const axios = require('axios');
const csv = require('csvtojson');
const _ = require('lodash');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');

const AUTH_ENDPOINT = `https://auth.indexexchange.com/auth/oauth/token`;
const API_ENDPOINT = `https://api01.indexexchange.com/api`;

const PARTNER_NAME = `IndexExchange`;
const NETWORK_ID = 79;
const DOMAIN_FIELD_NAME = 'site_name';
const REVENUE_FIELD = 'earnings';

const authParams = {
	username: 'dikshant.joshi@adpushup.com',
	key: 'iGY05Af7QidctaFx9gm9u4uNaNzl+Lo6'
};

/**
 * 1. Get Pub data
 * 2. Get AdPushup data for that Pub
 * 3. Compare both data
 */

// How IndexExchange works.
// 1. Get Auth token before each req
// 2. Get Placement info
// 3. Get Sites data based on Placement Ids
// 4. Get earnings from siteIds
const getDataFromPartner = function() {
	// 1. Get Auth token before each req
	return axios
		.post(`${AUTH_ENDPOINT}`, authParams)
		.then(response => response.data.data)
		.then(function(data) {
			const { accessToken } = data;
			return accessToken;
		})
		.then(async function(token) {
			console.log('Got Auth token before req....', token);

			const headers = {
				Authorization: `Bearer ${token}`
			};
			// 2. Get Placement Info
			const placementData = await getPlacementData(headers);
			// 3. Get Sites Info from placementIds
			const siteIdsAndNameMappingFromPubData = await getAllSitesInfo(headers);

			// 4. Get earnings from Placement Id and SiteIds in batches
			// 		a. For each Placement Id
			// 		b. then each placement id have multiple sites - Site Ids based batch
			// create batch of 50 sites - 50 parallel requests and then wait
			const queue = [];
			placementData.forEach(placement => {
				for (let i = 0; i < placement.siteID.length; i++) {
					queue.push({
						placementID: placement.placementID,
						siteID: placement.siteID[i]
					});
				}
			});

			// create batches
			const batchQueue = processReqInBatches(queue, headers);
			console.log('Processing batches.....')
			return Promise.all(batchQueue).then(response => {
				console.log('All done!');
				return processDataReceivedFromPublisher(response, siteIdsAndNameMappingFromPubData);
			});
		})
		.catch(function(error) {
			// handle error
			console.log(error.message, 'error token data', 'errrr');
		});
};

const getPlacementInfo = headers => {
	const placementConfig = {
		method: 'get',
		url: `${API_ENDPOINT}/publishers/placements/info`,
		headers
	};

	return axios(placementConfig)
		.then(response => response.data)
		.then(response => {
			return response.data.map(row => row.placementID);
		});
};

const getPlacementData = async headers => {
	const placementsIdArr = await getPlacementInfo(headers);
	const data = {
		placementID: placementsIdArr
	};

	const placementConfig = {
		method: 'post',
		url: `${API_ENDPOINT}/publishers/placements`,
		headers,
		data
	};

	return await axios(placementConfig)
		.then(response => response.data)
		.then(response => {
			return response.data.reduce((acc, row) => {
				const { placementID, siteID } = row;
				acc.push({
					placementID,
					siteID
				});
				return acc;
			}, []);
		});
};

const getAllSitesInfo = headers => {
	var config = {
		method: 'get',
		url: `${API_ENDPOINT}/publishers/sites/info?status=["A", "D", "N"]`,
		headers
	};

	return axios(config)
		.then(response => response.data)
		.then(response => {
			const obj = {};
			response.data.forEach(item => {
				obj[item.siteID] = item.name;
			});
			return obj;
		});
};

const processReqInBatches = (queue, headers) => {
	let count = 0;
	const batchSize = 50;
	let endIndex = batchSize;
	// To Be Removed after testing
	queue.splice(1000);
	let batchQueue = [];
	for (let i = 0; i < queue.length; i = i + batchSize) {
		count++;
		const batch = queue.slice(i, endIndex);
		endIndex += batchSize;

		function processBatch(batch) {
			let promiseQueue = [];
			for (const item of batch) {
				const data = {
					filters: {
						startDate: '2021-01-01',
						endDate: '2021-01-10',
						placementID: [item.placementID],
						siteID: [item.siteID]
					},
					aggregation: 'day'
				};

				let config = {
					method: 'post',
					url: `${API_ENDPOINT}/publishers/stats/earnings/open`,
					data,
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
			return Promise.all(promiseQueue);
		}
		batchQueue.push(processBatch(batch));
	}
	return batchQueue;
};

const processDataReceivedFromPublisher = (data, siteIdsAndNameMappingFromPubData) => {
	let processedData = data
		.reduce((acc, item) => {
			acc = acc.concat(...item);
			return acc;
		}, [])
		.map(item => {
			return item.data.data.map(row => {
				row.siteID = item.config.filters.siteID[0];
				return row;
			});
		})
		.filter(item => item.length)
		.reduce((acc, item) => {
			acc = acc.concat(...item);
			return acc;
		}, [])
		.map(item => {
			item.site_name = siteIdsAndNameMappingFromPubData[item.siteID].replace(
				/(AP|AR)\/\d+_/,
				function($1) {
					let typeAndSiteId = $1.replace('_', '').split('/');
					item.type = typeAndSiteId[0];
					item.siteId = typeAndSiteId[1];
					item.earnings = item.earnings * 0.00001;
					return '';
				}
			);

			return item;
		})
		.filter(item => item.type == 'AP');
	console.log('Processing end.............');
	return processedData;
};

const fetchData = sitesData => {
	const IndexExchangePartnerModel = new partnerAndAdpushpModel(
		sitesData,
		DOMAIN_FIELD_NAME,
		REVENUE_FIELD
	);

	console.log('Fetching data from IndexExchange...');
	return getDataFromPartner()
		.then(async function(reportDataJSON) {
			IndexExchangePartnerModel.setPartnersData(reportDataJSON);

			// process and map sites data with publishers API data structure
			IndexExchangePartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			IndexExchangePartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			// TBD - Remove hard coded dates after testing
			const params = {
				siteid: IndexExchangePartnerModel.getSiteIds().join(','),
				network: NETWORK_ID,
				fromDate: '2021-01-01',
				toDate: '2021-01-10',
				interval: 'daily',
				// siteid:40792,
				dimension: 'siteid'
			};

			const adpData = await IndexExchangePartnerModel.getDataFromAdPushup(params);
			let finalData = IndexExchangePartnerModel.compareAdPushupDataWithPartnersData(adpData);

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
				const dataToSend = IndexExchangePartnerModel.formatAnomaliesDataForSQL(anomalies, NETWORK_ID);
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
			console.log('error', `err with ${PARTNER_NAME}`, error);
		});
};

module.exports = fetchData;
