const express = require('express');
const atob = require('atob');

const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const utils = require('../helpers/utils');
const CC = require('../configs/commonConsts');
const httpStatus = require('../configs/httpStatusConsts');
const pagegroupCreationAutomation = require('../services/pagegroupCreationAutomation');
const AdpushupError = require('../helpers/AdPushupError');
const { checkParams, errorHandler, verifyOwner } = require('../helpers/routeHelpers');
const { sendSuccessResponse } = require('../helpers/commonFunctions');
const upload = require('../helpers/uploadToCDN');

const router = express.Router();

router
	.post('/saveSite', (req, res) => {
		// {siteId, site, onboardingStage, step}
		const data = req.body;

		const siteId = parseInt(req.body.siteId, 10);
		let siteObj;

		userModel
			.verifySiteOwner(req.user.email, siteId)
			.catch(err => {
				throw AdpushupError({ message: 'Site not found!', status: httpStatus.NOT_FOUND });
			})
			.then(() => {
				const audienceId = utils.getRandomNumber();
				const siteData = {
					siteDomain: data.site,
					siteId,
					ownerEmail: req.user.email,
					onboardingStage: data.onboardingStage,
					step: parseInt(data.step),
					ads: [],
					channels: [],
					templates: [],
					apConfigs: {
						mode: CC.site.mode.DRAFT,
						isAdPushupControlWithPartnerSSP: CC.apConfigDefaults.isAdPushupControlWithPartnerSSP,
						autoOptimise: false
					}
				};
				return siteModel.saveSiteData(siteId, 'POST', siteData);
			})
			.then(site => {
				siteObj = site;
				return userModel.setSitePageGroups(req.user.email);
			})
			.then(user =>
				pagegroupCreationAutomation({
					siteId: siteObj.data.siteId,
					url: siteObj.data.siteDomain,
					userEmail: req.user.email
				})
			)
			.then(() => siteModel.getSiteById(siteId))
			.then(site => res.status(httpStatus.OK).json(site.data))
			.catch(err => {
				if (err instanceof AdpushupError)
					return res.status(err.message.status).json({ error: err.message.message });
				return res
					.status(httpStatus.INTERNAL_SERVER_ERROR)
					.json({ error: 'Something went wrong!' });
			});
	})
	.post('/sendCode', (req, res) => {
		// developerEmail, subject, emailBody
		const json = {
			email: req.body.developerEmail,
			subject: req.body.subject,
			body: utils.atob(req.body.emailBody)
		};

		return userModel
			.sendCodeToDev(json)
			.then(() => res.status(httpStatus.OK).send({ success: 'Email sent successfully' }))
			.catch(e => {
				if (Array.isArray(e.message))
					return res.status(httpStatus.BAD_REQUEST).send({ error: e.message[0].message });
				return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: e.message });
			});
	})
	.post('/createBackupAd', (req, res) => {
		const { siteId, content, format } = req.body;
		const randomId = utils.randomString();

		function cwd(ftp) {
			const path = `/${siteId}/ads/`;
			return ftp.cwd(path).catch(() => ftp.mkdir(path).then(() => ftp.cwd(path)));
		}

		return checkParams(['siteId', 'content'], req, 'post')
			.then(() => verifyOwner(siteId, req.user.email))
			.then(() => {
				const decodedContent = atob(content);
				return upload(cwd, {
					content: decodedContent,
					filename: `${randomId}.${format}`
				});
			})
			.then(() => {
				sendSuccessResponse(
					{
						message: 'Operation Successful',
						url: `https://cdn.adpushup.com/${siteId}/ads/${randomId}.${format}`
					},
					res
				);
			})
			.catch(err => errorHandler(err, res, httpStatus.INTERNAL_SERVER_ERROR));
	});

module.exports = router;
