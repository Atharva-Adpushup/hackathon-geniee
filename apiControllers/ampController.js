const express = require('express');
const Promise = require('bluebird');
const uuid = require('uuid');

const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const {
	docKeys,
	ampAdInitialDoc,
	AUDIT_LOGS_ACTIONS: { AMP }
} = require('../configs/commonConsts');
const { generateSectionName } = require('../helpers/clientServerHelpers');
const {
	appBucket,
	errorHandler,
	verifyOwner,
	fetchAmpAds,
	createNewAmpDocAndDoProcessing,
	updateAmpTags,
	getAmpAds,
	sendDataToAuditLogService
} = require('../helpers/routeHelpers');

const router = express.Router();

const fn = {
	isSuperUser: false,
	createNewDocAndDoProcessingWrapper: payload =>
		createNewAmpDocAndDoProcessing(payload, ampAdInitialDoc, docKeys.ampScript, fn.processing),
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
		const key = `${docKeys.ampScript}${siteId}`;
		function dbOperation() {
			return !cas ? fn.getAndUpdate(key, value) : fn.directDBUpdate(key, value, cas);
		}

		return dbOperation().then(() => value);
	}
};

router
	.get('/fetchAds', (req, res) => fetchAmpAds(req, res, docKeys.ampScript))
	.post('/createAd', (req, res) => {
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
						doc: { ...value },
						newId: payload.id
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
			.then(ads => ads.map(val => val))
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
				const updatedAds = adsToUpdate.map(adId => updateAmpTags(adId, ads, siteId));
				return Promise.all(updatedAds)
					.then(() => verifyOwner(siteId, email))
					.then(site => site.save())
					.then(() => sendSuccessResponse({ msg: 'success' }, res))
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	})
	.post('/modifyAd', (req, res) => {
		const { adId, data } = req.body;
		return updateAmpTags(adId, null, data)
			.then(() => sendSuccessResponse({ msg: 'success' }, res))
			.catch(err => console.log(err));
	});

module.exports = router;
