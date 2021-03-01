const axios = require('axios');
const csv = require('csvtojson');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');
const nodemailer = require("nodemailer");

const API_ENDPOINT = `http://api.pubmatic.com/v1`;
const DOMAIN_FIELD_NAME = 'site_name';
const REVENUE_FIELD = 'revenue';
const PUBLISHER_ID = '158261'

const authParams = {
    "userName" : "sharad.yadav@adpushup.com",
    "password": "PcCkgS9Huxbh4WN",
    "apiProduct" : "PUBLISHER"
};
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
                fromDate:'2021-01-11T00:00',
                metrics:'revenue,paidImpressions,ecpm',
                pageSize:'',
                sort:'-revenue',
                toDate:'2021-01-18T23:59'
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
                    return processDataReceivedFromPublisher(response.data)
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
    processedData = processedData.map(row => {
        row.site_name = data.displayValue.siteId[row.siteId].replace(/(AP|AR)\/\d+_/, '');
        return row;
    })
    console.log(processedData)
    console.log('Processing end.............')
    return processedData;
}

const fetchData = sitesData => {

	const oftMediaPartnerModel = new partnerAndAdpushpModel(sitesData, DOMAIN_FIELD_NAME, REVENUE_FIELD);

	console.log('Fetching data from Pubmatic...');
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
				network: 31,
				fromDate: '2021-01-11',
				toDate: '2021-01-18',
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
			// console.log(JSON.stringify(dataToSend, null, 3), 'finalData');
			// console.log(finalData.length, 'finalData length');
			// console.log(dataToSend.length, 'dataToSend length');
			// // if anmalies found
			// if(dataToSend.length) {
            //     emailer.anomaliesMailService(dataToSend)
			// }
		})
		.catch(function(error) {
			// handle error
			console.log('error', 'errrr');
		});
};

module.exports = fetchData;
