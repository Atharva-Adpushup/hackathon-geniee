const express = require('express');
const Promise = require('bluebird');
const _ = require('lodash');
const uuid = require('uuid');
const { couchbaseService } = require('node-utils');
const request = require('request-promise');
const config = require('../configs/config');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const {
	docKeys,
	INNOVATIVE_ADS_INITIAL_DOC,
	DEFAULT_META,
	INTERACTIVE_ADS_TYPES
} = require('../configs/commonConsts');
const adpushup = require('../helpers/adpushupEvent');
const siteModel = require('../models/siteModel');

const router = express.Router();
const appBucket = couchbaseService(
	`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
	config.couchBase.DEFAULT_BUCKET,
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);

const fn = {
	sendDataToZapier: data => {
		const options = {
			method: 'GET',
			uri: 'https://hooks.zapier.com/hooks/catch/547126/cdt7p8/?',
			json: true
		};
		_.forEach(data, (value, key) => {
			options.uri += `${key}=${value}&`;
		});
		options.uri = options.uri.slice(0, -1);

		return request(options)
			.then(response => console.log('Ad Creation. Called made to Zapier'))
			.catch(err => console.log('Ad creation call to Zapier failed'));
	},
	createNewDocAndDoProcessing: payload => {
		const innovativeAdDefault = _.cloneDeep(INNOVATIVE_ADS_INITIAL_DOC);
		return appBucket
			.createDoc(`${docKeys.interactiveAds}${payload.siteId}`, innovativeAdDefault, {})
			.then(() => appBucket.getDoc(`site::${payload.siteId}`))
			.then(docWithCas => {
				payload.siteDomain = docWithCas.value.siteDomain;
				return fn.processing(innovativeAdDefault, payload);
			});
	},
	processing: (data, payload) => {
		const cas = data.cas || false;
		const { pagegroups, formatData } = payload.ad;

		const value = data.value || data;
		let newAds = [];
		const logs = [];

		if (pagegroups.length) {
			newAds = _.map(pagegroups, pagegroup => {
				logs.push(`${formatData.platform}-${formatData.format}-${pagegroup}`);
				return {
					...payload.ad,
					id: uuid.v4(),
					createdOn: +new Date(),
					pagegroups: [pagegroup]
				};
			});
		} else {
			return Promise.reject('No Pagegroups found in the ad');
		}

		value.ads = value.ads.concat(newAds);
		value.meta.pagegroups = value.meta.pagegroups.concat(logs);
		value.siteDomain = value.siteDomain || payload.siteDomain;
		value.siteId = value.siteId || payload.siteId;
		value.ownerEmail = value.ownerEmail || payload.ownerEmail;

		// if (config.environment.HOST_ENV === 'production') {
		// 	fn.sendDataToZapier({
		// 		email: value.ownerEmail,
		// 		website: value.siteDomain,
		// 		platform: ad.formatData.platform,
		// 		size: `${ad.width}x${ad.height}`,
		// 		adId: ad.id,
		// 		type: 'action',
		// 		message: 'New Section Created. Please Check',
		// 		createdOn: moment(ad.createdOn).format('dddd, MMMM Do YYYY, h:mm:ss a')
		// 	});
		// }

		return Promise.resolve([cas, value, { ads: newAds, logs }, payload.siteId]);
	},
	getAndUpdate: (key, value) =>
		appBucket.getDoc(key).then(result => appBucket.updateDoc(key, value, result.cas)),
	directDBUpdate: (key, value, cas) => appBucket.updateDoc(key, value, cas),
	dbWrapper: (cas, value, toReturn, siteId) => {
		function process() {
			const key = `${docKeys.interactiveAds}${siteId}`;
			return !cas ? fn.getAndUpdate(key, value) : fn.directDBUpdate(key, value, cas);
		}
		return process().then(() => toReturn);
	},
	errorHander: (err, res) => {
		console.log(err);
		return sendErrorResponse({ message: 'Opertion Failed' }, res);
	},
	emitEventAndSendResponse: (siteId, res, data = {}) =>
		siteModel.getSiteById(siteId).then(site => {
			adpushup.emit('siteSaved', site); // Emitting Event for Ad Syncing
			return sendSuccessResponse(
				{
					message: 'Operation Successfull',
					...data
				},
				res
			);
		}),
	adUpdateProcessing: (req, res, processing) =>
		appBucket
			.getDoc(`${docKeys.interactiveAds}${req.body.siteId}`)
			.then(docWithCas => processing(docWithCas))
			.then(() => fn.emitEventAndSendResponse(req.body.siteId, res))
			.catch(err => fn.errorHander(err, res))
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
			.getDoc(`${docKeys.interactiveAds}${req.query.siteId}`)
			.then(docWithCas =>
				sendSuccessResponse(
					{
						ads: docWithCas.value.ads || []
					},
					res
				)
			)
			.catch(err =>
				err.code && err.code === 13 && err.message.includes('key does not exist')
					? sendSuccessResponse(
							{
								ads: []
							},
							res
					  )
					: fn.errorHander(err, res)
			);
	})
	.get(['/', '/:siteId'], (req, res) => {
		const { session, params } = req;

		if (!params.siteId) {
			return res.render('404');
		}

		return Promise.join(siteModel.getSiteById(params.siteId), site =>
			new Promise((resolve, reject) =>
				site.get('ownerEmail') === session.user.email
					? resolve()
					: reject('Owner verification failed')
			)
				.then(() => appBucket.getDoc(`${docKeys.interactiveAds}${params.siteId}`))
				.then(docWithCas => docWithCas.value.meta)
				.catch(err =>
					err.name && err.name == 'CouchbaseError' && err.code == 13
						? DEFAULT_META
						: Promise.reject(err)
				)
				.then(meta => {
					const channels = site.get('channels') || [];
					return res.render('interactiveAdsManager', {
						siteId: params.siteId,
						isSuperUser: !!session.isSuperUser,
						channels,
						meta
					});
				})
		).catch(err => {
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
		const payload = {
			ad: req.body.ad,
			siteId: req.body.siteId,
			ownerEmail: req.session.user.email
		};
		return appBucket
			.getDoc(`${docKeys.interactiveAds}${req.body.siteId}`)
			.then(docWithCas => fn.processing(docWithCas, payload))
			.catch(err =>
				err.name && err.name == 'CouchbaseError' && err.code == 13
					? fn.createNewDocAndDoProcessing(payload)
					: Promise.reject(err)
			)
			.spread(fn.dbWrapper)
			.then(data => fn.emitEventAndSendResponse(req.body.siteId, res, data))
			.catch(err => fn.errorHander(err, res));
	})
	.post('/masterSave', (req, res) => {
		if (
			!req.body ||
			!req.body.siteId ||
			!req.body.ads ||
			!req.session.isSuperUser ||
			!req.body.meta
		) {
			return sendErrorResponse(
				{
					message: 'Invalid Parameters.'
				},
				res
			);
		}
		return fn.adUpdateProcessing(req, res, docWithCas => {
			const doc = docWithCas.value;
			const { siteId } = req.body;

			if (doc.ownerEmail != req.session.user.email) {
				return Promise.reject('Owner verfication fail');
			}
			if (!doc.ads.length) {
				doc.ads = req.body.ads;
			} else {
				const newAds = [];

				_.forEach(doc.ads, adFromDoc => {
					_.forEach(req.body.ads, adFromClient => {
						if (adFromDoc.id == adFromClient.id) {
							newAds.push({
								...adFromDoc,
								...adFromClient,
								networkData: {
									...adFromDoc.networkData,
									...adFromClient.networkData
								}
							});
						}
					});
				});
				doc.ads = newAds;
			}

			doc.meta = req.body.meta;
			return fn.directDBUpdate(`${docKeys.interactiveAds}${siteId}`, doc, docWithCas.cas);
		});
	})
	.post('/modifyAd', (req, res) => {
		if (!req.body || !req.body.siteId || !req.body.adId) {
			return sendErrorResponse(
				{
					message: 'Invalid Parameters.'
				},
				res
			);
		}
		return fn.adUpdateProcessing(req, res, docWithCas => {
			const doc = docWithCas.value;
			if (doc.ownerEmail != req.session.user.email) {
				return Promise.reject('Owner verfication fail');
			}
			_.forEach(doc.ads, (ad, index) => {
				if (ad.id == req.body.adId) {
					doc.ads[index] = { ...ad, ...req.body.data };
					return false;
				}
			});
			if (req.body.metaUpdate && Object.keys(req.body.metaUpdate).length) {
				const { mode, logs } = req.body.metaUpdate;
				doc.meta[mode] = logs;
			}
			return fn.directDBUpdate(`${docKeys.interactiveAds}${req.body.siteId}`, doc, docWithCas.cas);
		});
	});

module.exports = router;
