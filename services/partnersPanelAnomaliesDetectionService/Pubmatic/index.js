const axios = require('axios');
const moment = require('moment');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');
const { axiosAuthErrorHandler, axiosErrorHandler, partnerModuleErrorHandler } = require('../utils');

const {
	PARTNERS_PANEL_INTEGRATION: { ANOMALY_THRESHOLD, ANOMALY_THRESHOLD_IN_PER, PUBMATIC }
} = require('../../../configs/config');
const { PARTNER_NAME, NETWORK_ID, DOMAIN_FIELD_NAME, REVENUE_FIELD, AUTH_PARAMS, ENDPOINT } = PUBMATIC;
const { API_ENDPOINT, PUBLISHER_ID } = ENDPOINT

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
// 2. Get Report Id
// 3. Download Report - CSV
const getDataFromPartner = async function (fromDate, toDate) {
	// 1. Get Auth token before each req
	const token = await axios
		.post(`${API_ENDPOINT}/developer-integrations/developer/token`, AUTH_PARAMS)
		.then(response => response.data)
		.then(function (data) {
			const { accessToken } = data;
			return accessToken;
		})
		.catch((err) => {
			const errorResponseHandler = function (errResponse) {
				const { status, statusText } = errResponse;
				if (errResponse.data && errResponse.data.length) {
					const { errorCode, errorMessage } = errResponse.data[0];
					return `${errorCode} ${errorMessage} - ${status} ${statusText}`
				} else {
					return `${status} ${statusText}`
				}
			}
			axiosAuthErrorHandler(err, errorResponseHandler)
		});
	console.log('Got Auth token before req....', token);

	// 2. Get Report Data
	const queryParams = {
		dateUnit: 'date',
		dimensions: 'siteId',
		filters: '',
		metrics: 'netRevenue,paidImpressions,ecpm',
		pageSize: '',
		sort: '-netRevenue',
		fromDate,
		toDate,
		timeZone: 'PST'
	};
	const headers = {
		Authorization: `Bearer ${token}`
	};

	var config = {
		method: 'get',
		url: `${API_ENDPOINT}/analytics/data/publisher/${PUBLISHER_ID}`,
		params: queryParams,
		headers
	};

	return await axios(config)
		.then(response => {
			return processDataReceivedFromPublisher(response.data);
		})
		.catch(function (error) {
			// handle error
			console.log(error.message, 'error fetching data', 'errrr');
		})
		.catch(axiosErrorHandler);
};

const processDataReceivedFromPublisher = data => {
	let processedData = data.rows.map(row => {
		const obj = {};
		data.columns.map((col, index) => {
			obj[col] = row[index];
		});
		return obj;
	});
	processedData = processedData
		.map(row => {
			row.site_name = data.displayValue.siteId[row.siteId];
			return row;
		})
		.filter(row => /AP\/\d+_/.test(row.site_name))
		.map(row => {
			row.site_name = data.displayValue.siteId[row.siteId].replace(/AP\/\d+_/, '');
			return row;
		});
	console.log('Processing end.............');
	return processedData;
};

const initDataForpartner = function () {
	// data for one week
	const fromDatePubmatic = moment().subtract(8, 'days').format('YYYY-MM-DDT00:00');
	const toDatePubmatic = moment().subtract(2, 'days').format('YYYY-MM-DDT23:59:59');

	const fromDate = moment().subtract(8, 'days').format('YYYY-MM-DD');
	const toDate = moment().subtract(2, 'days').format('YYYY-MM-DD');
	return {
		fromDate,
		toDate,
		fromDatePubmatic,
		toDatePubmatic
	}
}

const fetchData = sitesData => {
	const { fromDate, toDate, fromDatePubmatic, toDatePubmatic } = initDataForpartner()
	const PubmaticPartnerModel = new partnerAndAdpushpModel(
		sitesData,
		DOMAIN_FIELD_NAME,
		REVENUE_FIELD
	);

	console.log('Fetching data from Pubmatic...');
	return getDataFromPartner(fromDatePubmatic, toDatePubmatic)
		.then(async function (reportDataJSON) {
			PubmaticPartnerModel.setPartnersData(reportDataJSON);

			// process and map sites data with publishers API data response
			PubmaticPartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			PubmaticPartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			const params = {
				siteid: PubmaticPartnerModel.getSiteIds().join(','),
				network: NETWORK_ID,
				fromDate,
				toDate,
				interval: 'cumulative',
				dimension: 'siteid'
			};

			const adpData = await PubmaticPartnerModel.getDataFromAdPushup(params);
			let finalData = PubmaticPartnerModel.compareAdPushupDataWithPartnersData(adpData);

			// filter out anomalies
			const anomalies = finalData.filter(
				item =>
					(Math.abs(item.adpRevenue) >= ANOMALY_THRESHOLD ||
						Math.abs(item.pubRevenue) >= ANOMALY_THRESHOLD) &&
					Math.abs(item.diffPer) >= ANOMALY_THRESHOLD_IN_PER
			);

			// if aonmalies found
			if (anomalies.length) {
				if (process.env.NODE_ENV == 'production') {
					const dataToSend = PubmaticPartnerModel.formatAnomaliesDataForSQL(anomalies, NETWORK_ID);
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
