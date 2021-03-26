const axios = require('axios');
const csv = require('csvtojson');
const moment = require('moment');
const PromisePool = require('@supercharge/promise-pool');

const partnerAndAdpushpModel = require('../PartnerAndAdpushpModel');
const constants = require('../../../configs/commonConsts');
const emailer = require('../emailer');
const saveAnomaliesToDb = require('../saveAnomaliesToDb');
const { axiosErrorHandler, partnerModuleErrorHandler } = require('../utils');

const API_ENDPOINT = `https://api.sovrn.com`;

const PARTNER_NAME = `Sovrn`;
const NETWORK_ID = 11;
const DOMAIN_FIELD_NAME = 'domain';
const REVENUE_FIELD = 'earnings';

const authParams = {
	grant_type: 'password',
	username: 'adpushup1',
	password: 'uCB78s6Bb4LR52M',
	client_id: 'sovrn',
	client_secret: 'sovrn'
};

const fromDateSovrn = moment()
	.subtract(1, 'days')
	.startOf('day')
	.valueOf();

const toDateSovrn = moment()
	.subtract(1, 'days')
	.endOf('day')
	.valueOf();

const fromDate = moment()
	.subtract(1, 'days')
	.format('YYYY-MM-DD');
const toDate = fromDate;

var FormData = require('form-data');
var data = new FormData();
data.append('grant_type', 'password');
data.append('username', 'adpushup1');
data.append('password', 'uCB78s6Bb4LR52M');
data.append('client_id', 'sovrn');
data.append('client_secret', 'sovrn');
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
// 2. Get User IID and All Sites
// 3. Req for each date separately - time should be in millisecond
// 4. Get Req for each site separately
// 5. Calculate eCPM for each day because result is not aggregated.
const getDataFromPartner = function() {
	// 1. Get Auth token before each req
	console.log('Get Auth token before each req');
	const config = {
		method: 'post',
		url: 'https://api.sovrn.com/oauth/token',
		data: data,
		headers: {
			...data.getHeaders()
		}
	};
	return axios(config)
		.then(response => response.data)
		.then(function(response) {
			const { access_token } = response;
			return access_token;
		})
		.then(async function(token) {
			console.log('Got Auth token before req....', token);

			const headers = {
				Authorization: `Bearer ${token}`
			};

			// 2. Get User IID and All Sites
			var config = {
				method: 'get',
				url: `${API_ENDPOINT}/account/user`,
				headers,
				timeout: 1000 * 60 * 5
			};
			console.log(config);
			const { iid, websites } = await axios(config)
				.then(function(response) {
					return response.data;
				})
				.catch(axiosErrorHandler);
			console.log(iid, websites, 'iid, websites');

			// 3. create batch requests and then wait
			const queue = websites.map(item => item.site);

			// // because of GC error split queue to half
			// const len = queue.length
			// const q1 = queue.slice(0, len)
			// const q2 = queue.slice(len)

			// process batches
			console.log('Processing batches.....');
			const { results, errors } = await processReqInBatches(queue.slice(200, 300), headers);
			// const { results: res1, err1 } = await processReqInBatches(q1, headers);
			// const { results: res2, err2 } = await processReqInBatches(q2, headers);

			// const results = [...res1, ...res2];
			return processDataReceivedFromPublisher(results);
		})
		.catch(function(error) {
			// handle error
			console.log(error.message, 'error token data', 'errrr');
		});
};

const processReqInBatches = async (queue, headers) => {
	const batchSize = 50;

	return await PromisePool.withConcurrency(batchSize)
		.for(queue)
		.process(async site => {
			// 3. Req for each date separately - time should be in millisecond
			const queryParams = {
				site,
				startDate: fromDateSovrn,
				endDate: toDateSovrn,
				iid: 13414817
			};

			var config = {
				method: 'get',
				url: `${API_ENDPOINT}/earnings/breakout/all`,
				params: queryParams,
				headers
			};
			console.log(config);

			var config = {
				method: 'get',
				url: `https://api.sovrn.com/earnings/breakout/all?site=${site}&startDate=1616265000000&endDate=1616351399999&iid=13414817`,
				headers: {
					Authorization: headers.Authorization
				}
			};
			console.log(site, ' processing....');
			return await axios(config)
				.then(response => response.data)
				.catch(err => {
					console.log(err);
				});
		});
};

const processDataReceivedFromPublisher = data => {
	var res = {};
	console.log(data, 'data');
	if (!data.length) {
		return [];
	}
	data.breakouts.forEach(row => {
		row.tags
			.filter(tag => {
				return /AP.\d+_/.test(tag.zoneTitle);
			})
			.map(tag => {
				// remove AP_siteId
				tag.domain = tag.domain.replace(/(AP)\/\d+_/, '');
				// remove _size if exist
				// sample AR.34675_cnetfrance.fr_300x250
				tag.domain = tag.domain.replace(/_\d+x\d+$/, '');
				const { domain, earnings, impressions } = tag;
				if (res[domain]) {
					res[domain].earnings += earning;
					res[domain].impressions += impressions;
				} else {
					res[domain] = {
						domain,
						impressions,
						impressions
					};
				}
				return tag;
			});
	});

	console.log(res, 'res');
	let processedData = Object.keys(res).map(domain => res[domain]);
	console.log(processedData, 'processedData');
	console.log('Processing end.............');
	return processedData;
};

const fetchData = sitesData => {
	const SovrnPartnerModel = new partnerAndAdpushpModel(sitesData, DOMAIN_FIELD_NAME, REVENUE_FIELD);

	console.log('Fetching data from Sovrn...');
	return getDataFromPartner()
		.then(async function(reportDataJSON) {
			SovrnPartnerModel.setPartnersData(reportDataJSON);

			// process and map sites data with publishers API data structure
			SovrnPartnerModel.mapAdPushupSiteIdAndDomainWithPartnersDomain();
			// Map PartnersData with AdPushup's SiteId mapping data
			SovrnPartnerModel.mapPartnersDataWithAdPushupSiteIdAndDomain();

			// TBD - Remove hard coded dates after testing
			const params = {
				siteid: SovrnPartnerModel.getSiteIds().join(','),
				network: 11,
				fromDate: '2021-01-13',
				toDate: '2021-01-19',
				interval: 'daily',
				// siteid:40792,
				dimension: 'siteid'
			};

			const adpData = await SovrnPartnerModel.getDataFromAdPushup(params);
			let finalData = SovrnPartnerModel.compareAdPushupDataWithPartnersData(adpData);

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
				const dataToSend = SovrnPartnerModel.formatAnomaliesDataForSQL(anomalies, NETWORK_ID);
				// await Promise.all([
				// 	emailer.anomaliesMailService({
				// 		partner: PARTNER_NAME,
				// 		anomalies
				// 	}),
				// 	saveAnomaliesToDb(dataToSend)
				// ]);
			}
		})
		.catch(async function(error) {
			// await emailer.serviceErrorNotificationMailService({
			// 	partner: PARTNER_NAME,
			// 	error
			// })
			// handle error
			console.log('error', `err with ${PARTNER_NAME}`);
			console.log(error);
		});
};

module.exports = fetchData;
