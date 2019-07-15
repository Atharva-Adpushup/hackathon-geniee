const express = require('express');
const atob = require('atob');
const moment = require('moment');
const request = require('request-promise');
const _ = require('lodash');

const { couchBase } = require('../configs/config');
const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { ACTIVE_SITES_API } = require('../configs/commonConsts');
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
				date = moment.isValid() ? date : moment();
				if (options) {
					const { operation, value: number, unit } = options;
					date = date[operation](number, unit);
				}
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
		function makeAPIRequest(qs) {
			const options = {
				method: 'GET',
				uri: ACTIVE_SITES_API,
				qs,
				json: true
			};

			return request(options);
		}

		const { params } = req.body;
		let parsedData;
		try {
			parsedData = JSON.parse(atob(params));
		} catch (e) {
			return sendErrorResponse({
				message: 'Invalid Params Received'
			});
		}
		/*
		{
			pageviewsThreshold: 10000, >=10000
			last: {
				from: 26-06-2019,
				to: 02-07-2019
			},
			current: {
				from: 03-07-2019,
				to: 09-07-2019
			}
		}
		*/
		const { pageviewsThreshold = 10000, last = {}, current = {} } = parsedData;
		const currentTo = processDate(current.to, moment(), 1);
		const currentFrom = processDate(current.from, currentTo, 7);
		const lastTo = processDate(last.to, currentFrom, 1);
		const lastFrom = processDate(last.from, lastTo, 7);

		const promises = [
			makeAPIRequest({
				fromDate: lastFrom,
				toDate: lastTo,
				minPageViews: pageviewsThreshold
			}),
			makeAPIRequest({
				fromDate: currentFrom,
				toDate: currentTo,
				minPageViews: pageviewsThreshold
			})
		];

		return Promise.all(promises)
			.spread((lastWeekData, currentWeekData) => {
				if (lastWeekData.code !== 1 || currentWeekData.code !== 1) {
					return Promise.reject(new Error('Invalid Data Found in either of the date rangers'));
				}
				const { data: { results: lastWeekSites = [] } = {} } = lastWeekData;
				const { data: { results: currentWeekSites = [] } = {} } = currentWeekData;

				const lastSiteIds = _.map(lastWeekSites, 'siteId');
				const currentSiteIds = _.map(currentWeekSites, 'siteId');

				const lostIds = _.difference(lastSiteIds, currentSiteIds);
				const wonIds = _.difference(currentSiteIds, lastSiteIds);
				const rententionIds = _.intersection(lastSiteIds, currentSiteIds);

				const won = currentWeekSites.filter(site => wonIds.indexOf(site.siteId) !== -1);
				const lost = lastWeekData.filter(site => lostIds.indexOf(site.siteId) !== -1);
				const rentention = lastWeekData.filter(site => rententionIds.indexOf(site.siteId) !== -1);

				return {
					won,
					lost,
					rentention
				};
			})
			.catch(err => errorHandler(err, res));
	});

module.exports = router;
