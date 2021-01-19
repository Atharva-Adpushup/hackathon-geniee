const request = require('request-promise');
const { N1qlQuery } = require('couchbase');
const { getAdpToken } = require('../../../helpers/authToken');
const userModel = require('../../../models/userModel');
const siteModel = require('../../../models/siteModel');
const couchbase = require('../../../helpers/couchBaseService');
const CC = require('../../../configs/commonConsts');
const { BASE_URL } = require('../../../configs/commonConsts');
function getLastRunInfo() {
	const bucket = 'apLocalBucket';
	return couchbase.connectToBucket(bucket).then(requestBucket =>
		requestBucket.getAsync(CC.docKeys.lastRunInfoDoc).then(doc => {
			//from where lastRunOn is set first
			const { value = {} } = doc;
			const { lastRunOn } = value;
			return Promise.resolve(lastRunOn);
		})
	);
}

function getActiveUsers() {
	return siteModel
		.getActiveSites()
		.then(users => Array.from(new Set(users.map(({ accountEmail }) => accountEmail))));
}

function getAllUsersForFreqReportsLog() {
	const query = `select email from AppBucket where meta().id like "freq:%"`;
	return couchbase
		.queryViewFromAppBucket(N1qlQuery.fromString(query))
		.then(data => Array.from(new Set(data.map(({ email }) => email))).filter(email => !!email));
}

function getUserSites(ownerEmail) {
	return userModel.getUserByEmail(ownerEmail).then(user => {
		const userSites = user.get('sites');

		return userSites
			.map(({ siteId }) => siteId)
			.sort((a, b) => a - b)
			.join();
	});
}

function getReportingData(params) {
	return request({
		uri: `${BASE_URL}/api/reports/getCustomStats`,
		json: true,
		qs: {
			...params,
			bypassCache: true
		},
		headers: {
			authorization: getAdpToken()
		},
		resolveWithFullResponse: true
	}).then(response => {
		if (response.statusCode == 200 && response.body) {
			console.log('fetched report');
			return Promise.resolve(response.body);
		}
		return Promise.reject(new Error('Invalid reporting data'));
	});
}

function getWidgetsDataSite(params) {
	return request({
		uri: `${BASE_URL}/api/reports/getWidgetData`,
		json: true,
		qs: {
			...params,
			bypassCache: true
		},
		headers: {
			authorization: getAdpToken()
		},
		resolveWithFullResponse: true
	}).then(response => {
		if (response.statusCode == 200 && response.body) {
			console.log('fetched widget');
			return Promise.resolve(response.body);
		}
		return Promise.reject(new Error('Invalid widget data'));
	});
}

function getMetaData(params) {
	return request({
		uri: `${BASE_URL}/api/reports/getMetaData`,
		json: true,
		qs: {
			...params,
			bypassCache: true
		},
		headers: {
			authorization: getAdpToken()
		},
		resolveWithFullResponse: true
	}).then(response => {
		if (response.statusCode == 200 && response.body) {
			console.log('fetched meta');
			return Promise.resolve(response.body);
		}
		return Promise.reject(new Error('Invalid meta data'));
	});
}

module.exports = {
	getReportingData,
	getUserSites,
	getActiveUsers,
	getLastRunInfo,
	getMetaData,
	getWidgetsDataSite,
	getAllUsersForFreqReportsLog
};
