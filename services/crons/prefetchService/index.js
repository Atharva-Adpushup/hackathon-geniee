const moment = require('moment');
const cron = require('node-cron');
const promisePool = require('@supercharge/promise-pool');
const request = require('request-promise');

const CC = require('../../../configs/commonConsts');
const config = require('../../../configs/config');
const { flushAll } = require('../../../middlewares/redis');

const prefetchFrequentQueries = require('./frequentReportsPrefetch');

const {
	getLastRunInfo,
	getActiveUsers,
	getReportingData,
	getUserSites,
	getMetaData,
	getWidgetsData
} = require('./core');

let isCronServiceRunning = false;
let isAllDataFetched = false;

let oldTimestamp = null;

let fromDate;
let toDate;

function getCustomStatsData(params) {
	const { siteid = '' } = params;
	//As we have to fetch customStats data site level as well as for combined site all
	const sites = (siteid.split(',').length > 1 && siteid.split(',')) || [];
	sites.push(siteid);

	function getAllCustomStatsDataSiteLevel(site) {
		console.log(`Fetching for ${site} custom stats`);
		const paramsNew = { ...params, siteid: site };
		return getReportingData(paramsNew).catch(err => console.log(err));
	}

	return promisePool
		.for(sites)
		.withConcurrency(1)
		.process(getAllCustomStatsDataSiteLevel);
}

function preFetchCustomStats(allSites) {
	const requestQuery = {
		fromDate,
		toDate,
		interval: 'daily',
		siteid: allSites
	};
	return getCustomStatsData(requestQuery).catch(err => console.log(err));
}

function preFetchMeta(allSites) {
	const requestQuery = { sites: allSites };
	return getMetaData(requestQuery).catch(err => console.log(err));
}

function getWidgetData(params, path) {
	const { siteid = '', isSuperUser = false } = params;
	const sites = (siteid.split(',').length > 1 && siteid.split(',')) || [];
	sites.push(siteid);
	function getSiteLevelWidgetData(site) {
		//As global reports api does not send siteid
		if (!isSuperUser) {
			paramsNew = { ...params, siteid: site };
		} else {
			paramsNew = { ...params };
		}
		const requestQuery = {
			path,
			params: JSON.stringify(paramsNew)
		};
		return getWidgetsData(requestQuery).catch(err => {
			console.log(err);
		});
	}
	return promisePool
		.for(sites)
		.withConcurrency(1)
		.process(getSiteLevelWidgetData);
}

function preFetchWidgetData(allSites) {
	const pathsSet = new Set([...CC.DASHBOARD_QUERY_PATHS, ...CC.ADMIN_DASHBOARD_QUERIES]);
	const paths = Array.from(pathsSet);
	const params = { fromDate, toDate, siteid: allSites };
	return promisePool
		.for(paths)
		.withConcurrency(1)
		.process(getWidgetData.bind(null, params));
}

function preFetchGlobalMeta() {
	const requestQuery = {
		sites: '',
		isSuperUser: true
	};
	return getMetaData(requestQuery).catch(err => console.log(err));
}

function preFetchGlobalCustomStats() {
	const requestQuery = {
		fromDate,
		toDate,
		interval: 'daily',
		siteid: '',
		isSuperUser: 'true'
	};
	return getReportingData(requestQuery).catch(err => {
		console.log(err);
	});
}

function preFetchGlobalWidgetData() {
	const params = { fromDate, toDate, isSuperUser: true };
	return promisePool
		.for(CC.ADMIN_DASHBOARD_QUERIES)
		.withConcurrency(5)
		.process(getWidgetData.bind(null, params));
}

async function preFetchAllGlobalData() {
	await preFetchGlobalMeta();
	await preFetchGlobalCustomStats();
	await preFetchGlobalWidgetData();
}

async function preFetchAllData(ownerEmail) {
	try {
		console.log({ ownerEmail });
		const allSites = await getUserSites(ownerEmail);
		await preFetchMeta(allSites);
		await preFetchCustomStats(allSites);
		await preFetchWidgetData(allSites);
	} catch (error) {
		console.log(error);
	}
}

function getAllUsersData() {
	// const ownerEmailsTesting = [
	// 	'shikhar@geeksforgeeks.org',
	// 	'sonoojaiswal1987@gmail.com',
	// 	'amit.qazi@zee.esselgroup.com'
	// ];
	isCronServiceRunning = true;
	isAllDataFetched = false;
	return getActiveUsers()
		.then(ownerEmails =>
			promisePool
				.for(ownerEmails)
				.withConcurrency(5)
				.process(preFetchAllData)
		)
		.then(() => preFetchAllGlobalData());
}

function runPrefetchService() {
	return getAllUsersData().then(prefetchFrequentQueries);
}

function startPrefetchService() {
	if (isCronServiceRunning && !isAllDataFetched)
		return Promise.resolve('Old cron is already running');

	return getLastRunInfo()
		.then(lastRunTime => {
			console.time();
			console.log({ lastRunTime, oldTimestamp });
			if (!lastRunTime) {
				throw new Error('timestamp not found');
			}
			if (config.environment.HOST_ENV === 'production' && oldTimestamp === lastRunTime) {
				return Promise.resolve('Old timestamp and new timestamp are same, no new data to cache');
			}
			console.log({ lastRunTime, fromDate, toDate, oldTimestamp });
			oldTimestamp = lastRunTime;
			fromDate = moment()
				.subtract(7, 'days')
				.format('YYYY-MM-DD');
			toDate = moment()
				.subtract(1, 'days')
				.format('YYYY-MM-DD');
			return runPrefetchService();
		})
		.then(() => {
			console.timeEnd();
			console.log('data fetched');
			isAllDataFetched = true;
			isCronServiceRunning = false;
		})
		.catch(err => {
			console.error(err);
			if (oldTimestamp) {
				const currentTime = moment();
				const lastRunTime = moment(oldTimestamp);
				const diffInHours = currentTime.diff(lastRunTime, 'hours');
				console.log({ currentTime, lastRunTime, diffInHours });
				if (diffInHours >= 4) {
					return flushAll()
						.then(succeeded => console.log(`${succeeded}: Cache Cleared`))
						.catch(err => console.log(err));
				}
			}
		});
}

// startPrefetchService();

cron.schedule(CC.cronSchedule.prefetchService, startPrefetchService);
