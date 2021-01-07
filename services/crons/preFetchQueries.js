const moment = require('moment');
const cron = require('node-cron');
const request = require('request-promise');
const CC = require('../../configs/commonConsts');
const redisClient = require('../../middlewares/redis').getClient();
const siteModel = require('../../models/siteModel');
const couchbase = require('../../helpers/couchBaseService');
const { getActiveUsers, getUserSites } = require('./cronhelpers');

const { promiseForeach } = require('node-utils');

let oldTimestamp = null;

const fromDate = moment()
	.subtract(7, 'days')
	.format('YYYY-MM-DD');
const toDate = moment()
	.subtract(1, 'days')
	.format('YYYY-MM-DD');

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
				redisClient.setex(JSON.stringify(requestQuery), 24 * 3600, JSON.stringify(data));
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

					redisClient.setex(JSON.stringify(requestQuery), 24 * 3600, JSON.stringify(response.data));
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
				redisClient.setex(JSON.stringify(requestQuery), 24 * 3600, JSON.stringify(response.data));
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
				const { value = {} } = doc;
				const { lastRunOn } = value;
				if (!lastRunOn) return Promise.reject(new Error('timestamp not found'));

				let newTimestamp = lastRunOn;
				if (oldTimestamp !== newTimestamp) {
					getAllUsersData();
				}

				oldTimestamp = newTimestamp;
			})
		)
		.catch(err => {
			if (oldTimestamp) {
				const currentTime = moment();
				const lastRunTime = moment(oldTimestamp);
				const diffInHours = currentTime.diff(lastRunTime, 'hours');
				if (diffInHours >= 4) {
					redisClient.flushall(function(err, succeeded) {
						console.log(`${succeeded}: Cache Cleared`);
					});
				}
			}
			console.log(err);
		});
}
// getLastRunInfo();
cron.schedule(CC.cronSchedule.prefetchService, getLastRunInfo);
