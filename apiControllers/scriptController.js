/* eslint-disable func-names */
const crypto = require('crypto');
const express = require('express');
const Promise = require('bluebird');

const UserModel = require('../models/userModel');
const SiteModel = require('../models/siteModel');
const activeBidderAdaptersList = require('../models/activeBidderAdaptersListModel');
const SelectiveRolloutActiveBidderAdaptersList = require('../models/selectiveRolloutActiveBidderAdaptersListModel');
const ampActiveBidderAdaptersListModel = require('../models/ampActiveBidderAdaptersListModel');
const SiteSpecificActiveBidderAdaptersList = require('../models/siteSpecificActiveBidderAdaptersListModel');
const ampScriptModel = require('../models/ampScriptModel');

const getReportData = require('../reports/universal');
const generateStatusesAndConfig = require('../services/genieeAdSyncService/cdnSyncService/generateConfig');
const generatePrebidConfig = require('../services/genieeAdSyncService/cdnSyncService/generatePrebidConfig');
const generateApLiteAdsConfig = require('../services/genieeAdSyncService/cdnSyncService/generateApLiteConfig');
const generateAdNetworkConfig = require('../services/genieeAdSyncService/cdnSyncService/generateAdNetworkConfig');
const generateAdPushupAdsConfig = require('../services/genieeAdSyncService/cdnSyncService/generateAdPushupConfig');
const AdPushupError = require('../helpers/AdPushupError');
const httpStatusConsts = require('../configs/httpStatusConsts');
const {
	getSizeMappingConfigFromCB
} = require('../services/genieeAdSyncService/cdnSyncService/commonFunctions');
const {
	isValidThirdPartyDFPAndCurrency,
	removeFormatWiseParamsForAMP
} = require('../helpers/commonFunctions');

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
	isBbPlayerLoggingEnabled: false
};

Router.get('/:siteId/siteConfig', (req, res) => {
	SiteModel.getSiteById(req.params.siteId)
		.then(site => Promise.join(site, UserModel.getUserByEmail(site.get('ownerEmail'))))
		.then(([site, user]) => {
			const siteId = site.get('siteId');
			const apps = site.get('apps');
			const isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise);
			const poweredByBanner = !!(site.get('apConfigs') && site.get('apConfigs').poweredByBanner);
			const poweredByBannerOnDocked = !!(
				site.get('apConfigs') && site.get('apConfigs').poweredByBannerOnDocked
			);
			const gptSraDisabled = !!(site.get('apConfigs') && site.get('apConfigs').gptSraDisabled);

			const setAllConfigs = function(prebidAndAdsConfig) {
				const apConfigs = {
					...defaultApConfigValues,
					...site.get('apConfigs')
				};
				const adServerSettings = user.get('adServerSettings');
				const isAdPartner = !!site.get('partner');
				const {
					experiment,
					prebidConfig,
					apLiteConfig,
					adNetworkConfig,
					manualAds,
					innovativeAds
				} = prebidAndAdsConfig;

				if (isAdPartner) {
					apConfigs.partner = site.get('partner');
				}

				apConfigs.lineItems = (adNetworkConfig && adNetworkConfig.lineItems) || [];
				apConfigs.autoOptimise = !!isAutoOptimise;
				apConfigs.poweredByBanner = !!poweredByBanner;
				apConfigs.poweredByBannerOnDocked = !!poweredByBannerOnDocked;
				apConfigs.gptSraDisabled = !!gptSraDisabled;
				apConfigs.siteDomain = site.get('siteDomain');
				apConfigs.ownerEmailMD5 = crypto
					.createHash('md5')
					.update(site.get('ownerEmail'))
					.digest('hex')
					.substr(0, 64);
				apConfigs.isSPA = apConfigs.isSPA ? apConfigs.isSPA : false;
				apConfigs.spaButUsingHook = apConfigs.spaButUsingHook ? apConfigs.spaButUsingHook : false;
				apConfigs.spaPageTransitionTimeout = apConfigs.spaPageTransitionTimeout
					? apConfigs.spaPageTransitionTimeout
					: 0;
				apConfigs.activeDFPNetwork =
					(adServerSettings && adServerSettings.dfp && adServerSettings.dfp.activeDFPNetwork) ||
					null;

				// GAM 360 config
				apConfigs.mcm = user.get('mcm') || {};

				apConfigs.apLiteActive = !!apps.apLite;

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

				const output = { apConfigs, prebidConfig };
				if (apps.apLite) output.apLiteConfig = apLiteConfig;

				return output;
			};
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
				const adServerSettings = user.get('adServerSettings');
				const activeDFPNetwork =
					(adServerSettings && adServerSettings.dfp && adServerSettings.dfp.activeDFPNetwork) ||
					null;

				if (activeDFPNetwork) {
					return generateAdNetworkConfig(activeDFPNetwork).then(adNetworkConfig => ({
						...prebidAndAdsConfig,
						adNetworkConfig
					}));
				}

				return Promise.resolve(prebidAndAdsConfig);
			};
			const getPrebidAndAdsConfig = () =>
				(() => {
					if (apps.apLite) {
						return Promise.join(generatePrebidConfig(siteId), generateApLiteAdsConfig(siteId)).then(
							([prebidConfig, apLiteConfig]) => ({ prebidConfig, apLiteConfig })
						);
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

			const generateApConfig = function(prebidAndAdsConfig) {
				// TODO: rj: to check hb status
				const apps = site.get('apps');
				const apConfigs = site.get('apConfigs');
				const adServerSettings = user.get('adServerSettings');

				const {
					prebidConfig,
					refreshLineItems,
					ampScriptConfig,
					sizeMappingConfig,
					currencyConfig,
					firstImpressionRefreshLineItems
				} = prebidAndAdsConfig;

				if (refreshLineItems) apConfigs.refreshLineItems = refreshLineItems;
				if (firstImpressionRefreshLineItems)
					apConfigs.firstImpressionRefreshLineItems = firstImpressionRefreshLineItems;
				if (sizeMappingConfig) apConfigs.sizeMapping = sizeMappingConfig;
				if (currencyConfig) apConfigs.currencyConfig = currencyConfig;
				apConfigs.siteDomain = site.get('siteDomain');
				apConfigs.ownerEmailMD5 = crypto
					.createHash('md5')
					.update(site.get('ownerEmail'))
					.digest('hex')
					.substr(0, 64);
				apConfigs.activeDFPNetwork =
					(adServerSettings && adServerSettings.dfp && adServerSettings.dfp.activeDFPNetwork) ||
					null;

				// GAM 360 config
				apConfigs.mcm = user.get('mcm') || {};

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

					ampScriptConfig.ads = ampScriptConfig.ads.filter(ad => ad.isActive !== false);

					if (!ampScriptConfig.ads.length) return;

					return ampScriptConfig;
				});

			const getRefreshLineItems = function(userModel) {
				const adServerSettings = userModel.get('adServerSettings');
				const activeDFPNetwork =
					(adServerSettings && adServerSettings.dfp && adServerSettings.dfp.activeDFPNetwork) ||
					null;

				if (!activeDFPNetwork) return null;

				return generateAdNetworkConfig(activeDFPNetwork).then(adNetworkConfig => {
					const isValidRefreshLineItems =
						adNetworkConfig &&
						adNetworkConfig.lineItems &&
						Array.isArray(adNetworkConfig.lineItems) &&
						adNetworkConfig.lineItems.length;

					if (!isValidRefreshLineItems) {
						return null;
					}

					return adNetworkConfig.lineItems;
				});
			};

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
				return SiteModel.getSiteById(parseInt(firstImpressionSiteId, 10))
					.then(firstImpressionSite =>
						UserModel.getUserByEmail(firstImpressionSite.get('ownerEmail'))
					)
					.then(firstImpressionUser => getRefreshLineItems(firstImpressionUser));
			};

			return Promise.join(
				generatePrebidConfig(siteId),
				generateAmpScriptAdsConfig(siteId),
				getRefreshLineItems(user),
				getSizeMappingConfigFromCB(),
				getCurrencyConfig()
			)
				.then(
					([
						prebidConfig,
						ampScriptConfig,
						refreshLineItems,
						sizeMappingConfig,
						currencyConfig
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
							currencyConfig
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

Router.get('/prebidBundleConfig', (req, res) => {
	const { siteId, forAmp } = req.query;

	return SiteModel.getSiteById(siteId)
		.then(site => {
			if (forAmp) {
				return ampActiveBidderAdaptersListModel;
			}

			const { isSelectiveRolloutEnabled = false, isSiteSpecificPrebidDisabled = false } =
				site.get('apConfigs') || {};

			if (!isSelectiveRolloutEnabled) {
				return activeBidderAdaptersList;
			}

			if (!isSiteSpecificPrebidDisabled) {
				return SiteSpecificActiveBidderAdaptersList;
			}

			return SelectiveRolloutActiveBidderAdaptersList;
		})
		.then(activeBiddersModel =>
			Promise.join(
				activeBiddersModel,
				activeBiddersModel.getActiveAndUsedBidderAdapters(siteId)
				// siteId is only used by SiteSpecificActiveBidderAdaptersList
			)
		)
		.then(([activeBiddersModel, activeAndUsedBidders]) => {
			if (forAmp) {
				return res.send({ activeAndUsedBidders });
			}

			return (
				activeBiddersModel
					.isS2SActiveOnAnySite(siteId)
					// siteId is only used by SiteSpecificActiveBidderAdaptersList
					.then(isS2SActiveOnAnySite => res.send({ isS2SActiveOnAnySite, activeAndUsedBidders }))
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
			if (forAmp) {
				return ampActiveBidderAdaptersListModel;
			}

			const { isSelectiveRolloutEnabled = false, isSiteSpecificPrebidDisabled = false } =
				site.get('apConfigs') || {};

			if (!isSelectiveRolloutEnabled) {
				return activeBidderAdaptersList;
			}

			if (!isSiteSpecificPrebidDisabled) {
				return SiteSpecificActiveBidderAdaptersList;
			}

			return SelectiveRolloutActiveBidderAdaptersList;
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

module.exports = Router;
