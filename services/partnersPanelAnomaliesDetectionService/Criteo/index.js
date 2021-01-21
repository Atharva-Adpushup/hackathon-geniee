const axios = require('axios');
const csv = require('csvtojson');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');

const TOKEN = 'D152A218-5DE9-4834-91F0-95542119D520';
const API_ENDPOINT = `https://pmc.criteo.com/api/stats?apitoken=${TOKEN}`;

const DOMAIN_FIELD_NAME = 'Domain';
const REVENUE_FIELD = 'Revenue';
// TBD - remove hard coded dates
const queryParams = {
	dimensions: 'domain',
	generator: 'daily',
	currency: 'USD',
	metrics: 'Revenue,CriteoDisplays',
	begindate: '2021-01-13',
	enddate: '2021-01-19'
};

/**
 * 1. Get Pub data
 * 2. Get AdPushup data for that Pub
 * 3. Compare both data
 */

const fetchData = async sitesData => {
	const critoePartnerModel = new partnerAndAdpushpModel(
		sitesData,
		DOMAIN_FIELD_NAME,
		REVENUE_FIELD
	);

	console.log('Fetching data from Criteo...');
	return axios
		.get(API_ENDPOINT, {
			params: queryParams
		})
		.then(response => response.data)
		.then(async function(reportDataJSON) {
			critoePartnerModel.setPartnersData(reportDataJSON);
			console.log(reportDataJSON, 'reportDataJSON');
			// process and map sites data with publishers API data structure
			critoePartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			critoePartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			// TBD - Remove hard coded dates after testing
			const params = {
				siteid: critoePartnerModel.getSiteIds().join(','),
				network: 11,
				fromDate: '2021-01-13',
				toDate: '2021-01-19',
				interval: 'daily',
				// // siteid:40792,
				dimension: 'siteid'
			};

			const adpData = await critoePartnerModel.getDataFromAdPushup(params);
			let finalData = critoePartnerModel.compareAdPushupDataWithPartnersData(adpData);

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
			// // if anmalies found
			// if(dataToSend.length) {
            //     emailer.anomaliesMailService(dataToSend)
            //     .catch(err => {
            //         console.log(err);
            //     });            
			// }
		})
		.catch(function(error) {
			// handle error
			console.log(error, 'errrr');
		});
};

module.exports = fetchData;
