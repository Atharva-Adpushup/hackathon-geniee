const express = require('express');
const Promise = require('bluebird');
const _ = require('lodash');
const uuid = require('uuid');
const moment = require('moment');
const { couchbaseService } = require('node-utils');
const request = require('request-promise');
const config = require('../configs/config');
const HTTP_STATUS = require('../configs/httpStatusConsts');
const AdPushupError = require('../helpers/AdPushupError');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const { docKeys, tagManagerInitialDoc } = require('../configs/commonConsts');
const adpushup = require('../helpers/adpushupEvent');
const siteModel = require('../models/siteModel');

const appBucket = couchbaseService(
	`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
	config.couchBase.DEFAULT_BUCKET,
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);
const router = express.Router();

const fn = {
	isSuperUser: false,
	verifyOwner: (siteId, userEmail) =>
		siteModel.getSiteById(siteId).then(site => {
			if (site.get('ownerEmail') !== userEmail) {
				return Promise.reject(
					new Error({ message: 'Unauthorized Request', code: HTTP_STATUS.PERMISSION_DENIED })
				);
			}
			return true;
		}),
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
			.then(() => console.log('Ad Creation. Called made to Zapier'))
			.catch(err => console.log(`Ad creation call to Zapier failed, err message : ${err.message}`));
	},
	createNewDocAndDoProcessing: payload => {
		const tagManagerDefault = _.cloneDeep(tagManagerInitialDoc);
		return appBucket
			.createDoc(`${docKeys.apTag}${payload.siteId}`, tagManagerDefault, {})
			.then(() => appBucket.getDoc(`site::${payload.siteId}`))
			.then(docWithCas => {
				payload.siteDomain = docWithCas.value.siteDomain;
				return fn.processing(tagManagerDefault, payload);
			});
	},
	processing: (data, payload) => {
		const cas = data.cas || false;
		const value = data.value || data;
		const id = uuid.v4();
		const ad = {
			...payload.ad,
			id,
			name: `Ad-${id}`,
			createdOn: +new Date(),
			formatData: {
				...payload.ad.formatData
			},
			networkInfo: {}
		};

		value.ads.push(ad);
		value.siteDomain = value.siteDomain || payload.siteDomain;
		value.siteId = value.siteId || payload.siteId;
		value.ownerEmail = value.ownerEmail || payload.ownerEmail;

		if (config.environment.HOST_ENV === 'production' && !fn.isSuperUser) {
			fn.sendDataToZapier({
				email: value.ownerEmail,
				website: value.siteDomain,
				platform: ad.formatData.platform,
				size: `${ad.width}x${ad.height}`,
				adId: ad.id,
				type: 'action',
				message: 'New Section Created. Please Check',
				createdOn: moment(ad.createdOn).format('dddd, MMMM Do YYYY, h:mm:ss a')
			});
		}

		return Promise.resolve([cas, value, id, payload.siteId]);
	},
	getAndUpdate: (key, value, adId) =>
		appBucket
			.getDoc(key)
			.then(result => appBucket.updateDoc(key, value, result.cas).then(() => adId)),
	directDBUpdate: (key, value, cas, adId) => appBucket.updateDoc(key, value, cas).then(() => adId),
	dbWrapper: (cas, value, adId, siteId) => {
		const key = `${docKeys.apTag}${siteId}`;
		return !cas ? fn.getAndUpdate(key, value, adId) : fn.directDBUpdate(key, value, cas, adId);
	},
	errorHander: (err, res, code = HTTP_STATUS.BAD_REQUEST) => {
		const customMessage = err.message || err;
		const errorCode = customMessage.code || code;
		return sendErrorResponse({ message: 'Opertion Failed' }, res, errorCode);
	},
	adUpdateProcessing: (req, res, processing) =>
		appBucket
			.getDoc(`${docKeys.apTag}${req.body.siteId}`)
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
		return fn
			.verifyOwner(req.query.siteId, req.user.email)
			.then(() => appBucket.getDoc(`${docKeys.apTag}${req.query.siteId}`))
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
	.post('/createAd', (req, res) => {
		if (!req.body || !req.body.siteId || !req.body.ad) {
			return sendErrorResponse(
				{
					message: 'Incomplete Parameters. Please check siteId/ad'
				},
				res
			);
		}

		fn.isSuperUser = req.user.isSuperUser;

		const payload = {
			ad: req.body.ad,
			siteId: req.body.siteId,
			ownerEmail: req.user.email
		};
		return fn
			.verifyOwner(req.body.siteId, req.user.email)
			.then(() => appBucket.getDoc(`${docKeys.apTag}${req.body.siteId}`))
			.then(docWithCas => fn.processing(docWithCas, payload))
			.catch(err =>
				err.name && err.name === 'CouchbaseError' && err.code === 13
					? fn.createNewDocAndDoProcessing(payload)
					: Promise.reject(err)
			)
			.spread(fn.dbWrapper)
			.then(id =>
				sendSuccessResponse(
					{
						message: 'Ad created',
						id
					},
					res
				)
			)
			.catch(err => fn.errorHander(err, res));
	})
	.post('/masterSave', (req, res) => {
		if (!req.body || !req.body.siteId || !req.body.ads || !req.user.isSuperUser) {
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

			if (doc.ownerEmail !== req.user.email) {
				throw new AdPushupError({
					message: 'Unauthorized Request',
					code: HTTP_STATUS.PERMISSION_DENIED
				});
			}
			if (!doc.ads.length) {
				doc.ads = req.body.ads;
			} else {
				const newAds = [];

				_.forEach(doc.ads, adFromDoc => {
					_.forEach(req.body.ads, adFromClient => {
						if (adFromDoc.id === adFromClient.id) {
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
			return fn.directDBUpdate(`${docKeys.apTag}${siteId}`, doc, docWithCas.cas);
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
			if (doc.ownerEmail !== req.user.email) {
				throw new AdPushupError({
					message: 'Unauthorized Request',
					code: HTTP_STATUS.PERMISSION_DENIED
				});
			}
			_.forEach(doc.ads, (ad, index) => {
				if (ad.id === req.body.adId) {
					doc.ads[index] = { ...ad, ...req.body.data };
					return false;
				}
			});
			return fn.directDBUpdate(`${docKeys.apTag}${req.body.siteId}`, doc, docWithCas.cas);
		});
	});

module.exports = router;
