const express = require('express');
const Promise = require('bluebird');
const uuid = require('uuid');
const _ = require('lodash');

const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const {
	docKeys,
	ampAdInitialDoc,
	AUDIT_LOGS_ACTIONS: { AMP }
} = require('../configs/commonConsts');
const { generateSectionName } = require('../helpers/clientServerHelpers');
const siteModel = require('../models/siteModel');
const {
	appBucket,
	errorHandler,
	verifyOwner,
	fetchAmpAds,
	fetchNewAmpAds,
	createNewAmpDocAndDoProcessing,
	createNewAmpScriptDocAndDoProcessing,
	updateAmpTags,
	updateAmpTagsNewFormat,
	queuePublishingWrapper,
	storedRequestWrapper,
	getAmpAds,
	getNewAmpAds,
	emitEventAndSendResponse,
	sendDataToAuditLogService
} = require('../helpers/routeHelpers');

const router = express.Router();

const fn = {
	isSuperUser: false,
	createNewDocAndDoProcessingWrapper: payload =>
		createNewAmpDocAndDoProcessing(payload, ampAdInitialDoc, docKeys.amp, fn.processing),
	// for new AMP Ad format
	createNewAmpDocAndDoProcessingWrapper: payload =>
		// for new AMP Tag format
		createNewAmpScriptDocAndDoProcessing(
			payload,
			ampAdInitialDoc,
			docKeys.ampScript,
			fn.processingAmp
		),
	processing: (data, payload) => {
		const cas = data.cas || false;
		const value = data.value || data;
		const { id } = payload;

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
	// for new AMP Ad format
	processingAmp: (data, payload) => {
		const cas = data.cas || false;
		const value = data.value || data;
		const { id } = payload;

		const name = generateSectionName({
			width: payload.ad.width,
			height: payload.ad.height,
			pagegroup: null,
			id,
			service: 'A_M'
		});
		const ad = {
			...payload.ad
		};
		value.dateCreated = +new Date();
		value.pnpConfig = {
			enabled: false,
			firstImpressionOptimized: false
		};

		ad.id = id;
		ad.name = name;
		ad.isAmpScriptAd = true;
		value.siteDomain = value.siteDomain || payload.siteDomain;
		value.siteId = +(value.siteId || payload.siteId);
		value.ownerEmail = value.ownerEmail || payload.ownerEmail;

		// If no ad is created for the site before
		if (!value.ads) {
			value.ads = [];
		}
		value.ads.push(ad);
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
	dbWrapperAmp: (cas, value, siteId) => {
		const key = `${docKeys.ampScript}${siteId}`;
		function dbOperation() {
			return !cas ? fn.getAndUpdate(key, value) : fn.directDBUpdate(key, value, cas);
		}

		return dbOperation().then(() => value);
	}
};

router
	.get('/fetchAds', (req, res) => fetchAmpAds(req, res, docKeys.amp))
	// for new AMP Ad Format
	.get('/fetchAmpAds', (req, res) => fetchNewAmpAds(req, res, docKeys.ampScript))
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
	// for new AMP Ad Format
	.post('/createAmpAd', (req, res) => {
		if (!req.body || !req.body.siteId || !req.body.ad) {
			return sendErrorResponse(
				{
					message: 'Incomplete Parameters. Please check siteId/ad'
				},
				res
			);
		}
		const { siteId } = req.body;
		fn.isSuperUser = req.user.isSuperUser;
		const payload = {
			ad: req.body.ad,
			siteId: +siteId,
			ownerEmail: req.user.email,
			id: uuid.v4()
		};
		return verifyOwner(siteId, req.user.email)
			.then(site => {
				// set siteDomain to payload
				payload.siteDomain = site.get('siteDomain');
				return appBucket.getDoc(`${docKeys.ampScript}${payload.siteId}`);
			})
			.then(docWithCas => fn.processingAmp(docWithCas, payload))
			.catch(err =>
				err.name && err.name === 'CouchbaseError' && err.code === 13
					? fn.createNewAmpDocAndDoProcessingWrapper(payload)
					: Promise.reject(err)
			)
			.spread(fn.dbWrapperAmp)
			.then(value =>
				sendSuccessResponse(
					{
						message: 'Ad created',
						doc: { ...value },
						newId: payload.id // return id of newly created ad
					},
					res
				)
			)
			.catch(err => errorHandler(err, res));
	})
	.post('/masterSave', (req, res) => {
		const { adsToUpdate, ads = [], siteId, dataForAuditLogs } = req.body;

		return verifyOwner(siteId, req.user.email)
			.then(() => getAmpAds(siteId))
			.then(ads => ads.map(val => val.doc))
			.then(amdAds => {
				const { email, originalEmail } = req.user;
				const { siteDomain, appName, type = 'app' } = dataForAuditLogs;

				const adIds = adsToUpdate.map(adId => adId).join(', ');
				sendDataToAuditLogService({
					siteId,
					siteDomain,
					appName,
					type,
					impersonateId: email,
					userId: originalEmail,
					prevConfig: amdAds,
					currentConfig: ads,
					action: {
						name: AMP.UPDATE_AMP_ADS,
						data: `AMP AD IDs - ${adIds}`
					}
				});
				const updatedAds = adsToUpdate.map(adId => updateAmpTags(adId, ads));
				return Promise.all(updatedAds)
					.then(modifiedAds => {
						const allAmpAds = ads.map(obj => modifiedAds.find(o => o.id === obj.id) || obj);
						return queuePublishingWrapper(siteId, allAmpAds);
					})
					.then(ads => {
						const storeRequestArr = ads.map(doc => storedRequestWrapper(doc));

						return Promise.all(storeRequestArr);
					})
					.then(() => sendSuccessResponse({ msg: 'success' }, res))
					.catch(err => errorHandler(err, res));
			})
			.catch(err => errorHandler(err, res));
	})
	.post('/masterSaveAmp', (req, res) => {
		const { adsToUpdate, ads = [], siteId, dataForAuditLogs } = req.body;

		return verifyOwner(siteId, req.user.email)
			.then(() => getNewAmpAds(siteId))
			.then(amdAds => {
				const { email, originalEmail } = req.user;
				const { siteDomain, appName, type = 'app' } = dataForAuditLogs;

				const adIds = adsToUpdate.join(', ');
				sendDataToAuditLogService({
					siteId,
					siteDomain,
					appName,
					type,
					impersonateId: email,
					userId: originalEmail,
					prevConfig: amdAds,
					currentConfig: ads,
					action: {
						name: AMP.UPDATE_AMP_ADS,
						data: `AMP AD IDs - ${adIds}`
					}
				});

				return updateAmpTagsNewFormat(null, ads, siteId)
					.then(() => emitEventAndSendResponse(siteId, res))
					.catch(err => errorHandler(err, res));
			})
			.catch(err => errorHandler(err, res));
	})
	.post('/modifyAd', (req, res) => {
		const { adId, data, siteId } = req.body;

		return updateAmpTags(adId, null, data)
			.then(() => sendSuccessResponse({ msg: 'success' }, res))
			.catch(err => errorHandler(err, res));
	})
	.post('/modifyAmpAd', (req, res) => {
		const { adId, data, siteId, dataForAuditLogs } = req.body;
		return verifyOwner(siteId, req.user.email)
			.then(() => getNewAmpAds(siteId))
			.then(amdAds => {
				const ampAd = _.cloneDeep(amdAds.find(ad => ad.id === adId));
				return updateAmpTagsNewFormat(adId, null, siteId, data)
					.then(updatedAdDoc => {
						const udpatedAd = updatedAdDoc.ads.find(ad => ad.id === adId);

						const { email, originalEmail } = req.user;
						const { siteDomain, appName, type = 'app' } = dataForAuditLogs;
						sendDataToAuditLogService({
							siteId,
							siteDomain,
							appName,
							type,
							impersonateId: email,
							userId: originalEmail,
							prevConfig: ampAd,
							currentConfig: udpatedAd,
							action: {
								name: AMP.UPDATE_AMP_ADS,
								data: `AMP AD IDs - ${ampAd.id}`
							}
						});
					})
					.then(() => sendSuccessResponse({ msg: 'success' }, res))
					.catch(err => errorHandler(err, res));
			});
	});

module.exports = router;
