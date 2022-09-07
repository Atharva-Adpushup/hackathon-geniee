const express = require('express');
const _ = require('lodash');
const siteModel = require('../models/siteModel');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const {
	docKeys,
	AUDIT_LOGS_ACTIONS: { AP_TAGS }
} = require('../configs/commonConsts');
const AdPushupError = require('../helpers/routeHelpers');
const HTTP_STATUS = require('../configs/httpStatusConsts');

const {
	appBucket,
	errorHandler,
	verifyOwner,
	emitEventAndSendResponse,
	masterSave,
	modifyAd,
	sendDataToAuditLogService,
	udpateApConfigIfFlyingCarpetAdEnabledInApTagOrLayoutEditorAd
} = require('../helpers/routeHelpers');
const apTagService = require('../apiServices/apTagServices');

const router = express.Router();

const fn = {
	isSuperUser: false,
	directDBUpdate: (key, value, cas) => appBucket.updateDoc(key, value, cas),
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
						currentConfig = { ..._.cloneDeep(prevConfig), name: data.name };
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
						name: AP_TAGS.UPDATE_AP_TAGS,
						data: `AP Tag`
					}
				});
				return processing(docWithCas);
			})
			.then(() => emitEventAndSendResponse(req.body.siteId, res))
			.catch(err => errorHandler(err, res))
};

router
	.get('/fetchAds', (req, res) => {
		const { siteId } = req.query || {};
		const { email } = req.user || {};
		return verifyOwner(siteId, email)
			.then(() => apTagService.fetchAds(siteId))
			.then(ads => sendSuccessResponse({ ads }, res))
			.catch(err => errorHandler(err, res));
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
		const prevConfig = {};
		return verifyOwner(req.body.siteId, req.user.email)
			.then(() => apTagService.createAd(payload.ad, payload.siteId, payload.ownerEmail))
			.then(toReturn =>
				sendSuccessResponse(
					{
						message: 'Ad created',
						...toReturn
					},
					res
				)
			)
			.then(() => appBucket.getDoc(`${docKeys.apTag}${req.body.siteId}`))
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
						name: AP_TAGS.CREATE_AP_TAGS,
						data: 'Create AP Tag'
					}
				});
			})
			.catch(err => errorHandler(err, res));
	})
	.post('/masterSave', (req, res) =>
		masterSave(req, res, fn.adUpdateProcessing, fn.directDBUpdate, docKeys.apTag, 1).then(
			async masterSaveResponse => {
				const { siteId, dataForAuditLogs } = req.body;
				try {
					const updatedConfig = await udpateApConfigIfFlyingCarpetAdEnabledInApTagOrLayoutEditorAd(
						siteId
					);
					const site = await siteModel.getSiteById(siteId);
					const prevApConfig = site.get('apConfigs');
					// check if apConfig is udpated
					if (JSON.stringify(updatedConfig) !== '{}') {
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
							prevConfig: prevApConfig,
							currentConfig: site.get('apConfigs'),
							action: {
								name: AP_TAGS.UPDATE_AP_CONFIG,
								data: 'Ap Tag Master Save - Update ApConfig'
							}
						});
					}
					return masterSaveResponse;
				} catch (err) {
					let error = err;
					error = new AdPushupError({
						message: err.toString(),
						code: HTTP_STATUS.BAD_REQUEST
					});
					return errorHandler(error, res);
				}
			}
		)
	)
	.post('/modifyAd', (req, res) =>
		modifyAd(req, res, fn.adUpdateProcessing, fn.directDBUpdate, docKeys.apTag)
	);

module.exports = router;
