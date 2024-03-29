const axios = require('axios');
const moment = require('moment');
const csv = require('csvtojson');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');
const { axiosAuthErrorHandler, axiosErrorHandler, partnerModuleErrorHandler, aggregateWeeklyData } = require('../utils');

const {
	PARTNERS_PANEL_INTEGRATION: { ANOMALY_THRESHOLD, ANOMALY_THRESHOLD_IN_PER, OFT }
} = require('../../../configs/config');
const { PARTNER_NAME, NETWORK_ID, DOMAIN_FIELD_NAME, REVENUE_FIELD, AUTH_PARAMS, ENDPOINT } = OFT;
const { API_ENDPOINT } = ENDPOINT;

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
		.post(`${API_ENDPOINT}/auth`, AUTH_PARAMS)
		.then(response => response.data.response)
		.then(function (data) {
			const { token } = data;
			return token;
		})
		.catch(axiosErrorHandler);

	console.log('Got Auth token before req....', token);

	// 2. Get Report Id
	const queryParams = {
		report: {
			report_type: 'publisher_analytics',
			start_date: fromDate,
			end_date: toDate,
			columns: ['day', 'clicks', 'publisher_revenue', 'site_id', 'site_name'],
			orders: [{ order_by: 'day', direction: 'ASC' }],
			format: 'csv',
			timezone: 'PST8PDT'
		}
	};
	const headers = {
		Authorization: `${token}`
	};
	const reportMetaData = await axios
		.post(`${API_ENDPOINT}/report`, queryParams, { headers })
		.then(response => response.data.response)
		.catch(err => {
			const errorResponseHandler = function (errResponse) {
				const { status, statusText } = errResponse;
				if (errResponse.data) {
					const { response: { error_id } } = errResponse.data;
					return `${error_id} - ${status} ${statusText}`
				} else {
					return `${status} ${statusText}`
				}
			}
			axiosAuthErrorHandler(err, errorResponseHandler)
		});
	// {
	//     "response": {
	//         "status": "OK",
	//         "token": "authn:271746:09a5bf8cec143:lax1",
	//     }
	// }

	console.log('Got Report Meta....', reportMetaData);
	// 3. Download Report - CSV
	const reportData = await axios
		.get(`${API_ENDPOINT}/report-download`, {
			params: {
				id: reportMetaData.report_id
			},
			headers
		})
		.then(response => response.data)
		.catch(axiosErrorHandler);
	return await csv().fromString(reportData);
};

const initDataForpartner = function () {
	// for weekly reports
	const fromDateOFT = moment()
		.subtract(9, 'days')
		.format('YYYY-MM-DD');
	const toDateOFT = moment()
		.subtract(2, 'days')
		.format('YYYY-MM-DD');
	;

	// for weekly reports
	const fromDate = moment()
		.subtract(9, 'days')
		.format('YYYY-MM-DD');
	const toDate = moment()
		.subtract(3, 'days')
		.format('YYYY-MM-DD');

	return {
		fromDateOFT,
		toDateOFT,
		fromDate,
		toDate
	}
}

const fetchData = sitesData => {
	const { fromDate, toDate, fromDateOFT, toDateOFT } = initDataForpartner();

	const OFTMediaPartnerModel = new partnerAndAdpushpModel(
		sitesData,
		DOMAIN_FIELD_NAME,
		REVENUE_FIELD
	);

	console.log('Fetching data from OFT...');
	return getDataFromPartner(fromDateOFT, toDateOFT)
		.then(async function (reportDataJSON) {
			// Partner's Panel does not return cumulative data. Reducing/Converting daily data
			// into weekly data
			OFTMediaPartnerModel.setPartnersData(aggregateWeeklyData(reportDataJSON, DOMAIN_FIELD_NAME, REVENUE_FIELD));
			// process and map sites data with publishers API data response
			OFTMediaPartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			OFTMediaPartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			const params = {
				siteid: OFTMediaPartnerModel.getSiteIds().join(','),
				network: NETWORK_ID,
				fromDate,
				toDate,
				interval: 'cumulative',
				dimension: 'siteid'
			};

			const adpData = await OFTMediaPartnerModel.getDataFromAdPushup(params);
			let finalData = OFTMediaPartnerModel.compareAdPushupDataWithPartnersData(adpData);

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
					const dataToSend = OFTMediaPartnerModel.formatAnomaliesDataForSQL(anomalies, NETWORK_ID);
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
