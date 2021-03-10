const axios = require('axios');
const moment = require('moment');
const _ = require('lodash');
const PromisePool = require('@supercharge/promise-pool')

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');

const AUTH_ENDPOINT = `https://auth.indexexchange.com/auth/oauth/token`;
const API_ENDPOINT = `https://api01.indexexchange.com/api`;

const PARTNER_NAME = `IndexExchange`;
const NETWORK_ID = 21;
const DOMAIN_FIELD_NAME = 'site_name';
const REVENUE_FIELD = 'earnings';

const authParams = {
	username: 'dikshant.joshi@adpushup.com',
	key: 'iGY05Af7QidctaFx9gm9u4uNaNzl+Lo6'
};

const fromDate = moment().subtract(7, "days").format("YYYY-MM-DD");
const toDate = fromDate;

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
const getDataFromPartner = function () {
	// 1. Get Auth token before each req
	return axios
		.post(`${AUTH_ENDPOINT}`, authParams)
		.then(response => response.data.data)
		.then(function (data) {
			const { accessToken } = data;
			return accessToken;
		})
		.then(async function (token) {
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
					if(siteIdsAndNameMappingFromPubData[placement.siteID[i]]) {
						queue.push({
							placementID: placement.placementID,
							siteID: placement.siteID[i]
						});
					}
				}
			});

			// process batches
			console.log('Processing batches.....')
			const { results, errors } = await processReqInBatches(queue, headers);
			return processDataReceivedFromPublisher(results, siteIdsAndNameMappingFromPubData);
		})
		.catch(function (error) {
			// handle error
			console.log(error, 'error token data', 'errrr');
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
		url: `${API_ENDPOINT}/publishers/sites/info?status=["A", "N"]`,
		headers
	};

	return axios(config)
		.then(response => response.data)
		.then(response => {
			const obj = {};
			response.data
			.filter(item => !(/(AR)\/\d+_/.test(item.name)))
			.forEach(item => {
				obj[item.siteID] = item.name;
			});
			return obj;
		});
};

const processReqInBatches = async (queue, headers) => {
	const batchSize = 50;

	return await PromisePool
		.withConcurrency(batchSize)
		.for(queue)
		.process(async item => {
			const data = {
				filters: {
					startDate: fromDate,
					endDate: toDate,
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
			console.log('Processing....')
			const apiResponse = await axios(config).then(response => {
				return {
					config: {
						fromDate,
						toDate,
						placementId: item.placementID,
						siteId: item.siteID
					},
					data: response.data.data
				};
			})
			.catch(function (error) {
				// handle error
				console.log(error.message, 'error promiseQueue', 'errrr');
			})
			return apiResponse;
		})
};

const processDataReceivedFromPublisher = (data, siteIdsAndNameMappingFromPubData) => {
	let processedData = data
		.map(item => {
			if(!item) {
				return [];
			}
			return item.data.map(row => {
				row.siteID = item.config.siteId;
				row.fromDate = item.config.fromDate;
				row.toDate = item.config.toDate;
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
				function ($1) {
					let typeAndSiteId = $1.replace('_', '').split('/');
					item.type = typeAndSiteId[0];
					item.siteId = typeAndSiteId[1];
					item.earnings = (item.earnings * 0.00001).toFixed(2);
					return '';
				}
			);

			return item;
		})
		.filter(item => item.type == 'AP');
	console.log('Processing end...');
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
		.then(async function (reportDataJSON) {
			IndexExchangePartnerModel.setPartnersData(reportDataJSON);

			// process and map sites data with publishers API data structure
			IndexExchangePartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			IndexExchangePartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			// TBD - Remove hard coded dates after testing
			const params = {
				siteid: IndexExchangePartnerModel.getSiteIds().join(','),
				network: NETWORK_ID,
				fromDate: fromDate,
				toDate: toDate,
				interval: 'daily',
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
			// console.log(JSON.stringify(anomalies, null, 3), 'anomalies');
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
				return {
					total: finalData.length,
					anomalies: anomalies.length,
					partner: PARTNER_NAME
				};
			}
		})
		.catch(async function (error) {
			await emailer.serviceErrorNotificationMailService({
				partner: PARTNER_NAME,
				error
			})
			// handle error
			console.log('error', `err with ${PARTNER_NAME}`, error);
		});
};

module.exports = fetchData;
