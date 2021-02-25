const { promiseForeach } = require('node-utils');
const CC = require('../../../configs/commonConsts');
const {
	getActiveUsers,
	getWidgetsDataSite,
	getLastRunInfo,
	generateEmailTemplate,
	roundOffTwoDecimal,
	numberWithCommas,
	sendEmail
} = require('../cronhelpers');
const { getAllUserSites } = require('../../../models/userModel');
const moment = require('moment');
const cron = require('node-cron');
const config = require('../../../configs/config');
const { generateImageSourcePath } = require('./modules/highCharts');

let isCronServiceRunning = false;
let isAllDataFetched = false;
let currentDate;
let oldTimestamp = null;

let count = 0;

function cleanAllReportingDataForTwoDecimal(allReportingData, widgetKeys) {
	for (let i = 0; i < widgetKeys.length; i++) {
		let widget = widgetKeys[i];
		const widgetData = allReportingData[widget];
		if (widget === 'getStatsByCustom') {
			let { total = {} } = widgetData;
			for (let key in total) {
				if (!isNaN(total[key])) total[key] = numberWithCommas(roundOffTwoDecimal(total[key]));
			}
			widgetData.total = { ...total };
		}
		let { result = [{}] } = widgetData;
		for (let i = 0; i < result.length; i++) {
			for (let key in result[i]) {
				if (!isNaN(result[i][key]))
					result[i][key] = numberWithCommas(roundOffTwoDecimal(result[i][key]));
			}
		}
		allReportingData[widget].result = [...result];
	}
	return allReportingData;
}

function giveEstimatedEarningProgressData(estimatedEarningWidgetData) {
	const {
		lastSevenDays,
		lastThirtyDays,
		previousSevenDays,
		previousThirtyDays,
		sameDayLastWeek,
		yesterday
	} = estimatedEarningWidgetData;
	const dayProgress =
		yesterday > 0 && sameDayLastWeek > 0
			? roundOffTwoDecimal(((yesterday - sameDayLastWeek) / sameDayLastWeek) * 100)
			: 'N/A';
	const weekProgress =
		lastSevenDays > 0 && previousSevenDays > 0
			? roundOffTwoDecimal(((lastSevenDays - previousSevenDays) / previousSevenDays) * 100)
			: 'N/A';
	const monthProgress =
		lastThirtyDays > 0 && previousThirtyDays > 0
			? roundOffTwoDecimal(((lastThirtyDays - previousThirtyDays) / previousThirtyDays) * 100)
			: 'N/A';
	return { dayProgress, weekProgress, monthProgress };
}

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
		return Promise.reject(new Error(`Error in fetching widget data${error}`));
	}
}

async function getEmailSnapshotsSites(userEmail) {
	try {
		let weeklyEnabledDayAllOverSites = null;
		const dailyWeeklySubscribedSites = await getAllUserSites(userEmail).reduce(
			(allSites, site, index) => {
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
					if (
						!weeklyEnabledDayAllOverSites ||
						weeklyEmailEnableDate < weeklyEnabledDayAllOverSites
					) {
						weeklyEnabledDayAllOverSites = weeklyEmailEnableDate;
					}
					allSites[1] = index === 0 ? `${siteId}` : `${allSites[1]},${siteId}`;
				}
				if (isDailyEmailReportsEnabled)
					allSites[0] = index === 0 ? `${siteId}` : `${allSites[0]},${siteId}`;
				return allSites;
			},
			['', '']
		);
		const diffDays = currentDate.diff(weeklyEnabledDayAllOverSites, 'days');
		if (diffDays && diffDays % 7 === 0) return dailyWeeklySubscribedSites;
		else return [dailyWeeklySubscribedSites[0], ''];
	} catch (err) {
		return Promise.reject(new Error(`Error in fetching subscribed sites of user:${error}`));
	}
}

async function sendDailyWeeklySnapshot(siteid, userEmail, type) {
	try {
		const daysGap = type === 'daily' ? 1 : 7;
		let fromDate = moment()
			.subtract(daysGap, 'days')
			.format('YYYY-MM-DD');
		let toDate = moment()
			.subtract(1, 'days')
			.format('YYYY-MM-DD');
		const fromReportingDate = moment(fromDate).format('LL'),
			toReportingDate = moment(toDate).format('LL');
		const params = { fromDate, toDate, siteid };
		const resultData = await giveDashboardReports(params);
		let allReportingData = await generateImageSourcePath(resultData, {
			fromReportingDate,
			toReportingDate,
			type,
			siteid
		});
		allReportingData.progressData = giveEstimatedEarningProgressData(
			allReportingData.estimatedRevenue.result[0] || []
		);
		allReportingData = cleanAllReportingDataForTwoDecimal(allReportingData, [
			'estimatedRevenue',
			'getStatsByCustom',
			'siteSummary'
		]);
		//here we will generate template and send mail to the user

		const template = await generateEmailTemplate('ReportsSnapshotEmail', 'reporting', {
			allReportingData,
			fromReportingDate,
			toReportingDate,
			adpLogo: config.weeklyDailySnapshots.BASE_PATH + 'logo-red-200X50.png',
			arrowUp: config.weeklyDailySnapshots.BASE_PATH + 'up-arrow.png',
			arrowDown: config.weeklyDailySnapshots.BASE_PATH + 'down-arrow.png',
			type
		});
		const subjectMessage = `Adpushup dashboard reporting ${type} snapshot`;
		sendEmail({
			queue: 'MAILER',
			data: {
				to: userEmail,
				body: template,
				subject: subjectMessage
			}
		});
		// return template;
	} catch (error) {
		//here we can send an email to  monitoring service for what happended wrong.
		console.log(error);
	}
}

async function processSitesOfUser(userEmail) {
	try {
		console.log(userEmail, count++);
		const dailyWeeklySubscribedSites = await getEmailSnapshotsSites(userEmail);
		const dailySubscribedSites = dailyWeeklySubscribedSites[0],
			weeklySubscribedSites = dailyWeeklySubscribedSites[1];
		if (dailySubscribedSites !== '')
			await sendDailyWeeklySnapshot(dailySubscribedSites, userEmail, 'daily');
		if (weeklySubscribedSites !== '')
			await sendDailyWeeklySnapshot(weeklySubscribedSites, userEmail, 'weekly');
	} catch (error) {
		console.log(error);
	}
}

function processEachUser(allUsers) {
	// allUsers = ['shikhar@geeksforgeeks.org'];
	return promiseForeach(allUsers, processSitesOfUser);
}

function runSnapshotService() {
	return getActiveUsers().then(processEachUser);
}

function startEmailSnapshotsService() {
	if (isCronServiceRunning && !isAllDataFetched)
		return Promise.resolve('Old cron is already running');
	currentDate = moment();
	return getLastRunInfo()
		.then(lastRunTime => {
			console.time();
			console.log({ lastRunTime, oldTimestamp });
			if (!lastRunTime) return Promise.reject(new Error('timestamp not found'));
			if (config.environment.HOST_ENV === 'development' && oldTimestamp === lastRunTime)
				return Promise.resolve('Old timestamp and new timestamp are same, no new reporting data');
			console.log({ lastRunTime, oldTimestamp });
			oldTimestamp = lastRunTime;
			return runSnapshotService();
		})
		.then(() => {
			console.timeEnd();
			console.log('All Snapshots email sent');
			isAllDataFetched = true;
			isCronServiceRunning = false;
		})
		.catch(err => {
			console.error(err);
		});
}

cron.schedule(CC.cronSchedule.emailSnapshotsService, startEmailSnapshotsService);
// module.exports = startEmailSnapshotsService;
// module.exports = sendDailyWeeklySnapshot;
