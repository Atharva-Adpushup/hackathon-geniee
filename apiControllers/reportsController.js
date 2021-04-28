const express = require('express');
const request = require('request-promise');
const _ = require('lodash');
const { v1: uuid } = require('uuid');

const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { sendSuccessResponse, sendErrorResponse } = require('../helpers/commonFunctions');
const CC = require('../configs/commonConsts');
const utils = require('../helpers/utils');
const reportsModel = require('../models/reportsModel');
const FormValidator = require('../helpers/FormValidator');
const schema = require('../helpers/schema');

const reportsAccess = require('../middlewares/reportsAuthorizationMiddleware.js');
const reportsService = require('../apiServices/reportsService');

const router = express.Router();

const setCacheHeaders = res => {
	res.header('X-AP-CACHE', 'HIT');
};

router
	.get('/getCustomStats', reportsAccess, async (req, res) => {
		req.setTimeout(360000); // timeout set to 6 mins for this particular route - temporary fix, need to remove when the backend responds on time
		const {
			query: { bypassCache = 'false', ...reportingConfig },
			user: { originalEmail, email }
		} = req;

		try {
			const { cacheHit, data: reportsData } = await reportsService.getReportsWithCache(
				reportingConfig,
				bypassCache === 'true'
			);
			if (cacheHit) setCacheHeaders(res);
			await reportsService.logReportUsage(originalEmail || email, reportingConfig);
			return sendSuccessResponse(reportsData, res, HTTP_STATUSES.OK);
		} catch (err) {
			return sendErrorResponse({ message: err.message }, res, HTTP_STATUSES.BAD_REQUEST);
		}
	})
	.get('/getAPStatsByCustom', reportsAccess, async (req, res) => {
		req.setTimeout(360000); // timeout set to 6 mins for this particular route - temporary fix, need to remove when the backend responds on time
		const {
			query: { bypassCache = 'false' }
		} = req;

		const reportConfig = _.cloneDeep(req.query);
		try {
			const {
				cacheHit,
				data: reportsData
			} = await reportsService.getReportsAPCustomStatXPathWithCache(
				reportConfig,
				bypassCache === 'true'
			);
			if (cacheHit) setCacheHeaders(res);
			return sendSuccessResponse(reportsData, res, HTTP_STATUSES.OK);
		} catch (err) {
			return sendErrorResponse({ message: err.message }, res, HTTP_STATUSES.BAD_REQUEST);
		}
	})
	.get('/getWidgetData', reportsAccess, async (req, res) => {
		const { params, path, bypassCache = 'false' } = req.query;
		const reqParams = _.isString(params) ? JSON.parse(params) : {};

		try {
			const { data: widgetData, cacheHit } = await reportsService.getWidgetDataWithCache(
				path,
				reqParams,
				bypassCache === 'true'
			);
			if (cacheHit) setCacheHeaders(res);
			return res.json(widgetData);
		} catch (err) {
			return sendErrorResponse({ message: err.message }, res, HTTP_STATUSES.BAD_REQUEST);
		}
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
	.get('/getMetaData', reportsAccess, async (req, res) => {
		const {
			query: { sites = '', isSuperUser = false, bypassCache = 'false' }
		} = req;

		try {
			const { data: metaData, cacheHit } = await reportsService.getReportingMetaDataWithCache(
				sites,
				isSuperUser,
				bypassCache === 'true'
			);
			if (cacheHit) setCacheHeaders(res);
			return res.json(metaData);
		} catch (err) {
			return sendErrorResponse({ message: err.message }, res, HTTP_STATUSES.BAD_REQUEST);
		}
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
				reportConfig = await reportsService.initiateReportsSchedule(reportConfig, email);
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
				await reportsService.cancelScheduledJob(existingConfigForId.scheduleOptions.jobId);
				updatedReportConfig.scheduleOptions = updateConfiguration.scheduleOptions;
				updatedReportConfig = await reportsService.initiateReportsSchedule(
					updatedReportConfig,
					email
				);
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
				await reportsService.cancelScheduledJob(reportToDelete.scheduleOptions.jobId);
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

module.exports = router;
