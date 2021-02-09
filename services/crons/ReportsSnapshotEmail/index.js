const { promiseForeach } = require('node-utils');
const CC = require('../../../configs/commonConsts');
const { getActiveUsers, getWidgetsDataSite, getLastRunInfo } = require('../cronhelpers');
const { getAllUserSites } = require('../../../models/userModel');
const moment = require('moment');
const cron = require('node-cron');
const config = require('../../../configs/config');

let isCronServiceRunning = false;
let isAllDataFetched = false;
let currentDate;
let fromDate;
let toDate;
let oldTimestamp = null;
let cronDateExecuted = {};

let count = 0;

function getWidgetData(params, path) {
	//return a single widgetData from here
	return getWidgetsDataSite({ params: JSON.stringify(params), path });
}

async function giveDashboardReports(params) {
	try {
		let dashboardReporting = {};
		const keys = [
			'estimatedRevenue',
			'APvsBaseline',
			'siteSummary',
			'revenueByNetwork',
			'getStatsByCustom',
			'countryReport'
		];
		const paths = [...CC.DASHBOARD_QUERY_PATHS];
		for (let i = 0; i < paths.length; i++) {
			const result = await getWidgetData(params, paths[i]);
			dashboardReporting[keys[i]] = result;
		}
		return dashboardReporting;
	} catch (error) {
		console.log(error);
	}
}

async function getEmailSnapshotsSites(userEmail) {
	try {
		const dailyWeeklySubscribedSites = await getAllUserSites(userEmail).reduce(
			(allSites, site, index) => {
				console.log(site, '************');
				const {
					apConfigs: {
						isWeeklyEmailReportsEnabled = false,
						isDailyEmailReportsEnabled = false,
						weeklyEmailEnableTimeStamp
					} = {},
					siteId
				} = site;
				if (isWeeklyEmailReportsEnabled) {
					const weeklyEmailEnableDate = moment(weeklyEmailEnableTimeStamp);
					const diffDays = currentDate.diff(weeklyEmailEnableDate, 'days');
					if (diffDays && diffDays % 7 === 0)
						allSites[1] = index === 0 ? `${siteId}` : `${allSites[1]},${siteId}`;
				}
				if (isDailyEmailReportsEnabled)
					allSites[0] = index === 0 ? `${siteId}` : `${allSites[0]},${siteId}`;
				return allSites;
			},
			['', '']
		);
		return dailyWeeklySubscribedSites;
	} catch (err) {
		console.log(err);
	}
}

async function sendDailySnapshot(siteid, userEmail) {
	const params = { fromDate, toDate, siteid };
	const resultData = await giveDashboardReports(params);
	//here we will generate template and send mail to the user
}

async function sendWeeklySnapshot(siteid, userEmail) {
	const params = { fromDate, toDate, siteid };
	const resultData = await giveDashboardReports(params);
	//here we will generate template and send mail to the user
}

async function processSitesOfUser(userEmail) {
	try {
		console.log(userEmail, count++);
		const dailyWeeklySubscribedSites = await getEmailSnapshotsSites(userEmail);
		const dailySubscribedSites = dailyWeeklySubscribedSites[0],
			weeklySubscribedSites = dailyWeeklySubscribedSites[1];
		if (dailySubscribedSites !== '') sendDailySnapshot(dailySubscribedSites, userEmail);
		if (weeklySubscribedSites !== '') sendWeeklySnapshot(weeklySubscribedSites, userEmail);
	} catch (error) {
		console.log(error);
	}
}

function processEachUser(allUsers) {
	// allUsers = ['matt@flytrapcare.com'];
	return promiseForeach(allUsers, processSitesOfUser);
}

function runSnapshotService() {
	return getActiveUsers().then(processEachUser);
}

function startEmailSnapshotsService() {
	if (isCronServiceRunning && !isAllDataFetched)
		return Promise.resolve('Old cron is already running');
	currentDate = moment();
	// if (cronDateExecuted[currentDate.format()])
	// 	return Promise.resolve('Cron job already executed for the today');
	return getLastRunInfo()
		.then(lastRunTime => {
			console.time();
			console.log({ lastRunTime, oldTimestamp });
			if (!lastRunTime) return Promise.reject(new Error('timestamp not found'));
			if (config.environment.HOST_ENV === 'development' && oldTimestamp === lastRunTime)
				return Promise.resolve('Old timestamp and new timestamp are same, no new reporting data');
			console.log({ lastRunTime, fromDate, toDate, oldTimestamp });
			oldTimestamp = lastRunTime;
			fromDate = moment()
				.subtract(7, 'days')
				.format('YYYY-MM-DD');
			toDate = moment()
				.subtract(1, 'days')
				.format('YYYY-MM-DD');
			cronDateExecuted = {};
			return runSnapshotService();
		})
		.then(() => {
			console.timeEnd();
			console.log('data fetched');
			isAllDataFetched = true;
			isCronServiceRunning = false;
			cronDateExecuted[currentDate.format()] = true;
		})
		.catch(err => {
			console.error(err);
		});
}

cron.schedule(CC.cronSchedule.emailSnapshotsService, startEmailSnapshotsService);
// module.exports = startEmailSnapshotsService;
