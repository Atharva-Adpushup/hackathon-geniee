const axios = require('axios');
const moment = require('moment');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');
const { axiosAuthErrorHandler, axiosErrorHandler, partnerModuleErrorHandler, aggregateWeeklyData } = require('../utils');

const {
	PARTNERS_PANEL_INTEGRATION: { ANOMALY_THRESHOLD, ANOMALY_THRESHOLD_IN_PER, CRITEO }
} = require('../../../configs/config');
const { PARTNER_NAME, NETWORK_ID, DOMAIN_FIELD_NAME, REVENUE_FIELD, AUTH_PARAMS, ENDPOINT } = CRITEO;

const API_ENDPOINT = `${ENDPOINT}?apitoken=${AUTH_PARAMS.TOKEN}`;

const getDataFromPartner = function (fromDate, toDate) {
	const queryParams = {
		dimensions: 'subid',
		generator: 'daily',
		currency: 'USD',
		metrics: 'Revenue,CriteoDisplays',
		begindate: fromDate,
		enddate: toDate,
		timezone: 'PST'
	};

	// 1. Get Auth token before each req
	return axios
		.get(
			API_ENDPOINT,
			{
				params: queryParams
			},
			{
				timeout: 1000 * 60 * 3
			}
		)
		.then(response => processDataReceivedFromPublisher(response.data))
		.catch((err) => {
			const errorResponseHandler = function (errResponse) {
				const { status, statusText } = errResponse;
				if (errResponse.data) {
					const { Message } = errResponse.data;
					return `${Message} - ${status} ${statusText}`
				} else {
					return `${status} ${statusText}`
				}
			}
			axiosAuthErrorHandler(err, errorResponseHandler)
		});
};

const processDataReceivedFromPublisher = data => {
	const processedData = data
		.filter(row => /AP\/\d+_/.test(row.Subid))
		.map(row => {
			row.Domain = row.Subid.replace(/AP\/\d+_/, '');
			return row;
		});
	return processedData;
};

const initDataForpartner = function () {
	const fromDate = moment()
		.subtract(8, 'days')
		.format('YYYY-MM-DD');
	const toDate = moment()
		.subtract(2, 'days')
		.format('YYYY-MM-DD');

	return {
		fromDate,
		toDate
	}
}

/**
 * 1. Get Pub data
 * 2. Get AdPushup data for that Pub
 * 3. Compare both data
 */

const fetchData = async sitesData => {
	const { fromDate, toDate } = initDataForpartner();

	const CriteoPartnerModel = new partnerAndAdpushpModel(
		sitesData,
		DOMAIN_FIELD_NAME,
		REVENUE_FIELD
	);

	console.log('Fetching data from Criteo...');
	return getDataFromPartner(fromDate, toDate)
		.then(async function (reportDataJSON) {
			CriteoPartnerModel.setPartnersData(aggregateWeeklyData(reportDataJSON, DOMAIN_FIELD_NAME, REVENUE_FIELD));
			// process and map sites data with publishers API data response
			CriteoPartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			CriteoPartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			const params = {
				siteid: CriteoPartnerModel.getSiteIds().join(','),
				network: NETWORK_ID,
				fromDate,
				toDate,
				interval: 'cumulative',
				dimension: 'siteid'
			};

			const adpData = await CriteoPartnerModel.getDataFromAdPushup(params);
			let finalData = CriteoPartnerModel.compareAdPushupDataWithPartnersData(adpData);

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
					const dataToSend = CriteoPartnerModel.formatAnomaliesDataForSQL(anomalies, NETWORK_ID);
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
