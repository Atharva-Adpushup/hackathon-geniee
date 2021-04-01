/* eslint-disable func-names */
const crypto = require('crypto');
const express = require('express');
const Promise = require('bluebird');

const UserModel = require('../models/userModel');
const SiteModel = require('../models/siteModel');
const ActiveBidderAdaptersListModel = require('../models/activeBidderAdaptersListModel');
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
const { isValidThirdPartyDFPAndCurrency } = require('../helpers/commonFunctions');

const Router = express.Router();

Router.get('/:siteId/siteConfig', (req, res) => {
	SiteModel.getSiteById(req.params.siteId)
		.then(site => Promise.join(site, UserModel.getUserByEmail(site.get('ownerEmail'))))
		.then(([site, user]) => {
			const siteId = site.get('siteId');
			const apps = site.get('apps');
			const isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise);
			const poweredByBanner = !!(site.get('apConfigs') && site.get('apConfigs').poweredByBanner);
			const gptSraDisabled = !!(site.get('apConfigs') && site.get('apConfigs').gptSraDisabled);

			const setAllConfigs = function(prebidAndAdsConfig) {
				const apConfigs = site.get('apConfigs');
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

			const generatedConfig = getPrebidAndAdsConfig().then(prebidAndAdsConfig =>
				generateStatusesAndConfig(site, prebidAndAdsConfig)
			);

			return Promise.join(generatedConfig, {
				siteId: site.get('siteId'),
				medianetId: site.get('medianetId')
			});
		})
		.then(([scriptConfig, siteData]) =>
			res.send({ error: null, data: { config: scriptConfig, siteData } })
		)
		.catch(e => res.send({ error: e.message }));
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

Router.get('/prebidBundleConfig', (req, res) =>
	Promise.join(
		ActiveBidderAdaptersListModel.isS2SActiveOnAnySite(),
		ActiveBidderAdaptersListModel.getActiveAndUsedBidderAdapters()
	)
		.then(([isS2SActiveOnAnySite, activeAndUsedBidders]) =>
			res.send({ isS2SActiveOnAnySite, activeAndUsedBidders })
		)
		.catch(err => {
			if (err instanceof AdPushupError) {
				return res.status(httpStatusConsts.NOT_FOUND).json({ error: err.message });
			}

			return res
				.status(httpStatusConsts.INTERNAL_SERVER_ERROR)
				.json({ error: 'Internal Server Error!' });
		})
);

Router.post('/prebidActiveBidderAdapters', (req, res) => {
	const { newActiveBidderAdapters } = req.body;
	return ActiveBidderAdaptersListModel.updateActiveBidderAdaptersIfChanged(newActiveBidderAdapters)
		.then(data => res.send(data))
		.catch(err => {
			if (err instanceof AdPushupError) {
				return res.status(httpStatusConsts.NOT_FOUND).json({ error: err.message });
			}

			return res
				.status(httpStatusConsts.INTERNAL_SERVER_ERROR)
				.json({ error: 'Internal Server Error!' });
		});
});

module.exports = Router;
