const express = require('express');
const Promise = require('bluebird');
const _ = require('lodash');
const uuid = require('uuid');

const HTTP_STATUS = require('../configs/httpStatusConsts');
const AdPushupError = require('../helpers/AdPushupError');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const { docKeys, INNOVATIVE_ADS_INITIAL_DOC, DEFAULT_META } = require('../configs/commonConsts');
const {
	appBucket,
	errorHandler,
	verifyOwner,
	// sendDataToZapier,
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
		createNewDocAndDoProcessing(
			payload,
			INNOVATIVE_ADS_INITIAL_DOC,
			docKeys.interactiveAds,
			fn.processing
		),
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
			.then(docWithCas => processing(docWithCas))
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
		fn.isSuperUser = req.user.isSuperUser;
		const payload = {
			ad: req.body.ad,
			siteId: req.body.siteId,
			ownerEmail: req.user.email
		};
		return verifyOwner(payload.siteId, req.user.email)
			.then(() => appBucket.getDoc(`${docKeys.interactiveAds}${req.body.siteId}`))
			.then(docWithCas => fn.processing(docWithCas, payload))
			.catch(err =>
				err.name && err.name === 'CouchbaseError' && err.code === 13
					? fn.createNewDocAndDoProcessingWrapper(payload)
					: Promise.reject(err)
			)
			.spread(fn.dbWrapper)
			.then(data => emitEventAndSendResponse(req.body.siteId, res, data))
			.catch(err => errorHandler(err, res));
	})
	.post('/masterSave', (req, res) =>
		masterSave(req, res, fn.adUpdateProcessing, fn.directDBUpdate, docKeys.interactiveAds, 2)
	)
	.post('/modifyAd', (req, res) =>
		modifyAd(req, res, fn.adUpdateProcessing, fn.directDBUpdate, docKeys.interactiveAds)
	);

module.exports = router;
