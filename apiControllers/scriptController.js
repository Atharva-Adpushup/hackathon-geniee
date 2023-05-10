/* eslint-disable func-names */
const express = require('express');
const Promise = require('bluebird');

const UserModel = require('../models/userModel');
const SiteModel = require('../models/siteModel');
const activeBidderAdaptersList = require('../models/activeBidderAdaptersListModel');
// const SelectiveRolloutActiveBidderAdaptersList = require('../models/selectiveRolloutActiveBidderAdaptersListModel');
const ampActiveBidderAdaptersListModel = require('../models/ampActiveBidderAdaptersListModel');
const ampSelectiveRolloutActiveBidderAdaptersList = require('../models/ampSelectiveRolloutActiveBidderAdaptersListModel');
const SiteSpecificActiveBidderAdaptersList = require('../models/siteSpecificActiveBidderAdaptersListModel');
const SiteLevelPrebidModulesModel = require('../models/siteLevelPrebidModulesModel');
const ampScriptModel = require('../models/ampScriptModel');
const instreamScriptModel = require('../models/instreamScriptModel');
const getReportData = require('../reports/universal');
const generateStatusesAndConfig = require('../services/genieeAdSyncService/cdnSyncService/generateConfig');
const generateAmpStatusesAndConfig = require('../services/genieeAdSyncService/cdnSyncService/generateAmpConfig');
const generatePrebidConfig = require('../services/genieeAdSyncService/cdnSyncService/generatePrebidConfig');
const generateApLiteAdsConfig = require('../services/genieeAdSyncService/cdnSyncService/generateApLiteConfig');
const generateAdNetworkConfig = require('../services/genieeAdSyncService/cdnSyncService/generateAdNetworkConfig');
const generateAdPushupAdsConfig = require('../services/genieeAdSyncService/cdnSyncService/generateAdPushupConfig');
const generateAmpAdPushupConfig = require('../services/genieeAdSyncService/cdnSyncService/generateAmpAdPushupConfig');
const generatePnPRefreshConfig = require('../services/genieeAdSyncService/cdnSyncService/generatePnPRefreshConfig');
const generateAmpPnPRefreshConfig = require('../services/genieeAdSyncService/cdnSyncService/generateAmpPnPRefreshConfig');
const AdPushupError = require('../helpers/AdPushupError');
const httpStatusConsts = require('../configs/httpStatusConsts');
const {
	getSizeMappingConfigFromCB
} = require('../services/genieeAdSyncService/cdnSyncService/commonFunctions');
const {
	isValidThirdPartyDFPAndCurrency,
	removeFormatWiseParamsForAMP,
	getFloorEngineConfigFromCB
} = require('../helpers/commonFunctions');
const utils = require('../helpers/utils');
const CC = require('../configs/commonConsts');

const Router = express.Router();

const defaultApConfigValues = {
	// site specific config
	isUrlReportingEnabled: false,
	isVideoWaitLimitDisabled: false,
	isSeparatePrebidDisabled: false,
	isBbPlayerDisabled: false,
	isPerformanceLoggingEnabled: false,
	isAutoAddMultiformatDisabled: false,
	isSiteSpecificPrebidDisabled: false,
	isSiteSpecificSeparatePrebidEnabled: false, // TODO: to be removed; only used by GFG
	// global config
	isBbPlayerLoggingEnabled: false,
	isVacantAdSpaceEnabled: false
};

const getActiveDfpNetworkCode = function(user) {
	const adServerSettings = user.get('adServerSettings');
	const manuallyAddedPublisherNetworkCode = user.get('manuallyAddedPublisherNetworkCode');
	return (
		(adServerSettings && adServerSettings.dfp && adServerSettings.dfp.activeDFPNetwork) ||
		manuallyAddedPublisherNetworkCode ||
		null
	);
};

const setOutbrainDisabled = function(site, scriptType) {
	const outbrainDisabled =
		(site.get('apConfigs') && site.get('apConfigs').outbrainDisabled) || false;
	if (typeof outbrainDisabled === 'object') return outbrainDisabled[scriptType];
	return outbrainDisabled;
};

Router.get('/:siteId/ampDeliveryViaCreativeConfig', (req, res) => {
	/**
	 * this route will be used by AmpDeliveryViaCreative repo
	 * we need to handle 2 cases for AMP here
	 * 		1. simple AMP delivery via creative setup
	 * 		2. AMP delivery via creative aplite + pnp setup
	 * for aplite setup, we don't actually run aplite module but render the aptags with adunits having config for publisher's GAM - dfpAdunit and dfpAdunitCode
	 * so, we essentially are running aptags with a set of ads other than tgmr ads
	 * also, some new files are created specially for amp to keep the web and amp versions different
	 */
	SiteModel.getSiteById(req.params.siteId)
		.then(site => Promise.join(site, UserModel.getUserByEmail(site.get('ownerEmail'))))
		.then(([site, user]) => {
			const siteId = site.get('siteId');
			const apps = site.get('apps');
			apps.pnp = false;
			apps.apLite = false;

			const isAmpPnpEnabled = !!apps.ampPnp;
			const isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise);
			const poweredByBanner = site.get('apConfigs') && site.get('apConfigs').poweredByBanner;
			const revenueShare =
				site.get('adNetworkSettings') && site.get('adNetworkSettings').revenueShare;
			const shouldDeductApShareFromHb =
				site.get('apConfigs') && site.get('apConfigs').shouldDeductApShareFromHb && !!revenueShare;
			const gptSraDisabled = !!(site.get('apConfigs') && site.get('apConfigs').gptSraDisabled);
			const lineItemTypes = site.get('lineItemTypes') || [];

			const setAllConfigs = function(prebidAndAdsConfig) {
				const apConfigs = {
					...defaultApConfigValues,
					...site.get('apConfigs')
				};

				const isAdPartner = !!site.get('partner');

				const {
					experiment,
					prebidConfig,
					apLiteConfig,
					pnpConfig,
					adNetworkConfig,
					manualAds,
					innovativeAds
				} = prebidAndAdsConfig;

				if (isAdPartner) {
					apConfigs.partner = site.get('partner');
				}

				// when using line Items File, lineItems is not an array
				if (
					apConfigs.useLineItemsFileAMP &&
					adNetworkConfig &&
					adNetworkConfig.useLineItemFile &&
					adNetworkConfig.lineItemsFileName &&
					!Array.isArray(adNetworkConfig.lineItems) &&
					adNetworkConfig.fallbackLineItems &&
					!isAmpPnpEnabled
				) {
					apConfigs.lineItemsFileName = adNetworkConfig.lineItemsFileName;
					apConfigs.fallbackLineItems = adNetworkConfig.fallbackLineItems;
					apConfigs.refreshByTypeLineItems = adNetworkConfig.refreshByTypeLineItems || [];

					const blockListedLineItemsAvailable =
						prebidAndAdsConfig.blockListedLineItems &&
						Array.isArray(prebidAndAdsConfig.blockListedLineItems) &&
						prebidAndAdsConfig.blockListedLineItems.length;
					if (blockListedLineItemsAvailable) {
						apConfigs.blockListedLineItems = prebidAndAdsConfig.blockListedLineItems;
					}
				} else {
					apConfigs.lineItems = (adNetworkConfig && adNetworkConfig.lineItems) || [];
					apConfigs.separatelyGroupedLineItems =
						(adNetworkConfig && adNetworkConfig.separatelyGroupedLineItems) || [];
				}

				apConfigs.autoOptimise = !!isAutoOptimise;
				apConfigs.poweredByBanner = poweredByBanner;
				if (shouldDeductApShareFromHb) {
					apConfigs.revenueShare = revenueShare;
				}
				apConfigs.outbrainDisabled = setOutbrainDisabled(
					site,
					CC.OUTBRAIN_DISABLED_SCRIPTS.AMP_DVC
				);
				apConfigs.gptSraDisabled = !!gptSraDisabled;
				apConfigs.siteDomain = site.get('siteDomain');
				apConfigs.ownerEmailMD5 = user.get('sellerId');
				apConfigs.isSPA = apConfigs.isSPA ? apConfigs.isSPA : false;
				apConfigs.spaButUsingHook = apConfigs.spaButUsingHook ? apConfigs.spaButUsingHook : false;
				apConfigs.spaPageTransitionTimeout = apConfigs.spaPageTransitionTimeout
					? apConfigs.spaPageTransitionTimeout
					: 0;
				apConfigs.activeDFPNetwork = getActiveDfpNetworkCode(user);
				// GAM 360 config
				apConfigs.mcm = user.get('mcm') || {};

				apConfigs.apLiteActive = !!apps.apLite;
				apConfigs.ampPnpActive = !!apps.ampPnp;
				apConfigs.ampApliteActive = !!apps.ampAplite;
				apConfigs.isRedefineGptOnRefreshEnabled = !!(
					!apConfigs.apLiteActive && apConfigs.isRedefineGptOnRefreshEnabled
				);
				apConfigs.isReplaceGptSlotOnRefreshEnabled = !!(
					!apConfigs.apLiteActive && apConfigs.isReplaceGptSlotOnRefreshEnabled
				);
				apConfigs.refreshOnImpressionViewed = apConfigs.refreshOnImpressionViewed || false;

				if (!apps.apLite) {
					apConfigs.manualModeActive = !!(apps.apTag && manualAds && manualAds.length);
					apConfigs.innovativeModeActive = !!(
						apps.innovativeAds &&
						innovativeAds &&
						innovativeAds.length
					);

					// Default 'draft' mode is selected if config mode is not present
					apConfigs.mode = apps.layout && apConfigs.mode ? apConfigs.mode : 2;

					if (apConfigs.manualModeActive) {
						apConfigs.manualAds = manualAds || [];
					}

					if (apConfigs.innovativeModeActive) {
						apConfigs.innovativeAds = innovativeAds || [];
					}

					apConfigs.experiment = experiment;
				}

				delete apConfigs.pageGroupPattern;

				if (isAmpPnpEnabled) {
					const pnpCodeHex = utils.btoa(CC.AMP_PNP_REFRESH_SCRIPTS);
					apConfigs.pnpScript = pnpCodeHex;
				}

				const output = { apConfigs, prebidConfig };
				if (apps.apLite) output.apLiteConfig = apLiteConfig;
				if (isAmpPnpEnabled) output.pnpConfig = pnpConfig;

				return output;
			};
			// eslint-disable-next-line
			const combinePrebidAndAdsConfig = (experiment, adpTags, manualAds, innovativeAds) => {
				if (!(Array.isArray(adpTags) && adpTags.length)) {
					return {
						experiment,
						prebidConfig: false,
						manualAds,
						innovativeAds
					};
				}
				return generatePrebidConfig(siteId).then(prebidConfig => ({
					prebidConfig,
					experiment,
					manualAds,
					innovativeAds
				}));
			};
			const setAdNetworkConfig = function(prebidAndAdsConfig) {
				const blockListedLineItems = site.get('blockListedLineItems');
				const activeDFPNetwork = getActiveDfpNetworkCode(user);
				const apConfigs = site.get('apConfigs');
				const useLineItemsFile = !!(apConfigs && apConfigs.useLineItemsFileAMP && !isAmpPnpEnabled);
				const fromDVC = true;
				if (activeDFPNetwork) {
					return generateAdNetworkConfig(
						activeDFPNetwork,
						lineItemTypes,
						blockListedLineItems,
						useLineItemsFile,
						fromDVC
					).then(adNetworkConfig => ({
						...prebidAndAdsConfig,
						blockListedLineItems,
						adNetworkConfig
					}));
				}

				return Promise.resolve(prebidAndAdsConfig);
			};
			const setPnPConfig = function(combinedConfig) {
				if (isAmpPnpEnabled) {
					return generateAmpPnPRefreshConfig(
						siteId,
						combinedConfig.adNetworkConfig,
						combinedConfig.blockListedLineItems
					).then(pnpConfig => ({
						...combinedConfig,
						pnpConfig
					}));
				}

				return Promise.resolve(combinedConfig);
			};
			const getPrebidAndAdsConfig = () =>
				(() => {
					if (apps.apLite) {
						return Promise.join(
							generatePrebidConfig(siteId),
							generateApLiteAdsConfig(siteId)
						).then(([prebidConfig, apLiteConfig]) => ({ prebidConfig, apLiteConfig }));
					}

					return getReportData(site)
						.then(reportData => {
							if (reportData.status && reportData.data) {
								return generateAmpAdPushupConfig(site, reportData.data);
							}
							return generateAmpAdPushupConfig(site);
						})
						.spread(combinePrebidAndAdsConfig);
				})()
					.then(setAdNetworkConfig)
					.then(setPnPConfig)
					.then(setAllConfigs);

			const generatedConfig = getPrebidAndAdsConfig().then(prebidAndAdsConfig => {
				// Remove ampConfig from adpushup.js
				const { prebidConfig } = prebidAndAdsConfig;
				if (prebidConfig && prebidConfig.hbcf) {
					const { hbcf } = prebidConfig;
					Object.keys(hbcf).forEach(bidder => {
						if (hbcf[bidder].ampConfig) {
							delete hbcf[bidder].ampConfig;
						}
					});
				}
				return generateAmpStatusesAndConfig(site, prebidAndAdsConfig);
			});

			return Promise.join(generatedConfig, {
				siteId: site.get('siteId'),
				medianetId: site.get('medianetId')
			});
		})
		.then(([scriptConfig, siteData]) =>
			res.send({ error: null, data: { config: scriptConfig, siteData } })
		)
		.catch(e => {
			if (typeof e.message === 'string') {
				return res.send({ error: e.message });
			}

			/**
			 * error thrown from services/genieeAdSyncService/cdnSyncService/generateAdPushupConfig.js ends up in a really weird state
			 * adding checks for the same
			 */
			if (typeof e[0] === 'object') {
				const errObject = e[0];
				if (errObject.message && errObject.message.message) {
					return res.send({ error: errObject.message.message });
				}
			}

			return res.send({ error: `Unknown message occured: ${e}` });
		});
});

Router.get('/:siteId/siteConfig', (req, res) => {
	SiteModel.getSiteById(req.params.siteId)
		.then(site => Promise.join(site, UserModel.getUserByEmail(site.get('ownerEmail'))))
		.then(([site, user]) => {
			const siteId = site.get('siteId');
			const apps = site.get('apps');
			const isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise);
			const poweredByBanner = site.get('apConfigs') && site.get('apConfigs').poweredByBanner;
			const revenueShare =
				site.get('adNetworkSettings') && site.get('adNetworkSettings').revenueShare;
			const shouldDeductApShareFromHb =
				site.get('apConfigs') && site.get('apConfigs').shouldDeductApShareFromHb && !!revenueShare;
			const gptSraDisabled = !!(site.get('apConfigs') && site.get('apConfigs').gptSraDisabled);
			const lineItemTypes = site.get('lineItemTypes') || [];

			const setAllConfigs = async function(prebidAndAdsConfig) {
				const apConfigs = {
					...defaultApConfigValues,
					...site.get('apConfigs')
				};

				const isAdPartner = !!site.get('partner');

				const {
					experiment,
					prebidConfig,
					apLiteConfig,
					pnpConfig,
					adNetworkConfig,
					manualAds,
					innovativeAds
				} = prebidAndAdsConfig;

				if (isAdPartner) {
					apConfigs.partner = site.get('partner');
				}
				if (
					apConfigs.useLineItemsFile &&
					adNetworkConfig &&
					adNetworkConfig.useLineItemFile &&
					adNetworkConfig.lineItemsFileName &&
					!Array.isArray(adNetworkConfig.lineItems) &&
					adNetworkConfig.fallbackLineItems &&
					!apps.pnp
				) {
					apConfigs.lineItemsFileName = adNetworkConfig.lineItemsFileName;
					apConfigs.fallbackLineItems = adNetworkConfig.fallbackLineItems;
					apConfigs.refreshByTypeLineItems = adNetworkConfig.refreshByTypeLineItems || [];

					const blockListedLineItemsAvailable =
						prebidAndAdsConfig.blockListedLineItems &&
						Array.isArray(prebidAndAdsConfig.blockListedLineItems) &&
						prebidAndAdsConfig.blockListedLineItems.length;
					if (blockListedLineItemsAvailable) {
						apConfigs.blockListedLineItems = prebidAndAdsConfig.blockListedLineItems;
					}
				} else {
					apConfigs.lineItems = (adNetworkConfig && adNetworkConfig.lineItems) || [];
					apConfigs.separatelyGroupedLineItems =
						(adNetworkConfig && adNetworkConfig.separatelyGroupedLineItems) || [];
				}

				apConfigs.autoOptimise = !!isAutoOptimise;
				apConfigs.poweredByBanner = poweredByBanner;
				if (shouldDeductApShareFromHb) {
					apConfigs.revenueShare = revenueShare;
				}
				apConfigs.outbrainDisabled = setOutbrainDisabled(
					site,
					CC.OUTBRAIN_DISABLED_SCRIPTS.ADPUSHUP_JS
				);
				apConfigs.gptSraDisabled = !!gptSraDisabled;
				apConfigs.siteDomain = site.get('siteDomain');
				apConfigs.ownerEmailMD5 = user.get('sellerId');
				apConfigs.isSPA = apConfigs.isSPA ? apConfigs.isSPA : false;
				apConfigs.spaButUsingHook = apConfigs.spaButUsingHook ? apConfigs.spaButUsingHook : false;
				apConfigs.spaPageTransitionTimeout = apConfigs.spaPageTransitionTimeout
					? apConfigs.spaPageTransitionTimeout
					: 0;
				apConfigs.activeDFPNetwork = getActiveDfpNetworkCode(user);

				// GAM 360 config
				apConfigs.mcm = user.get('mcm') || {};

				apConfigs.apLiteActive = !!apps.apLite;
				apConfigs.isRedefineGptOnRefreshEnabled = !!(
					!apConfigs.apLiteActive && apConfigs.isRedefineGptOnRefreshEnabled
				);

				if (!apps.apLite) {
					apConfigs.manualModeActive = !!(apps.apTag && manualAds && manualAds.length);
					apConfigs.innovativeModeActive = !!(
						apps.innovativeAds &&
						innovativeAds &&
						innovativeAds.length
					);

					/** removing mode dependency on layout editor */
					// apConfigs.mode = apps.layout && apConfigs.mode ? apConfigs.mode : 2;

					if (apConfigs.manualModeActive) {
						apConfigs.manualAds = manualAds || [];
					}

					if (apConfigs.innovativeModeActive) {
						apConfigs.innovativeAds = innovativeAds || [];
					}

					apConfigs.experiment = experiment;
				}

				// Handle deleted page group patterns
				// Get all channels and filter and remove extra page group patterns from apConfigs.pageGroupPattern
				const allPageGroups = site.get('channels') || [];

				const allPageGroupPattern = apConfigs.pageGroupPattern || {};
				Object.keys(allPageGroupPattern).forEach(platform => {
					const pageGroupPatternsObjects = allPageGroupPattern[platform] || [];
					allPageGroupPattern[platform] = pageGroupPatternsObjects.filter(patternObj => {
						const { pageGroup } = patternObj;
						if (!pageGroup) return false;

						const platformPageGroupKey = `${platform}:${pageGroup}`;
						if (allPageGroups.indexOf(platformPageGroupKey) === -1) {
							return false;
						}
						return true;
					});
				});
				if (apConfigs?.floorPriceConfig?.enabled) {
					const floorEngineConfigDoc = await getFloorEngineConfigFromCB();
					if (floorEngineConfigDoc.globalFloorsMapping)
						apConfigs.floorPriceConfig.globalFloorsMapping =
							floorEngineConfigDoc.globalFloorsMapping;
					else
						throw new Error(
							"FloorEngineConfig Doc Couchbase Error: Can't find globalFloorsMapping"
						);
				}

				const output = { apConfigs, prebidConfig };
				if (apps.apLite) output.apLiteConfig = apLiteConfig;
				if (apps.pnp) output.pnpConfig = pnpConfig;

				return output;
			};
			// eslint-disable-next-line
			const combinePrebidAndAdsConfig = (experiment, adpTags, manualAds, innovativeAds) => {
				if (!(Array.isArray(adpTags) && adpTags.length)) {
					return {
						experiment,
						prebidConfig: false,
						manualAds,
						innovativeAds
					};
				}
				return generatePrebidConfig(siteId).then(prebidConfig => ({
					prebidConfig,
					experiment,
					manualAds,
					innovativeAds
				}));
			};
			const setAdNetworkConfig = function(prebidAndAdsConfig) {
				const blockListedLineItems = site.get('blockListedLineItems') || [];
				const activeDFPNetwork = getActiveDfpNetworkCode(user);
				const apConfigs = site.get('apConfigs');
				const useLineItemsFile = !!(apConfigs && apConfigs.useLineItemsFile && !apps.pnp);
				const fromScript = true;
				if (activeDFPNetwork) {
					return generateAdNetworkConfig(
						activeDFPNetwork,
						lineItemTypes,
						blockListedLineItems,
						useLineItemsFile,
						fromScript
					).then(adNetworkConfig => ({
						...prebidAndAdsConfig,
						blockListedLineItems,
						adNetworkConfig
					}));
				}

				return Promise.resolve(prebidAndAdsConfig);
			};
			const setPnPConfig = function(combinedConfig) {
				const pnpActive = !!apps.pnp;
				if (pnpActive) {
					return generatePnPRefreshConfig(
						siteId,
						combinedConfig.adNetworkConfig,
						combinedConfig.blockListedLineItems
					).then(pnpConfig => ({
						...combinedConfig,
						pnpConfig
					}));
				}

				return Promise.resolve(combinedConfig);
			};
			const getPrebidAndAdsConfig = () =>
				(() => {
					if (apps.apLite) {
						return Promise.join(
							generatePrebidConfig(siteId),
							generateApLiteAdsConfig(siteId)
						).then(([prebidConfig, apLiteConfig]) => ({ prebidConfig, apLiteConfig }));
					}

					return getReportData(site)
						.then(reportData => {
							if (reportData.status && reportData.data) {
								return generateAdPushupAdsConfig(site, reportData.data);
							}
							return generateAdPushupAdsConfig(site);
						})
						.spread(combinePrebidAndAdsConfig);
				})()
					.then(setAdNetworkConfig)
					.then(setPnPConfig)
					.then(setAllConfigs);

			const generatedConfig = getPrebidAndAdsConfig().then(prebidAndAdsConfig => {
				// Remove ampConfig from adpushup.js
				const { prebidConfig } = prebidAndAdsConfig;
				if (prebidConfig && prebidConfig.hbcf) {
					const { hbcf } = prebidConfig;
					Object.keys(hbcf).forEach(bidder => {
						if (hbcf[bidder].ampConfig) {
							delete hbcf[bidder].ampConfig;
						}
					});
				}
				return generateStatusesAndConfig(site, prebidAndAdsConfig);
			});

			return Promise.join(generatedConfig, {
				siteId: site.get('siteId'),
				apScriptSize: site.get('apScriptSize'),
				medianetId: site.get('medianetId')
			});
		})
		.then(([scriptConfig, siteData]) =>
			res.send({ error: null, data: { config: scriptConfig, siteData } })
		)
		.catch(e => {
			if (typeof e.message === 'string') {
				return res.send({ error: e.message });
			}

			/**
			 * error thrown from services/genieeAdSyncService/cdnSyncService/generateAdPushupConfig.js ends up in a really weird state
			 * adding checks for the same
			 */
			if (typeof e[0] === 'object') {
				const errObject = e[0];
				if (errObject.message && errObject.message.message) {
					return res.send({ error: errObject.message.message });
				}
			}

			return res.send({ error: `Unknown message occured: ${e}` });
		});
});

Router.get('/:siteId/ampSiteConfig', (req, res) => {
	SiteModel.getSiteById(req.params.siteId)
		.then(site => Promise.join(site, UserModel.getUserByEmail(site.get('ownerEmail'))))
		.then(([site, user]) => {
			const siteId = site.get('siteId');
			const lineItemTypes = site.get('lineItemTypes') || [];

			const generateApConfig = function(prebidAndAdsConfig) {
				// TODO: rj: to check hb status
				const apps = site.get('apps');
				const apConfigs = site.get('apConfigs');

				const {
					prebidConfig,
					refreshLineItems,
					ampScriptConfig,
					sizeMappingConfig,
					currencyConfig,
					firstImpressionRefreshLineItems,
					adpushupAdsConfig = []
				} = prebidAndAdsConfig;

				if (refreshLineItems) apConfigs.refreshLineItems = refreshLineItems;
				if (firstImpressionRefreshLineItems)
					apConfigs.firstImpressionRefreshLineItems = firstImpressionRefreshLineItems;
				if (sizeMappingConfig) apConfigs.sizeMapping = sizeMappingConfig;
				if (currencyConfig) apConfigs.currencyConfig = currencyConfig;
				apConfigs.siteId = site.get('siteId');
				apConfigs.siteDomain = site.get('siteDomain');
				apConfigs.ownerEmailMD5 = user.get('sellerId');
				apConfigs.activeDFPNetwork = getActiveDfpNetworkCode(user);
				apConfigs.outbrainDisabled = setOutbrainDisabled(
					site,
					CC.OUTBRAIN_DISABLED_SCRIPTS.AMP_TYPE_ADPUSHUP
				);
				// GAM 360 config
				apConfigs.mcm = user.get('mcm') || {};

				// eslint-disable-next-line prefer-destructuring
				apConfigs.manualAds = adpushupAdsConfig[2]; // Returns manaul ads at second index

				if (ampScriptConfig && ampScriptConfig.ads.length) {
					apConfigs.ampConfig = {
						ampAds: ampScriptConfig.ads,
						pnpConfig: ampScriptConfig.pnpConfig
					};
				}

				// Default 'draft' mode is selected if config mode is not present
				apConfigs.mode = apConfigs.mode === 1 && apConfigs.ampConfig ? apConfigs.mode : 2;

				if (apps.headerBidding && Object.keys(prebidConfig.hbcf).length) {
					delete prebidConfig.email;
					apConfigs.hbConfig = prebidConfig;
				}

				return apConfigs;
			};

			const generateAmpScriptAdsConfig = () =>
				ampScriptModel.getAmpScriptConfig(siteId).then(({ data: ampScriptConfig }) => {
					if (
						!(ampScriptConfig && Array.isArray(ampScriptConfig.ads) && ampScriptConfig.ads.length)
					) {
						return;
					}

					// eslint-disable-next-line no-param-reassign
					ampScriptConfig.ads = ampScriptConfig.ads.filter(ad => ad.isActive !== false);

					if (!ampScriptConfig.ads.length) return;

					// eslint-disable-next-line consistent-return
					return ampScriptConfig;
				});

			const getRefreshLineItems = function(userModel, lineItemTypesToRefresh) {
				const activeDFPNetwork = getActiveDfpNetworkCode(userModel);

				if (!activeDFPNetwork) return null;

				return generateAdNetworkConfig(activeDFPNetwork, lineItemTypesToRefresh).then(
					adNetworkConfig => {
						const isValidRefreshLineItems =
							adNetworkConfig &&
							adNetworkConfig.lineItems &&
							Array.isArray(adNetworkConfig.lineItems) &&
							adNetworkConfig.lineItems.length;

						if (!isValidRefreshLineItems) {
							return null;
						}
						const groupedLineItems = Object.keys(adNetworkConfig.separatelyGroupedLineItems).reduce(
							(accumulator, currValue) => {
								// eslint-disable-next-line no-param-reassign
								accumulator = [
									...accumulator,
									...adNetworkConfig.separatelyGroupedLineItems[currValue]
								];
								return accumulator;
							},
							[]
						);

						return Array.isArray(groupedLineItems) && groupedLineItems.length
							? [...adNetworkConfig.lineItems, ...groupedLineItems]
							: adNetworkConfig.lineItems;
					}
				);
			};

			// eslint-disable-next-line consistent-return
			const getCurrencyConfig = function() {
				const adServerSettings = user.get('adServerSettings');
				const isValidCurrencyCnfg =
					adServerSettings &&
					adServerSettings.dfp &&
					isValidThirdPartyDFPAndCurrency(adServerSettings.dfp);

				if (isValidCurrencyCnfg) {
					const activeAdServer = adServerSettings.dfp;
					return {
						adServerCurrency: activeAdServer.activeDFPCurrencyCode,
						granularityMultiplier: Number(activeAdServer.prebidGranularityMultiplier) || 1
					};
				}
			};

			const getFirstImpressionRefreshLineItems = function(firstImpressionSiteId) {
				return SiteModel.getSiteById(parseInt(firstImpressionSiteId, 10)).then(
					firstImpressionSite => {
						const firstImpressionLineItemTypes = firstImpressionSite.get('lineItemTypes') || [];
						return UserModel.getUserByEmail(firstImpressionSite.get('ownerEmail')).then(userDoc =>
							getRefreshLineItems(userDoc, firstImpressionLineItemTypes)
						);
					}
				);
			};

			const getApTagConfig = function() {
				// Manual ads required only in case of AMP DVC via type adpushup
				const isTypeAdpushupViaDvc =
					site.get('apConfigs') && site.get('apConfigs').isTypeAdpushupViaDvc;

				if (!isTypeAdpushupViaDvc) {
					return [];
				}
				return generateAdPushupAdsConfig(site);
			};

			return Promise.join(
				generatePrebidConfig(siteId),
				generateAmpScriptAdsConfig(siteId),
				getRefreshLineItems(user, lineItemTypes),
				getSizeMappingConfigFromCB(),
				getCurrencyConfig(),
				getApTagConfig()
			)
				.then(
					([
						prebidConfig,
						ampScriptConfig,
						refreshLineItems,
						sizeMappingConfig,
						currencyConfig,
						adpushupAdsConfig
					]) => {
						// Remove ampConfig from amp.js as ampConfig is used in s2s
						const { hbcf } = prebidConfig;
						if (hbcf) {
							Object.keys(hbcf).forEach(bidder => {
								if (hbcf[bidder].ampConfig) {
									delete hbcf[bidder].ampConfig;
								}
								// Remove format wise bidder param prefix from amp.js
								hbcf[bidder].config = removeFormatWiseParamsForAMP(hbcf[bidder]);
							});
						}
						const output = {
							prebidConfig,
							ampScriptConfig,
							refreshLineItems,
							sizeMappingConfig,
							currencyConfig,
							adpushupAdsConfig
						};

						const isFirstImpressionSiteIdAvailable =
							ampScriptConfig &&
							ampScriptConfig.pnpConfig &&
							ampScriptConfig.pnpConfig.enabled &&
							!Number.isNaN(ampScriptConfig.pnpConfig.firstImpressionSiteId);

						if (isFirstImpressionSiteIdAvailable) {
							return getFirstImpressionRefreshLineItems(
								ampScriptConfig.pnpConfig.firstImpressionSiteId
							).then(firstImpressionRefreshLineItems => ({
								...output,
								firstImpressionRefreshLineItems
							}));
						}

						return output;
					}
				)
				.then(generateApConfig);
		})
		.then(scriptConfig => res.send({ error: null, data: { config: scriptConfig } }))
		.catch(e => res.send({ error: e.message }));
});

Router.get('/:siteId/instreamScriptConfig', (req, res) => {
	const { siteId } = req.params;

	return SiteModel.getSiteById(siteId)
		.then(site => Promise.join(site, UserModel.getUserByEmail(site.get('ownerEmail'))))
		.then(() => {
			const generateInstreamScriptAdsConfig = () =>
				instreamScriptModel
					.getInstreamScriptConfig(siteId)
					.then(({ data: instreamScriptConfig }) => {
						if (
							!(
								instreamScriptConfig &&
								Array.isArray(instreamScriptConfig.ads) &&
								instreamScriptConfig.ads.length
							)
						) {
							return;
						}

						// eslint-disable-next-line consistent-return
						return instreamScriptConfig;
					});

			return generateInstreamScriptAdsConfig(siteId);
		})
		.then(instreamScriptConfig => res.send({ error: null, data: { config: instreamScriptConfig } }))
		.catch(e => res.send({ error: e.message }));
});

Router.get('/prebidBundleConfig', (req, res) => {
	const { siteId, forAmp } = req.query;

	return SiteModel.getSiteById(siteId)
		.then(site => {
			if (forAmp) {
				return ampActiveBidderAdaptersListModel;
			}

			const { isSelectiveRolloutEnabled = false, isSiteSpecificPrebidDisabled = false } =
				site.get('apConfigs') || {};

			// if (isSelectiveRolloutEnabled) {
			// 	return SelectiveRolloutActiveBidderAdaptersList;
			// }

			if (!isSiteSpecificPrebidDisabled || isSelectiveRolloutEnabled) {
				return SiteSpecificActiveBidderAdaptersList;
			}

			return activeBidderAdaptersList;
		})
		.then(activeBiddersModel =>
			Promise.join(
				activeBiddersModel,
				activeBiddersModel.getActiveAndUsedBidderAdapters(siteId), // siteId is only used by SiteSpecificActiveBidderAdaptersList
				SiteLevelPrebidModulesModel.getSiteLevelPrebidAdditionalModules(siteId)
			)
		)
		.then(([activeBiddersModel, activeAndUsedBidders, siteLevelModules]) => {
			if (forAmp) {
				return res.send({ activeAndUsedBidders });
			}

			return (
				activeBiddersModel
					.isS2SActiveOnAnySite(siteId)
					// siteId is only used by SiteSpecificActiveBidderAdaptersList
					.then(isS2SActiveOnAnySite =>
						res.send({ isS2SActiveOnAnySite, activeAndUsedBidders, siteLevelModules })
					)
			);
		})
		.catch(err => {
			if (err instanceof AdPushupError) {
				return res.status(httpStatusConsts.NOT_FOUND).json({ error: err.message });
			}

			return res
				.status(httpStatusConsts.INTERNAL_SERVER_ERROR)
				.json({ error: 'Internal Server Error!' });
		});
});

Router.post('/prebidActiveBidderAdapters', (req, res) => {
	const { newActiveBidderAdapters, siteId, forAmp } = req.body;

	return SiteModel.getSiteById(siteId)
		.then(site => {
			const {
				isAmpSelectiveRolloutEnabled = false,
				isSelectiveRolloutEnabled = false,
				isSiteSpecificPrebidDisabled = false
			} = site.get('apConfigs') || {};

			if (forAmp) {
				if (isAmpSelectiveRolloutEnabled) {
					return ampSelectiveRolloutActiveBidderAdaptersList;
				}
				return ampActiveBidderAdaptersListModel;
			}

			// if (isSelectiveRolloutEnabled) {
			// 	return SelectiveRolloutActiveBidderAdaptersList;
			// }

			if (!isSiteSpecificPrebidDisabled || isSelectiveRolloutEnabled) {
				return SiteSpecificActiveBidderAdaptersList;
			}

			return activeBidderAdaptersList;
		})
		.then(activeBiddersModel =>
			activeBiddersModel
				.updateActiveBidderAdaptersIfChanged(newActiveBidderAdapters, siteId)
				.then(data => res.send(data))
				.catch(err => {
					if (err instanceof AdPushupError) {
						return res.status(httpStatusConsts.NOT_FOUND).json({ error: err.message });
					}

					return res
						.status(httpStatusConsts.INTERNAL_SERVER_ERROR)
						.json({ error: 'Internal Server Error!' });
				})
		);
});
Router.post('/:siteId/updateApScriptSize', (req, res) => {
	const { siteId } = req.params;
	const { currentApScriptSize: apScriptSize } = req.body;

	return SiteModel.getSiteById(siteId)
		.then(site => {
			site.set('apScriptSize', apScriptSize);
			return site.save();
		})
		.then(() => res.status(httpStatusConsts.OK).send('The script size is updated'))
		.catch(err => res.status(httpStatusConsts.NOT_FOUND).json({ error: err.message }));
});

module.exports = Router;
