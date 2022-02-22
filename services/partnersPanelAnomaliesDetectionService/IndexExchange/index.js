const request = require('request');
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');
const JSZip = require("jszip");
var csv = require("csvtojson");

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');
const { axiosAuthErrorHandler, axiosErrorHandler, partnerModuleErrorHandler } = require('../utils');

const {
	PARTNERS_PANEL_INTEGRATION: { ANOMALY_THRESHOLD, ANOMALY_THRESHOLD_IN_PER, INDEX_EXCHANGE }
} = require('../../../configs/config');
const { PARTNER_NAME, NETWORK_ID, DOMAIN_FIELD_NAME, REVENUE_FIELD, AUTH_PARAMS, ENDPOINT, REPORT_ID } = INDEX_EXCHANGE;
const { AUTH_ENDPOINT, API_ENDPOINT } = ENDPOINT;

/**
 * 1. Get Pub data
 * 2. Get AdPushup data for that Pub
 * 3. Compare both data
 */

// How IndexExchange works.
// 1. Get Auth token before each req
// 2. Run report using report id - constant
// 3. Downliad file - its a zip file, extract csv file from it
// 4. Get publisher payment from site_domain
const getDataFromPartner = async function (fromDate, toDate) {
	// 1. Get Auth token before each req
	const token = await axios
		.post(`${AUTH_ENDPOINT}`, AUTH_PARAMS)
		.then(response => response.data)
		.then(function (data) {
			const { loginResponse: { authResponse: { access_token } } } = data;
			return access_token;
		})
		.catch((err) => {
			const errorResponseHandler = function (errResponse) {
				const { status, statusText } = errResponse;
				if (errResponse.data) {
					const { error } = errResponse.data;
					return `${error[0].code} - ${status} ${statusText}`
				} else {
					return `${status} ${statusText}`
				}
			}
			axiosAuthErrorHandler(err, errorResponseHandler)
		});

	console.log('Got Auth token before req....', token);

	const headers = {
		Authorization: `Bearer ${token}`
	};

	// 2. Run existing Report
	const reportRunID = await runExistingReportConfiguredInIExDashboard(headers)
	// {"reportRunID":921162}

	// 3. Download report - by default is gzipped csv
	const results = await downloadReport(headers, reportRunID)
	return processDataReceivedFromPublisher(results);
};

const runExistingReportConfiguredInIExDashboard = headers => {
	const data = {
		reportId: REPORT_ID
	}

	const runReportConfig = {
		method: 'post',
		url: `${API_ENDPOINT}/report-runs`,
		headers,
		data
	};

	return axios(runReportConfig)
		.then(response => response.data)
		.then(function (data) {
			// {"reportRunID":921162}
			return data.reportRunID
		})
		.catch((err) => axiosErrorHandler);
};

const downloadReport = (headers, reportRunID) => {
	var file = fs.createWriteStream('./report.zip');

	var options = {
		'method': 'GET',
		'url': `${API_ENDPOINT}/report-files/download/${reportRunID}`,
		'headers': {
			'Content-Type': 'application/octet-stream',
			'Accept': 'application/json; charset=utf-8',
			...headers
		}
	}

	return new Promise((resolve, reject) => {
		// the run api give response early and file has been generated properly yet
		// and starteing downloading immediately fails - it worked after adding a delay of
		// 25sec(s) but added a delay of 60 sec(s) just to be safe
		setTimeout(() => {
			request(options)
				.on('error', function (error) {
					console.log(error);
					reject(error);
				})
				.pipe(file)
				.on('finish', function () {
					const zipread = fs.readFileSync('report.zip')
					JSZip.loadAsync(zipread).then(async function (zip) {
						let reportData;
						// there would be just one file - using loop because we don't know the file name that we want to read
						for (file in zip.files) {
							const str = await zip.file(file).async("string");
							reportData = await csv({
								colParser: {
									"column1": `${DOMAIN_FIELD_NAME}`,
									"column2": "impressions",
									"column3": "publisher_payment",
								},
								checkType: true
							})
								.fromString(str)
						}
						resolve(reportData)
					});
				});
		}, 60 * 1000)
	})
}

function compare(a, b) {
	if (a.site_name < b.site_name) {
		return -1;
	}
	if (a.site_name > b.site_name) {
		return 1;
	}
	return 0;
}


const processDataReceivedFromPublisher = (data) => {
	var obj = {};
	data
		.filter(item => /^AP\//.test(item.site_name))
		.map(item => {
			item.site_name = item.site_name.replace("AP/", "");
			// split siteId, domain
			const siteId = item.site_name.substring(0, item.site_name.indexOf('_'));
			item.domain = item.site_name.substring(item.site_name.indexOf('_') + 1);

			if (!obj[siteId]) {
				obj[siteId] = [];
			}
			obj[siteId].push(item);
			return item;
		})

	const processedData = [];
	Object.keys(obj).map(key => {
		const firstItem = obj[key][0];
		if (obj[key].length == 1) {
			processedData.push(firstItem);
		} else {
			obj[key] = obj[key].sort(compare);
			const finalItem = firstItem;
			finalItem.publisher_payment = obj[key].reduce((rev, siteItem) => {
				rev += siteItem.publisher_payment;
				return rev;
			}, 0)


			processedData.push(finalItem);
		}
	}, [])
	console.log('Processing end...');
	return processedData;
};

const initDataForpartner = function () {
	const fromDate = moment()
		.subtract(7, 'days')
		.format('YYYY-MM-DD');

	const toDate = moment()
		.subtract(1, 'days')
		.format('YYYY-MM-DD');

	return {
		fromDate,
		toDate
	};
};

const fetchData = sitesData => {
	const { fromDate, toDate } = initDataForpartner();
	const IndexExchangePartnerModel = new partnerAndAdpushpModel(
		sitesData,
		DOMAIN_FIELD_NAME,
		REVENUE_FIELD
	);

	console.log('Fetching data from IndexExchange...');
	return getDataFromPartner(fromDate, toDate)
		.then(async function (reportDataJSON) {
			IndexExchangePartnerModel.setPartnersData(reportDataJSON);

			// process and map sites data with publishers API data response
			IndexExchangePartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			IndexExchangePartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			const params = {
				siteid: IndexExchangePartnerModel.getSiteIds().join(','),
				network: NETWORK_ID,
				fromDate: fromDate,
				toDate: toDate,
				interval: 'cumulative',
				dimension: 'siteid'
			};

			const adpData = await IndexExchangePartnerModel.getDataFromAdPushup(params);
			let finalData = IndexExchangePartnerModel.compareAdPushupDataWithPartnersData(adpData);

			// filter out anomalies
			const anomalies = finalData.filter(
				item =>
					(Math.abs(item.adpRevenue) >= ANOMALY_THRESHOLD ||
						Math.abs(item.pubRevenue) >= ANOMALY_THRESHOLD) &&
					Math.abs(item.diffPer) >= ANOMALY_THRESHOLD_IN_PER
			);

			// if aonmalies found
			if (anomalies.length) {
				if (process.env.NODE_ENV === 'production') {
					const dataToSend = IndexExchangePartnerModel.formatAnomaliesDataForSQL(
						anomalies,
						NETWORK_ID
					);
					await Promise.all([
						emailer.anomaliesMailService({
							partner: PARTNER_NAME,
							anomalies
						}),
						saveAnomaliesToDb(dataToSend, PARTNER_NAME)
					]);
				} else {
					await emailer.anomaliesMailService({
						partner: PARTNER_NAME,
						anomalies
					})
				}
			}
			return {
				total: finalData.length,
				anomalies: anomalies.length,
				partner: PARTNER_NAME,
				message: 'Success'
			};
		})
		.catch(partnerModuleErrorHandler.bind(null, PARTNER_NAME));
};

module.exports = fetchData;
