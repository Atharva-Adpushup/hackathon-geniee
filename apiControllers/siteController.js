const express = require('express');
const Promise = require('bluebird');
const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
const woodlotCustomLogger = require('woodlot').customLogger;
const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const schema = require('../helpers/schema');
const CC = require('../configs/commonConsts');
const HTTP_STATUS = require('../configs/httpStatusConsts');
const FormValidator = require('../helpers/FormValidator');
const AdPushupError = require('../helpers/AdPushupError');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const {
	verifyOwner,
	fetchStatusesFromReporting,
	fetchCustomStatuses,
	errorHandler,
	checkParams
} = require('../helpers/routeHelpers');
const proxy = require('../helpers/proxy');

const router = express.Router();

// Initialise woodlot module for geniee api custom logging
// const woodlot = new woodlotCustomLogger({
// 	streams: ['./logs/geniee-api-custom.log'],
// 	stdout: false
// });

router
	.get('/live', (req, res) => {
		const { email } = req.user;
		const { siteId } = req.query;
		const DEFAULT_RESPONSE = {
			gam: {
				status: false,
				isOptional: false
			},
			adsTxt: {
				status: 4, // 1: All Good | 2: Not Found | 3: Some are missing | 4: Ads Txt not present
				isOptional: true
			},
			adsense: {
				status: false,
				isOptional: true
			},
			apHeadCode: {
				status: false,
				isOptional: false
			},
			pagegroupRegex: {
				status: false,
				isOptional: true
			}
		};
		const response = _.cloneDeep(DEFAULT_RESPONSE);

		function adsTxtProcessing(domain) {
			return proxy
				.fetchOurAdsTxt()
				.then(ourAdsTxt => proxy.verifyAdsTxt(domain, ourAdsTxt))
				.then(() => 1)
				.catch(err => {
					if (err instanceof AdPushupError) {
						const {
							message: { httpCode = 404 }
						} = err;
						let output = null;
						switch (httpCode) {
							case 204:
								output = 2;
								break;
							case 206:
								output = 3;
								break;
							default:
							case 404:
								output = 4;
								break;
						}
						return Promise.resolve(output);
					}
					return Promise.reject(err);
				});
		}

		function pagegroupProcessing(site) {
			const { pageGroupPattern = null } = site.get('apConfigs') || {};
			if (!pageGroupPattern) return Promise.resolve(false);

			let output = true;

			_.forEach(pageGroupPattern, pagegroups => {
				const regexInvalid = pagegroups.some(pg => !pg.pattern);

				if (regexInvalid) {
					output = false;
					return false;
				}
				return true;
			});

			return Promise.resolve(output);
		}

		function apDetection(site) {
			const url = site.get('siteDomain');

			return proxy.detectCustomAp(url, siteId);
		}

		return checkParams(['siteId'], req, 'get')
			.then(() => verifyOwner(siteId, email))
			.then(site => {
				const domain = site.get('siteDomain');
				return Promise.join(
					userModel.getUserByEmail(email),
					pagegroupProcessing(site),
					adsTxtProcessing(domain),
					apDetection(site),
					(user, pagegroupRegex, adsTxtStatus, apHeadCodeStatus) => {
						const { dfp: { activeDFPNetwork = false } = {} } = user.get('adServerSettings');
						const adNetworkSettings = user.get('adNetworkSettings') || [];
						const { pubId = false } = adNetworkSettings.length ? adNetworkSettings[0] : {};

						if (activeDFPNetwork) response.gam.status = true;
						if (pubId) response.adsense.status = true;

						response.pagegroupRegex.status = pagegroupRegex;
						response.adsTxt.status = adsTxtStatus;
						response.apHeadCode.status = apHeadCodeStatus;
					}
				);
			})
			.then(() =>
				sendSuccessResponse(
					{
						...response
					},
					res
				)
			)
			.catch(err => {
				console.log(err);
				return sendErrorResponse(DEFAULT_RESPONSE, res);
			});
	})
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

		json.ownerEmail = partnerEmail;
		json.apConfigs = {
			mode: CC.site.mode.DRAFT,
			isAdPushupControlWithPartnerSSP: CC.apConfigDefaults.isAdPushupControlWithPartnerSSP
		};
		json.apps = {};

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
				}

				const error = err.message[0];
				return res.status(error.status).send({ error: error.message });
			});
	})
	.get('/onboarding', (req, res) => {
		const siteId = parseInt(req.query.siteId, 10);
		const { email } = req.user;

		if (!siteId) {
			return userModel.getUserByEmail(email).then(user => {
				const { sites } = user.data;
				if (sites[0].onboardingStage === 'preOnboarding' && sites.length === 1) {
					return res.status(HTTP_STATUS.OK).json({
						isOnboarding: true,
						onboardingStage: sites[0].onboardingStage,
						siteId: sites[0].siteId,
						site: sites[0].domain
					});
				}

				return res.status(HTTP_STATUS.OK).json({ isOnboarding: false });
			});
		}

		return userModel
			.verifySiteOwner(email, siteId)
			.then(({ site }) => {
				const { domain, onboardingStage, step } = site;
				return res.status(HTTP_STATUS.OK).json({
					isOnboarding: onboardingStage === 'preOnboarding',
					siteId,
					site: domain,
					onboardingStage,
					step
				});
			})
			.catch(() => res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Site not found!' }));
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
				HTTP_STATUS.BAD_REQUEST
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
				return sendErrorResponse(err, res);
			});
	})
	.get('/getAppStatuses', (req, res) => {
		const { email } = req.user;
		const { siteId } = req.body;

		if (!siteId) return sendErrorResponse({ message: 'Missing Params' }, res);

		return verifyOwner(siteId, email)
			.then(site => {
				const apps = site.get('apps') || {};
				return sendSuccessResponse({ apps }, res);
			})
			.catch(err => {
				console.log(err);
				return sendErrorResponse(err, res);
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
				return site.save();
			})
			.then(() => sendSuccessResponse({ success: 1 }, res))
			.catch(err => {
				console.log(err);
				return sendErrorResponse(err, res);
			});
	})
	.post('/saveSettings', (req, res) => {
		const { email } = req.user;
		const { siteId, apConfigs, adNetworkSettings } = req.body;

		return verifyOwner(siteId, email)
			.then(site => {
				const siteApConfigs = { ...site.get('apConfigs'), ...apConfigs };
				const siteAdNetworkSettings = { ...site.get('adNetworkSettings'), ...adNetworkSettings };

				site.set('apConfigs', siteApConfigs);
				site.set('adNetworkSettings', siteAdNetworkSettings);
				return site.save();
			})
			.then(() => sendSuccessResponse({ success: 1 }, res))
			.catch(err => {
				console.log(err);
				return sendErrorResponse(err, res);
			});
	})
	.post('/updateSite', (req, res) => {
		const { siteId, toUpdate } = req.body;
		const toSend = [];
		return checkParams(['siteId', 'toUpdate'], req, 'post')
			.then(() => verifyOwner(siteId, req.user.email))
			.then(site => {
				toUpdate.forEach(content => {
					const { key, value, replace = false, requireResponse = true } = content;
					let data = site.get(key);
					if (typeof data === 'object' && !Array.isArray(data) && !replace) {
						data = {
							...data,
							...value
						};
					} else {
						data = value;
					}
					site.set(key, data);
					if (requireResponse) toSend.push({ key, value: data });
				});
				return site.save();
			})
			.then(() =>
				sendSuccessResponse(
					{
						message: 'Site Updated',
						toUpdate: toSend
					},
					res
				)
			)
			.catch(err => errorHandler(err, res, HTTP_STATUS.INTERNAL_SERVER_ERROR));
	})
	.post('/deleteSite', (req, res) => {
		const { siteId } = req.body;
		const { email } = req.user;
		return checkParams(['siteId'], req, 'post')
			.then(() => userModel.verifySiteOwner(email, siteId))
			.then(({ user }) => {
				if (!user) return Promise.reject(new Error('No user found. Invalid request'));

				let sites = user.get('sites');
				if (sites && sites.length) {
					sites = sites.filter(site => site.siteId !== siteId);
					user.set('sites', sites);
					return user.save();
				}
				return true;
			})
			.then(() => siteModel.deleteSite(siteId))
			.then(() =>
				sendSuccessResponse(
					{
						message: 'Site deleted successfully'
					},
					res
				)
			)
			.catch(err => errorHandler(err, res));
	});

module.exports = router;
