const express = require('express');
const request = require('request-promise');
const csv = require('express-csv');
const _ = require('lodash');
const { v1: uuid } = require('uuid');
const axios = require('axios').default;

const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { sendSuccessResponse, sendErrorResponse } = require('../helpers/commonFunctions');
const CC = require('../configs/commonConsts');
const utils = require('../helpers/utils');
const reportsModel = require('../models/reportsModel');
const FormValidator = require('../helpers/FormValidator');
const schema = require('../helpers/schema');

const couchbase = require('couchbase');
const config = require('../configs/config');

const redisClient = require('../middlewares/redis');
const { queryViewFromAppBucket } = require('../helpers/couchBaseService');
const router = express.Router();
const cache = require('../middlewares/cacheMiddleware');

const getKeyFromProps = (report = {}, props = []) => {
	const propValues = props.map(prop => report[prop]);
	return propValues.join(',');
};

const mergeReportingWithSessionRpmReports = (
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
		const key = getKeyFromProps(report, mergableProps);
		return {
			...result,
			[key]: report
		};
	}, {});

	const mergedReportingData = reports.map(report => {
		const key = getKeyFromProps(report, mergableProps);
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
};

const mergeReportColumns = reportColumns => [...reportColumns, ...CC.SESSION_RPM.SESSION_RPM_PROPS];

const calculateSessionTotals = (sessionReports = []) => {
	const totalSessionRpm =
		sessionReports.reduce((result, report) => result + report.session_rpm, 0) /
		sessionReports.length;
	const totalSessions = sessionReports.reduce((result, report) => result + report.user_sessions, 0);

	return {
		total_session_rpm: totalSessionRpm,
		total_user_sessions: totalSessions
	};
};

const mergeReportsWithSessionRpmData = (reportsData, sessionRpmData, isSuperUser = false) => {
	const { result: reports, columns: reportColumns, total: reportsTotals } = reportsData;
	const { result: sessionRpmReports, columns: sessionRpmColumns } = sessionRpmData;

	const mergedReports = mergeReportingWithSessionRpmReports(
		reports,
		sessionRpmReports,
		sessionRpmColumns
	);

	const mergedColumns = mergeReportColumns(reportColumns, sessionRpmColumns);

	const sessionTotals = calculateSessionTotals(sessionRpmReports);
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
}
const Utils = {
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
		const cronExpression = Utils.generateCronExpression(interval, startDate);

		const scheduleConfig = Object.assign({}, reportConfig);

		scheduleConfig.scheduleOptions.cron = cronExpression;

		const scheduledJobData = await Utils.scheduleReportJob(reportConfig, email);
		scheduleConfig.scheduleOptions.jobId = scheduledJobData.job.id;

		return scheduleConfig;
	}
};

router
	.get('/getCustomStats', cache, async (req, res) => {
		const {
			query: { siteid = '', isSuperUser = false, fromDate, toDate, interval, dimension, ...filters }
		} = req;
		const isValidParams = !!((siteid || isSuperUser) && fromDate && toDate && interval);
		const sessionRpmSupportedDimensions = CC.SESSION_RPM.SUPPORTED_DIMENSIONS;
		const sessionRpmSupportedFilters = CC.SESSION_RPM.SUPPORTED_FILTERS;

		if (!isValidParams) return res.send({});
		let reportsData = {};
		let queryParams = _.cloneDeep(req.query);
		try {
			// modify query object if PNP site.
			queryParams = await modifyQueryIfPnp(queryParams);
			
			const reportsResponse = await request({
				uri: `${CC.ANALYTICS_API_ROOT}${CC.REPORT_PATH}`,
				json: true,
				qs: queryParams
			});
			if (!reportsResponse.code === 1 || !reportsResponse.data) return res.send({});

			reportsData = reportsResponse.data;

			const extraFiltersForSession = Object.keys(filters).filter(
				filter => !sessionRpmSupportedFilters.includes(filter)
			);

			if (
				!(dimension && !sessionRpmSupportedDimensions.includes(dimension)) &&
				!extraFiltersForSession.length
			) {
				const sessionRpmReportsResponse = await request({
					uri: `${CC.SESSION_RPM_REPORTS_API}`,
					json: true,
					qs: queryParams
				});

				if (sessionRpmReportsResponse.code === 1 && sessionRpmReportsResponse.data) {
					const sessionRpmReportsData = sessionRpmReportsResponse.data;

					const mergedData = mergeReportsWithSessionRpmData(
						reportsData,
						sessionRpmReportsData,
						isSuperUser
					);
					reportsData = mergedData;
				}
			}
		} catch (err) {
			console.log(err);
		}
		
		if (Object.keys(reportsData).length && JSON.stringify(queryParams) === JSON.stringify(req.query )) {
			  redisClient.setex(JSON.stringify(queryParams), 24 * 3600, JSON.stringify(reportsData));
		}

		return res.send(reportsData);
	})
	.get('/getWidgetData', cache, (req, res) => {
		const { params, path } = req.query;
		const reqParams = _.isString(params) ? JSON.parse(params) : {};
		const { siteid, isSuperUser } = reqParams;
		const isValidParams = !!(siteid || (isSuperUser && !siteid));

		if (isValidParams)
			return request({
				uri: `${CC.ANALYTICS_API_ROOT}${path}`,
				json: true,
				qs: reqParams
			})
				.then(response => {
					if (response.code == 1 && response.data) {
						return res.send(response.data) && response.data;
					}
					return res.send({});
				})
				.then(data =>
					// set data to redis
					redisClient.setex(JSON.stringify(req.query), 24 * 3600, JSON.stringify(data))
				)
				.catch(err => {
					console.log(err);
					return res.send({});
				});
		return res.send({});
	})
	.get('/downloadAdpushupReport', (req, res) => {
		const { data, fileName } = req.query;

		if (data) {
			try {
				const csvData = JSON.parse(utils.atob(data));

				res.setHeader('Content-disposition', `attachment; filename=${fileName}.csv`);
				res.set('Content-Type', 'text/csv');

				const headers = {};
				for (key in csvData[0]) {
					headers[key] = key;
				}

				csvData.unshift(headers);

				return res.status(200).csv(csvData);
			} catch (e) {
				return res.status(500).send('Some error occurred! Please try again later.');
			}
		} else {
			return res.status(403).send('CSV data to be generated is undefined.');
		}
	})
	.get('/getLastUpdateStatus', (req, res) =>
		request({
			method: 'GET',
			uri: `${CC.REPORT_STATUS}`
		})
			.then(result => res.send(result))
			.catch(err => {
				console.log(err);
				return res.send({});
			})
	)
	.get('/getMetaData', cache, (req, res) => {
		const {
			query: { sites = '', isSuperUser = false }
		} = req;
		const isValidParams = !!(sites || isSuperUser);

		if (isValidParams) {
			const params = { siteid: sites, isSuperUser };

			return request({
				uri: `${CC.ANALYTICS_API_ROOT}${CC.ANALYTICS_METAINFO_URL}`,
				json: true,
				qs: params
			})
				.then(response => {
					const { code = -1, data } = response;
					if (code !== 1) return Promise.reject(new Error(response.data));
					return response.code == 1 && data ? res.send(data) && data : res.send({});
				})
				.then(data =>
					// set data to redis
					redisClient.setex(JSON.stringify(req.query), 24 * 3600, JSON.stringify(data))
				)
				.catch(err => {
					const { message: errorMessage } = err;

					const {
						message = 'Something went wrong',
						code = HTTP_STATUSES.INTERNAL_SERVER_ERROR
					} = errorMessage;
					return sendErrorResponse(
						{
							message
						},
						res,
						code
					);
				});
		}

		return res.send({});
	})
	.get('/sections/generate', (req, res) => {
		const { from, to, pagegroup } = req.query;
		const siteid = parseInt(req.query.siteid, 10);

		return request({
			uri: CC.PAGEGROUP_LIST_API,
			json: true,
			qs: {
				list_name: 'GET_ALL_PAGE_GROUPS',
				siteid,
				hideSitePrefix: true
			}
		})
			.then(response => {
				const {
					data: { result = [] },
					code = -1
				} = response;

				if (code === -1 || !result.length)
					throw new Error(
						JSON.stringify({
							message: 'No pagegroup found',
							code: HTTP_STATUSES.BAD_REQUEST
						})
					);

				const pagegroups = result.filter(pg => pg.value === pagegroup);
				return pagegroups.length ? pagegroups[0].id : false;
			})
			.then(pagegroupId => {
				if (!pagegroupId)
					throw new Error(
						JSON.stringify({
							message: 'No pagegroup found',
							code: HTTP_STATUSES.BAD_REQUEST
						})
					);

				return request({
					uri: `${CC.ANALYTICS_API_ROOT}${CC.REPORT_PATH}`,
					json: true,
					qs: {
						interval: 'daily',
						dimension: 'siteid,page_group,page_variation_id,page_variation,section_id,section',
						metrics:
							'adpushup_xpath_miss,adpushup_impressions,network_impressions,network_net_revenue',
						fromDate: from,
						toDate: to,
						siteid,
						page_group: pagegroupId
					}
				});
			})
			.then(response => {
				const {
					data: { result = [] },
					code = -1
				} = response;
				const sections = {};

				if (code === -1)
					throw new Error(
						JSON.stringify({
							message: 'Something went wrong',
							code: HTTP_STATUSES.INTERNAL_SERVER_ERROR
						})
					);

				if (!result.length)
					return sendSuccessResponse(
						{
							message: 'No data found'
						},
						res,
						HTTP_STATUSES.OK
					);

				result.forEach(section => {
					sections[section.section_id] = {
						...section,
						adpushup_total_cpm: Number(
							((section.network_net_revenue * 1000) / section.adpushup_impressions).toFixed(2)
						)
					};
				});
				return sendSuccessResponse(
					{
						sections
					},
					res,
					HTTP_STATUSES.OK
				);
			})
			.catch(err => {
				let { message: errorMessage } = err;
				try {
					errorMessage = JSON.parse(errorMessage);
				} catch (e) {
					errorMessage = {
						message: 'Something went wrong',
						code: HTTP_STATUSES.INTERNAL_SERVER_ERROR
					};
				}
				const {
					message = 'Something went wrong',
					code = HTTP_STATUSES.INTERNAL_SERVER_ERROR
				} = errorMessage;
				return sendErrorResponse(
					{
						message
					},
					res,
					code
				);
			});
	})
	.get('/', (req, res) => {
		const { user } = req;
		const email = user.originalEmail || user.email;
		return reportsModel
			.getSavedReportConfig(email)
			.then(reportConfig => sendSuccessResponse(reportConfig, res, HTTP_STATUSES.OK))
			.catch(err => {
				let { message: errorMessage } = err;
				try {
					errorMessage = JSON.parse(errorMessage);
				} catch (e) {
					errorMessage = 'Something went wrong';
				}
				const {
					message = 'Something went wrong',
					code = HTTP_STATUSES.INTERNAL_SERVER_ERROR
				} = errorMessage;
				return sendErrorResponse(
					{
						message
					},
					res,
					code
				);
			});
	})
	.post('/', async (req, res) => {
		const { user, body: reportBody } = req;
		let reportConfig = {
			...reportBody,
			createdAt: Date.now(),
			id: uuid()
		};
		const email = user.originalEmail || user.email;
		try {
			const errors = await FormValidator.validate(reportConfig, schema.saveReportApi.validations);
			if (errors && errors.length) {
				return sendErrorResponse({
					message: 'Invalid report parameters',
					errors
				});
			}

			if (reportConfig.scheduleOptions && Object.keys(reportConfig.scheduleOptions).length) {
				reportConfig = await Utils.initiateReportsSchedule(reportConfig, email);
			}

			const reportsConfig = await reportsModel.getSavedReportConfig(email);
			const updatedReportsConfig = {
				...reportsConfig,
				savedReports: [...reportsConfig.savedReports, reportConfig]
			};

			const response = await reportsModel.updateSavedReportConfig(updatedReportsConfig, email);

			return sendSuccessResponse(response, res, HTTP_STATUSES.OK);
		} catch (err) {
			console.log(err);
			let { message: errorMessage } = err;
			try {
				errorMessage = JSON.parse(errorMessage);
			} catch (e) {
				errorMessage = {
					message: 'Something went wrong',
					code: HTTP_STATUSES.INTERNAL_SERVER_ERROR
				};
			}
			const {
				message = 'Something went wrong',
				code = HTTP_STATUSES.INTERNAL_SERVER_ERROR
			} = errorMessage;
			return sendErrorResponse(
				{
					message
				},
				res,
				code
			);
		}
	})
	.patch('/:id', async (req, res) => {
		try {
			const { user, body: updateConfiguration } = req;
			const email = user.originalEmail || user.email;
			const savedConfigId = req.params.id;

			if (!savedConfigId) throw new Error('Id required to update saved report');
			const reportsConfig = await reportsModel.getSavedReportConfig(email);
			if (!reportsConfig || !reportsConfig.savedReports.length)
				throw new Error('No saved reports found');

			const existingConfigForId = reportsConfig.savedReports.filter(
				report => report.id === savedConfigId
			)[0];
			if (!existingConfigForId)
				throw new Error('Unable to find existng configuration for this report');

			let updatedReportConfig = {
				...existingConfigForId,
				name: updateConfiguration.name || existingConfigForId.name
			};

			if (
				updateConfiguration.scheduleOptions &&
				Object.keys(updateConfiguration.scheduleOptions).length
			) {
				await Utils.cancelScheduledJob(existingConfigForId.scheduleOptions.jobId);
				updatedReportConfig.scheduleOptions = updateConfiguration.scheduleOptions;
				updatedReportConfig = await Utils.initiateReportsSchedule(updatedReportConfig, email);
			}

			const newSavedReports = reportsConfig.savedReports.map(report => {
				if (report.id === savedConfigId) {
					return updatedReportConfig;
				}
				return report;
			});
			const newConfiguration = {
				...reportsConfig,
				savedReports: newSavedReports
			};

			const response = await reportsModel.updateSavedReportConfig(newConfiguration, email);
			return sendSuccessResponse(response, res, HTTP_STATUSES.OK);
		} catch (err) {
			console.log(err);
			let { message: errorMessage } = err;
			try {
				errorMessage = JSON.parse(errorMessage);
			} catch (e) {
				errorMessage = {
					message: 'Something went wrong',
					code: HTTP_STATUSES.INTERNAL_SERVER_ERROR
				};
			}
			const {
				message = 'Something went wrong',
				code = HTTP_STATUSES.INTERNAL_SERVER_ERROR
			} = errorMessage;
			return sendErrorResponse(
				{
					message
				},
				res,
				code
			);
		}
	})
	.delete('/:id', async (req, res) => {
		try {
			const { user } = req;
			const email = user.originalEmail || user.email;
			const reportId = req.params.id;
			if (!reportId) throw new Error('Invalid report ID');

			const reportsConfig = await reportsModel.getSavedReportConfig(email);
			if (!reportsConfig || !reportsConfig.savedReports.length)
				throw new Error('No saved reports found');

			const reportToDelete = reportsConfig.savedReports.filter(report => report.id === reportId)[0];
			if (!reportToDelete) throw new Error('Report not found');

			if (reportToDelete.scheduleOptions && reportToDelete.scheduleOptions.jobId) {
				await Utils.cancelScheduledJob(reportToDelete.scheduleOptions.jobId);
			}

			const newSavedReports = reportsConfig.savedReports.filter(report => report.id !== reportId);
			const newConfiguration = {
				...reportsConfig,
				savedReports: newSavedReports
			};
			const response = await reportsModel.updateSavedReportConfig(newConfiguration, email);
			return sendSuccessResponse(response, res, HTTP_STATUSES.OK);
		} catch (err) {
			let { message: errorMessage } = err;
			try {
				errorMessage = JSON.parse(errorMessage);
			} catch (e) {
				errorMessage = {
					message: 'Something went wrong',
					code: HTTP_STATUSES.INTERNAL_SERVER_ERROR
				};
			}
			const {
				message = 'Something went wrong',
				code = HTTP_STATUSES.INTERNAL_SERVER_ERROR
			} = errorMessage;
			return sendErrorResponse(
				{
					message
				},
				res,
				code
			);
		}
	});
/**
 *
 * @param {array<String>} siteIds
 * @description returns promise which resolves to get Data from Couchbase
 */


/**
 *
 * @param {Object} query - req.query object, contains query params.
 * @return {Object} modifiedQuery
 * @description checks if the siteid is pnp, modify query by appending the mapped siteIds to
 * 							query.siteid.
 */
const modifyQueryIfPnp = (query) => {
	return new Promise((resolve, reject) => {
		const regex = new RegExp('^[0-9]*(,[0-9]+)*$');
		if (!regex.test(query.siteid)) {
			reject(new Error('Invalid parameter in query.siteid'));
			return;
		}
		const siteIds = query.siteid.split(',');
		const dbQuery = couchbase.N1qlQuery.fromString(
			`select buc.mappedPnpSiteId from AppBucket 
   		as buc where meta().id like 'site::%'  
  	 	and buc.siteId in [${siteIds}]  
   		and buc.mappedPnpSiteId is not missing  
   		and buc.apConfigs.mergeReport = true`
		)
		queryViewFromAppBucket(dbQuery)
			.then((data) => {
				// data is array of objects e.g.. [{mappedPnpSiteId: 41355}, {mappedPnpSiteId:41395}]
				data.forEach((ele) => {
					query.siteid += `,${ele.mappedPnpSiteId}`;
				});

				resolve(query);
			})
			.catch(err => {
				console.error(err);
				reject(new Error('Error while accessing data'));
			});
	});
}
module.exports = router;
