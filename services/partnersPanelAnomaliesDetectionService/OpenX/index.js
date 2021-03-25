const axios = require('axios');
const moment = require('moment');
const querystring = require('querystring');

const OAuth = require('../lib/OAuth');
const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');
const { axiosErrorHandler, partnerModuleErrorHandler } = require('../utils');

const {
	PARTNERS_PANEL_INTEGRATION: { ANOMALY_THRESHOLD_IN_PER, OPENX }
} = require('../../../configs/commonConsts');
const { PARTNER_NAME, NETWORK_ID, DOMAIN_FIELD_NAME, REVENUE_FIELD } = OPENX;

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
};

const date = moment().subtract(1, 'days');
const fromDateOpenX = date.format('YYYY-MM-DDT00:00:00') + 'Z';
const toDateOpenX = date.format('YYYY-MM-DDT23:59:59') + 'Z';
const fromDate = moment()
	.subtract(1, 'days')
	.format('YYYY-MM-DD');
const toDate = fromDate;

/**
 * 1. Get Pub data
 * 2. Get AdPushup data for that Pub
 * 3. Compare both data
 */

// How OpenX works.
// 1. Access Token
//     a. Temp Request Token
//     b. Verify Temp Token
//     c. Get Access Token
// 2. Get Data from Partner
const getDataFromPartner = async function() {
	// Step 1 - Access Token
	// a. Temp Request Token
	const OAuthInstanceForRequestToken = new OAuth({
		consumer: CONSUMER
	});
	const signedOAuthDataForRequestToken = OAuthInstanceForRequestToken.authorize({
		method: 'post',
		url: OAUTH_ENDPOINT_INITIATE
	});
	const stringifiedSignedOAuthDataForRequestToken = querystring.stringify(
		signedOAuthDataForRequestToken
	);
	// 1. Get Auth token before each req
	const configForRequestToken = {
		method: 'post',
		url: `${OAUTH_ENDPOINT_INITIATE}?${stringifiedSignedOAuthDataForRequestToken}`
	};

	const requestTokenObj = await axios(configForRequestToken)
		.then(response => response.data)
		.then(function(response) {
			// string to obj
			const resObj = {};
			response.split('&').map(item => {
				const [key, val] = item.split('=');
				resObj[key] = val;
				return item;
			});
			return resObj;
		})
		.catch(axiosErrorHandler);

	// b. Verify Temp Token
	const FormData = require('form-data');
	const data = new FormData();

	data.append('email', AUTH_PARAMS.EMAIL);
	data.append('password', AUTH_PARAMS.PASSWORD);
	data.append('oauth_token', requestTokenObj.oauth_token);

	const configForRequestTokenVerification = {
		method: 'post',
		url: OAUTH_ENDPOINT_PROCESS,
		headers: {
			...data.getHeaders()
		},
		data: data
	};

	const tokenVerifyObj = await axios(configForRequestTokenVerification)
		.then(response => response.data)
		.then(function(response) {
			const resObj = {};
			response = response.replace(/oob\?/, '');
			// string to obj
			response.split('&').map(item => {
				const [key, val] = item.split('=');
				resObj[key] = val;
				return item;
			});
			return resObj;
		})
		.catch(axiosErrorHandler);

	// c. Get Access Token
	const OAuthInstanceForAccessToken = new OAuth({
		consumer: CONSUMER
	});
	const signedOAuthDataForAccessToken = OAuthInstanceForAccessToken.authorize(
		{
			method: 'post',
			url: OAUTH_ENDPOINT_TOKEN
		},
		{
			public: tokenVerifyObj.oauth_token,
			secret: requestTokenObj.oauth_token_secret
		},
		{
			oauth_verifier: tokenVerifyObj.oauth_verifier
		}
	);

	const stringifiedSignedOAuthDataForAccessToken = querystring.stringify(
		signedOAuthDataForAccessToken
	);
	const configForAccessToken = {
		method: 'post',
		url: `${OAUTH_ENDPOINT_TOKEN}?${stringifiedSignedOAuthDataForAccessToken}`
	};
	const accessTokenObj = await axios(configForAccessToken)
		.then(response => response.data)
		.then(function(response) {
			const resObj = {};
			response.split('&').map(item => {
				const [key, val] = item.split('=');
				resObj[key] = val;
				return item;
			});
			return resObj;
		})
		.catch(axiosErrorHandler);

	// 2. Fetching data fom Partner
	const configForFetchingData = {
		method: 'post',
		url: `${API_ENDPOINT}/data/1.0/report`,
		headers: {
			Cookie: `openx3_access_token=${accessTokenObj.oauth_token}`
		},
		data: {
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
	const responseDataFromAPI = await axios(configForFetchingData)
		.then(response => response.data)
		.then(function(response) {
			console.log(response, 'dataaaaa');
			return response.reportData;
		});

	return processDataReceivedFromPublisher(responseDataFromAPI);
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
	return getDataFromPartner()
		.then(async function(reportDataJSON) {
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
				interval: 'daily',
				dimension: 'siteid'
			};

			const adpData = await OpenXPartnerModel.getDataFromAdPushup(params);
			let finalData = OpenXPartnerModel.compareAdPushupDataWithPartnersData(adpData);

			// filter out anomalies
			const anomalies = finalData.filter(
				item =>
					item.diffPer <= -ANOMALY_THRESHOLD_IN_PER || item.diffPer >= ANOMALY_THRESHOLD_IN_PER
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
					saveAnomaliesToDb(dataToSend, PARTNER_NAME)
				]);
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
