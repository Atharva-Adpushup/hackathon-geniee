const express = require('express');
const Promise = require('bluebird');
const _ = require('lodash');
const uuid = require('uuid');
const { couchbaseService } = require('node-utils');
const request = require('request-promise');
const config = require('../configs/config');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const { docKeys, interactiveAdsInitialDoc, defaultMeta, INTERACTIVE_ADS_TYPES } = require('../configs/commonConsts');
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
		let options = {
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
		let tagManagerDefault = _.cloneDeep(tagManagerInitialDoc);
		return appBucket
			.createDoc(`${docKeys.interactiveAds}${payload.siteId}`, tagManagerDefault, {})
			.then(() => appBucket.getDoc(`site::${payload.siteId}`))
			.then(docWithCas => {
				payload.siteDomain = docWithCas.value.siteDomain;
				return fn.processing(tagManagerDefault, payload);
			});
	},
	createNewDocAndDoProcessing: payload => {
		const tagManagerDefault = _.cloneDeep(interactiveAdsInitialDoc);
		return appBucket
			.createDoc(`${docKeys.interactiveAds}${payload.siteId}`, tagManagerDefault, {})
			.then(() => appBucket.getDoc(`site::${payload.siteId}`))
			.then(docWithCas => {
				payload.siteDomain = docWithCas.value.siteDomain;
				return fn.processing(tagManagerDefault, payload);
			});
	},
	processing: (data, payload) => {
		let value = data.value || data;

		const cas = data.cas || false;
		const id = uuid.v4();
		const ad = {
			...payload.ad,
			id: id,
			name: `Ad-${id}`,
			createdOn: +new Date()
		};

		value.ads.push(ad);
		value.siteDomain = value.siteDomain || payload.siteDomain;
		value.siteId = value.siteId || payload.siteId;
		value.ownerEmail = value.ownerEmail || payload.ownerEmail;

		if (ad.pagegroups.length) {
			_.forEach(ad.pagegroups, pagegroup => {
				value.meta.pagegroups.push(`${ad.formatData.platform}-${ad.formatData.format}-${pagegroup}`);
			});
		} else {
			value.meta.custom.push(`${ad.formatData.platform}-${ad.format}`);
		}

		// if (INTERACTIVE_ADS_TYPES.VERTICAL.includes(this.state.format)) {
		// 	value.meta.verticalAds = 1;
		// } else if (INTERACTIVE_ADS_TYPES.HORIZONTAL.includes(this.state.format)) {
		// 	value.meta.horizontalAds = 1;
		// } else {
		// 	value.meta.others = 1;
		// }

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

		return Promise.resolve([cas, value, id, payload.siteId]);
	},
	getAndUpdate: (key, value, adId) => {
		return appBucket.getDoc(key).then(result => appBucket.updateDoc(key, value, result.cas).then(() => adId));
	},
	directDBUpdate: (key, value, cas, adId) => appBucket.updateDoc(key, value, cas).then(() => adId),
	dbWrapper: (cas, value, adId, siteId) => {
		const key = `${docKeys.interactiveAds}${siteId}`;
		return !cas ? fn.getAndUpdate(key, value, adId) : fn.directDBUpdate(key, value, cas, adId);
	},
	errorHander: (err, res) => {
		console.log(err);
		return sendErrorResponse({ message: 'Opertion Failed' }, res);
	},
	adUpdateProcessing: (req, res, processing) => {
		return appBucket
			.getDoc(`${docKeys.interactiveAds}${req.body.siteId}`)
			.then(docWithCas => processing(docWithCas))
			.then(() => siteModel.getSiteById(req.body.siteId))
			.then(site => {
				adpushup.emit('siteSaved', site); // Emitting Event for Ad Syncing
				return sendSuccessResponse(
					{
						message: 'Operation Successfull'
					},
					res
				);
			})
			.catch(err => fn.errorHander(err, res));
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
			.getDoc(`${docKeys.interactiveAds}${req.query.siteId}`)
			.then(docWithCas =>
				sendSuccessResponse(
					{
						ads: docWithCas.value.ads || []
					},
					res
				)
			)
			.catch(err => {
				return err.code && err.code === 13 && err.message.includes('key does not exist')
					? sendSuccessResponse(
							{
								ads: []
							},
							res
					  )
					: fn.errorHander(err, res);
			});
	})
	.get(['/', '/:siteId'], (req, res) => {
		const { session, params } = req;

		if (!params.siteId) {
			return res.render('404');
		}

		return Promise.join(siteModel.getSiteById(params.siteId), site => {
			return new Promise((resolve, reject) =>
				site.get('ownerEmail') === session.user.email ? resolve() : reject('Owner verification failed')
			)
				.then(() => appBucket.getDoc(`${docKeys.interactiveAds}${params.siteId}`))
				.then(docWithCas => docWithCas.value.meta)
				.catch(err => {
					return err.name && err.name == 'CouchbaseError' && err.code == 13
						? defaultMeta
						: Promise.reject(err);
				})
				.then(meta => {
					let channels = site.get('channels') || [];
					return res.render('interactiveAdsManager', {
						siteId: params.siteId,
						isSuperUser: !!session.isSuperUser,
						channels: channels,
						meta
					});
				});
		}).catch(err => {
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
			.getDoc(`${docKeys.interactiveAds}${req.body.siteId}`)
			.then(docWithCas => fn.processing(docWithCas, payload))
			.catch(err => {
				return err.name && err.name == 'CouchbaseError' && err.code == 13
					? fn.createNewDocAndDoProcessing(payload)
					: Promise.reject(err);
			})
			.spread(fn.dbWrapper)
			.then(id => {
				return sendSuccessResponse(
					{
						message: 'Ad created',
						id: id
					},
					res
				);
			})
			.catch(err => fn.errorHander(err, res));
	})
	.post('/masterSave', (req, res) => {
		if (!req.body || !req.body.siteId || !req.body.ads || !req.session.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Invalid Parameters.'
				},
				res
			);
		}
		return fn.adUpdateProcessing(req, res, docWithCas => {
			let doc = docWithCas.value,
				{ siteId, siteDomain } = req.body;

			if (doc.ownerEmail != req.session.user.email) {
				return Promise.reject('Owner verfication fail');
			}
			if (!doc.ads.length) {
				doc.ads = req.body.ads;
			} else {
				let newAds = [];

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

			return appBucket.updateDoc(`${docKeys.interactiveAds}${siteId}`, doc, docWithCas.cas);
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
			let doc = docWithCas.value;
			if (doc.ownerEmail != req.session.user.email) {
				return Promise.reject('Owner verfication fail');
			}
			_.forEach(doc.ads, (ad, index) => {
				if (ad.id == req.body.adId) {
					doc.ads[index] = { ...ad, ...req.body.data };
					return false;
				}
			});
			return appBucket.updateDoc(`${docKeys.interactiveAds}${req.body.siteId}`, doc, docWithCas.cas);
		});
	});

module.exports = router;
