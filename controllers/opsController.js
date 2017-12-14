const express = require('express'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	{ couchbaseService } = require('node-utils'),
	config = require('../configs/config'),
	utils = require('../helpers/utils'),
	{ fetchLiveSites } = require('../reports/default/adpTags/index'),
	{ getGlobalNetworkWiseDataContributionReport } = require('../helpers/commonFunctions'),
	router = express.Router(),
	appBucket = couchbaseService(
		`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
		config.couchBase.DEFAULT_BUCKET,
		config.couchBase.DEFAULT_BUCKET_PASSWORD
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
			'/liveSitesMapping',
			'/couchbaseEditor',
			'/getAllSites',
			'/:siteId/panel',
			'/sitesMapping',
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
