const axios = require('axios');
const moment = require('moment');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');

const TOKEN = 'D152A218-5DE9-4834-91F0-95542119D520';
const API_ENDPOINT = `https://pmc.criteo.com/api/stats?apitoken=${TOKEN}`;

const PARTNER_NAME = `Criteo`;
const NETWORK_ID = 20;
const DOMAIN_FIELD_NAME = 'Domain';
const REVENUE_FIELD = 'Revenue';

const fromDate = moment().subtract(2, "days").format("YYYY-MM-DD");
const toDate = fromDate;

// TBD - remove hard coded dates
const queryParams = {
	dimensions: 'domain',
	generator: 'daily',
	currency: 'USD',
	metrics: 'Revenue,CriteoDisplays',
	begindate: fromDate,
	enddate: toDate,
	timezone:'PST'
};

/**
 * 1. Get Pub data
 * 2. Get AdPushup data for that Pub
 * 3. Compare both data
 */

const fetchData = async sitesData => {
	const CriteoPartnerModel = new partnerAndAdpushpModel(
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
			CriteoPartnerModel.setPartnersData(reportDataJSON);
			// process and map sites data with publishers API data structure
			CriteoPartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			CriteoPartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			// TBD - Remove hard coded dates after testing
			const params = {
				siteid: CriteoPartnerModel.getSiteIds().join(','),
				network: NETWORK_ID,
				fromDate,
				toDate,
				interval: 'daily',
				// // siteid:40792,
				dimension: 'siteid'
			};

			const adpData = await CriteoPartnerModel.getDataFromAdPushup(params);
			let finalData = CriteoPartnerModel.compareAdPushupDataWithPartnersData(adpData);

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
				const dataToSend = CriteoPartnerModel.formatAnomaliesDataForSQL(anomalies, NETWORK_ID);
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
			console.log('error', `err with ${PARTNER_NAME}`);
		});
};

module.exports = fetchData;
