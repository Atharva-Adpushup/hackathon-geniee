const axios = require('axios');
const csv = require('csvtojson');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel')
const config = require('../../../configs/config');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');
const {
	mapAdPushupSiteIdAndDomainWithPartnersDomain,
	getDataFromAdPushup,
	compareAdPushupDataWithPartnersData
} = require('../common');

const API_ENDPOINT = `https://api.appnexus.com`;

const authParams = {
	auth: {
		username: 'adpushup152ns',
		password: '152Media/12'
	}
};

/**
 * Pub API
 * 1. Get Token If not
 * 2. Check Token validity if exist
 * 3. Get clientId, secret - If needed
 * 4. Fetch data
 * 5. Process Data if needed
 * 6. Return result
 *
 * AdPushup
 * 1. Super User access
 * 2. API endpoint
 * 3. Fetch data
 *
 * Comparison
 * 1. Process both the data if needed
 * 2. compare data
 * 3. Check for anomaly
 * 4. Report anomaly
 *
 * Notes:
 * Some tokens are valid for long time - can be used as constant in config
 * Some may need to refresh after certain time - got expired after some time
 * Some may need to fetch fresh token for every req
 */

// How OFT works.
// 1. Get Auth token before each req
// 2. Get Report Id
// 3. Download Report - CSV
const fetchData = async sitesData => {
    const oftMediaPartnerModel = new partnerAndAdpushpModel(sitesData, 'site_name');
	console.log('Fetching data from OFT...');
	// 1. Get Auth token
	return axios
		.post(`${API_ENDPOINT}/auth`, authParams)
		.then(response => response.data.response)
		.then(function(data) {
			const { token } = data;
			return token;
		})
		.then(async function(token) {
			console.log('Got Auth token before req....', token);
			const queryParams = {
				report: {
					report_type: 'publisher_analytics',
					report_interval: 'last_30_days',
					columns: ['day', 'clicks', 'publisher_revenue', 'site_id', 'site_name'],
					orders: [{ order_by: 'day', direction: 'ASC' }],
					format: 'csv'
				}
			};

            // 2. Get Report Id
            const headers = {
				Authorization: `${token}`
			};
			const reportMetaData = await axios
				.post(`${API_ENDPOINT}/report`, queryParams, { headers })
				.then(response => response.data.response);
			//
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
            const reportDataJSON = await csv().fromString(reportData);
            oftMediaPartnerModel.setPartnersData(reportDataJSON);
			console.log('Got Report Data....', reportDataJSON);

			// process and map sites data with publishers API data structure
			oftMediaPartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();

            // Map PartnersData with Partner and AdPushup's SiteId mapping data
            oftMediaPartnerModel.mapPartnersDataWithSiteIdAndDomain();

            // let siteIdArr = [];
			// let _data = reportDataJSON
			// 	.map(item => {
			// 		const details = sitesDomainAndIdMapping[item['site_name']];
			// 		item.details = details;
			// 		return item;
			// 	})
			// 	.filter(item => !!item.details)
			// 	.map(item => {
			// 		sitesDomainAndIdMapping[item['site_name']].pubRevenue = item.publisher_revenue;
			// 		siteIdArr.push(item.details.siteId);
			// 		return item;
			// 	});
			// console.log(siteIdArr, 'siteIdArr')
            // TBD - Remove hard coded dates after testing
            const params = {
				siteid: oftMediaPartnerModel.getSiteIds().join(','),
				network: 11,
				fromDate: '2021-01-11',
				toDate: '2021-01-17',
				interval: 'daily',
				// siteid:40792,
				dimension: 'siteid'
			};
console.log(params, 'params')
			const adpData = await getDataFromAdPushup(params);
			let finalData = compareAdPushupDataWithPartnersData(adpData);
			const {
				PARTNERS_PANEL_INTEGRATION: { ANOMALY_THRESHOLD_IN_PER }
			} = constants;
			const dataToSend = finalData.filter(
				item =>
					item.diffPer <= -ANOMALY_THRESHOLD_IN_PER || item.diffPer >= ANOMALY_THRESHOLD_IN_PER
			);
			console.log(JSON.stringify(dataToSend, null, 3), 'finalData');
			console.log(finalData.length, 'finalData length');
			console.log(dataToSend.length, 'dataToSend length');
			// // if anmalies found
			// if(dataToSend.length) {
			//     emailer.anomaliesMailService(dataToSend)
			// }
		})
		.catch(function(error) {
			// handle error
			console.log(error, 'errrr');
		});
};

module.exports = fetchData;
