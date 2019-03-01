const express = require('express');
const userModel = require('../models/userModel');
const utils = require('../helpers/utils');
const CC = require('../configs/commonConsts');
const httpStatus = require('../configs/httpStatusConsts');
const formValidator = require('../helpers/FormValidator');
const schema = require('../helpers/schema');

const router = express.Router();

router
	.get('/', (req, res) => {
		res.status(200).json({ email: 'sdjklf@kewrle.com' });
	})
	.post('/addSite', (req, res) => {
		const site = req.body.site ? utils.getSafeUrl(req.body.site) : req.body.site;

		formValidator
			.validate({ site }, schema.user.validations)
			.then(() => {
				userModel
					.addSite(req.user.email, site)
					.spread((user, siteId) => {
						const userSites = user.get('sites');
						for (const i in userSites) {
							if (userSites[i].siteId === siteId) {
								userSites[i].onboardingStage = 'onboarding';
								userSites[i].step = CC.onboarding.initialStep; // initial site step i.e. 1 now
								user.set('sites', userSites);
								user.save();

								const { siteId, domain, onboardingStage, step } = userSites[i];

								return res
									.status(httpStatus.OK)
									.json({ siteId, site: domain, onboardingStage, step });
							}
						}
						return res
							.status(httpStatus.INTERNAL_SERVER_ERROR)
							.json({ error: 'Error while Adding site' });
					})
					.catch(err => {
						console.log('Error while Adding site', err);
						if (err.message.status === 409) {
							return res.status(409).json({ error: err.message.message });
						}
						return res
							.status(httpStatus.INTERNAL_SERVER_ERROR)
							.json({ error: 'Error while Adding site' });
					});
			})
			.catch(err => res.status(httpStatus.BAD_REQUEST).json({ error: err.message[0].message }));
	});

module.exports = router;
