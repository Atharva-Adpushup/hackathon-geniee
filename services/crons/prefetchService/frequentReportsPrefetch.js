const moment = require('moment');
const _ = require('lodash');
const couchbase = require('couchbase');
const promisePool = require('@supercharge/promise-pool');
const uuid = require('uuid').v4;

const { getReportingData, getAllUsersForFreqReportsLog } = require('./core');
const couchbaseService = require('../../../helpers/couchBaseService');

const PROCESS_PAST_DAYS_FOR_FREQUENT = 7;
const docKey = 'freq:rprt::';
const bucketName = 'AppBucket';
const dataExpiry = 4 * 60 * 60 * 1000; // 4 hours
const reportCacheDateInterval = 7;
const COUNT_OF_REPORTS_TO_CACHE = 3;
const COUNT_OF_CACHED_REPORTS_TO_SHOW = 3;

const getModifiedDateConfig = config => {
	const updatedConfig = _.cloneDeep(config);
	let diffBetweenExistingDates = reportCacheDateInterval;

	if (updatedConfig.fromDate && updatedConfig.toDate) {
		diffBetweenExistingDates = moment(updatedConfig.toDate).diff(
			moment(updatedConfig.fromDate),
			'days'
		);
	}

	updatedConfig.fromDate = moment()
		.subtract(diffBetweenExistingDates, 'days')
		.format('YYYY-MM-DD');
	updatedConfig.toDate = moment().format('YYYY-MM-DD');

	return updatedConfig;
};

const getDatesToProcessFrequentReports = () => {
	const dates = [];
	for (let i = 0; i < PROCESS_PAST_DAYS_FOR_FREQUENT; i++) {
		dates.push(
			moment()
				.subtract(i, 'days')
				.format('YYYY-MM-DD')
		);
	}
	return dates;
};

const orderLogsInDescOrder = (logs = {}, filterCount) => {
	const sortedLogs = Object.entries(logs).sort(
		([firstKey, firstCount], [secondKey, secondCount]) => {
			return secondCount - firstCount;
		}
	);
	if (filterCount) {
		return sortedLogs.slice(0, filterCount);
	}
	return sortedLogs;
};

const fetchAccessLogs = async (email, dates) => {
	console.log(`Fetching access log for ${email}`);
	const docIds = dates.map(date => `"${docKey}${email}:${date}"`);

	const query = `SELECT * FROM ${bucketName} WHERE META().id IN [${docIds}]`;

	const data = await couchbaseService
		.queryViewFromAppBucket(couchbase.N1qlQuery.fromString(query))
		.then((data = []) => data.map(entry => entry[bucketName].reportsLog));
	if (data && data.length) {
		console.log(`---- LOGS FOUND FOR ${email} ----`);
		// merge similar logs from multiple days so that each entry has cumulative count
		const mergedLogs = data.reduce((result, entry) => {
			const values = result;
			Object.keys(entry).forEach(key => {
				if (values[key]) {
					values[key] += entry[key];
				} else {
					values[key] = entry[key];
				}
			});
			return values;
		}, {});
		return {
			results: mergedLogs
		};
	}
	console.log(`--------- NO LOGS FOUND FOR ${email} --------`);
	return {};
};

const fetchAndCacheReport = async configLog => {
	const startTime = Date.now();
	try {
		const [reportKey] = configLog;
		const config = getModifiedDateConfig(JSON.parse(reportKey));
		await getReportingData(config);
		// await redisClient.setValue(reportKey, JSON.stringify(data), dataExpiry)
		return {
			error: false,
			log: config,
			timeTaken: (Date.now() - startTime) / 1000
		};
	} catch (err) {
		return {
			error: true,
			err: JSON.stringify(err),
			config: configLog,
			timeTaken: (Date.now() - startTime) / 1000
		};
	}
};

const cacheReportsForUser = async (email, reportConfigs) => {
	console.log(`Fetching and caching for user ${email} for config`);
	return promisePool
		.withConcurrency(5)
		.for(reportConfigs)
		.process(fetchAndCacheReport)
		.then(({ results }) => {
			const successfulCachedConfigs = results
				.filter(result => !result.error)
				.map(result => result.log);
			const errorConfigs = results
				.filter(result => result.error)
				.map(result => ({ config: result.config, err: result.err, timeTaken: result.timeTaken }));
			console.log({ email, results, successfulCachedConfigs, errorConfigs });
			return { email, reports: successfulCachedConfigs, errorLogs: errorConfigs };
		});
};

const processFilters = filters => {
	return Object.keys(filters).reduce((result, filter) => {
		const filterValues = filters && filters[filter] ? filters[filter].split(',') : [];
		return {
			...result,
			[filter]: filterValues.reduce((result, value) => ({ ...result, [value]: true }), {})
		};
	}, {});
};

const saveCachedFrequentReports = log => {
	const reportDimensionSet = {};
	const { email, reports = [], errorLogs = [] } = log;

	const topLogsForUi = reports.slice(0, COUNT_OF_CACHED_REPORTS_TO_SHOW);
	const frequentReports = topLogsForUi.map((report, i) => {
		const { interval, dimension, fromDate, toDate, ...filters } = report;

		if (reportDimensionSet[dimension]) {
			reportDimensionSet[dimension] += 1;
		} else {
			reportDimensionSet[dimension] = 1;
		}

		return {
			selectedInterval: interval,
			selectedDimension: dimension,
			startDate: fromDate,
			endDate: toDate,
			selectedFilters: processFilters(filters),
			id: uuid(),
			createdDate: Date.now()
		};
	});
	const query = `SELECT * FROM ${bucketName} WHERE META().id = "rprt::${email}"`;
	return couchbaseService
		.queryViewFromAppBucket(couchbase.N1qlQuery.fromString(query))
		.then(data => {
			const rprtDoc = data[0] ? data[0][bucketName] : {};
			const newRprtDoc = {
				...rprtDoc,
				email,
				frequentReports,
				errorLogs
			};
			const upsertQuery = `UPSERT INTO ${bucketName} (KEY, VALUE) VALUES("rprt::${email}", ${JSON.stringify(
				newRprtDoc
			)}) RETURNING *`;
			console.log({ newRprtDoc });
			return couchbaseService.queryViewFromAppBucket(couchbase.N1qlQuery.fromString(upsertQuery));
		});
};

const fetchAccessLogsForUsers = (userEmails = [], dates) => {
	console.log({ userEmails: userEmails.length });
	return promisePool
		.for(userEmails)
		.withConcurrency(Math.min(userEmails.length, 10))
		.process(email => fetchAccessLogs(email, dates))
		.then(result => {
			return result.results;
		});
};

const cacheReports = async logs => {
	return promisePool
		.for(logs)
		.withConcurrency(1)
		.process(log => cacheReportsForUser(log.email, log.results));
};

const savedCachedLogsInCb = async cachedLogs => {
	return promisePool
		.for(cachedLogs)
		.withConcurrency(5)
		.handleError((err, config) => {
			console.log({ err, config });
		})
		.process(saveCachedFrequentReports);
};

const preprocessLogs = async logs => {
	return logs
		.filter(log => Object.keys(log).length)
		.map(log => ({ ...log, results: orderLogsInDescOrder(log.results) }));
};

const cacheFrequentReports = () => {
	console.log('----- STARTING FREQUENT REPORTS PREFETCH -------');
	const dates = getDatesToProcessFrequentReports();
	console.log({ dates });
	// const emailsToTest = ['sriram.r@adpushup.com', 'abhishek.sontakke@adpushup.com', 'mayank.madan@adpushup.com'];

	return getAllUsersForFreqReportsLog()
		.then(userEmails => fetchAccessLogsForUsers(userEmails, dates))
		.then((logs = []) => preprocessLogs(logs))
		.then(cacheReports)
		.then(({ results: cachedLogs }) => savedCachedLogsInCb(cachedLogs))
		.catch(err => console.error(err));
};

// (async function() {
//     try {
//         await cacheFrequentReports();
//     } catch(err) { console.log({ err }); }
// })();

module.exports = cacheFrequentReports;
