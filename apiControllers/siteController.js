const express = require('express');
const Promise = require('bluebird');
const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
// const woodlotCustomLogger = require('woodlot').customLogger;
const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const channelModel = require('../models/channelModel');
const headerBiddingModel = require('../models/headerBiddingModel');
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
	checkParams,
	appBucket,
	emitEventAndSendResponse,
	publishAdPushupBuild,
	sendDataToAuditLogService
} = require('../helpers/routeHelpers');
const proxy = require('../helpers/proxy');
const pageGroupController = require('./pageGroupController');

const {
	AUDIT_LOGS_ACTIONS: { OPS_PANEL }
} = CC;

const router = express.Router();

// Initialise woodlot module for geniee api custom logging
// const woodlot = new woodlotCustomLogger({
// 	streams: ['./logs/geniee-api-custom.log'],
// 	stdout: false
// });

const helpers = {
	adUpdateProcessing: (req, res, key, processing) =>
		appBucket
			.getDoc(`${key}${req.params.siteId}`)
			.then(docWithCas => processing(docWithCas))
			.then(() => emitEventAndSendResponse(req.body.siteId || req.params.siteId, res))
			.catch(err => {
				let error = err;
				if (err && err.code && err.code === 13) {
					error = new AdPushupError({
						message: 'No Doc Found',
						code: HTTP_STATUS.BAD_REQUEST
					});
				}
				return errorHandler(error, res);
			}),
	directDBUpdate: (key, value, cas) => appBucket.updateDoc(key, value, cas)
};

router
	.get('/status', (req, res) => {
		const { email } = req.user;
		const { siteId } = req.query;
		const {
			liveAdsTxtEntryStatus: { partialPresent, allPresent, noAdsTxt }
		} = CC;

		const DEFAULT_RESPONSE = {
			gam: {
				status: false,
				isOptional: false,
				displayText: 'Google Ad Manager',
				key: 'gamStatus'
			},
			adsTxt: {
				status: noAdsTxt, // 1: All Good | 2: Not Found | 3: Some are missing | 4: Ads Txt not present
				isOptional: true,
				displayText: 'AdsTxt',
				key: 'adsTxtStatus'
			},
			adsense: {
				status: false,
				isOptional: true,
				displayText: 'Adsense Publisher Id',
				key: 'adsenseStatus'
			},
			apHeadCode: {
				status: false,
				isOptional: false,
				displayText: 'AdPushup Head Code',
				key: 'apStatus'
			},
			pagegroupRegex: {
				status: false,
				isOptional: true,
				displayText: 'Pagegroups Regexes',
				key: 'pagegroupRegexStatus'
			}
		};
		const response = _.cloneDeep(DEFAULT_RESPONSE);

		function adsTxtProcessing(domain) {
			const getAdsTxtData = [
				proxy.fetchOurAdsTxt(),
				proxy.getMandatoryAdsTxtEntryBySite(req.query.siteId)
			];

			return Promise.all(getAdsTxtData)
				.then(([ourAdsTxt, mandatoryAdsTxtEntry]) =>
					proxy.verifyAdsTxt(domain, ourAdsTxt, mandatoryAdsTxtEntry)
				)
				.then(() => ({
					status: allPresent,
					message: 'All fine'
				}))
				.catch(err => {
					if (err instanceof AdPushupError) {
						let output = null;

						if (err.message.httpCode === 400) {
							const {
								message: { error: errors }
							} = err;
							let mandatoryEntryMessage = null;
							let commonEntryMessage = null;

							for (let index = 0; index < errors.length; index += 1) {
								const { code, type } = errors[index];

								if (type === 'ourAdsTxt') {
									// code = 204 || 206
									commonEntryMessage = code === 204 ? 'Our Ads.txt entries' : 'Some entries';
								} else {
									mandatoryEntryMessage = 'Mandatory Entry';
								}
							}

							const message =
								mandatoryEntryMessage && commonEntryMessage
									? `${mandatoryEntryMessage} and ${commonEntryMessage} not found in publisher's ads.txt`
									: `${commonEntryMessage ||
											mandatoryEntryMessage} not found in publisher's ads.txt`;

							output = { message, status: partialPresent };
						} else {
							output = {
								status: noAdsTxt,
								message: "Publisher's ads.txt not found"
							};
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
					(user, pagegroupRegex, adsTxtInfo, apHeadCodeStatus) => {
						const { dfp: { activeDFPNetwork = false } = {} } = user.get('adServerSettings');
						const adNetworkSettings = user.get('adNetworkSettings') || [];
						const { pubId = false } = adNetworkSettings.length ? adNetworkSettings[0] : {};

						if (activeDFPNetwork) response.gam.status = true;
						if (pubId) response.adsense.status = true;

						response.pagegroupRegex.status = pagegroupRegex;
						response.adsTxt = { ...response.adsTxt, ...adsTxtInfo };
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
			.catch(() => sendErrorResponse(DEFAULT_RESPONSE, res));
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
			.catch(err => sendErrorResponse(err, res));
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
			.catch(err => sendErrorResponse(err, res));
	})
	.post('/saveApConfigs', (req, res) => {
		const { email, originalEmail } = req.user;
		const { siteId, apConfigs, dataForAuditLogs } = req.body;

		return verifyOwner(siteId, email)
			.then(site => {
				const prevConfig = site.get('apConfigs');
				const siteApConfigs = { ...prevConfig };

				Object.keys(apConfigs).forEach(propertyKey => {
					const propertyValue = apConfigs[propertyKey];
					siteApConfigs[propertyKey] = propertyValue;
				});

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
					currentConfig: siteApConfigs,
					action: {
						name: OPS_PANEL.SITES_SETTING,
						data: `Sites Setting - Save Ap Configs`
					}
				});

				site.set('apConfigs', { ...siteApConfigs });
				return site.save();
			})
			.then(() => sendSuccessResponse({ success: 1 }, res))
			.catch(err => sendErrorResponse(err, res));
	})
	.post('/saveSettings', (req, res) => {
		const { email, originalEmail } = req.user;
		const { siteId, apConfigs, adNetworkSettings, dataForAuditLogs } = req.body;
		const { isWeeklyEmailReportsEnabled = false } = apConfigs;
		if (isWeeklyEmailReportsEnabled) {
			apConfigs.weeklyEmailEnableTimeStamp = new Date().toDateString();
		}
		return verifyOwner(siteId, email)
			.then(site => {
				const prevApConfigs = site.get('apConfigs');
				const prevAdNetworkSettings = site.get('adNetworkSettings');
				const siteApConfigs = { ...prevApConfigs, ...apConfigs };
				const siteAdNetworkSettings = { ...prevAdNetworkSettings, ...adNetworkSettings };

				// log config changes
				const { siteDomain, appName, type = 'site', actionInfo = '' } = dataForAuditLogs;
				sendDataToAuditLogService({
					siteId,
					siteDomain,
					appName,
					type,
					impersonateId: email,
					userId: originalEmail,
					prevConfig: {
						siteApConfigs: prevApConfigs,
						siteAdNetworkSettings: prevAdNetworkSettings
					},
					currentConfig: {
						siteApConfigs,
						siteAdNetworkSettings
					},
					action: {
						name: OPS_PANEL.SITES_SETTING,
						data: actionInfo ? `Sites Setting - ${actionInfo}` : 'Sites Setting'
					}
				});

				site.set('apConfigs', siteApConfigs);
				site.set('adNetworkSettings', siteAdNetworkSettings);
				return site.save();
			})
			.then(() => sendSuccessResponse({ success: 1 }, res))
			.catch(err => sendErrorResponse(err, res));
	})
	.post('/updateSite', (req, res) => {
		const { email, originalEmail } = req.user;
		const { siteId, toUpdate, dataForAuditLogs } = req.body;
		const toSend = [];
		return checkParams(['siteId', 'toUpdate'], req, 'post')
			.then(() => verifyOwner(siteId, req.user.email))
			.then(site => {
				const prevConfig = [];
				const currentConfig = [];
				toUpdate.forEach(content => {
					const { key, value, replace = false, requireResponse = true } = content;
					let data = site.get(key);
					// for logging
					prevConfig.push({
						key: data
					});

					if (typeof data === 'object' && !Array.isArray(data) && !replace) {
						data = {
							...data,
							...value
						};
					} else {
						data = value;
					}

					// for logging
					currentConfig.push({
						key: data
					});

					site.set(key, data);
					if (requireResponse) toSend.push({ key, value: data });
				});

				// log config changes
				const { siteDomain, appName, type = 'site', actionInfo = '' } = dataForAuditLogs;
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
						name: OPS_PANEL.SITES_SETTING,
						data: actionInfo ? `Sites Setting - ${actionInfo}` : 'Sites Setting'
					}
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
	})
	.get('/:siteId/ampSettingsData', (req, res) =>
		siteModel
			.getSiteById(req.params.siteId)
			.then(site => {
				const ampSettings = site.get('ampSettings') || {};

				return channelModel.getAmpSettings(req.params.siteId).then(channels =>
					res.send({
						siteId: req.params.siteId,
						channels,
						ampSettings,
						siteDomain: site.get('siteDomain')
					})
				);
			})
			.catch(() =>
				res.send({
					error: true,
					message: 'Some Error Occured'
				})
			)
	)

	.post('/siteLevelBeforeJs/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email, originalEmail } = req.user;
		const { beforeJs, dataForAuditLogs } = req.body;
		return userModel
			.verifySiteOwner(email, siteId)

			.then(() => siteModel.getSiteById(siteId))
			.then(site => {
				const prevConfig = site.get('apConfigs');
				const apConfig = { ...prevConfig, ...{ beforeJs } };
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
					currentConfig: apConfig,
					action: {
						name: OPS_PANEL.SITES_SETTING,
						data: `Sites Setting - Custom Script`
					}
				});

				site.set('apConfigs', apConfig);
				return site.save();
			})

			.then(siteData => {
				const {
					data: { apConfigs = {} }
				} = siteData;

				return sendSuccessResponse({ message: 'Settings saved successfully', apConfigs }, res);
			})
			.catch(() => sendErrorResponse({ message: 'Unable to save settings' }));
	})

	.post('/:siteId/saveAmpSettings', (req, res) => {
		const response = {
			error: true,
			message: 'Operaiton Failed'
		};
		return siteModel
			.getSiteById(req.params.siteId)
			.then(site => {
				if (!site) {
					return res.send(response);
				}
				site.set('ampSettings', req.body);
				return site.save();
			})
			.then(site => {
				res.send(site);
			})
			.catch(() =>
				res.send({
					error: true,
					message: 'Some Error Occured'
				})
			);
	})
	.get('/:siteId/inventories', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => headerBiddingModel.getInventoriesForHB(siteId))
			.then(inventories => sendSuccessResponse(inventories, res))
			.catch(err => {
				if (err instanceof AdPushupError)
					return res.status(HTTP_STATUS.NOT_FOUND).json({ error: err.message });

				return res
					.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
					.json({ error: 'Something went wrong' });
			});
	})
	.post('/:siteId/sizeMapping', (req, res) => {
		const { data, dataForAuditLogs } = req.body;
		const { email, originalEmail } = req.user;
		const { siteId } = req.params;
		// log config changes
		const { siteDomain, appName } = dataForAuditLogs;

		const { type } = data;

		const validateSizeMapping = sizeMapping => {
			if (!Array.isArray(sizeMapping)) {
				return false;
			}

			const viewportWidthMap = {};

			for (let i = 0; i < sizeMapping.length; i += 1) {
				const { viewportWidth, maxHeight, maxWidth } = sizeMapping[i];

				const isValidMaxWidth = typeof maxWidth === 'number' && maxWidth >= 0;
				const isValidMaxHeight = typeof maxHeight === 'number' && maxHeight >= 0;
				const isValidViewportWidth = typeof viewportWidth === 'number' && viewportWidth >= 0;

				const hasValidValues = isValidMaxWidth && isValidMaxHeight && isValidViewportWidth;
				const isUniqueViewportWidth = !viewportWidthMap[viewportWidth];

				if (!hasValidValues || !isUniqueViewportWidth) {
					return false;
				}

				viewportWidthMap[viewportWidth] = true;
			}

			return true;
		};

		const getSortedSizeMapping = sizeMapping =>
			sizeMapping.sort((a, b) => parseInt(a.viewportWidth, 10) - parseInt(b.viewportWidth, 10));

		const updateLayoutAd = adData => {
			const { adUnitId, device: platform, pageGroup, sizeMapping, adId } = adData;

			return channelModel
				.getChannel(siteId, platform, pageGroup)
				.then(channel => {
					// find variation
					let variationId = null;
					const { data: channelData } = channel;
					const prevConfig = _.cloneDeep(channelData);
					const { variations } = channelData;
					// eslint-disable-next-line no-restricted-syntax
					for (const key in variations) {
						if (Object.prototype.hasOwnProperty.call(variations, key)) {
							const { sections } = variations[key];
							if (adUnitId in sections) {
								variationId = key;
								break;
							}
						}
					}

					if (!variationId) {
						throw new AdPushupError({ message: 'Invalid adUnitId', code: 400 });
					}

					channelData.variations[variationId].sections[adUnitId].ads[
						adId
					].sizeMapping = sizeMapping;

					// log config changes
					sendDataToAuditLogService({
						siteId,
						siteDomain,
						appName,
						type: 'site',
						impersonateId: email,
						userId: originalEmail,
						prevConfig,
						currentConfig: channelData,
						action: {
							name: OPS_PANEL.SITES_SETTING,
							data: `Sites Setting - Size Mapping(Update Layout Ad)`
						}
					});

					return channelModel.saveChannel(siteId, platform, pageGroup, channelData);
				})
				.then(() => sendSuccessResponse({}, res))
				.catch(err => errorHandler(err, res));
		};

		const updateNonLayoutAds = (docKey, adData) => {
			const { adUnitId, sizeMapping } = adData;

			return helpers
				.adUpdateProcessing(req, res, docKey, docWithCas => {
					const prevConfig = _.cloneDeep(docWithCas.value);
					const doc = docWithCas.value;
					if (doc.ownerEmail !== req.user.email) {
						throw new AdPushupError({
							message: 'Unauthorized Request',
							code: HTTP_STATUS.PERMISSION_DENIED
						});
					}
					_.forEach(doc.ads, (ad, index) => {
						if (ad.id === adUnitId) {
							doc.ads[index] = { ...ad, sizeMapping };
							return false;
						}
						return true;
					});

					sendDataToAuditLogService({
						siteId,
						siteDomain,
						appName,
						type: 'site',
						impersonateId: email,
						userId: originalEmail,
						prevConfig,
						currentConfig: doc,
						action: {
							name: OPS_PANEL.SITES_SETTING,
							data: `Sites Setting - Size Mapping(Update Non Layout Ad)`
						}
					});

					return helpers.directDBUpdate(`${docKey}${req.params.siteId}`, doc, docWithCas.cas);
				})
				.catch(err => errorHandler(err, res));
		};

		const updateApTagAd = adData => {
			const docKey = CC.docKeys.apTag;
			return updateNonLayoutAds(docKey, adData);
		};

		const updateInnovativeAd = adData => {
			const docKey = CC.docKeys.interactiveAds;
			return updateNonLayoutAds(docKey, adData);
		};

		const updateApLiteAd = adData => {
			const docKey = CC.docKeys.apLite;
			const { adUnit, sizeMapping } = adData;

			return helpers
				.adUpdateProcessing(req, res, docKey, docWithCas => {
					const prevConfig = _.cloneDeep(docWithCas.value);
					const doc = docWithCas.value;

					_.forEach(doc.adUnits, (ad, index) => {
						if (ad.dfpAdUnit === adUnit) {
							doc.adUnits[index] = { ...ad, sizeMapping };
							return false;
						}
						return true;
					});

					// log config changes
					sendDataToAuditLogService({
						siteId,
						siteDomain,
						appName,
						type: 'site',
						impersonateId: email,
						userId: originalEmail,
						prevConfig,
						currentConfig: doc,
						action: {
							name: OPS_PANEL.SITES_SETTING,
							data: `Sites Setting - Size Mapping(Update AP Lite Ad)`
						}
					});
					return helpers.directDBUpdate(`${docKey}${req.params.siteId}`, doc, docWithCas.cas);
				})
				.catch(err => errorHandler(err, res));
		};

		const updateSizeMapping = adType => {
			const { sizeMapping } = data;

			const isValidSizeMapping = validateSizeMapping(sizeMapping);

			if (!isValidSizeMapping) {
				throw new AdPushupError({ message: 'Invalid Size Mapping Configuration', code: 400 });
			}

			const sortedSizeMapping = getSortedSizeMapping(sizeMapping);

			const adData = { ...data, sizeMapping: sortedSizeMapping, siteId };

			switch (adType) {
				case 'layout':
					return updateLayoutAd(adData);

				case 'apTag':
					return updateApTagAd(adData);

				case 'innovative':
					return updateInnovativeAd(adData);

				case 'apLite':
					return updateApLiteAd(adData);

				default:
					throw new AdPushupError({ message: 'Invalid Ad type', code: 400 });
			}
		};

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => updateSizeMapping(type))
			.catch(err => errorHandler(err, res));
	})
	.use('/:siteId/pagegroup/', pageGroupController)
	.post('/:siteId/forceApBuild', (req, res) => {
		const { siteId } = req.params;
		const { email, originalEmail } = req.user;
		const { dataForAuditLogs } = req.body;

		if (!siteId || siteId.trim().length === 0) {
			return res.status(404).json({ message: 'Invalid Site ID' });
		}

		// log config changes
		const { siteDomain, appName, type = 'site' } = dataForAuditLogs;

		sendDataToAuditLogService({
			siteId,
			siteDomain,
			appName,
			type,
			impersonateId: email,
			userId: originalEmail,
			prevConfig: {},
			currentConfig: { forceBuild: true },
			action: {
				name: OPS_PANEL.SITES_SETTING,
				data: `Sites Setting - Force Ap Build`
			}
		});

		return siteModel
			.getSiteById(siteId)
			.then(() => {
				publishAdPushupBuild(siteId);
				return res.json({ message: 'Build pushed' });
			})
			.catch(e => {
				if (e instanceof AdPushupError) {
					// site id not found.
					return res.status(404).json({ message: e.message || 'Unable to build adpushup.js' });
				}
				return res.status(500).json({ message: 'Unable to build adpushup.js' });
			});
	});

module.exports = router;
