const express = require('express');
const Promise = require('bluebird');
const uuid = require('uuid');

const config = require('../configs/config');
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
	queuePublishingWrapper,
	storedRequestWrapper,
	getAmpAds,
	sendDataToAuditLogService
} = require('../helpers/routeHelpers');

const router = express.Router();

const fn = {
	isSuperUser: false,
	createNewDocAndDoProcessingWrapper: payload =>
		createNewAmpDocAndDoProcessing(payload, ampAdInitialDoc, docKeys.ampScript, fn.processing),
	processing: (data, payload) => {
		console.log(JSON.stringify(data, null, 3), 'data')
		console.log(JSON.stringify(payload, null, 3), 'payload')
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
		// value.ad = ad;

		ad.id = id;
		ad.name = name;
		ad.isAmpScriptAd = true;
		value.siteDomain = value.siteDomain || payload.siteDomain;
		value.siteId = value.siteId || payload.siteId;
		value.ownerEmail = value.ownerEmail || payload.ownerEmail;
		// value.dfpSyncingStatus = {
		// 	startedOn: null, // timestamp
		// 	completedOn: null, // timestamp
		// 	error: null // Error msg
		// };
		// value.storedRequestSyncedOn = null; // timestamp
console.log(value, 'value')
		if(!value.ads) {
			value.ads = [];
		}
		value.ads.push(ad);
		return Promise.resolve([cas, value, payload.siteId]);
	},
	getAndUpdate: (key, value) =>
		appBucket.getDoc(key).then(result => appBucket.updateDoc(key, value, result.cas)),
	directDBUpdate: (key, value, cas) => appBucket.updateDoc(key, value, cas),
	dbWrapper: (cas, value, siteId) => {
		console.log(cas, 'cas')
		const key = `${docKeys.ampScript}${siteId}`;
console.log(key, ',dbWrapper')
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
		fn.isSuperUser = req.user.isSuperUser;
		const payload = {
			ad: req.body.ad,
			siteId: req.body.siteId,
			ownerEmail: req.user.email,
			id: uuid.v4()
		};
		return verifyOwner(req.body.siteId, req.user.email)
			.then(() => appBucket.getDoc(`${docKeys.ampScript}${payload.siteId}`))
			.then(docWithCas => fn.processing(docWithCas, payload))
			.catch(err => {
				console.log(err, 'errrrrr');
				return err.name && err.name === 'CouchbaseError' && err.code === 13
					? fn.createNewDocAndDoProcessingWrapper(payload)
					: Promise.reject(err)
			})
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
console.log(req.body, 'req.body')
		return verifyOwner(siteId, req.user.email)
			.then(() => getAmpAds(siteId))
			.then(ads => ads.map(val => {
				// console.log(val, 'valllllll');
				return val;
			}))
			.then(amdAds => {
				// console.log(JSON.stringify(amdAds, null, 3), 'ampads');
				console.log(JSON.stringify(ads, null, 3), 'ads');
				const { email, originalEmail } = req.user;
				const { siteDomain, appName, type = 'app' } = dataForAuditLogs;

				const adIds = adsToUpdate.map(adId => adId).join(', ');
				// sendDataToAuditLogService({
				// 	siteId,
				// 	siteDomain,
				// 	appName,
				// 	type,
				// 	impersonateId: email,
				// 	userId: originalEmail,
				// 	prevConfig: amdAds,
				// 	currentConfig: ads,
				// 	action: {
				// 		name: AMP.UPDATE_AMP_ADS,
				// 		data: `AMP AD IDs - ${adIds}`
				// 	}
				// });
				console.log(adsToUpdate, 'adsToUpdate')
				const updatedAds = adsToUpdate.map(adId => updateAmpTags(adId, ads, siteId));
				return Promise.all(updatedAds)
					.then(modifiedAds => {
						const allAmpAds = ads.map(obj => modifiedAds.find(o => o.id === obj.id) || obj);
						console.log(JSON.stringify(allAmpAds, null, 3), 'allAmpAds')
						return queuePublishingWrapper(siteId, allAmpAds);
					})
					.then(ads => {
						const storeRequestArr = ads.map(doc => storedRequestWrapper(doc));

						return Promise.all(storeRequestArr);
					})
					.then(() => sendSuccessResponse({ msg: 'success' }, res))
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	})
	.post('/modifyAd', (req, res) => {
		const { adId, data, siteId } = req.body;
console.log('modifyAd')
		return updateAmpTags(adId, null, data)
			.then(() => sendSuccessResponse({ msg: 'success' }, res))
			.catch(err => console.log(err));
	});

module.exports = router;
