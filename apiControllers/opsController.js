const express = require('express');
const atob = require('atob');
const moment = require('moment');
const request = require('request-promise');
const _ = require('lodash');

const { couchBase } = require('../configs/config');
const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { GET_SITES_STATS_API, EMAIL_REGEX } = require('../configs/commonConsts');
const { sendSuccessResponse, sendErrorResponse } = require('../helpers/commonFunctions');
const { appBucket, errorHandler } = require('../helpers/routeHelpers');
const opsModel = require('../models/opsModel');
const proxy = require('../helpers/proxy');

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
				uri: GET_SITES_STATS_API,
				qs
			});
		}

		function cleanData(array) {
			return array.map(element => ({
				site: element.site,
				siteid: element.siteid
			}));
		}

		function uniqueData(arr) {
			return _.uniqBy(arr, 'siteid').filter(value => value.adpushup_count >= 10000);
		}

		return new Promise((resolve, reject) => {
			if (!parsedData.current) {
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
				const { current = {} } = parsedData;

				const numberOfDays = Math.ceil(moment(current.to).diff(moment(current.from), 'days', true));
				const currentTo = processDate(current.to, moment(), 1);
				const currentFrom = processDate(current.from, currentTo, numberOfDays);

				const lastTo = processDate(null, currentFrom, 1);
				const lastFrom = processDate(null, lastTo, numberOfDays);

				const promises = [
					makeAPIRequestWrapper({
						fromDate: lastFrom,
						toDate: lastTo,
						report_name: 'get_stats_by_custom',
						isSuperUser: true,
						dimension: 'siteid,mode'
					}),
					makeAPIRequestWrapper({
						fromDate: currentFrom,
						toDate: currentTo,
						report_name: 'get_stats_by_custom',
						isSuperUser: true,
						dimension: 'siteid,mode'
					})
				];
				return Promise.all(promises);
			})
			.then(([lastWeekData, currentWeekData]) => {
				if (lastWeekData.code !== 1 || currentWeekData.code !== 1) {
					return Promise.reject(new Error('Invalid Data Found in either of the date rangers'));
				}

				const { data: { result: lastWeekSites = [] } = {} } = lastWeekData;
				const { data: { result: currentWeekSites = [] } = {} } = currentWeekData;

				let lastWeekEntries = uniqueData(lastWeekSites);
				let currentWeekEntries = uniqueData(currentWeekSites);

				lastWeekEntries = cleanData(lastWeekEntries);
				currentWeekEntries = cleanData(currentWeekEntries);

				const lastSiteIds = _.map(lastWeekEntries, 'siteid');
				const currentSiteIds = _.map(currentWeekEntries, 'siteid');

				const lostIds = _.difference(lastSiteIds, currentSiteIds);
				const wonIds = _.difference(currentSiteIds, lastSiteIds);
				const rententionIds = _.intersection(lastSiteIds, currentSiteIds);

				const won = currentWeekEntries.filter(site => wonIds.indexOf(site.siteid) !== -1);
				const lost = lastWeekEntries.filter(site => lostIds.indexOf(site.siteid) !== -1);
				const rentention = lastWeekEntries.filter(
					site => rententionIds.indexOf(site.siteid) !== -1
				);

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

	.post('/xpathEmailNotifier', (req, res) => {
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

		const isDataValid = !!(
			siteId &&
			topURLCount &&
			startDate &&
			endDate &&
			EMAIL_REGEX.test(emailId)
		);

		if (isDataValid === false) {
			return sendErrorResponse(
				{
					message: 'Missing or Inavalid params.'
				},
				res
			);
		}

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

		return helpers
			.makeAPIRequest({
				uri: GET_SITES_STATS_API,
				qs: { ...qs, report_name: 'get_url_count' }
			})
			.then(response => {
				const { code = -1 } = response;
				if (code !== 1) return Promise.reject(new Error(response.data));
				return sendSuccessResponse(response, res);
			})
			.catch(err => errorHandler(err, res));
	})

	.post('/adsTxtLiveEntries', (req, res) => {
		if (!req.user.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request',
					code: HTTP_STATUSES.UNAUTHORIZED
				},
				res
			);
		}

		const { siteId, emailId, currentSelectedEntry, adsTxtSnippet } = req.body;

		const isDataValid = !!(currentSelectedEntry && EMAIL_REGEX.test(emailId));

		if (isDataValid === false) {
			return sendErrorResponse(
				{
					message: 'Missing or Inavalid params.'
				},
				res
			);
		}

		opsModel
			.getAdsTxtEntries(siteId, adsTxtSnippet, currentSelectedEntry)
			.then(sitesData => {
				let adsData = '';
				let commonMailFormatIfSiteId = `<div class="mailData">
			<p><b>Domain :</b> ${sitesData.domain}</p>
			<p><b>Site ID :</b> ${siteId}
			<p> <b>Account Email :</b> ${sitesData.accountEmail}</p>`;
				siteId
					? (adsData =
							currentSelectedEntry === 'All Entries Present' ||
							sitesData.status === 1 ||
							sitesData.status === 2 ||
							sitesData.status === 4
								? `${commonMailFormatIfSiteId}
								  <p> <b>${sitesData.message} </b></p>
					</div>
				`
								: `${commonOutput}
				<p> <b>${currentSelectedEntry} :</b> ${sitesData.adsTxtEntries.split('\n').join('<br>')} </p>
				</div>`)
					: sitesData.forEach(siteData => {
							let commonMailFormatIfNoSiteId = `<div class="mailData">
						<p><b>Domain :</b> ${siteData.domain}</p>
						<p><b>Site ID :</b> ${siteData.siteId}
						<p> <b>Account Email :</b> ${siteData.accountEmail}</p>`;
							adsData +=
								currentSelectedEntry === 'All Entries Present' ||
								siteData.status === 1 ||
								siteData.status === 2 ||
								siteData.status === 4
									? `${commonMailFormatIfNoSiteId}
					<p> <b>${siteData.message} </b></p>
					</div><br/>
				`
									: `${commonMailFormatIfNoSiteId}
				<p> <b>${currentSelectedEntry} :</b> ${siteData.adsTxtEntries.split('\n').join('<br>')} </p>
				</div> <br/>`;
					  });

				var options = {
					method: 'POST',
					uri: 'http://queuepublisher.adpushup.com/publish',
					body: {
						queue: 'MAILER',
						data: {
							to: emailId,
							body: adsData,
							subject: !siteId
								? `${currentSelectedEntry} list for all the active sites`
								: `${currentSelectedEntry} list for ${sitesData.domain} `
						}
					},
					json: true
				};

				return request(options)
					.then(data => console.log(data))
					.catch(err => console.log(err));
			})
			.catch(err => errorHandler(err, res));

		return opsModel
			.getActiveSites()
			.then(sitesData => sendSuccessResponse(sitesData, res))
			.catch(err => errorHandler(err, res));
	})

	.get('/allSitesStats', (req, res) => {
		if (!req.user.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request',
					code: HTTP_STATUSES.UNAUTHORIZED
				},
				res
			);
		}

		return opsModel
			.getAllSitesStats()
			.then(sitesData => sendSuccessResponse(sitesData, res))
			.catch(err => errorHandler(err, res));
	});

module.exports = router;
