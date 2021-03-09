const axios = require('axios');
const moment = require('moment');
const csv = require('csvtojson');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');

const API_ENDPOINT = `https://api.appnexus.com`;

const PARTNER_NAME = `AppNexus/OFT`;
const NETWORK_ID = 11;
const DOMAIN_FIELD_NAME = 'site_name';
const REVENUE_FIELD = 'publisher_revenue';

const fromDate = moment().subtract(1, "days").format("YYYY-MM-DD");
const toDate = fromDate;

const authParams = {
	auth: {
		username: 'adpushup152ns',
		password: '152Media/12'
	}
};

/**
 * 1. Get Pub data
 * 2. Get AdPushup data for that Pub
 * 3. Compare both data
 */

// How OFT works.
// 1. Get Auth token before each req
// 2. Get Report Id
// 3. Download Report - CSV
const getDataFromPartner = function() {
	// 1. Get Auth token before each req
	return axios
		.post(`${API_ENDPOINT}/auth`, authParams)
		.then(response => response.data.response)
		.then(function(data) {
			const { token } = data;
			return token;
		})
		.then(async function(token) {
			console.log('Got Auth token before req....', token);

			// 2. Get Report Id
			const queryParams = {
				report: {
					"report_type": "publisher_analytics",
					"start_date": "2021-03-03",
					"end_date": "2021-03-04",
					"columns": ["day","clicks", "publisher_revenue", "site_id", "site_name"],
					"orders": [{"order_by":"day", "direction":"ASC"}],
					"format": "csv",
					"timezone":"PST8PDT"
					// report_type: 'publisher_analytics',
					// report_interval: 'yesterday',
					// columns: ['day', 'clicks', 'publisher_revenue', 'site_id', 'site_name'],
					// orders: [{ order_by: 'day', direction: 'ASC' }],
					// format: 'csv'
				}
			};
			const headers = {
				Authorization: `${token}`
			};
			const reportMetaData = await axios
				.post(`${API_ENDPOINT}/report`, queryParams, { headers })
				.then(response => response.data.response);
			// {
			//     "response": {
			//         "status": "OK",
			//         "token": "authn:271746:09a5bf8cec143:lax1",
			//     }
			// }

			console.log('Got Report Meta....');
			// 3. Download Report - CSV
			const reportData = await axios
				.get(`${API_ENDPOINT}/report-download`, {
					params: {
						id: reportMetaData.report_id
					},
					headers
				})
				.then(response => response.data);
			return await csv().fromString(reportData);
		});
};

const fetchData = sitesData => {
	const OFTMediaPartnerModel = new partnerAndAdpushpModel(
		sitesData,
		DOMAIN_FIELD_NAME,
		REVENUE_FIELD
	);

	console.log('Fetching data from OFT...');
	return getDataFromPartner()
		.then(async function(reportDataJSON) {
			OFTMediaPartnerModel.setPartnersData(reportDataJSON);

			// process and map sites data with publishers API data structure
			OFTMediaPartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			OFTMediaPartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			// TBD - Remove hard coded dates after testing
			const params = {
				siteid: OFTMediaPartnerModel.getSiteIds().join(','),
				network: NETWORK_ID,
				fromDate,
				toDate,
				interval: 'daily',
				dimension: 'siteid'
			};

			const adpData = await OFTMediaPartnerModel.getDataFromAdPushup(params);
			let finalData = OFTMediaPartnerModel.compareAdPushupDataWithPartnersData(adpData);

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
				const dataToSend = OFTMediaPartnerModel.formatAnomaliesDataForSQL(anomalies);
				await Promise.all([
					emailer.anomaliesMailService({
						partner: PARTNER_NAME,
						anomalies
					}),
					saveAnomaliesToDb(dataToSend, PARTNER_NAME)
				]);
			}
		})
		.catch(async function(error) {
			await emailer.serviceErrorNotificationMailService({
				partner: PARTNER_NAME,
				error
			})
			// handle error
			console.log('error', `err with ${PARTNER_NAME}`);
		});
};

module.exports = fetchData;
