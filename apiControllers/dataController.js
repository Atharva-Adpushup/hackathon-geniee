const express = require('express');
const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const utils = require('../helpers/utils');
const CC = require('../configs/commonConsts');
const httpStatus = require('../configs/httpStatusConsts');

const router = express.Router();

router.post('/saveSite', (req, res) => {
	// {siteId, site, onboardingStage, step}
	const data = req.body;

	const siteId = parseInt(req.body.siteId, 10);
	userModel
		.verifySiteOwner(req.user.email, siteId)
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
			return siteData;
		})
		.then(siteModel.saveSiteData.bind(null, siteId, 'POST'))
		.then(site =>
			userModel
				.setSitePageGroups(req.user.email)
				.then(user => {
					res.status(httpStatus.OK).json({
						siteId,
						site: data.site,
						onboardingStage: site.data.onboardingStage,
						step: site.data.step
					});
				})
				.catch(() => {
					res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'server error' });
				})
		)
		.catch(err => {
			res.status(httpStatus.NOT_FOUND).json({ error: 'site not found!' });
		});
});

module.exports = router;
