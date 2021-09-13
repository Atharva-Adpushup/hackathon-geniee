const couchbase = require('couchbase');
const axios = require('axios').default;
const _ = require('lodash');
const request = require('request-promise');
const moment = require('moment');

const config = require('../configs/config');
const CC = require('../configs/commonConsts');
const { queryViewFromAppBucket, getDoc, upsertDoc } = require('../helpers/couchBaseService');
const {
	sortObjectEntries,
	roundOffTwoDecimal,
	doesReportingHavePageViewData
} = require('../helpers/utils');
const AdPushupError = require('../helpers/AdPushupError');
const {
	getCustomStatsValidations,
	getMetaDataValidations,
	getWidgetDataValidations
} = require('../validations/reportsValidations');
const cacheWrapper = require('../helpers/cacheWrapper');
const ObjectValidator = require('../helpers/ObjectValidator');

const { getUserGaEnabledSites, getUserByEmail } = require('../models/userModel');
const { getAllGaEnabledSites } = require('../models/siteModel');

const reportsService = {
	generateCronExpression: (interval, startDate) => {
		if (!interval || !startDate) throw new Error('Invalid parameters to generate schedule cron');
		let cron = '';
		const start = new Date(startDate);
		switch (interval) {
			case 'daily':
				cron = '0 20 * * *'; // everyday at 8PM
				break;
			case 'weekly':
				cron = `0 20 * * ${start.getDay()}`; // same day every week at 8PM
				break;
			case 'monthly':
				cron = `0 20 ${start.getDate()} * *`; // same date every month at 8PM
				break;
			default:
				throw new Error('Invalid schedule interval');
		}
		return cron;
	},
	scheduleReportJob: async (configuration, email) => {
		const { scheduleOptions, ...reportConfig } = configuration;
		const jobConfiguration = {
			type: 'RABBITMQ',
			config: {
				queue: 'REPORTS_SCHEDULER',
				data: {
					sendTo: email,
					endDate: reportConfig.endDate,
					startDate: reportConfig.startDate,
					name: reportConfig.name,
					dimension: reportConfig.selectedDimension,
					filters: reportConfig.selectedFilters,
					interval: reportConfig.selectedInterval,
					id: reportConfig.id
				}
			},
			retryOptions: {
				attempts: 3
			},
			executionOptions: {
				type: 'repeat',
				value: scheduleOptions.cron,
				startDate: scheduleOptions.startDate,
				endDate: scheduleOptions.endDate
			}
		};
		return axios
			.post(`${config.SCHEDULER_API_ROOT}/schedule`, jobConfiguration)
			.then(response => response.data);
	},
	cancelScheduledJob: async jobId => {
		if (jobId) {
			return axios.delete(`${config.SCHEDULER_API_ROOT}/cancel/${jobId}`);
		}
		return Promise.resolve();
	},
	initiateReportsSchedule: async (reportConfig, email) => {
		const { interval, startDate } = reportConfig.scheduleOptions;
		const cronExpression = reportsService.generateCronExpression(interval, startDate);

		const scheduleConfig = Object.assign({}, reportConfig);

		scheduleConfig.scheduleOptions.cron = cronExpression;

		const scheduledJobData = await reportsService.scheduleReportJob(reportConfig, email);
		scheduleConfig.scheduleOptions.jobId = scheduledJobData.job.id;

		return scheduleConfig;
	},
	getKeyFromProps: (report = {}, props = []) => {
		const propValues = props.map(prop => report[prop]);
		return propValues.join(',');
	},
	mergeReportingWithSessionRpmReports: (
		reports = [],
		sessionRpmReports = [],
		sessionRpmColumns = []
	) => {
		const sessionRpmUniqueProps = CC.SESSION_RPM.SESSION_RPM_PROPS; // list of columns from session rpm report that needs to be merged with normal reports
		const propsToIgnore = CC.SESSION_RPM.IGNORE_PROPS;
		const mergableProps = sessionRpmColumns.filter(
			column => !sessionRpmUniqueProps.includes(column) && !propsToIgnore.includes(column)
		);

		const sessionRpmMap = sessionRpmReports.reduce((result, report) => {
			const key = reportsService.getKeyFromProps(report, mergableProps);
			return {
				...result,
				[key]: report
			};
		}, {});

		const mergedReportingData = reports.map(report => {
			const key = reportsService.getKeyFromProps(report, mergableProps);
			const reportClone = _.cloneDeep(report);
			if (sessionRpmMap[key]) {
				const rpmReport = sessionRpmMap[key];
				sessionRpmUniqueProps.forEach(prop => {
					reportClone[prop] = rpmReport[prop];
				});
			} else {
				sessionRpmUniqueProps.forEach(prop => {
					reportClone[prop] = 0;
				});
			}
			return reportClone;
		});

		return mergedReportingData;
	},
	mergeReportColumns: reportColumns => [...reportColumns, ...CC.SESSION_RPM.SESSION_RPM_PROPS],
	calculateSessionTotals: (sessionReports = []) => {
		const totalSessions = sessionReports.reduce(
			(result, report) => result + report.user_sessions,
			0
		);
		const totalNetworkRevenue = sessionReports.reduce(
			(result, report) => result + report.network_net_revenue,
			0
		);

		const totalSessionRpm = (totalNetworkRevenue / totalSessions) * 1000;

		return {
			total_session_rpm: totalSessionRpm,
			total_user_sessions: totalSessions
		};
	},
	mergeReportsWithSessionRpmData: (reportsData, sessionRpmData, isSuperUser = false) => {
		const { result: reports, columns: reportColumns, total: reportsTotals } = reportsData;
		const { result: sessionRpmReports, columns: sessionRpmColumns } = sessionRpmData;

		const mergedReports = reportsService.mergeReportingWithSessionRpmReports(
			reports,
			sessionRpmReports,
			sessionRpmColumns
		);

		const mergedColumns = reportsService.mergeReportColumns(reportColumns, sessionRpmColumns);

		const sessionTotals = reportsService.calculateSessionTotals(sessionRpmReports);
		const mergedTotal = {
			...reportsTotals,
			...sessionTotals
		};

		const mergedData = {
			result: mergedReports,
			columns: mergedColumns
		};

		if (!isSuperUser) mergedData.total = mergedTotal;

		return mergedData;
	},
	getReportingMetaData: (siteid, isSuperUser) => {
		const params = { siteid, isSuperUser };
		return ObjectValidator(getMetaDataValidations, params)
			.then(() => reportsService.modifyQueryIfPnp(params))
			.then(params => {
				return request({
					uri: `${CC.ANALYTICS_API_ROOT}${CC.ANALYTICS_METAINFO_URL}`,
					json: true,
					qs: params
				})
			})
			.then(response => {
				const { code = -1, data } = response;
				if (code !== 1) return Promise.reject(new Error(response.data));
				return data;
			});
	},
	modifyQueryIfPnp: query => {
		const regex = new RegExp('^[0-9]*(,[0-9]+)*$');
		if (!query.siteid) return query;
		if (!regex.test(query.siteid)) {
			throw new Error('Invalid parameter in query.siteid');
		}
		const siteIds = query.siteid.split(',').map(siteId => parseInt(siteId));
		const pnpQuery = CC.GET_ACTIVE_PNP_SITE_MAPPING_QUERY.replace('$1', JSON.stringify(siteIds));
		const dbQuery = couchbase.N1qlQuery.fromString(
			pnpQuery
		);
		return queryViewFromAppBucket(dbQuery)
			.then(data => {
				// data is array of objects e.g.. [{mappedPnpSiteId: 41355}, {mappedPnpSiteId:41395}]
				if (data && Array.isArray(data) && data.length) {
					const pnpSiteIds = data.reduce((result, { pnpSiteId }) => `${pnpSiteId},${result}`, '');
					const newSiteIds =  `${pnpSiteIds}${siteIds.join(',')}`;
					query.siteid = newSiteIds;
				}
				return query;
			})
			.catch(err => {
				console.error(err);
				throw new Error('Error while accessing data');
			});
	},
	fetchReports: async reportConfig => {
		const reportsResponse = await request({
			uri: `${CC.ANALYTICS_API_ROOT}${CC.REPORT_PATH}`,
			json: true,
			qs: reportConfig,
			timeout: 600000 //10 mins
		});

		if (reportsResponse.code !== 1) throw new AdPushupError(reportsResponse);
		return reportsResponse.data;
	},
	fetchReportAPCustomStatXPath: async reportConfig => {
		const reportsResponse = await request({
			uri: `${CC.ANALYTICS_API_ROOT}${CC.REPORT_PATH_XPATH}`,
			json: true,
			qs: reportConfig,
			timeout: 600000 //10 mins
		});

		if (reportsResponse.code !== 1) throw new AdPushupError(reportsResponse);
		return reportsResponse.data;
	},
	fetchSessionData: async reportConfig => {
		const sessionRpmReportsResponse = await request({
			uri: `${CC.SESSION_RPM_REPORTS_API}`,
			json: true,
			qs: reportConfig
		});
		if (sessionRpmReportsResponse.code !== 1) throw new AdPushupError(sessionRpmReportsResponse);
		return sessionRpmReportsResponse.data;
	},
	fetchAndMergeSessionData: async (reportConfig = {}, reportsData = {}, isSuperUser = false) => {
		const sessionRpmSupportedDimensions = CC.SESSION_RPM.SUPPORTED_DIMENSIONS;
		const sessionRpmSupportedFilters = CC.SESSION_RPM.SUPPORTED_FILTERS;

		const { fromDate, toDate, interval, dimension, ...filters } = reportConfig;

		const unsupportedFiltersForSessionData = Object.keys(filters).filter(
			filter => !sessionRpmSupportedFilters.includes(filter)
		);

		if (
			(dimension && !sessionRpmSupportedDimensions.includes(dimension)) ||
			unsupportedFiltersForSessionData.length
		) {
			return reportsData;
		}

		const sessionData = await reportsService.fetchSessionData(reportConfig);
		return reportsService.mergeReportsWithSessionRpmData(reportsData, sessionData, isSuperUser);
	},
	getReports: async (reportConfig, email) =>
		ObjectValidator(getCustomStatsValidations, reportConfig)
			.then(() => reportsService.modifyQueryIfPnp(reportConfig))
			.then(config => reportsService.processAndSendReportingData(email, config, reportConfig)),
	getReportAPCustomStatXPath: async reportConfig =>
		ObjectValidator(getCustomStatsValidations, reportConfig)
			.then(() => reportsService.modifyQueryIfPnp(reportConfig))
			.then(config => reportsService.fetchReportAPCustomStatXPath(config)),
	getWidgetData: async (path, params) =>
		ObjectValidator(getWidgetDataValidations, { path, params })
			.then(() =>
				request({
					uri: `${CC.ANALYTICS_API_ROOT}${path}`,
					json: true,
					qs: params
				})
			)
			.then(response => {
				if (response && response.code !== 1) throw new AdPushupError(response);
				return response.data;
			}),
	getReportsWithCache: async (reportConfig, bypassCache = false, email) => {
		const { siteid } = reportConfig;
		//bypass if site has blocked prefetch
		if (siteid)
			config.prefetchBlockedSites.forEach(blockedSitePreFetch => {
				if (siteid.indexOf(blockedSitePreFetch) !== -1) bypassCache = true;
			});
		const sortedConfig = sortObjectEntries(reportConfig);
		return ObjectValidator(getCustomStatsValidations, sortedConfig).then(() => {
			return cacheWrapper(
				{ cacheKey: JSON.stringify(sortedConfig), bypassCache, cacheExpiry: 4 * 3600 },
				async () => reportsService.getReports(reportConfig, email)
			);
		});
	},
	getReportsAPCustomStatXPathWithCache: async (reportConfig, bypassCache = false) => {
		const sortedConfig = sortObjectEntries(reportConfig);
		return ObjectValidator(getCustomStatsValidations, sortedConfig).then(() => {
			// added a prefix 'xPath-' to cacheKey to make it unique for xPath
			// because reportConfig is same for General Report and xPath report
			return cacheWrapper(
				{ cacheKey: 'xPath-' + JSON.stringify(sortedConfig), bypassCache, cacheExpiry: 24 * 3600 },
				async () => reportsService.getReportAPCustomStatXPath(reportConfig)
			);
		});
	},
	getReportingMetaDataWithCache: async (sites, isSuperUser, bypassCache = false) => {
		return cacheWrapper(
			{ cacheKey: JSON.stringify({ sites, isSuperUser }), cacheExpiry: 24 * 3600, bypassCache },
			async () => reportsService.getReportingMetaData(sites, isSuperUser)
		);
	},
	getWidgetDataWithCache: async (path, params, bypassCache = false) => {
		const { siteid } = params;
		//bypass if site has blocked prefetch
		if (siteid)
			config.prefetchBlockedSites.forEach(blockedSitePreFetch => {
				if (siteid.indexOf(blockedSitePreFetch) !== -1) bypassCache = true;
			});
		return cacheWrapper(
			{ cacheKey: JSON.stringify({ path, params }), cacheExpiry: 4 * 3600, bypassCache },
			async () => reportsService.getWidgetData(path, params)
		);
	},
	logReportUsage: async (email, reportConfig) => {
		const todaysDate = moment().format('YYYY-MM-DD');
		const docId = `${CC.docKeys.freqReports}${email}:${todaysDate}`;

		const { value: todaysConfigDoc } = await getDoc('AppBucket', docId);
		const reportKey = JSON.stringify(reportConfig);

		const existingCount = todaysConfigDoc.reportsLog
			? todaysConfigDoc.reportsLog[reportKey] || 0
			: 0;
		const newConfig = {
			email,
			reportsLog: {
				...todaysConfigDoc.reportsLog,
				[reportKey]: existingCount + 1
			}
		};
		return upsertDoc('AppBucket', docId, newConfig);
	},
	shouldUseGaPageViews: async (email, reportConfig) => {
		const { siteid = '', isSuperUser = false } = reportConfig;
		let isGlobalReportsBeingFetched = false;
		if (isSuperUser) {
			if (siteid === '') return false;
			isGlobalReportsBeingFetched = true;
		}
		const { data: { useGAAnalyticsForReporting = false } = {} } = await getUserByEmail(email);
		if (!useGAAnalyticsForReporting && !isSuperUser) return false;
		let allGaEnabledSites;
		if (isGlobalReportsBeingFetched) {
			allGaEnabledSites = await getAllGaEnabledSites();
		} else {
			allGaEnabledSites = await getUserGaEnabledSites(email);
		}
		const selectedSiteidsForReporting = siteid.split(',');
		const userSiteIdswithEnabledGaAnalyticMap = allGaEnabledSites.reduce((mapResult, site) => {
			const { siteId } = site;
			mapResult[siteId] = true;
			return mapResult;
		}, {});
		const isAnySiteWithoutGaEnabled = selectedSiteidsForReporting.some(siteId => {
			const enableGAAnalytics = userSiteIdswithEnabledGaAnalyticMap[siteId];
			return !enableGAAnalytics;
		});
		if (isAnySiteWithoutGaEnabled) return false;
		return true;
	},
	processAndSendReportingData: (email, config, reportConfig) => {
		return Promise.all([
			reportsService.fetchReports(config),
			reportsService.shouldUseGaPageViews(email, reportConfig)
		]).then(async ([reports, isGaPageBeingUsed]) => {
			const result = await reportsService.fetchAndMergeSessionData(
				reportConfig,
				reports,
				reportConfig.isSuperUser
			);
			const { columns } = result;
			const isReportingDataHavePageViews = doesReportingHavePageViewData(columns);
			if (!isGaPageBeingUsed || !isReportingDataHavePageViews) return result;
			return reportsService.transformReportingDataForGA(result);
		});
	},
	transformReportingDataForGA: reportingResult => {
		const { result = [], total } = reportingResult;
		//This will store the sum of Ap page views where Ga page views is Zero
		let sumOfApPageViewsWhereGAPageViewNotExist = 0;
		for (let index = 0; index < result.length; index++) {
			const rowData = result[index];
			const {
				ga_ap_page_views: gaPageViews = 0,
				network_net_revenue: networkNetRevenue = 0
			} = rowData;
			if (gaPageViews) {
				rowData.adpushup_page_views = gaPageViews;
				rowData.adpushup_page_cpm = parseFloat(
					roundOffTwoDecimal((networkNetRevenue / gaPageViews) * 1000)
				);
			} else if (total) sumOfApPageViewsWhereGAPageViewNotExist += rowData.adpushup_page_views;
		}
		// returning from here if result data have not total field(This happens in site filter reports in Global reports)
		if (!total) return { ...reportingResult, result };
		const {
			total_ga_ap_page_views: totalGaPageViews = 0,
			total_network_net_revenue: totalNetworkRevenue = 0
		} = total;
		if (totalGaPageViews) {
			//Here we are adding page views which are present in result but not in total data(becuase ga page views is being used here)
			const updatedTotalGaPageViews = totalGaPageViews + sumOfApPageViewsWhereGAPageViewNotExist;
			total.total_adpushup_page_views = updatedTotalGaPageViews;
			total.total_adpushup_page_cpm = parseFloat(
				roundOffTwoDecimal((totalNetworkRevenue / updatedTotalGaPageViews) * 1000)
			);
		}
		return { ...reportingResult, result, total };
	}
};

module.exports = reportsService;
