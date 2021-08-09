const Client = require('ftp');
const cron = require('node-cron');
const crypto = require('crypto');
const Promise = require('bluebird');
const csv = require('csvtojson');
const soap = require('strong-soap').soap;
const request = require('request-promise');
const moment = require('moment');

const couchbase = require('../../helpers/couchBaseService');
const { appBucket } = require('../../helpers/routeHelpers');
const config = require('../../configs/config');
const CC = require('../../configs/commonConsts');

function getTipaltiConfig() {
	const tipaltiConfig = config.tipalti;
	const { key: configKey, payerName, soapPayerUrl: url } = tipaltiConfig;
	const timestamp = Math.floor(+new Date() / 1000);

	return {
		url,
		configKey,
		payerName,
		timestamp
	};
}

function getTipaltiKey(key, params) {
	return crypto
		.createHmac('sha256', key)
		.update(params.toString('utf-8'))
		.digest('hex');
}

function createPaymentOrdersReport() {
	const { url, payerName, timestamp, configKey } = getTipaltiConfig();
	const params = payerName + timestamp;
	const key = getTipaltiKey(configKey, params);
	const requestArgs = {
		key,
		payerName,
		timestamp,
		startTime: moment()
			.subtract(3, 'months')
			.toISOString(), //3 months prior
		endTime: moment().toISOString()
	};
	const createClient = Promise.promisify(soap.createClient);
	return createClient(url)
		.then(function(client) {
			var method = client['CreatePaymentOrdersReport'];
			method = Promise.promisify(method);
			return method(requestArgs);
		})
		.then(function(data) {
			const {
				CreatePaymentOrdersReportResult: { resultsFile }
			} = data;
			return resultsFile;
		})
		.catch(function(error) {
			return `FAILED TO FETCH DATA FROM TIPALTI: ${error}`;
		});
}

function createMappingFromJson(data) {
	var mappingFromPayerId = {};
	data.forEach(json => {
		const id = json['Payee ID'];
		if (mappingFromPayerId[id]) {
			mappingFromPayerId[id].push(json);
		} else {
			mappingFromPayerId[id] = [{ ...json }];
		}
	});
	return mappingFromPayerId;
}

function sendAlertEmailIfServiceFails(body) {
	return request({
		method: 'POST',
		uri: config.mailerQueueUrl,
		json: true,
		body
	})
		.then(() => {
			console.log('Mail sent succesfully');
		})
		.catch(error => {
			throw new Error(`Error in sending email:${error}`);
		});
}

function createSFTPConnectionAndDoProcessing() {
	console.log('started running');
	var c = new Client();
	c.connect({
		host: CC.TIPALTI_SFTP_CREDS.host,
		user: CC.TIPALTI_SFTP_CREDS.user,
		password: CC.TIPALTI_SFTP_CREDS.password,
		secure: true,
		secureOptions: { rejectUnauthorized: false },
		connTimeout: 60000
	});
	c.on('ready', function() {
		createPaymentOrdersReport()
			.then(csvfile => {
				c.get(csvfile, function(err, stream) {
					if (err) throw err;
					csv()
						.fromStream(stream)
						.subscribe(function(jsonObj) {
							//single json object will be emitted for each csv line
							// parse each json asynchronousely
							return Promise.resolve(jsonObj);
						})
						.then(data => {
							const docData = createMappingFromJson(data);

							couchbase
								.connectToAppBucket()
								.then(appBucket =>
									appBucket
										.getAsync(CC.docKeys.paymentHistoryDoc, {})
										.then(doc => ({ appBucket, doc }))
								)
								.then(({ appBucket }) => {
									return appBucket
										.replaceAsync(CC.docKeys.paymentHistoryDoc, docData)
										.then(() => {
											console.log('doc updated');
											c.end();
										})
										.catch(() => {
											console.log('doc updation failed');
										});
								})
								.catch(err => {
									console.log(err);
									if (err.code === 13) {
										return appBucket
											.createDoc(CC.docKeys.paymentHistoryDoc, docData, {})
											.then(() => {
												console.log('doc created');
												c.end();
											})
											.catch(() => {
												console.log('doc creation failed');
											});
									}
								});
						})
						.catch(err => {
							console.log(err);
							sendAlertEmailIfServiceFails({
								queue: 'MAILER',
								data: {
									to: 'yash.garg@adPushup.com',
									body: err.message,
									subject: 'Tipalti Payment History Service fails'
								}
							});
						});
				});
			})
			.catch(err => {
				console.log(err);
			});
	});
}

createSFTPConnectionAndDoProcessing();
var cronJob = cron.schedule(
	CC.cronSchedule.paymentHistoryService,
	createSFTPConnectionAndDoProcessing,
	false
);
cronJob.start();
