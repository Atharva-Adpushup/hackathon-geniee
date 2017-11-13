const express = require('express'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	{ couchbaseService } = require('node-utils'),
	config = require('../configs/config'),
	router = express.Router(),
	appBucket = couchbaseService(
		`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
		config.couchBase.DEFAULT_BUCKET,
		config.couchBase.DEFAULT_BUCKET_PASSWORD
	);

const fn = {
	getAllSitesFromCouchbase: () => {
		let query = `select a.siteId, a.siteDomain, a.adNetworkSettings, a.ownerEmail, a.step, a.channels, a.apConfigs, a.dateCreated, b.adNetworkSettings[0].pubId, b.adNetworkSettings[0].adsenseEmail from ${config
			.couchBase.DEFAULT_BUCKET} a join ${config.couchBase
			.DEFAULT_BUCKET} b on keys 'user::' || a.ownerEmail where meta(a).id like 'site::%'`;
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
