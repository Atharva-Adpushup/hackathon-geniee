const express = require('express'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	moment = require('moment'),
	{ couchbaseService } = require('node-utils'),
	config = require('../configs/config'),
	utils = require('../helpers/utils'),
	{ fetchLiveSites } = require('../reports/default/adpTags/index'),
	{
		getGlobalNetworkWiseDataContributionReport,
		getGlobalMetricsDataContributionReport,
		getGlobalModeWiseTrafficContributionReport,
		getSiteModeWiseTrafficContributionReport,
		getGlobalTop10CountriesContributionQuery,
		getGlobalTop10SitesContributionReport,
		getGlobalLostAndFoundLiveSitesReport,
		getSiteBrowserWiseTrafficContributionReport,
		getSiteXpathMissPageGroupContributionReport,
		getSiteTop20CountriesContributionReport,
		getSiteMetricsDataContributionReport,
		getSiteNetworkWiseDataContributionReport,
		getSiteModeWiseTopUrlsReport
	} = require('../helpers/commonFunctions'),
	router = express.Router(),
	appBucket = couchbaseService(
		`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
		config.couchBase.DEFAULT_BUCKET,
		config.couchBase.DEFAULT_USER_NAME,
		config.couchBase.DEFAULT_USER_PASSWORD
	);

const fn = {
	getAllSitesFromCouchbase: () => {
		let query = `select a.siteId, a.siteDomain, a.adNetworkSettings, a.ownerEmail, a.step, a.channels, a.apConfigs, a.dateCreated, b.adNetworkSettings[0].pubId, b.adNetworkSettings[0].adsenseEmail from ${
			config.couchBase.DEFAULT_BUCKET
		} a join ${config.couchBase.DEFAULT_BUCKET} b on keys 'user::' || a.ownerEmail where meta(a).id like 'site::%'`;
		return appBucket.queryDB(query);
	}
};

router
	.get(
		[
			'/',
			'/couchbaseEditor',
			'/getAllSites',
			'/:siteId/panel',
			'/settings/:siteId'
		],
		(req, res) => {
			const { session, params } = req,
				dataToSend = {
					siteId: 1
				};

			if (session.isSuperUser) {
				params.hasOwnProperty('siteId') ? (dataToSend.siteId = req.params.siteId) : null;
				return res.render('opsPanel', dataToSend);
			} else {
				return res.render('404');
			}
		}
	)
	.post('/getGlobalNetworkWiseData', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			params = {
				transform: true,
				fromDate:
					req.body && req.body.fromDate
						? moment(req.body.fromDate).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				toDate:
					req.body && req.body.toDate
						? moment(req.body.toDate).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD')
			},
			dateFormatCollection = utils.getDateFormatCollection({
				fromDate: params.fromDate,
				toDate: params.toDate,
				format: 'MMM DD'
			});

		return getGlobalNetworkWiseDataContributionReport(params)
			.then(responseData => {
				response.data = responseData;
				response.data.dateFormat = dateFormatCollection;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getGlobalMetricsData', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			params = {
				transform: true,
				fromDate:
					req.body && req.body.fromDate
						? moment(req.body.fromDate).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				toDate:
					req.body && req.body.toDate
						? moment(req.body.toDate).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD')
			},
			dateFormatCollection = utils.getDateFormatCollection({
				fromDate: params.fromDate,
				toDate: params.toDate,
				format: 'MMM DD'
			});

		return getGlobalMetricsDataContributionReport(params)
			.then(responseData => {
				response.data = responseData;
				response.data.dateFormat = dateFormatCollection;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getGlobalModeWiseData', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			params = {
				transform: true,
				fromDate:
					req.body && req.body.fromDate
						? moment(req.body.fromDate).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				toDate:
					req.body && req.body.toDate
						? moment(req.body.toDate).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD')
			},
			dateFormatCollection = utils.getDateFormatCollection({
				fromDate: params.fromDate,
				toDate: params.toDate,
				format: 'MMM DD'
			});

		return getGlobalModeWiseTrafficContributionReport(params)
			.then(responseData => {
				response.data = responseData;
				response.data.dateFormat = dateFormatCollection;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getSiteModeWiseTopUrlsData', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			bodyParameters = req.body,
			params = {
				transform: true,
				fromDate:
					bodyParameters && bodyParameters.fromDate
						? moment(bodyParameters.fromDate).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				toDate:
					bodyParameters && bodyParameters.toDate
						? moment(bodyParameters.toDate).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD'),
				siteId: bodyParameters.siteId,
				mode: bodyParameters.mode || 1,
				count: bodyParameters.count || 20,
				platformCode: bodyParameters.platformCode || ''
			},
			dateFormatCollection = utils.getDateFormatCollection({
				fromDate: params.fromDate,
				toDate: params.toDate,
				format: 'MMM DD'
			});

		return getSiteModeWiseTopUrlsReport(params)
			.then(responseData => {
				response.data = responseData;
				response.dateFormat = dateFormatCollection;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getSiteNetworkWiseData', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			bodyParameters = req.body,
			params = {
				transform: true,
				fromDate:
					bodyParameters && bodyParameters.fromDate
						? moment(bodyParameters.fromDate).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				toDate:
					bodyParameters && bodyParameters.toDate
						? moment(bodyParameters.toDate).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD'),
				siteId: bodyParameters.siteId
			},
			dateFormatCollection = utils.getDateFormatCollection({
				fromDate: params.fromDate,
				toDate: params.toDate,
				format: 'MMM DD'
			});

		return getSiteNetworkWiseDataContributionReport(params)
			.then(responseData => {
				response.data = responseData;
				response.data.dateFormat = dateFormatCollection;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getSiteModeWiseData', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			bodyParameters = req.body,
			params = {
				transform: true,
				fromDate:
					bodyParameters && bodyParameters.fromDate
						? moment(bodyParameters.fromDate).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				toDate:
					bodyParameters && bodyParameters.toDate
						? moment(bodyParameters.toDate).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD'),
				siteId: bodyParameters.siteId,
				platformCode: bodyParameters.platformCode || ''
			},
			dateFormatCollection = utils.getDateFormatCollection({
				fromDate: params.fromDate,
				toDate: params.toDate,
				format: 'MMM DD'
			});

		return getSiteModeWiseTrafficContributionReport(params)
			.then(responseData => {
				response.data = responseData;
				response.data.dateFormat = dateFormatCollection;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getSiteBrowserWiseTraffic', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			bodyParameters = req.body,
			params = {
				transform: true,
				fromDate:
					bodyParameters && bodyParameters.fromDate
						? moment(bodyParameters.fromDate).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				toDate:
					bodyParameters && bodyParameters.toDate
						? moment(bodyParameters.toDate).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD'),
				siteId: bodyParameters.siteId
			},
			dateFormatCollection = utils.getDateFormatCollection({
				fromDate: params.fromDate,
				toDate: params.toDate,
				format: 'MMM DD'
			});

		return getSiteBrowserWiseTrafficContributionReport(params)
			.then(responseData => {
				response.data = responseData;
				response.data.dateFormat = dateFormatCollection;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getSiteTop20CountriesData', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			bodyParameters = req.body,
			params = {
				transform: true,
				count: bodyParameters.count ? bodyParameters.count : 11,
				fromDate:
					bodyParameters && bodyParameters.fromDate
						? moment(bodyParameters.fromDate).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				toDate:
					bodyParameters && bodyParameters.toDate
						? moment(bodyParameters.toDate).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD'),
				siteId: bodyParameters.siteId
			},
			dateFormatCollection = utils.getDateFormatCollection({
				fromDate: params.fromDate,
				toDate: params.toDate,
				format: 'MMM DD'
			});

		return getSiteTop20CountriesContributionReport(params)
			.then(responseData => {
				response.data = responseData;
				response.data.dateFormat = dateFormatCollection;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getSiteXpathMissPageGroupData', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			bodyParameters = req.body,
			params = {
				transform: true,
				count: bodyParameters.count ? bodyParameters.count : 20,
				fromDate:
					bodyParameters && bodyParameters.fromDate
						? moment(bodyParameters.fromDate).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				toDate:
					bodyParameters && bodyParameters.toDate
						? moment(bodyParameters.toDate).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD'),
				siteId: bodyParameters.siteId
			},
			dateFormatCollection = utils.getDateFormatCollection({
				fromDate: params.fromDate,
				toDate: params.toDate,
				format: 'MMM DD'
			});

		return getSiteXpathMissPageGroupContributionReport(params)
			.then(responseData => {
				response.data = responseData;
				response.data.dateFormat = dateFormatCollection;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})

	.post('/getSiteMetricsData', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			bodyParameters = req.body,
			params = {
				transform: true,
				fromDate:
					bodyParameters && bodyParameters.fromDate
						? moment(bodyParameters.fromDate).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				toDate:
					bodyParameters && bodyParameters.toDate
						? moment(bodyParameters.toDate).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD'),
				siteId: bodyParameters.siteId
			},
			dateFormatCollection = utils.getDateFormatCollection({
				fromDate: params.fromDate,
				toDate: params.toDate,
				format: 'MMM DD'
			});

		return getSiteMetricsDataContributionReport(params)
			.then(responseData => {
				response.data = responseData;
				response.data.dateFormat = dateFormatCollection;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getGlobalTop10Countries', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			bodyParameters = req.body,
			params = {
				transform: true,
				count: bodyParameters.count ? bodyParameters.count : 11,
				fromDate:
					bodyParameters && bodyParameters.fromDate
						? moment(bodyParameters.fromDate).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				toDate:
					bodyParameters && bodyParameters.toDate
						? moment(bodyParameters.toDate).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD')
			},
			dateFormatCollection = utils.getDateFormatCollection({
				fromDate: params.fromDate,
				toDate: params.toDate,
				format: 'MMM DD'
			});

		return getGlobalTop10CountriesContributionQuery(params)
			.then(responseData => {
				response.data = responseData;
				response.data.dateFormat = dateFormatCollection;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getGlobalTop10Sites', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			bodyParameters = req.body,
			params = {
				transform: true,
				fromDate:
					bodyParameters && bodyParameters.fromDate
						? moment(bodyParameters.fromDate).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				toDate:
					bodyParameters && bodyParameters.toDate
						? moment(bodyParameters.toDate).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD')
			},
			dateFormatCollection = utils.getDateFormatCollection({
				fromDate: params.fromDate,
				toDate: params.toDate,
				format: 'MMM DD'
			});

		return getGlobalTop10SitesContributionReport(params)
			.then(responseData => {
				response.data = responseData;
				response.data.dateFormat = dateFormatCollection;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getGlobalLostAndFoundLiveSites', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			bodyParameters = req.body,
			isBodyParameters = !!bodyParameters,
			isThisWeekParameters =
				isBodyParameters &&
				bodyParameters.thisWeek &&
				bodyParameters.thisWeek.from &&
				bodyParameters.thisWeek.to,
			isLastWeekParameters =
				isBodyParameters &&
				bodyParameters.lastWeek &&
				bodyParameters.lastWeek.from &&
				bodyParameters.lastWeek.to,
			params = {
				transform: true,
				threshold: (isBodyParameters && bodyParameters.threshold) || 1000,
				thisWeek: {
					from: isThisWeekParameters && bodyParameters.thisWeek.from,
					to: isThisWeekParameters && bodyParameters.thisWeek.to
				},
				lastWeek: {
					from: isLastWeekParameters && bodyParameters.lastWeek.from,
					to: isLastWeekParameters && bodyParameters.lastWeek.to
				}
			};

		return getGlobalLostAndFoundLiveSitesReport(params)
			.then(responseData => {
				response.data = responseData;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getLiveSites', (req, res) => {
		let response = {
				error: false,
				data: []
			},
			params = {
				threshold: req.body && req.body.threshold ? req.body.threshold : 0,
				from:
					req.body && req.body.from
						? moment(req.body.from).format('YYYY-MM-DD')
						: moment()
								.subtract(7, 'days')
								.format('YYYY-MM-DD'),
				to:
					req.body && req.body.to
						? moment(req.body.to).format('YYYY-MM-DD')
						: moment()
								.subtract(1, 'days')
								.format('YYYY-MM-DD')
			};
		return fetchLiveSites(params)
			.then(resultFromQuery => {
				resultFromQuery && resultFromQuery.length ? (response.data = resultFromQuery) : null;
				return res.send(response);
			})
			.catch(err => {
				return res.send(Object.assign(response, { error: true }));
			});
	})
	.post('/getAllSites', (req, res) => {
		let response = {
			error: false
		};
		return fn
			.getAllSitesFromCouchbase()
			.then(sites => res.send(Object.assign(response, { sites: sites })))
			.catch(err => {
				console.log(err);
				res.send(
					Object.assign(response, {
						error: true,
						message: 'Message failed'
					})
				);
			});
	});

module.exports = router;
