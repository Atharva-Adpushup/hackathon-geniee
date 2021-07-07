const { promiseForeach } = require('node-utils');
const CC = require('../../../configs/commonConsts');
const {
	getActiveUsers,
	getSiteWidgetData,
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
const { generateAndProcessCharts } = require('./modules/highCharts');

let isCronServiceRunning = false;
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
	return getSiteWidgetData({ params: JSON.stringify(params), path });
}

async function giveDashboardReports(params) {
	try {
		let dashboardReporting = {};
		const keysMapingForPath = {
			'/site/report?report_name=site_summary': 'siteSummary',
			'/site/report?report_name=estimated_earning_comparison': 'estimatedRevenue',
			'/site/report?report_name=revenue_by_network': 'revenueByNetwork',
			'/site/report?report_name=get_stats_by_custom&dimension=siteid&interval=cumulative&metrics=adpushup_page_views,adpushup_page_cpm,network_ad_ecpm,network_impressions,network_net_revenue':
				'getStatsByCustom',
			'/site/report?report_name=country_report': 'countryReports'
		};
		const paths = Object.keys(keysMapingForPath);
		for (let i = 0; i < paths.length; i++) {
			const result = await getWidgetData(params, paths[i]);
			const widgetName = keysMapingForPath[paths[i]];
			dashboardReporting[widgetName] = result;
		}
		return dashboardReporting;
	} catch (error) {
		throw new Error(`Error in fetching widget data${error}`);
	}
}

async function setDashboardApVsBaslineReports(dashboardReporting, params) {
	try {
		const path = '/site/report?report_name=ap_vs_baseline';
		const widgetName = 'APvsBaseline';
		const result = await getWidgetData(params, path);
		dashboardReporting[widgetName] = result;
	} catch (error) {
		throw new Error(`Error in fetching ApVsBaseline widget data${error}`);
	}
}

function giveHighesRevenueSite(siteSummary) {
	let highestRevenueSite = '';
	let highestRevenueValue = -1;
	const { result = [] } = siteSummary;
	for (let site of result) {
		const { network_net_revenue, siteid } = site;
		if (network_net_revenue > highestRevenueValue) {
			highestRevenueSite = siteid;
			highestRevenueValue = network_net_revenue;
		}
	}
	return highestRevenueSite;
}

async function getEmailSnapshotsSites(userEmail) {
	try {
		//here we are maintaing the daily and weekly subscribed sites in the string comma seprated format
		const initailObject = {
			dailySubscribedSites: [],
			weeklySubscribedSites: []
		};
		const subscribedSites = await getAllUserSites(userEmail).reduce((allSites, site, index) => {
			const {
				apConfigs: { isWeeklyEmailReportsEnabled = false, isDailyEmailReportsEnabled = false } = {},
				siteId
			} = site;
			let { dailySubscribedSites, weeklySubscribedSites } = allSites;
			if (isDailyEmailReportsEnabled) {
				dailySubscribedSites.push(siteId);
			}
			if (isWeeklyEmailReportsEnabled) {
				weeklySubscribedSites.push(siteId);
			}
			return { dailySubscribedSites, weeklySubscribedSites };
		}, initailObject);
		return subscribedSites;
	} catch (error) {
		throw new Error(`Error in fetching subscribed sites of user:${error}`);
	}
}

function giveApVsBaselineRevenue(APvsBaseline) {
	const { result = [] } = APvsBaseline;
	const adpushupRevenueKey = 'adpushup_variation_revenue';
	const originalRevenueKey = 'original_variation_revenue';
	const initialObject = {
		adpushupRevenue: 0,
		originalRevenue: 0
	};
	return result.reduce((accumulatedResult, currentResult) => {
		const { adpushupRevenue, originalRevenue } = accumulatedResult;
		return {
			adpushupRevenue: adpushupRevenue + currentResult[adpushupRevenueKey],
			originalRevenue: originalRevenue + currentResult[originalRevenueKey]
		};
	}, initialObject);
}

async function sendSnapshot(siteids, userEmail, type) {
	try {
		const daysGap = type === 'daily' ? 1 : 7;
		let fromDate = moment()
			.subtract(daysGap, 'days')
			.format('YYYY-MM-DD');
		let toDate = moment()
			.subtract(1, 'days')
			.format('YYYY-MM-DD');
		const fromReportingDate = moment(fromDate).format('DD/MM/YYYY');
		const toReportingDate = moment(toDate).format('DD/MM/YYYY');
		const params = { fromDate, toDate, siteid: siteids };
		const resultData = await giveDashboardReports(params);
		let isApVsBaslineChartShown = false;
		if (type === 'weekly') {
			const getHighestRevenueSite = giveHighesRevenueSite(resultData.siteSummary);
			await setDashboardApVsBaslineReports(resultData, {
				...params,
				siteid: `${getHighestRevenueSite}`
			});
			const { adpushupRevenue, originalRevenue } = giveApVsBaselineRevenue(
				resultData.APvsBaseline || {}
			);
			const baselineRevenuePercentage = (originalRevenue / adpushupRevenue) * 100;
			if (baselineRevenuePercentage >= 0.05) isApVsBaslineChartShown = true;
		}
		let allReportingData = await generateAndProcessCharts(
			{ ...resultData, isApVsBaslineChartShown },
			{
				fromReportingDate,
				toReportingDate,
				type,
				siteids
			}
		);
		allReportingData.progressData = giveEstimatedEarningProgressData(
			allReportingData.estimatedRevenue.result[0] || []
		);
		allReportingData = cleanAllReportingDataForTwoDecimal(allReportingData, [
			'estimatedRevenue',
			'getStatsByCustom',
			'siteSummary'
		]);
		//here we will generate template and send mail to the user

		const ejsTemplateData = {
			allReportingData,
			fromReportingDate,
			toReportingDate,
			adpLogo: config.weeklyDailySnapshots.BASE_PATH + 'logo-full.png',
			arrowUp: config.weeklyDailySnapshots.BASE_PATH + 'up-arrow.png',
			arrowDown: config.weeklyDailySnapshots.BASE_PATH + 'down-arrow.png',
			type,
			isApVsBaslineChartShown
		};

		const template = await generateEmailTemplate(
			'ReportsSnapshotEmail',
			'reporting',
			ejsTemplateData
		);
		const subjectMessage = `Adpushup ${type} dashboard reporting snapshot `;
		console.log('proceesed user', siteids, type, userEmail, ++count);
		//'amit.gupta@adpushup.com' testing email
		sendEmail({
			queue: 'MAILER',
			data: {
				to: userEmail,
				body: template,
				subject: subjectMessage
			}
		});
	} catch (error) {
		//here we can send an email to  monitoring service for what happended wrong.
		console.log(error);
	}
}

async function processSitesOfUser(userEmail) {
	try {
		console.log('processing user', userEmail);
		const { dailySubscribedSites = [], weeklySubscribedSites = [] } = await getEmailSnapshotsSites(
			userEmail
		);
		if (dailySubscribedSites.length !== 0)
			await sendSnapshot(dailySubscribedSites.join(','), userEmail, 'daily');
		//0->sunday,1->Monday and so on
		const dayOfWeek = currentDate.day();
		//if week day is monday
		if (dayOfWeek === 1) {
			if (weeklySubscribedSites.length !== 0)
				await sendSnapshot(weeklySubscribedSites.join(','), userEmail, 'weekly');
		}
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
	if (isCronServiceRunning) return Promise.resolve('Old cron is already running');
	currentDate = moment();
	return getLastRunInfo()
		.then(lastRunTime => {
			console.time();
			console.log({ lastRunTime, oldTimestamp });
			if (!lastRunTime) {
				throw new Error('timestamp not found');
			}
			if (config.environment.HOST_ENV === 'production' && oldTimestamp === lastRunTime) {
				return Promise.resolve('Old timestamp and new timestamp are same, no new reporting data');
			}
			console.log({ lastRunTime, oldTimestamp });
			oldTimestamp = lastRunTime;
			return runSnapshotService();
		})
		.then(() => {
			console.timeEnd();
			console.log('All Snapshots email sent');
			isCronServiceRunning = false;
		})
		.catch(err => {
			console.timeEnd();
			console.error(err);
		});
}

cron.schedule(CC.cronSchedule.emailSnapshotsService, startEmailSnapshotsService);
// module.exports = startEmailSnapshotsService;
// module.exports = sendSnapshot;
