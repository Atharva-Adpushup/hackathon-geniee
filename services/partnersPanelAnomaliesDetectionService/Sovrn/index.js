const axios = require('axios');
const csv = require('csvtojson');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');

const API_ENDPOINT = `https://api.sovrn.com`;

const PARTNER_NAME = `Sovrn`;
const NETWORK_ID = 11;
const DOMAIN_FIELD_NAME = 'site_name';
const REVENUE_FIELD = 'revenue';

const authParams = {
	grant_type: 'password',
	username: 'adpushup1',
	password: 'uCB78s6Bb4LR52M',
	client_id: 'sovrn',
	client_secret: 'sovrn'
};
// response
/**
    {
        "userEmail": "sharad.yadav@adpushup.com",
        "tokenType": "BearerToken",
        "accessToken": "y9poc3G1Eju3Ys7R3PCCcmbtdIul",
        "refreshToken": "MNzuLSzG61t7X2gDzTGqrdaLr8RPRjgl"
    }
 */

/**
 * 1. Get Pub data
 * 2. Get AdPushup data for that Pub
 * 3. Compare both data
 */

// How OFT works.
// 1. Get Auth token before each req
// 2. Get User IID and All Sites
// 3. Req for each date separately - time should be in millisecond
// 4. Get Req for each site separately
// 5. Calculate eCPM for each day because result is not aggregated.
const getDataFromPartner = function() {
	// 1. Get Auth token before each req
	console.log('Get Auth token before each req');
	return (
		Promise.resolve('')
			// return axios
			// 	.post(`${API_ENDPOINT}/oauth/token`, authParams)
			.then(response => response.data)
			.then(function(data) {
				return '2ba4aa39-2937-49ed-820a-c8f4d2aac6db';
				const { accessToken } = data;
				return accessToken;
			})
			.then(async function(token) {
				console.log('Got Auth token before req....', token);

				const headers = {
					Authorization: `Bearer ${token}`
				};

				// 2. Get User IID and All Sites
				// var config = {
				// 	method: 'get',
				// 	url: `${API_ENDPOINT}/account/user`,
				// 	headers
				// };

				var config = {
					method: 'get',
					url: 'https://api.sovrn.com/account/user',
					headers: {
						Authorization: 'Bearer d7eaa068-5715-4b24-af0f-a2a7ab01ff54',
					}
				};

				const {iid, websites} = await axios(config)
					.then(function(response) {
						return response.data;
					})
					.catch(function(error) {
						console.log(error.message);
					});

				// 3. Req for each date separately - time should be in millisecond
				// Need to send requests in batches
				const batchQueue = processReqInBatches(websites.map(item => item.site), headers);

				// process;
				const queryParams = {
					site: 'All%20Traffic',
					startDate: '1614018600000',
					startDate: '1614061799000',
					iid
				};
				var config = {
					method: 'get',
					url: `${API_ENDPOINT}/earnings/breakout/all`,
					params: queryParams,
					headers
				};

				return await axios(config).then(response => {
					return processDataReceivedFromPublisher(response.data);
				});
			})
			.catch(function(error) {
				// handle error
				console.log(error.message, 'error token data', 'errrr');
			})
	);
};

const processReqInBatches = (queue, headers) => {
	let count = 0;
	const batchSize = 5;
	let endIndex = batchSize;
	// To Be Removed after testing
	// queue.splice(100);
	let batchQueue = [];
	for (let i = 0; i < queue.length; i = i + batchSize) {
		count++;
		const batch = queue.slice(i, endIndex);
		endIndex += batchSize;
		console.log(batch, batch.length, 'batch', count);

		function processBatch(batch) {
			let promiseQueue = [];
			for (const site of batch) {
				const queryParams = {
					site,
					startDate: 1610303400000,
					startDate: 1610994540000,
					iid: 13414817
				};

				let config = {
					method: 'get',
					url: `${API_ENDPOINT}/earnings/breakout/all`,
					params: queryParams,
					headers
				};

				promiseQueue.push(
					axios(config)
						.then(response => {
							return {
								config: config.data,
								data: response.data
							};
						})
						.catch(function(error) {
							// handle error
							console.log(error.message, 'error promiseQueue', 'errrr');
						})
				);
			}
			console.log(promiseQueue, 'promiseQueue');
			return Promise.all(promiseQueue);
		}
		batchQueue.push(processBatch(batch));
	}
	return batchQueue;
};

const processDataReceivedFromPublisher = data => {
	let processedData = data.rows.map(row => {
		const obj = {};
		data.columns.map((col, index) => {
			obj[col] = row[index];
		});
		return obj;
	});
	processedData = processedData.map(row => {
		row.site_name = data.displayValue.siteId[row.siteId].replace(/(AP|AR)\/\d+_/, '');
		return row;
	});
	console.log(processedData);
	console.log('Processing end.............');
	return processedData;
};

const fetchData = sitesData => {
	const SovrnPartnerModel = new partnerAndAdpushpModel(
		sitesData,
		DOMAIN_FIELD_NAME,
		REVENUE_FIELD
	);

	console.log('Fetching data from Sovrn...');
	return getDataFromPartner()
		.then(async function(reportDataJSON) {
			SovrnPartnerModel.setPartnersData(reportDataJSON);

			// process and map sites data with publishers API data structure
			SovrnPartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			SovrnPartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			// TBD - Remove hard coded dates after testing
			const params = {
				siteid: SovrnPartnerModel.getSiteIds().join(','),
				network: 11,
				fromDate: '2021-01-13',
				toDate: '2021-01-19',
				interval: 'daily',
				// siteid:40792,
				dimension: 'siteid'
			};

			const adpData = await SovrnPartnerModel.getDataFromAdPushup(params);
			let finalData = SovrnPartnerModel.compareAdPushupDataWithPartnersData(adpData);

			const {
				PARTNERS_PANEL_INTEGRATION: { ANOMALY_THRESHOLD_IN_PER }
			} = constants;
			// filter out anomalies
			const anomalies = finalData.filter(
				item =>
					item.diffPer <= -ANOMALY_THRESHOLD_IN_PER || item.diffPer >= ANOMALY_THRESHOLD_IN_PER
			);
			// console.log(JSON.stringify(anomalies, null, 3), 'finalData');
			console.log(finalData.length, 'finalData length');
			console.log(anomalies.length, 'anomalies length');

			// if aonmalies found
			if (anomalies.length) {
				const dataToSend = SovrnPartnerModel.formatAnomaliesDataForSQL(anomalies, NETWORK_ID);
				await Promise.all([
					emailer.anomaliesMailService({
						partner: PARTNER_NAME,
						anomalies
					}),
					saveAnomaliesToDb(dataToSend)
				]);
			}
		})
		.catch(function(error) {
			// handle error
			console.log('error', `err with ${PARTNER_NAME}`);
		});
};

module.exports = fetchData;
