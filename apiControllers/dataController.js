const express = require('express');
const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const utils = require('../helpers/utils');
const CC = require('../configs/commonConsts');
const httpStatus = require('../configs/httpStatusConsts');
const pagegroupCreationAutomation = require('../services/pagegroupCreationAutomation');
const AdpushupError = require('../helpers/AdPushupError');

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
						isAdPushupControlWithPartnerSSP: CC.apConfigDefaults.isAdPushupControlWithPartnerSSP
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
	});

module.exports = router;
