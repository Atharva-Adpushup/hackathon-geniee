const express = require('express'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	uuid = require('uuid'),
	{ couchbaseService } = require('node-utils'),
	config = require('../configs/config'),
	utils = require('../helpers/utils'),
	{ sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions'),
	{ docKeys, tagManagerInitialDoc } = require('../configs/commonConsts'),
	router = express.Router(),
	appBucket = couchbaseService(
		`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
		config.couchBase.DEFAULT_BUCKET,
		config.couchBase.DEFAULT_BUCKET_PASSWORD
	);

const fn = {
	createNewDocAndDoProcessing: payload => {
		return appBucket
			.createDoc(`${docKeys.tagManager}${payload.siteId}`, tagManagerInitialDoc, {})
			.then(() => appBucket.getDoc(`site::${payload.siteId}`))
			.then(docWithCas => {
				payload.siteDomain = docWithCas.value.siteDomain;
				return fn.processing(tagManagerInitialDoc, payload);
			});
	},
	processing: (data, payload) => {
		let cas = data.cas || false,
			value = data.value || data,
			id = uuid.v4();

		value.ads.push({ ...payload.ad, id: id });
		// value.dateCreated = value.dateCreated || +new Date();
		value.siteDomain = value.siteDomain || payload.siteDomain;
		value.siteId = value.siteId || payload.siteId;
		value.ownerEmail = value.ownerEmail || payload.ownerEmail;

		return Promise.resolve([cas, value, id, payload.siteId]);
	},
	getAndUpdate: (key, value, adId) => {
		return appBucket.getDoc(key).then(result => appBucket.updateDoc(key, value, result.cas).then(() => adId));
	},
	directDBUpdate: (key, value, cas, adId) => appBucket.updateDoc(key, value, cas).then(() => adId),
	dbWrapper: (cas, value, adId, siteId) => {
		const key = `${docKeys.tagManager}${siteId}`;
		return !cas ? fn.getAndUpdate(key, value, adId) : fn.directDBUpdate(key, value, cas, adId);
	}
};

router
	.get('/fetchAds', (req, res) => {
		if (!req.query || !req.query.siteId) {
			return sendErrorResponse(
				{
					message: 'Incomplete Parameters. Please check siteId'
				},
				res
			);
		}
		return appBucket
			.getDoc(`${docKeys.tagManager}${req.query.siteId}`)
			.then(docWithCas =>
				sendSuccessResponse(
					{
						ads: docWithCas.value.ads || []
					},
					res
				)
			)
			.catch(err => {
				console.log(err.message);
				return sendErrorResponse({ message: 'Opertion Failed' }, res);
			});
	})
	.get(['/', '/:siteId'], (req, res) => {
		const { session, params } = req;

		if (!params.siteId) {
			return res.send('404');
		}

		return res.render('tagManager', {
			siteId: params.siteId,
			isSuperUser: !!req.session.isSuperUser
		});
	})
	.post('/createAd', (req, res) => {
		if (!req.body || !req.body.siteId || !req.body.ad) {
			return sendErrorResponse(
				{
					message: 'Incomplete Parameters. Please check siteId/ad'
				},
				res
			);
		}
		let payload = { ad: req.body.ad, siteId: req.body.siteId, ownerEmail: req.session.user.email };
		return appBucket
			.getDoc(`${docKeys.tagManager}${req.body.siteId}`)
			.then(docWithCas => fn.processing(docWithCas, payload))
			.catch(err => {
				return err.name && err.name == 'CouchbaseError' && err.code == 13
					? fn.createNewDocAndDoProcessing(payload)
					: Promise.reject(err);
			})
			.spread(fn.dbWrapper)
			.then(id =>
				sendSuccessResponse(
					{
						message: 'Ad created',
						id: id
					},
					res
				)
			)
			.catch(err => {
				console.log(err.message);
				return sendErrorResponse({ message: 'Opertion Failed' }, res);
			});
	});

module.exports = router;
