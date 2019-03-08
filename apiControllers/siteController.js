const express = require('express');
const Promise = require('bluebird');

const router = express.Router();
const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const schema = require('../helpers/schema');
const CC = require('../configs/commonConsts');
const FormValidator = require('../helpers/FormValidator');
const woodlotCustomLogger = require('woodlot').customLogger;
const httpStatus = require('../configs/httpStatusConsts');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const {
	verifyOwner,
	fetchStatusesFromReporting,
	fetchCustomStatuses
} = require('../helpers/routeHelpers');

// Initialise woodlot module for geniee api custom logging
// const woodlot = new woodlotCustomLogger({
// 	streams: ['./logs/geniee-api-custom.log'],
// 	stdout: false
// });

router
	.post('/create', (req, res) => {
		// siteDomain
		const json = req.body;

		const adsensePublisherId = json.publisherId || null;

		// Set partner to geniee
		if (req.isGenieeSite) {
			json.partner = 'geniee';
			json.isManual = false;
		}
		const partnerEmail = `${json.partner}@adpushup.com`;

		let siteId;
		json.ownerEmail = partnerEmail;
		json.apConfigs = {
			mode: CC.site.mode.DRAFT,
			isAdPushupControlWithPartnerSSP: CC.apConfigDefaults.isAdPushupControlWithPartnerSSP
		};

		if (adsensePublisherId) {
			json.adsensePublisherId = adsensePublisherId;
			delete json.publisherId;
		}

		// Function to create partner user account and site
		function createPartnerAndSite() {
			return userModel
				.createNewUser({
					email: partnerEmail,
					firstName: json.partner,
					password: `${json.partner}adpushup`,
					site: json.siteDomain,
					userType: 'partner'
				})
				.then(firstSite => {
					json.siteId = firstSite.siteId;
					return siteModel.saveSiteData(firstSite.siteId, 'POST', json);
				})
				.then(site => res.status(200).send({ success: true, data: { siteId: site.data.siteId } }));
		}

		// Validate input params and create site
		return FormValidator.validate(json, schema.api.validations)
			.then(() => userModel.getUserByEmail(partnerEmail).then(user => user))
			.then(user => siteModel.createSite(json).then(site => ({ site, user })))
			.then(data => {
				if (data.user.data) {
					data.user
						.get('sites')
						.push({ siteId: data.site.data.siteId, domain: data.site.data.siteDomain });
					data.user.save();
				}
				return res.status(200).send({
					siteId: data.site.data.siteId,
					domain: data.site.data.domain,
					step: data.site.data.step
				});
			})
			.catch(err => {
				// woodlot.err({
				// 	debugData: JSON.stringify(err),
				// 	url: req.url,
				// 	method: req.method,
				// 	name: 'GenieeAPI'
				// });

				if (err.name !== 'AdPushupError') {
					if (err.code === 13) {
						// If partner is not present then create partner account and site
						createPartnerAndSite();
					} else {
						return res.status(500).send({ error: 'Some error occurred' });
					}
				} else {
					const error = err.message[0];
					return res.status(error.status).send({ error: error.message });
				}
			});
	})
	.get('/onboarding', (req, res) => {
		const siteId = parseInt(req.query.siteId, 10);
		const { email } = req.user;

		if (!siteId) {
			return userModel.getUserByEmail(email).then(user => {
				const { sites } = user.data;
				if (sites[0].onboardingStage === 'preOnboarding' && sites.length === 1) {
					return res.status(httpStatus.OK).json({
						isOnboarding: true,
						onboardingStage: sites[0].onboardingStage,
						siteId: sites[0].siteId,
						site: sites[0].domain
					});
				}

				return res.status(httpStatus.OK).json({ isOnboarding: false });
			});
		}

		return userModel
			.verifySiteOwner(email, siteId)
			.then(({ user, site }) => {
				const { domain, onboardingStage, step } = site;
				return res.status(httpStatus.OK).json({
					isOnboarding: onboardingStage === 'preOnboarding',
					siteId,
					site: domain,
					onboardingStage,
					step
				});
			})
			.catch(err => res.status(httpStatus.NOT_FOUND).json({ error: 'Site not found!' }));
	})

	.get('/fetchAppStatuses', (req, res) => {
		const { siteId } = req.query;
		const { email } = req.user;

		if (!siteId) {
			return sendErrorResponse(
				{
					message: 'Incomplete params. Site Id is necessary'
				},
				res,
				httpStatus.BAD_REQUEST
			);
		}
		/*
			Flow:
			1. Fetch and Verify Site
			2. Fetch App Statuses
				- Call to Reporting API
					- Layout, AdRecover, Innovative Ads, AP Tag, Header Bidding
				- Fetch Channels
					- Mediation: Auto Optimise in Channels
					- AMP: IsEnabled in Channels
				- Manage Ads.txt: Check Redirect
			3. Prepare final JSON for client
		*/

		return verifyOwner(siteId, email)
			.then(site =>
				Promise.join(
					fetchStatusesFromReporting(site),
					fetchCustomStatuses(site),
					(statusesFromReporting, customStatuses) =>
						sendSuccessResponse(
							{
								...site.data,
								appStatuses: {
									...statusesFromReporting,
									...customStatuses
								}
							},
							res
						)
				)
			)
			.catch(err => {
				console.log(err);
				sendErrorResponse(err, res);
			});
	})
	.post('/saveApConfigs', (req, res) => {
		const { email } = req.user;
		const { siteId, apConfigs } = req.body;

		return verifyOwner(siteId, email)
			.then(site => {
				const siteApConfigs = { ...site.get('apConfigs') };

				Object.keys(apConfigs).forEach(propertyKey => {
					const propertyValue = apConfigs[propertyKey];
					siteApConfigs[propertyKey] = propertyValue;
				});

				site.set('apConfigs', { ...siteApConfigs });
				return site.save().then(() => sendSuccessResponse({ success: 1 }, res));
			})
			.catch(err => {
				console.log(err);
				sendErrorResponse(err, res);
			});
	});

module.exports = router;
