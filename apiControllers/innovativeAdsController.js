const express = require('express');
const Promise = require('bluebird');
const _ = require('lodash');
const uuid = require('uuid');

const HTTP_STATUS = require('../configs/httpStatusConsts');
const AdPushupError = require('../helpers/AdPushupError');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const { generateSectionName } = require('../helpers/clientServerHelpers');
const {
	docKeys,
	INNOVATIVE_ADS_INITIAL_DOC,
	DEFAULT_META,
	AUDIT_LOGS_ACTIONS: { INNOVATIVE_ADS }
} = require('../configs/commonConsts');
const {
	appBucket,
	errorHandler,
	verifyOwner,
	// sendDataToZapier,
	emitEventAndSendResponse,
	fetchAds,
	createNewDocAndDoProcessing,
	masterSave,
	modifyAd,
	sendDataToAuditLogService
} = require('../helpers/routeHelpers');

const router = express.Router();

const fn = {
	isSuperUser: false,
	createNewDocAndDoProcessingWrapper: payload =>
		createNewDocAndDoProcessing(
			payload,
			INNOVATIVE_ADS_INITIAL_DOC,
			docKeys.interactiveAds,
			fn.processing
		),
	processing: (data, payload) => {
		const cas = data.cas || false;
		const { pagegroups, formatData, width, height } = payload.ad;

		const value = data.value || data;
		let newAds = [];
		const logs = [];

		if (pagegroups.length) {
			newAds = _.map(pagegroups, pagegroup => {
				logs.push(`${formatData.platform}-${formatData.format}-${pagegroup}`);
				const id = uuid.v4();
				return {
					...payload.ad,
					id,
					name: generateSectionName({
						width,
						height,
						pagegroup: pagegroup.split(':')[1],
						platform: formatData.platform,
						id,
						service: 'I'
					}),
					createdOn: +new Date(),
					pagegroups: [pagegroup]
				};
			});
		} else if (formatData.format === 'interstitial') {
			const id = uuid.v4();

			newAds.push({
				...payload.ad,
				id,
				name: generateSectionName({
					width,
					height,
					platform: formatData.platform,
					id,
					service: 'I'
				}),
				createdOn: +new Date()
			});
		} else {
			throw new AdPushupError({
				message: 'No Pagegroups found in the ad',
				code: HTTP_STATUS.BAD_REQUEST
			});
		}

		value.ads = value.ads.concat(newAds);
		value.meta.pagegroups = value.meta.pagegroups.concat(logs);
		value.siteDomain = value.siteDomain || payload.siteDomain;
		value.siteId = value.siteId || payload.siteId;
		value.ownerEmail = value.ownerEmail || payload.ownerEmail;

		// if (config.environment.HOST_ENV === 'production' && !fn.isSuperUser) {
		// 	sendDataToZapier('URL HERE', {
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
	adUpdateProcessing: (req, res, key, processing) =>
		appBucket
			.getDoc(`${key}${req.body.siteId}`)
			.then(docWithCas => {
				const { siteId, dataForAuditLogs, data = {} } = req.body;
				const { email, originalEmail } = req.user;

				let prevConfig = docWithCas.value.ads;
				let currentConfig = req.body.ads;
				// if change is not done by Super User
				// i.e change is not made by using Master Save
				if (req.body.adId) {
					const origAd = docWithCas.value.ads.filter(ad => ad.id === req.body.adId);
					if (origAd.length) {
						// eslint-disable-next-line prefer-destructuring
						prevConfig = origAd[0];
						currentConfig = { ..._.cloneDeep(prevConfig), ...data };
					}
				}

				// log config changes
				const { siteDomain, appName, type = 'app' } = dataForAuditLogs;
				sendDataToAuditLogService({
					siteId,
					siteDomain,
					appName,
					type,
					impersonateId: email,
					userId: originalEmail,
					prevConfig,
					currentConfig,
					action: {
						name: INNOVATIVE_ADS.UPDATE_INNOVATIVE_ADS,
						data: `INNOVATIVE AD`
					}
				});
				return processing(docWithCas);
			})
			.then(() => emitEventAndSendResponse(req.body.siteId, res))
			.catch(err => {
				let error = err;
				if (err && err.code && err.code === 13) {
					error = new AdPushupError({
						message: 'No Doc Found',
						code: HTTP_STATUS.BAD_REQUEST
					});
				}
				return errorHandler(error, res);
			})
};

router
	.get('/fetchAds', (req, res) => fetchAds(req, res, docKeys.interactiveAds))
	.get('/fetchMeta', (req, res) => {
		if (!req.query || !req.query.siteId) {
			return sendErrorResponse(
				{
					message: 'Incomplete Parameters. Please check siteId'
				},
				res
			);
		}
		const { siteId } = req.query;
		return Promise.join(verifyOwner(siteId, req.user.email), site =>
			appBucket
				.getDoc(`${docKeys.interactiveAds}${siteId}`)
				.then(docWithCas => docWithCas.value.meta)
				.catch(err =>
					err.name && err.name === 'CouchbaseError' && err.code === 13
						? DEFAULT_META
						: Promise.reject(err)
				)
				.then(meta => {
					const channels = site.get('channels') || [];
					return sendSuccessResponse(
						{
							channels,
							meta
						},
						res
					);
				})
		).catch(err => errorHandler(err, res));
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
		const { siteId, dataForAuditLogs } = req.body;
		fn.isSuperUser = req.user.isSuperUser;
		const payload = {
			ad: req.body.ad,
			siteId: req.body.siteId,
			ownerEmail: req.user.email
		};
		let prevConfig = {};
		return verifyOwner(payload.siteId, req.user.email)
			.then(() => appBucket.getDoc(`${docKeys.interactiveAds}${req.body.siteId}`))
			.then(docWithCas => {
				const { formatData } = payload.ad;
				if (formatData.format === 'interstitial') {
					const interstitialAdsPlatform = docWithCas.value.ads
						.filter(ad => ad.formatData.format === 'interstitial')
						.map(ad => ad.formatData.platform);
					const { platform } = payload.ad.formatData;
					if (interstitialAdsPlatform.includes(platform)) {
						throw new Error(`Interstitial Ad is already running on ${platform}`);
					}
				}
				return docWithCas;
			})
			.then(docWithCas => {
				prevConfig = _.cloneDeep(docWithCas.value);
				return fn.processing(docWithCas, payload);
			})
			.catch(err =>
				err.name && err.name === 'CouchbaseError' && err.code === 13
					? fn.createNewDocAndDoProcessingWrapper(payload)
					: Promise.reject(err)
			)
			.spread(fn.dbWrapper)
			.then(data => emitEventAndSendResponse(req.body.siteId, res, data))
			.then(() => appBucket.getDoc(`${docKeys.interactiveAds}${req.body.siteId}`))
			.then(docWithCas => {
				const { email, originalEmail } = req.user;
				// log config changes
				const { siteDomain, appName, type = 'site' } = dataForAuditLogs;
				sendDataToAuditLogService({
					siteId,
					siteDomain,
					appName,
					type,
					impersonateId: email,
					userId: originalEmail,
					prevConfig,
					currentConfig: docWithCas.value,
					action: {
						name: INNOVATIVE_ADS.CREATE_INNOVATIVE_ADS,
						data: 'Create Innovative Ads'
					}
				});
			})
			.catch(err => errorHandler(err, res));
	})
	.post('/masterSave', (req, res) =>
		masterSave(req, res, fn.adUpdateProcessing, fn.directDBUpdate, docKeys.interactiveAds, 2)
	)
	.post('/modifyAd', (req, res) =>
		modifyAd(req, res, fn.adUpdateProcessing, fn.directDBUpdate, docKeys.interactiveAds)
	);

module.exports = router;
