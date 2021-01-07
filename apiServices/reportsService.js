const couchbase = require('couchbase');
const axios = require('axios').default;
const _ = require('lodash');
const request = require('request-promise');

const config = require('../configs/config');
const CC = require('../configs/commonConsts');
const { queryViewFromAppBucket } = require('../helpers/couchBaseService');
const { sortObjectEntries } = require('../helpers/utils');
const AdPushupError = require('../helpers/AdPushupError');
const {
	getCustomStatsValidations,
	getMetaDataValidations,
	getWidgetDataValidations
} = require('../validations/reportsValidations');
const cacheWrapper = require('../helpers/cacheWrapper');
const ObjectValidator = require('../helpers/ObjectValidator');

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
		const totalSessionRpm =
			sessionReports.reduce((result, report) => result + report.session_rpm, 0) /
			sessionReports.length;
		const totalSessions = sessionReports.reduce(
			(result, report) => result + report.user_sessions,
			0
		);

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
			.then(() =>
				request({
					uri: `${CC.ANALYTICS_API_ROOT}${CC.ANALYTICS_METAINFO_URL}`,
					json: true,
					qs: params
				})
			)
			.then(response => {
				const { code = -1, data } = response;
				if (code !== 1) return Promise.reject(new Error(response.data));
				return data;
			});
	},
	modifyQueryIfPnp: query => {
		const modifiedQuery = _.cloneDeep(query);
		const regex = new RegExp('^[0-9]*(,[0-9]+)*$');
		if (!query.siteid) return modifiedQuery;
		if (!regex.test(modifiedQuery.siteid)) {
			throw new Error('Invalid parameter in query.siteid');
		}
		const siteIds = modifiedQuery.siteid.split(',');
		const dbQuery = couchbase.N1qlQuery.fromString(
			`select buc.mappedPnpSiteId from AppBucket 
				as buc where meta().id like 'site::%'
				and buc.siteId in [${siteIds}]
				and buc.mappedPnpSiteId is not missing
				and buc.apConfigs.mergeReport = true
			`
		);
		return queryViewFromAppBucket(dbQuery)
			.then(data => {
				// data is array of objects e.g.. [{mappedPnpSiteId: 41355}, {mappedPnpSiteId:41395}]
				data.forEach(ele => {
					modifiedQuery.siteid += `,${ele.mappedPnpSiteId}`;
				});
				return modifiedQuery;
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

		if ((dimension && !sessionRpmSupportedDimensions.includes(dimension)) || unsupportedFiltersForSessionData.length) {
			return reportsData;
		}

		const sessionData = await reportsService.fetchSessionData(reportConfig);
		return reportsService.mergeReportsWithSessionRpmData(reportsData, sessionData, isSuperUser);
	},
	getReports: async reportConfig =>
        ObjectValidator(getCustomStatsValidations, reportConfig)
            .then(() => reportsService.modifyQueryIfPnp(reportConfig))
			.then(config => reportsService.fetchReports(config))
			.then(reports =>
				reportsService.fetchAndMergeSessionData(reportConfig, reports, reportConfig.isSuperUser)
			),
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
	getReportsWithCache: async (reportConfig, bypassCache = false) => {
		const sortedConfig = sortObjectEntries(reportConfig);
		return ObjectValidator(getCustomStatsValidations, sortedConfig)
		.then(() => {
			return cacheWrapper(
				{ cacheKey: JSON.stringify(sortedConfig), bypassCache, cacheExpiry: 24 * 3600 },
				async () => reportsService.getReports(reportConfig)
			)
		});
	},
	getReportingMetaDataWithCache: async (sites, isSuperUser, bypassCache = false) =>
		cacheWrapper(
			{ cacheKey: JSON.stringify({ sites, isSuperUser }), cacheExpiry: 24 * 3600, bypassCache },
			async () => reportsService.getReportingMetaData(sites, isSuperUser)
		),
	getWidgetDataWithCache: async (path, params, bypassCache = false) =>
		cacheWrapper(
			{ cacheKey: JSON.stringify({ path, params }), cacheExpiry: 24 * 3600, bypassCache },
			async () => reportsService.getWidgetData(path, params)
		)
};

module.exports = reportsService;