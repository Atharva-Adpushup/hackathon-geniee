const request = require('request');
const axios = require('axios');
var moment = require('moment-timezone');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const util = require('util');

const requestPromise = util.promisify(request);
const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');
const { axiosErrorHandler, requestErrorHandler, partnerModuleErrorHandler } = require('../utils');

const {
	PARTNERS_PANEL_INTEGRATION: { ANOMALY_THRESHOLD, ANOMALY_THRESHOLD_IN_PER, OPENX },
	PARTNERS_PANEL_INTEGRATION: { TIMEZONE_OFFSET }
} = require('../../../configs/commonConsts');
const { PARTNER_NAME, NETWORK_ID, DOMAIN_FIELD_NAME, REVENUE_FIELD } = OPENX;

const API_ENDPOINT = `http://openxcorporate-ui3.openxenterprise.com`;

const OAUTH_ENDPOINT_INITIATE = `https://sso.openx.com/api/index/initiate`;
const OAUTH_ENDPOINT_PROCESS = `https://sso.openx.com/login/process`;
const OAUTH_ENDPOINT_TOKEN = `https://sso.openx.com/api/index/token`;

const AUTH_PARAMS = {
	EMAIL: 'sharad.yadav@adpushup.com',
	PASSWORD: '=Xe/v9ZYrj9q:cK2'
};

const CONSUMER = {
	key: '3886c1427947cac75c7034db82f590d01bc826d6',
	secret: 'd457b1ff100015ca3a7dd1d1ed7972aa455231a9'
};

const oauth = OAuth({
	consumer: CONSUMER,
	signature_method: 'HMAC-SHA1',
	hash_function(base_string, key) {
		return crypto
			.createHmac('sha1', key)
			.update(base_string)
			.digest('base64');
	}
});

const initDataForpartner = function() {
	const OFFSET =
	process.env.NODE_ENV === 'production' ? TIMEZONE_OFFSET.PRODUCTION : TIMEZONE_OFFSET.STAGING;
	let fromDateOpenX = moment().subtract(2, 'days');
	let zoneFromDate = moment.tz.zone('America/Los_Angeles').abbr(fromDateOpenX);
	fromDateOpenX = fromDateOpenX
		.set({
			hour: zoneFromDate === 'PDT' ? OFFSET.PDT : OFFSET.PST,
			minute: 30
		})
		.format('YYYY-MM-DDTHH:MM:00Z');

	let toDateOpenX = moment().subtract(1, 'days');
	let zoneToDate = moment.tz.zone('America/Los_Angeles').abbr(toDateOpenX);
	toDateOpenX = toDateOpenX
		.set({
			hour: zoneToDate === 'PDT' ? OFFSET.PDT : OFFSET.PST,
			minute: 30
		})
		.format('YYYY-MM-DDTHH:MM:00Z');

	const fromDate = moment()
		.subtract(2, 'days')
		.format('YYYY-MM-DD');
	const toDate = fromDate;

	return {
		fromDateOpenX,
		toDateOpenX,
		fromDate,
		toDate
	}

}
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
const getDataFromPartner = async function(fromDate, toDate) {
	// Step 1 - Access Token
	// a. Temp Request Token
	const requestTokenObj = await getOAuthRequestToken();
	// b. Verify Temp Token
	const tokenVerifyObj = await getOAuthTokenVerifier(requestTokenObj);
	// c. Get Access Token
	const token = {
		key: tokenVerifyObj.oauth_token,
		secret: requestTokenObj.oauth_token_secret
	};
	const accessTokenObj = await getOAuthAccessToken(tokenVerifyObj, token);

	// Step 2. Fetching data fom Partner
	const responseDataFromAPI = await getDataFromOpenX(accessTokenObj, fromDate, toDate);

	return processDataReceivedFromPublisher(responseDataFromAPI);
};

const getOAuthRequestToken = () => {
	const configForRequestToken = {
		url: `${OAUTH_ENDPOINT_INITIATE}`,
		method: 'post',
		data: {
			oauth_callback: 'oob'
		}
	};

	return requestPromise({
		url: configForRequestToken.url,
		method: configForRequestToken.method,
		form: oauth.authorize(configForRequestToken, {})
	})
		.then(response => response.body)
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
		.catch(requestErrorHandler);
};
const getOAuthTokenVerifier = requestTokenObj => {
	const configForRequestTokenVerification = {
		url: OAUTH_ENDPOINT_PROCESS,
		method: 'POST',
		data: {
			oauth_callback: 'oob',
			email: AUTH_PARAMS.EMAIL,
			password: AUTH_PARAMS.PASSWORD,
			oauth_token: requestTokenObj.oauth_token
		}
	};
	return requestPromise({
		url: configForRequestTokenVerification.url,
		method: configForRequestTokenVerification.method,
		form: oauth.authorize(configForRequestTokenVerification, {})
	})
		.then(response => response.body)
		.then(function(response) {
			response = response.replace(/oob\?/, '');
			// string to obj
			const resObj = {};
			response.split('&').map(item => {
				const [key, val] = item.split('=');
				resObj[key] = val;
				return item;
			});
			return resObj;
		})
		.catch(requestErrorHandler);
};

const getOAuthAccessToken = (tokenVerifyObj, token) => {
	const configForAccessToken = {
		url: OAUTH_ENDPOINT_TOKEN,
		method: 'POST',
		data: {
			oauth_verifier: tokenVerifyObj.oauth_verifier,
			oauth_token: tokenVerifyObj.oauth_token
		}
	};
	return requestPromise({
		url: configForAccessToken.url,
		method: configForAccessToken.method,
		form: oauth.authorize(configForAccessToken, token)
	})
		.then(response => response.body)
		.then(function(response) {
			const resObj = {};
			response.split('&').map(item => {
				const [key, val] = item.split('=');
				resObj[key] = val;
				return item;
			});
			return resObj;
		})
		.catch(requestErrorHandler);
};

const getDataFromOpenX = (accessTokenObj, fromDate, toDate) => {
	const configForFetchingData = {
		method: 'post',
		url: `${API_ENDPOINT}/data/1.0/report`,
		headers: {
			Cookie: `openx3_access_token=${accessTokenObj.oauth_token}`
		},
		data: {
			startDate: fromDate,
			endDate: toDate,
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

	return axios(configForFetchingData)
		.then(response => response.data)
		.then(response => response.reportData)
		.catch(axiosErrorHandler);
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
	const { fromDate, toDate, fromDateOpenX, toDateOpenX } = initDataForpartner();
	const OpenXPartnerModel = new partnerAndAdpushpModel(sitesData, DOMAIN_FIELD_NAME, REVENUE_FIELD);

	console.log('Fetching data from OpenX...');
	return getDataFromPartner(fromDateOpenX, toDateOpenX)
		.then(async function(reportDataJSON) {
			OpenXPartnerModel.setPartnersData(reportDataJSON);

			// process and map sites data with publishers API data response
			OpenXPartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			OpenXPartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

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
					(Math.abs(item.adpRevenue) >= ANOMALY_THRESHOLD ||
						Math.abs(item.pubRevenue) >= ANOMALY_THRESHOLD) &&
					Math.abs(item.diffPer) >= ANOMALY_THRESHOLD_IN_PER
			);

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
		})
		.catch(partnerModuleErrorHandler.bind(null, PARTNER_NAME));
};

module.exports = fetchData;
