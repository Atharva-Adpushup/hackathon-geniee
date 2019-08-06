const express = require('express');
const atob = require('atob');
const moment = require('moment');
const request = require('request-promise');
const _ = require('lodash');

const { couchBase } = require('../configs/config');
const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { ACTIVE_SITES_API, XPATH_MISS_MODE_URL_API } = require('../configs/commonConsts');
const { sendSuccessResponse, sendErrorResponse } = require('../helpers/commonFunctions');
const { appBucket, errorHandler } = require('../helpers/routeHelpers');

const router = express.Router();

const helpers = {
	getAllSitesFromCouchbase: () => {
		const query = `select a.siteId, a.siteDomain, a.adNetworkSettings, a.ownerEmail, a.step, a.channels, a.apConfigs, a.dateCreated, b.adNetworkSettings[0].pubId, b.adNetworkSettings[0].adsenseEmail from ${
			couchBase.DEFAULT_BUCKET
		} a join ${
			couchBase.DEFAULT_BUCKET
		} b on keys 'user::' || a.ownerEmail where meta(a).id like 'site::%'`;
		return appBucket.queryDB(query);
	},
	makeAPIRequest: options => {
		const DEFAULT_OPTIONS = {
			method: 'GET',
			json: true
		};
		return request({
			...DEFAULT_OPTIONS,
			...options
		});
	}
};

router
	.get('/getAllSites', (req, res) =>
		helpers
			.getAllSitesFromCouchbase()
			.then(sites => sendSuccessResponse(sites, res))
			.catch(err => errorHandler(err, res, HTTP_STATUSES.INTERNAL_SERVER_ERROR))
	)
	.get('/getSiteStats', (req, res) => {
		if (!req.user.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request',
					code: HTTP_STATUSES.UNAUTHORIZED
				},
				res
			);
		}
		const { params } = req.query;
		let parsedData;
		try {
			parsedData = JSON.parse(atob(params));
		} catch (e) {
			return sendErrorResponse(
				{
					message: 'Invalid Params Received',
					code: HTTP_STATUSES.BAD_REQUEST
				},
				res
			);
		}
		const DEFAULT_OPERATION = {
			operation: 'subtract',
			unit: 'days'
		};
		function isValidDate(value = null) {
			const date = moment(value);
			return !!date.isValid();
		}
		function getDate(value = null, options = null) {
			const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
			let date = moment();
			if (value) {
				date = moment(value);
				date = date.isValid() ? date : moment();
			}
			if (options) {
				const { operation, value: number, unit } = options;
				date = date[operation](number, unit);
			}
			return date.format(DEFAULT_DATE_FORMAT);
		}
		function processDate(date, reference, value) {
			return date && isValidDate(date)
				? getDate(date)
				: getDate(reference, {
						...DEFAULT_OPERATION,
						value
				  });
		}
		function makeAPIRequestWrapper(qs) {
			return helpers.makeAPIRequest({
				uri: ACTIVE_SITES_API,
				qs
			});
		}

		function cleanData(array) {
			return array.map(element => ({
				site: element.site,
				siteid: element.siteid
			}));
		}
		return new Promise((resolve, reject) => {
			if (!parsedData.pageviewsThreshold || !parsedData.current) {
				return reject(
					new Error({
						message: 'Missing Params',
						code: HTTP_STATUSES.BAD_REQUEST
					})
				);
			}
			return resolve();
		})
			.then(() => {
				const { pageviewsThreshold = 10000, current = {} } = parsedData;

				const numberOfDays = Math.ceil(moment(current.to).diff(moment(current.from), 'days', true));
				const currentTo = processDate(current.to, moment(), 1);
				const currentFrom = processDate(current.from, currentTo, numberOfDays);

				const lastTo = processDate(null, currentFrom, 1);
				const lastFrom = processDate(null, lastTo, numberOfDays);

				const promises = [
					makeAPIRequestWrapper({
						fromDate: lastFrom,
						toDate: lastTo,
						minPageViews: pageviewsThreshold
					}),
					makeAPIRequestWrapper({
						fromDate: currentFrom,
						toDate: currentTo,
						minPageViews: pageviewsThreshold
					})
				];
				return Promise.all(promises);
			})
			.then(([lastWeekData, currentWeekData]) => {
				if (lastWeekData.code !== 1 || currentWeekData.code !== 1) {
					return Promise.reject(new Error('Invalid Data Found in either of the date rangers'));
				}
				let { data: { result: lastWeekSites = [] } = {} } = lastWeekData;
				let { data: { result: currentWeekSites = [] } = {} } = currentWeekData;

				lastWeekSites = cleanData(lastWeekSites);
				currentWeekSites = cleanData(currentWeekSites);

				const lastSiteIds = _.map(lastWeekSites, 'siteid');
				const currentSiteIds = _.map(currentWeekSites, 'siteid');

				const lostIds = _.difference(lastSiteIds, currentSiteIds);
				const wonIds = _.difference(currentSiteIds, lastSiteIds);
				const rententionIds = _.intersection(lastSiteIds, currentSiteIds);

				const won = currentWeekSites.filter(site => wonIds.indexOf(site.siteid) !== -1);
				const lost = lastWeekSites.filter(site => lostIds.indexOf(site.siteid) !== -1);
				const rentention = lastWeekSites.filter(site => rententionIds.indexOf(site.siteid) !== -1);

				return sendSuccessResponse(
					{
						won,
						lost,
						rentention
					},
					res
				);
			})
			.catch(err => errorHandler(err, res));
	})

	.post('/xpathmiss', (req, res) => {
		if (!req.user.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request',
					code: HTTP_STATUSES.UNAUTHORIZED
				},
				res
			);
		}
		const {
			siteId,
			topURLCount,
			emailId,
			pageGroups,
			currentSelectedDevice,
			currentSelectedMode,
			errorCode,
			startDate,
			endDate
		} = req.body;

		const qs = {
			siteid: siteId,
			urlCount: topURLCount,
			email: emailId,
			page_group: pageGroups,
			device_type: currentSelectedDevice,
			mode: currentSelectedMode,
			error_code: errorCode,
			fromDate: startDate,
			toDate: endDate
		};

		const isDataValid = !!(
			siteId &&
			topURLCount &&
			emailId &&
			pageGroups &&
			currentSelectedDevice &&
			currentSelectedMode &&
			errorCode &&
			startDate &&
			endDate
		);

		if (!isDataValid) {
			return sendErrorResponse(
				{
					message: 'Missing params.'
				},
				res
			);
		}
		return helpers
			.makeAPIRequest({
				uri: XPATH_MISS_MODE_URL_API,
				qs: { ...qs, report_name: 'get_url_count' }
			})
			.then(response => {
				const { code = -1 } = response;
				if (code !== 1) return Promise.reject(new Error(response.data));
				return sendSuccessResponse(response, res);
			})
			.catch(err => {
				errorHandler(err, res);
			});
	});

module.exports = router;
