const axios = require('axios');
const moment = require('moment');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');

const API_ENDPOINT = `http://api.pubmatic.com/v1`;

const PARTNER_NAME = `Pubmatic(HB)`;
const NETWORK_ID = 28;
const DOMAIN_FIELD_NAME = 'site_name';
const REVENUE_FIELD = 'netRevenue';
const PUBLISHER_ID = '158261'

const authParams = {
    "userName" : "sharad.yadav@adpushup.com",
    "password": "PcCkgS9Huxbh4WN",
    "apiProduct" : "PUBLISHER"
};

const date = moment().subtract(2, "days");
const fromDatePubmatic = date.format("YYYY-MM-DDT00:00");
const toDatePubmatic = date.format("YYYY-MM-DDT23:59");

const fromDate = date.format("YYYY-MM-DD")
const toDate = date.format("YYYY-MM-DD")

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
const getDataFromPartner = function() {
	// 1. Get Auth token before each req
	return axios
		.post(`${API_ENDPOINT}/developer-integrations/developer/token`, authParams)
		.then(response => response.data)
		.then(function(data) {
			const { accessToken } = data;
			return accessToken;
		})
		.then(async function(token) {
			console.log('Got Auth token before req....', token);

			// 2. Get Report Data
			const queryParams = {
                dateUnit:'date',
                dimensions:'siteId',
                filters:'',
                metrics:'netRevenue,paidImpressions,ecpm',
                pageSize:'',
                sort:'-netRevenue',
                fromDate: fromDatePubmatic,
				toDate: toDatePubmatic,
				timeZone: "PST"
			};
			console.log(queryParams, 'queryParams')
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
                    return processDataReceivedFromPublisher(response.data)
                }).catch(function(error) {
					// handle error
					console.log(error.message, 'error fetching data', 'errrr');
				});
		
        })
        .catch(function(error) {
			// handle error
			console.log(error.message, 'error token data', 'errrr');
		});
};
const processDataReceivedFromPublisher = data => {
    let processedData = data.rows.map(row => {
        const obj = {};
        data.columns.map((col, index) => {
            obj[col] = row[index];
        })
        return obj;
	});
	processedData = processedData
	.map(row => {
        row.site_name = data.displayValue.siteId[row.siteId]
        return row;
	}).filter(row => /AP\/\d+_/.test(row.site_name))
	.map(row => {
		row.site_name = data.displayValue.siteId[row.siteId].replace(/AP\/\d+_/, '');
		return row;
	})
    console.log('Processing end.............')
    return processedData;
}

const fetchData = sitesData => {

	const PubmaticPartnerModel = new partnerAndAdpushpModel(sitesData, DOMAIN_FIELD_NAME, REVENUE_FIELD);

	console.log('Fetching data from Pubmatic...');
	return getDataFromPartner()
		.then(async function(reportDataJSON) {
			PubmaticPartnerModel.setPartnersData(reportDataJSON);

			// process and map sites data with publishers API data structure
			PubmaticPartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			PubmaticPartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			// TBD - Remove hard coded dates after testing
			const params = {
				siteid: PubmaticPartnerModel.getSiteIds().join(','),
				network: NETWORK_ID,
				fromDate,
				toDate,
				interval: 'daily',
				dimension: 'siteid'
			};

			const adpData = await PubmaticPartnerModel.getDataFromAdPushup(params);
			let finalData = PubmaticPartnerModel.compareAdPushupDataWithPartnersData(adpData);

			const {
				PARTNERS_PANEL_INTEGRATION: { ANOMALY_THRESHOLD_IN_PER }
			} = constants;
			// filter out anomalies
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
				const dataToSend = PubmaticPartnerModel.formatAnomaliesDataForSQL(anomalies, NETWORK_ID);
				await Promise.all([
					emailer.anomaliesMailService({
						partner: PARTNER_NAME,
						anomalies
					}),
					saveAnomaliesToDb({
						anomalyData: dataToSend
					})
				]);
			}
		})
		.catch(function(error) {
			// handle error
			console.log('error', `err with ${PARTNER_NAME}`);
		});
};

module.exports = fetchData;
