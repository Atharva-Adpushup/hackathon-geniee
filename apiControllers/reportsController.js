const express = require('express');
const request = require('request-promise');
const csv = require('express-csv');
const _ = require('lodash');

const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { sendSuccessResponse, sendErrorResponse } = require('../helpers/commonFunctions');
const CC = require('../configs/commonConsts');
const utils = require('../helpers/utils');
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
		let queryParams = req.query;
		try {
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

		if (Object.keys(reportsData).length) {
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
	});

/**
 *
 * @param {array<String>} siteIds
 * @description returns promise which resolves to get Data from Couchbase
 */
const queryDatabase = siteIds => {
	const queryDbPromise = siteIds.map(siteid => {
		const dbQuery = couchbase.N1qlQuery.fromString(
			`select buc.apConfigs.mergeReport, buc.mappedNonPnpSiteId from AppBucket as buc where meta().id = "site::${siteid}" and buc.apConfigs.mergeReport = true`
		);
		return queryViewFromAppBucket(dbQuery);
	});
	return Promise.all(queryDbPromise);
};

/**
 *
 * @param {Object} query - req.query object, contains query params.
 * @return {Object} modifiedQuery
 * @description checks if the siteid is pnp, modify query by appending the mapped siteIds to
 * 							query.siteid.
 */
const modifyQueryIfPnp = (query) => {
	return new Promise((resolve, reject) => {
		const regex = new RegExp('^[0-9]+(,[0-9]+)*$');
		if (!regex.test(query.siteid)) {
			reject(new Error('Invalid parameter in query.siteid'));
			return;
		}
		const siteIds = query.siteid.split(',');
		queryDatabase(siteIds)
			.then((data) => {
				
				const filteredData = data.reduce( (accData, currArr )=> {
					const siteData = currArr.shift();
					return (siteData && siteData.mappedNonPnpSiteId) ? 
						accData.concat([siteData]) : accData;
				},[]);
				
				filteredData.forEach(siteData => {
					query.siteid += `,${siteData.mappedNonPnpSiteId}`;
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
