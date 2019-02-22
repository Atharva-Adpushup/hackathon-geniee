const express = require('express');
const Promise = require('bluebird');
const uuid = require('uuid');
const moment = require('moment');
const config = require('../configs/config');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const { docKeys, tagManagerInitialDoc } = require('../configs/commonConsts');
const {
	appBucket,
	errorHander,
	verifyOwner,
	sendDataToZapier,
	emitEventAndSendResponse,
	fetchAds,
	createNewDocAndDoProcessing,
	masterSave,
	modifyAd
} = require('../helpers/routeHelpers');

const router = express.Router();

const fn = {
	isSuperUser: false,
	createNewDocAndDoProcessingWrapper: payload =>
		createNewDocAndDoProcessing(payload, tagManagerInitialDoc, docKeys.apTag, fn.processing),
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
			}
		};

		value.ads.push(ad);
		value.siteDomain = value.siteDomain || payload.siteDomain;
		value.siteId = value.siteId || payload.siteId;
		value.ownerEmail = value.ownerEmail || payload.ownerEmail;

		if (config.environment.HOST_ENV === 'production' && !fn.isSuperUser) {
			sendDataToZapier('https://hooks.zapier.com/hooks/catch/547126/cdt7p8/?', {
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
	adUpdateProcessing: (req, res, processing) =>
		appBucket
			.getDoc(`${docKeys.apTag}${req.body.siteId}`)
			.then(docWithCas => processing(docWithCas))
			.then(() => emitEventAndSendResponse(req.body.siteId, res))
			.catch(err => errorHander(err, res))
};

router
	.get('/fetchAds', (req, res) => fetchAds(req, res, docKeys.apTag))
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
		return verifyOwner(req.body.siteId, req.user.email)
			.then(() => appBucket.getDoc(`${docKeys.apTag}${req.body.siteId}`))
			.then(docWithCas => fn.processing(docWithCas, payload))
			.catch(err =>
				err.name && err.name === 'CouchbaseError' && err.code === 13
					? fn.createNewDocAndDoProcessingWrapper(payload)
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
			.catch(err => errorHander(err, res));
	})
	.post('/masterSave', (req, res) =>
		masterSave(req, res, fn.adUpdateProcessing, fn.directDBUpdate, docKeys.apTag, 1)
	)
	.post('/modifyAd', (req, res) =>
		modifyAd(req, res, fn.adUpdateProcessing, fn.directDBUpdate, docKeys.apTag)
	);

module.exports = router;
