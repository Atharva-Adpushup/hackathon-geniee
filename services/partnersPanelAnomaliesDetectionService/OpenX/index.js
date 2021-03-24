const axios = require('axios');
const moment = require('moment');
const querystring = require('querystring');

const OAuth = require('../lib/OAuth');
const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');
const { axiosErrorHandler, partnerModuleErrorHandler } = require('../utils');

const {
	PARTNERS_PANEL_INTEGRATION: { ANOMALY_THRESHOLD_IN_PER, OPENX }
} = require('../../../configs/commonConsts');
const { PARTNER_NAME, NETWORK_ID, DOMAIN_FIELD_NAME, REVENUE_FIELD } = OPENX;

const AUTH_ENDPOINT = `https://auth.indexexchange.com/auth/oauth/token`;
const API_ENDPOINT = `http://openxcorporate-ui3.openxenterprise.com`;

const OAUTH_ENDPOINT_INITIATE = `https://sso.openx.com/api/index/initiate`;
const OAUTH_ENDPOINT_PROCESS = `https://sso.openx.com/login/process`;
const OAUTH_ENDPOINT_TOKEN = `https://sso.openx.com/api/index/token`;

const AUTH_PARAMS = {
	EMAIL: 'sharad.yadav@adpushup.com',
	PASSWORD: 'L@y58vfThW'
};

const CONSUMER = {
    public: '3886c1427947cac75c7034db82f590d01bc826d6',
    secret: 'd457b1ff100015ca3a7dd1d1ed7972aa455231a9'
}

// 2021-03-23T00:00:00Z
const date = moment().subtract(2, 'days');
const fromDateOpenX = date.format('YYYY-MM-DDT00:00:00') + 'Z';
const toDateOpenX = date.format('YYYY-MM-DDT23:59:59') + 'Z';
console.log(fromDateOpenX, toDateOpenX)
const fromDate = moment()
	.subtract(2, 'days')
	.format('YYYY-MM-DD');
const toDate = fromDate;

/**
 * 1. Get Pub data
 * 2. Get AdPushup data for that Pub
 * 3. Compare both data
 */

// How IndexExchange works.
// 1. Get Auth token before each req
// 2. Get Placement info
// 3. Get Sites data based on Placement Ids
// 4. Get earnings from siteIds
const getDataFromPartner = async function() {
	var auth = new OAuth({
		consumer: CONSUMER
	});
	const reqObj = auth.authorize({
		method: 'post',
		url: OAUTH_ENDPOINT_INITIATE
	});

	const result = querystring.stringify(reqObj);
	console.log(result);

	// 1. Get Auth token before each req
	var config = {
		method: 'post',
		url: `${OAUTH_ENDPOINT_INITIATE}?${result}`,
	};

	const tokenObj = await axios(config)
		.then(response => response.data)
		.then(function(response) {
			const resObj = {};
			response.split('&').map(item => {
				const [key, val] = item.split('=');
				resObj[key] = val;
				return item;
			});
			console.log(response, 'response');
			console.log(resObj, 'resObj');
			return resObj;
		})
		.catch(function(error) {
			console.log(error);
		});
	// .catch(axiosErrorHandler);

	console.log('Got Auth token before req....', tokenObj);

	var FormData = require('form-data');
    var data = new FormData();
    
	data.append('email', AUTH_PARAMS.EMAIL);
	data.append('password', AUTH_PARAMS.PASSWORD);
	data.append('oauth_token', tokenObj.oauth_token);

	var config = {
		method: 'post',
		url: OAUTH_ENDPOINT_PROCESS,
		headers: {
			...data.getHeaders()
		},
		data: data
	};
	console.log(config, 'config tokenverify input');
	const tokenVerifyObj = await axios(config)
		.then(response => response.data)
		.then(function(response) {
			const resObj = {};
			response = response.replace(/oob\?/, '');
			response.split('&').map(item => {
				const [key, val] = item.split('=');
				resObj[key] = val;
				return item;
			});
			console.log(response, 'response');
			console.log(resObj, 'resObj');
			return resObj;
		})
		.catch(function(error) {
			console.log(error);
		});

	console.log(tokenVerifyObj, 'tokenVerifyObj');
	var auth2 = new OAuth({
		consumer: CONSUMER
	});

	const reqObj2 = auth2.authorize(
		{
			method: 'post',
			url: OAUTH_ENDPOINT_TOKEN
		},
		{
			public: tokenVerifyObj.oauth_token,
			secret: tokenObj.oauth_token_secret
		},
		{
			oauth_verifier: tokenVerifyObj.oauth_verifier
		}
	);
	// reqObj2.oauth_token= tokenVerifyObj.oauth_token;
	console.log(reqObj2, 'reqObj2');
	const result2 = querystring.stringify(reqObj2);
	console.log(result2, 'result2');

	var config2 = {
		method: 'post',
		url: `${OAUTH_ENDPOINT_TOKEN}?${result2}`,
		headers: {
			'Content-Type': 'application/json'
			// Cookie: `openx3_access_token=${tokenVerifyObj.oauth_token}`
		}
	};

	const tokenObj2 = await axios(config2)
		.then(response => response.data)
		.then(function(response) {
			console.log(response, 'response acc token');

			const resObj = {};
			response.split('&').map(item => {
				const [key, val] = item.split('=');
				resObj[key] = val;
				return item;
			});
			console.log(response, 'response');
			console.log(resObj, 'resObj');

			return resObj;
		})
		.catch(function(error) {
			console.log(error);
		});
	console.log('Got Auth token before req....', tokenObj2);

	var config2 = {
		method: 'post',
		url: `${API_ENDPOINT}/data/1.0/report`,
		headers: {
			'Content-Type': 'application/json',
			Cookie: `openx3_access_token=${tokenObj2.oauth_token}`
		},
		data: {
            // 2021-03-23T00:00:00Z
            // 2021-03-23T23:59:59Z

			// startDate: '2021-03-24T00:00:00Z',
            // endDate: '2021-03-23T24:59:59Z',
			startDate: fromDateOpenX,
            endDate: toDateOpenX,
			attributes: [
				{ id: 'publisherAccountName' },
				{ id: 'publisherAccountId' },
				{ id: 'publisherCurrency' },
				{ id: 'publisherSiteName' }
			],
			metrics: [
				{ id: 'privateMarketPublisherGrossRevenue' },
				{ id: 'marketPublisherRevenue' },
				{ id: 'marketImpressions' }
			]
        }
    };
    const resData = await axios(config2)
    .then(response => response.data)
    .then(function(response) {
        console.log(response, 'dataaaaa');
        return response.reportData;
    });

    return processDataReceivedFromPublisher(resData)
    return resData;
	// return [];
	// http://openxcorporate-ui3.openxenterprise.com/data/1.0/report

	// const headers = {
	// 	Authorization: `Bearer ${token}`
	// };

	// // 2. Get Placement Info
	// const placementData = await getPlacementData(headers);
	// // 3. Get Sites Info from placementIds
	// const siteIdsAndNameMappingFromPubData = await getAllSitesInfo(headers);

	// // process batches
	// console.log('Processing batches.....');
	// const { results, errors } = await processReqInBatches(queue, headers);
	// return processDataReceivedFromPublisher(results, siteIdsAndNameMappingFromPubData);
};

const processDataReceivedFromPublisher = data => {
	let processedData = data
		.filter(row => /AP\/\d+_/.test(row.publisherSiteName))
		.map(row => {
			row.publisherSiteName = row.publisherSiteName.replace(/AP\/\d+_/, '');
			return row;
		});
	console.log('Processing end.............');
	return processedData;
};

const fetchData = sitesData => {
	const OpenXPartnerModel = new partnerAndAdpushpModel(sitesData, DOMAIN_FIELD_NAME, REVENUE_FIELD);

	console.log('Fetching data from OpenX...');
	return getDataFromPartner().then(async function(reportDataJSON) {
		OpenXPartnerModel.setPartnersData(reportDataJSON);

		// process and map sites data with publishers API data structure
		OpenXPartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
		// Map PartnersData with AdPushup's SiteId mapping data
		OpenXPartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

		// TBD - Remove hard coded dates after testing
		const params = {
			siteid: OpenXPartnerModel.getSiteIds().join(','),
			network: NETWORK_ID,
			fromDate: fromDate,
            toDate: toDate,
            // fromDate: '2021-03-23',
			// toDate: '2021-03-23',
			interval: 'daily',
			dimension: 'siteid'
		};

        const adpData = await OpenXPartnerModel.getDataFromAdPushup(params);
		let finalData = OpenXPartnerModel.compareAdPushupDataWithPartnersData(adpData);

		// filter out anomalies
		const anomalies = finalData.filter(
			item => item.diffPer <= -ANOMALY_THRESHOLD_IN_PER || item.diffPer >= ANOMALY_THRESHOLD_IN_PER
		);
		// console.log(JSON.stringify(anomalies, null, 3), 'anomalies');
		console.log(finalData.length, 'finalData length');
		console.log(anomalies.length, 'anomalies length');

		// if aonmalies found
		if (anomalies.length) {
			const dataToSend = OpenXPartnerModel.formatAnomaliesDataForSQL(anomalies, NETWORK_ID);
			await Promise.all([
				emailer.anomaliesMailService({
					partner: PARTNER_NAME,
					anomalies
				}),
				// saveAnomaliesToDb(dataToSend, PARTNER_NAME)
			]);
		}
		return {
			total: finalData.length,
			anomalies: anomalies.length,
			partner: PARTNER_NAME,
			message: 'Success'
		};
	});
	// .catch(partnerModuleErrorHandler.bind(null, PARTNER_NAME));
};

module.exports = fetchData;
