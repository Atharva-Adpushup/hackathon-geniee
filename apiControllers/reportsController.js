const express = require('express');
const request = require('request-promise');
const csv = require('express-csv');
const _ = require('lodash');

const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { sendSuccessResponse, sendErrorResponse } = require('../helpers/commonFunctions');
const CC = require('../configs/commonConsts');
const utils = require('../helpers/utils');
const reportsModel = require('../models/reportsModel');

const config = require('../configs/config');

const redisClient = require('../middlewares/redis');

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

		try {
			const reportsResponse = await request({
				uri: `${CC.ANALYTICS_API_ROOT}${CC.REPORT_PATH}`,
				json: true,
				qs: req.query
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
					qs: req.query
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

		if (Object.keys(reportsData).length) {
			redisClient.setex(JSON.stringify(req.query), 24 * 3600, JSON.stringify(reportsData));
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
					//set data to redis
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
					//set data to redis
					redisClient.setex(JSON.stringify(req.query), 24 * 3600, JSON.stringify(data))
				)
				.catch(err => {
					let { message: errorMessage } = err;

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
	.get('/getSavedReportConfig', (req, res) => {
		const { user } = req;
		return reportsModel
			.getSavedReportConfig(user.email)
			.then(reportConfig => res.status(HTTP_STATUSES.OK).json(reportConfig))
			.catch(__ => {
				// If no config file is found, create a config file
				const savedReportsConfig = {
					savedReports: [],
					scheduledReports: []
				};
				return reportsModel
					.updateSavedReportConfig(savedReportsConfig, user.email)
					.then(config => res.status(HTTP_STATUSES.OK).json(config));
			})
			.catch(__ => res.status(HTTP_STATUSES.NOT_FOUND).json({ message: 'Document not found' }));
	});
module.exports = router;
