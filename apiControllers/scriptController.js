/* eslint-disable func-names */
const crypto = require('crypto');
const express = require('express');
const Promise = require('bluebird');

const UserModel = require('../models/userModel');
const SiteModel = require('../models/siteModel');
const ActiveBidderAdaptersListModel = require('../models/activeBidderAdaptersListModel');

const getReportData = require('../reports/universal');
const generateStatusesAndConfig = require('../services/genieeAdSyncService/cdnSyncService/generateConfig');
const generatePrebidConfig = require('../services/genieeAdSyncService/cdnSyncService/generatePrebidConfig');
const generateApLiteAdsConfig = require('../services/genieeAdSyncService/cdnSyncService/generateApLiteConfig');
const generateAdNetworkConfig = require('../services/genieeAdSyncService/cdnSyncService/generateAdNetworkConfig');
const generateAdPushupAdsConfig = require('../services/genieeAdSyncService/cdnSyncService/generateAdPushupConfig');
const AdPushupError = require('../helpers/AdPushupError');
const httpStatusConsts = require('../configs/httpStatusConsts');

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
