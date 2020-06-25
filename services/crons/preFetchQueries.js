const redis = require('redis');
const moment = require('moment');
const cron = require('node-cron');
const userModel = require('../../models/userModel');
const request = require('request-promise');
const CC = require('../../configs/commonConsts');
const config = require('../../configs/config');
const REDIS_PORT = config.environment.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT);
const siteModel = require('../../models/siteModel');
const couchbase = require('../../helpers/couchBaseService');
const { promiseForeach } = require('node-utils');
const { isEqual } = require('lodash');

let oldLastRunInfo = null;

const fromDate = moment()
	.subtract(7, 'days')
	.format('YYYY-MM-DD');
const toDate = moment()
	.subtract(1, 'days')
	.format('YYYY-MM-DD');

function getActiveUsers() {
	return siteModel
		.getActiveSites()
		.then(users => Array.from(new Set(users.map(({ accountEmail }) => accountEmail))))
		.catch(err => console.log(err));
}

function getUserSites(ownerEmail) {
	let siteid = [];

	return userModel
		.getUserByEmail(ownerEmail)
		.then(user => {
			const userSites = user.get('sites');

			userSites.map(({ siteId }) => {
				siteid.push(siteId.toString());
			});
			return siteid.sort((a, b) => a - b).join();
		})
		.catch(err => console.log(err));
}

function preFetchMeta(ownerEmail) {
	return getUserSites(ownerEmail).then(siteid => {
		const params = { siteid, isSuperUser: false };

		const requestQuery = { sites: params.siteid };
		return request({
			uri: `${CC.ANALYTICS_API_ROOT}${CC.ANALYTICS_METAINFO_URL}`,
			json: true,
			qs: params
		})
			.then(response => {
				const { data } = response;
				client.setex(JSON.stringify(requestQuery), 24 * 3600, JSON.stringify(data));
				console.log(data);
			})
			.catch(err => console.log(err));
	});
}

function preFetchCustomStats(ownerEmail) {
	return getUserSites(ownerEmail).then(siteid => {
		const requestQuery = {
			fromDate,
			toDate,
			interval: 'daily',
			siteid
		};
		return request({
			uri: `${CC.ANALYTICS_API_ROOT}${CC.REPORT_PATH}`,
			json: true,
			qs: requestQuery
		})
			.then(response => {
				if (response.code == 1 && response.data) {
					console.log(response.data);

					client.setex(JSON.stringify(requestQuery), 24 * 3600, JSON.stringify(response.data));
				}
			})
			.catch(err => {
				console.log(err);
			});
	});
}

function getWidgetData(params, path) {
	const requestQuery = {
		path,
		params: JSON.stringify(params)
	};

	return request({
		uri: `${CC.ANALYTICS_API_ROOT}${requestQuery.path}`,
		json: true,
		qs: params
	})
		.then(response => {
			if (response.code == 1 && response.data) {
				client.setex(JSON.stringify(requestQuery), 24 * 3600, JSON.stringify(response.data));
				console.log(response.data);
			}
		})
		.catch(err => {
			console.log(err);
		});
}

function preFetchWidgetData(ownerEmail) {
	return getUserSites(ownerEmail)
		.then(siteid => {
			const params = { fromDate, toDate, siteid };

			promiseForeach(CC.DASHBOARD_QUERY_PATHS, getWidgetData.bind(null, params), (data, err) => {
				console.log(err);
				return true;
			});
		})
		.catch(err => console.log(err));
}

function preFetchAllData(ownerEmail) {
	return Promise.resolve()
		.then(() => preFetchMeta(ownerEmail))
		.then(() => preFetchCustomStats(ownerEmail))
		.then(() => preFetchWidgetData(ownerEmail))
		.catch(err => console.log(err));
}

function getAllUsersData() {
	getActiveUsers()
		.then(ownerEmails =>
			promiseForeach(ownerEmails, preFetchAllData, (data, err) => {
				console.log(err);
				return true;
			})
		)
		.catch(err => console.log(err));
}

function getLastRunInfo() {
	const bucket = 'apLocalBucket';
	return couchbase
		.connectToBucket(bucket)
		.then(requestBucket =>
			requestBucket.getAsync(CC.docKeys.lastRunInfoDoc).then(doc => {
				const { lastRunOn } = doc.value;

				let newLastRunInfo = lastRunOn;
				if (!isEqual(oldLastRunInfo, newLastRunInfo)) {
					client.flushall(function(err, succeeded) {
						console.log(`${succeeded}: Cache Cleared`); // will be true if successfull
						getAllUsersData();
					});
				}

				oldLastRunInfo = newLastRunInfo;
			})
		)
		.catch(err => {
			if (oldLastRunInfo) {
				const currentTime = moment();
				const lastRunTime = moment(oldLastRunInfo);
				const diffInHours = currentTime.diff(lastRunTime, 'hours');
				if (diffInHours >= 4) {
					client.flushall(function(err, succeeded) {
						console.log(`${succeeded}: Cache Cleared`);
					});
				}
			}
			console.log(err);
		});
}

cron.schedule(CC.cronSchedule.prefetchService, getLastRunInfo);
