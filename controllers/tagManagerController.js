const express = require('express'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	uuid = require('uuid'),
	{ couchbaseService } = require('node-utils'),
	config = require('../configs/config'),
	utils = require('../helpers/utils'),
	{ sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions'),
	{ docKeys, tagManagerInitialDoc, videoNetworkInfo } = require('../configs/commonConsts'),
	adpushup = require('../helpers/adpushupEvent'),
	siteModel = require('../models/siteModel'),
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
		if (
			(value.ownerEmail && req.session.user.email != value.ownerEmail) ||
			(payload.ownerEmail && req.session.user.email != payload.ownerEmail)
		) {
			return Promise.reject();
		}

		let cas = data.cas || false,
			value = data.value || data,
			id = uuid.v4(),
			networkInfo = payload.ad.formatData.type == 'video' ? videoNetworkInfo : {};

		value.ads.push({
			...payload.ad,
			id: id,
			formatData: {
				...payload.ad.formatData,
				eventData: { value: payload.ad.formatData.type == 'video' ? `#adp_video_${id}` : null }
			},
			...networkInfo
		});
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
	},
	errorHander: (err, res) => {
		console.log(err.message);
		return sendErrorResponse({ message: 'Opertion Failed' }, res);
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
			.catch(err => fn.errorHander(err, res));
	})
	.get(['/', '/:siteId'], (req, res) => {
		const { session, params } = req;

		if (!params.siteId) {
			return res.render('404');
		}

		return siteModel
			.getSiteById(params.siteId)
			.then(site => {
				return site.get('ownerEmail') != session.user.email
					? res.render('404')
					: res.render('tagManager', {
							siteId: params.siteId,
							isSuperUser: !!session.isSuperUser
					  });
			})
			.catch(err => {
				console.log(err.message);
				return res.render('404');
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
			.catch(err => fn.errorHander(err, res));
	})
	.post('/masterSave', (req, res) => {
		if (!req.body || !req.body.siteId || !req.body.ads) {
			return sendErrorResponse(
				{
					message: 'Incomplete Parameters.'
				},
				res
			);
		}
		return appBucket
			.getDoc(`${docKeys.tagManager}${req.body.siteId}`)
			.then(docWithCas => {
				let doc = docWithCas.value;
				if (doc.ownerEmail != req.session.user.email) {
					return Promise.reject();
				}
				doc.ads = req.body.ads;
				return appBucket.updateDoc(`${docKeys.tagManager}${req.body.siteId}`, doc, docWithCas.cas);
			})
			.then(() => siteModel.getSiteById(req.body.siteId))
			.then(site => {
				adpushup.emit('siteSaved', site); // Emitting Event for Ad Syncing
				return sendSuccessResponse(
					{
						message: 'Master Saved'
					},
					res
				);
			})
			.catch(err => fn.errorHander(err, res));
	});

module.exports = router;
