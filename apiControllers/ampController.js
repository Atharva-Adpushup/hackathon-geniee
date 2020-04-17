const express = require('express');
const Promise = require('bluebird');
const uuid = require('uuid');
const moment = require('moment');

const config = require('../configs/config');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const { docKeys, tagManagerInitialDoc, ampAdInitialDoc } = require('../configs/commonConsts');
const { generateSectionName } = require('../helpers/clientServerHelpers');
const {
	appBucket,
	errorHandler,
	verifyOwner,
	sendDataToZapier,
	emitEventAndSendResponse,
	fetchAds,
	fetchAmpAds,
	createNewDocAndDoProcessing,
	createNewAmpDocAndDoProcessing,
	updateAmpTags,
	masterSave,
	modifyAd,
	queuePublishingWrapper,
	storedRequestWrapper
} = require('../helpers/routeHelpers');

const router = express.Router();

const fn = {
	isSuperUser: false,
	createNewDocAndDoProcessingWrapper: payload =>
		createNewAmpDocAndDoProcessing(payload, ampAdInitialDoc, docKeys.amp, fn.processing),
	processing: (data, payload) => {
		const cas = data.cas || false;
		const value = data.value || data;
		const id = payload.id;

		const name = generateSectionName({
			width: payload.ad.width,
			height: payload.ad.height,
			pagegroup: null,
			id,
			service: 'A_M'
		});
		const ad = {
			...payload.ad,
			sectionId: `${payload.siteId}:${id}`
		};
		// value.createdOn = +new Date();
		value.ad = ad;
		value.id = `${payload.siteId}:${id}`;
		value.name = name;
		value.isAmp = true;
		value.siteDomain = value.siteDomain || payload.siteDomain;
		value.siteId = value.siteId || payload.siteId;
		value.ownerEmail = value.ownerEmail || payload.ownerEmail;
		value.dfpSyncingStatus = {
			startedOn: null, // timestamp
			completedOn: null, // timestamp
			error: null // Error msg
		};
		value.storedRequestSyncedOn = null; // timestamp

		return Promise.resolve([cas, value, payload.siteId]);
	},
	getAndUpdate: (key, value) =>
		appBucket.getDoc(key).then(result => appBucket.updateDoc(key, value, result.cas)),
	directDBUpdate: (key, value, cas) => appBucket.updateDoc(key, value, cas),
	dbWrapper: (cas, value, siteId) => {
		const key = `${docKeys.amp}${value.id}`;

		function dbOperation() {
			return !cas ? fn.getAndUpdate(key, value) : fn.directDBUpdate(key, value, cas);
		}

		return dbOperation().then(() => value);
	},
	adUpdateProcessing: (req, res, key, processing) => {
		const { ads } = req.body;
		const ad = ads[1];

		return appBucket
			.getDoc(`${key}${ad.id}`)
			.then(docWithCas => processing(docWithCas))
			.then(() => emitEventAndSendResponse(req.body.siteId, res))
			.catch(err => errorHandler(err, res));
	}
};

router
	.get('/fetchAds', (req, res) => fetchAmpAds(req, res, docKeys.amp))
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
			ownerEmail: req.user.email,
			id: uuid.v4()
		};
		return verifyOwner(req.body.siteId, req.user.email)
			.then(() => appBucket.getDoc(`${docKeys.amp}${payload.siteId}:${payload.id}`))
			.then(docWithCas => fn.processing(docWithCas, payload))
			.catch(err =>
				err.name && err.name === 'CouchbaseError' && err.code === 13
					? fn.createNewDocAndDoProcessingWrapper(payload)
					: Promise.reject(err)
			)
			.spread(fn.dbWrapper)
			.then(value =>
				sendSuccessResponse(
					{
						message: 'Ad created',
						doc: { ...value }
					},
					res
				)
			)
			.catch(err => errorHandler(err, res));
	})
	.post('/masterSave', (req, res) => {
		const { adsToUpdate, ads = [], siteId } = req.body;

		const updatedAds = adsToUpdate.map(adId => updateAmpTags(adId, ads));
		return (
			Promise.all(updatedAds)
				.then(modifiedAds => {
					const allAmpAds = ads.map(obj => modifiedAds.find(o => o.id === obj.id) || obj);

					return queuePublishingWrapper(siteId, allAmpAds);
				})
				// .then(res => {
				// 	const { ads } = res;
				// 	return ads.map(doc => storedRequestWrapper(doc));
				// })
				.then(() => res.send({ msg: 'success' }))
				.catch(err => console.log(err))
		);

		// masterSave(req, res, fn.adUpdateProcessing, fn.directDBUpdate, docKeys.amp, 1);
	})
	.post('/modifyAd', (req, res) => {
		const { adId, data, siteId } = req.body;

		return updateAmpTags(adId, null, data)
			.then(() => res.send({ msg: 'success' }))
			.catch(err => console.log(err));
		// modifyAd(req, res, fn.adUpdateProcessing, fn.directDBUpdate, docKeys.amp);
	});

module.exports = router;
