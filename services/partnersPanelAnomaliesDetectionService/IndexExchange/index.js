const axios = require('axios');
const moment = require('moment');
const _ = require('lodash');
const PromisePool = require('@supercharge/promise-pool');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');
const { axiosErrorHandler, partnerModuleErrorHandler } = require('../utils');

const {
	PARTNERS_PANEL_INTEGRATION: { ANOMALY_THRESHOLD, ANOMALY_THRESHOLD_IN_PER, INDEX_EXCHANGE }
} = require('../../../configs/commonConsts');
const { PARTNER_NAME, NETWORK_ID, DOMAIN_FIELD_NAME, REVENUE_FIELD } = INDEX_EXCHANGE;

const AUTH_ENDPOINT = `https://auth.indexexchange.com/auth/oauth/token`;
const API_ENDPOINT = `https://api01.indexexchange.com/api`;

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
const getDataFromPartner = async function(fromDate, toDate) {
	// 1. Get Auth token before each req
	const token = await axios
		.post(`${AUTH_ENDPOINT}`, authParams)
		.then(response => response.data.data)
		.then(function(data) {
			const { accessToken } = data;
			return accessToken;
		})
		.catch(axiosErrorHandler);

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
	// create a queue to be processed in batches
	const queue = [];
	placementData.forEach(placement => {
		for (let i = 0; i < placement.siteID.length; i++) {
			if (siteIdsAndNameMappingFromPubData[placement.siteID[i]]) {
				queue.push({
					placementID: placement.placementID,
					siteID: placement.siteID[i]
				});
			}
		}
	});

	// process batches
	console.log('Processing batches.....');
	const { results, errors } = await processReqInBatches(queue, headers, fromDate, toDate);
	return processDataReceivedFromPublisher(results, siteIdsAndNameMappingFromPubData);
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
		})
		.catch(axiosErrorHandler);
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
				.filter(item => !/(AR)\/\d+_/.test(item.name))
				.forEach(item => {
					obj[item.siteID] = item.name;
				});
			return obj;
		})
		.catch(axiosErrorHandler);
};

const processReqInBatches = async (queue, headers, fromDate, toDate) => {
	const batchSize = 50;

	return await PromisePool.withConcurrency(batchSize)
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

			return await axios(config)
				.then(response => {
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
				.catch(axiosErrorHandler);
		});
};

const processDataReceivedFromPublisher = (data, siteIdsAndNameMappingFromPubData) => {
	let processedData = data
		.map(item => {
			// empty response handling
			if (!item) {
				return [];
			}
			return item.data.map(row => {
				row.siteID = item.config.siteId;
				row.fromDate = item.config.fromDate;
				row.toDate = item.config.toDate;
				return row;
			});
		})
		// empty response handling - for nested array response
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

const initDataForpartner = function() {
	const fromDate = moment()
	.subtract(1, 'days')
	.format('YYYY-MM-DD');
	const toDate = fromDate;

	return {
		fromDate,
		toDate
	}
}

const fetchData = sitesData => {
	const { fromDate, toDate } = initDataForpartner();
	const IndexExchangePartnerModel = new partnerAndAdpushpModel(
		sitesData,
		DOMAIN_FIELD_NAME,
		REVENUE_FIELD
	);

	console.log('Fetching data from IndexExchange...');
	return getDataFromPartner(fromDate, toDate)
		.then(async function(reportDataJSON) {
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
				interval: 'daily',
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
