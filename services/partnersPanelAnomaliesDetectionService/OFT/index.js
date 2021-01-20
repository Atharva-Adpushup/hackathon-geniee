const axios = require('axios');
const csv = require('csvtojson');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');

const API_ENDPOINT = `https://api.appnexus.com`;
const DOMAIN_FIELD_NAME = 'site_name';
const REVENUE_FIELD = 'publisher_revenue';

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
					report_type: 'publisher_analytics',
					report_interval: 'last_7_days',
					columns: ['day', 'clicks', 'publisher_revenue', 'site_id', 'site_name'],
					orders: [{ order_by: 'day', direction: 'ASC' }],
					format: 'csv'
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

			console.log('Got Report Meta....', reportMetaData);
			// 3. Download Report - CSV
			const reportData = await axios
				.get(`${API_ENDPOINT}/report-download`, {
					params: {
						id: reportMetaData.report_id
					},
					headers: {
						Authorization: `${token}`
					}
				})
				.then(response => response.data);
			return await csv().fromString(reportData);
		});
};

const fetchData = async sitesData => {
	const oftMediaPartnerModel = new partnerAndAdpushpModel(sitesData, DOMAIN_FIELD_NAME, REVENUE_FIELD);

	console.log('Fetching data from OFT...');
	return getDataFromPartner()
		.then(async function(reportDataJSON) {
			oftMediaPartnerModel.setPartnersData(reportDataJSON);

			// process and map sites data with publishers API data structure
			oftMediaPartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			oftMediaPartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			// TBD - Remove hard coded dates after testing
			const params = {
				siteid: oftMediaPartnerModel.getSiteIds().join(','),
				network: 11,
				fromDate: '2021-01-13',
				toDate: '2021-01-19',
				interval: 'daily',
				// siteid:40792,
				dimension: 'siteid'
			};

			const adpData = await oftMediaPartnerModel.getDataFromAdPushup(params);
			let finalData = oftMediaPartnerModel.compareAdPushupDataWithPartnersData(adpData);

			const {
				PARTNERS_PANEL_INTEGRATION: { ANOMALY_THRESHOLD_IN_PER }
			} = constants;
			// filter out anomalies
			const dataToSend = finalData.filter(
				item =>
					item.diffPer <= -ANOMALY_THRESHOLD_IN_PER || item.diffPer >= ANOMALY_THRESHOLD_IN_PER
			);
			console.log(JSON.stringify(dataToSend, null, 3), 'finalData');
			console.log(finalData.length, 'finalData length');
			console.log(dataToSend.length, 'dataToSend length');
			// // // if anmalies found
			// // if(dataToSend.length) {
			// //     emailer.anomaliesMailService(dataToSend)
			// // }
		})
		.catch(function(error) {
			// handle error
			console.log(error, 'errrr');
		});
};

module.exports = fetchData;
