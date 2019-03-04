const express = require('express');
const crypto = require('crypto');
const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const utils = require('../helpers/utils');
const CC = require('../configs/commonConsts');
const httpStatus = require('../configs/httpStatusConsts');
const formValidator = require('../helpers/FormValidator');
const schema = require('../helpers/schema');
const config = require('../configs/config');

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
	})
	.get('/payment', (req, res) => {
		userModel
			.getUserByEmail(req.user.email)
			.then(user => {
				const tipaltiConfig = config.tipalti;

				let tipaltiUrl = '';

				const tipaltiBaseUrl = tipaltiConfig.baseUrl;

				const email = user.get('email');

				const payeeId = encodeURIComponent(
					crypto
						.createHash('md5')
						.update(email)
						.digest('hex')
						.substr(0, 64)
				);

				const payer = tipaltiConfig.payerName;

				const date = Math.floor(+new Date() / 1000);

				const paramsStr = `idap=${payeeId}&payer=${payer}&ts=${date}&email=${encodeURIComponent(
					email
				)}`;

				const key = tipaltiConfig.key;

				const hash = crypto
					.createHmac('sha256', key)
					.update(paramsStr.toString('utf-8'))
					.digest('hex');

				const paymentHistoryUrl = `${tipaltiConfig.paymentHistoryUrl + paramsStr}&hashkey=${hash}`;

				tipaltiUrl = `${tipaltiBaseUrl + paramsStr}&hashkey=${hash}`;
				res.send({
					tipaltiUrl,
					paymentHistoryUrl
				});
			})
			.catch(err => {
				res.render('payment', {
					error: 'Some error occurred!'
				});
			});
	})
	.post('/setSiteStep', (req, res) => {
		const { siteId, onboardingStage, step } = req.body;
		siteModel
			.setSiteStep(siteId, onboardingStage, step)
			.then(() => userModel.setSitePageGroups(req.user.email))
			.then(user => {
				user.save();
				return res.status(httpStatus.OK).send({ success: 'Update site step successfully!' });
			})
			.catch(() =>
				res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Something went wrong!' })
			);
	});

module.exports = router;
