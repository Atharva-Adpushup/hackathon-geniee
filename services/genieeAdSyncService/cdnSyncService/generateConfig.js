const Promise = require('bluebird');
const _ = require('lodash');

const { PREBID_ADAPTERS, docKeys } = require('../../../configs/commonConsts');
const siteModel = require('../../../models/siteModel');
const userModel = require('../../../models/userModel');
const couchbase = require('../../../helpers/couchBaseService');
const { getHbAdsApTag, getHbAdsInnovativeAds } = require('./generateInjectionTechniqueConfig');
const { isValidThirdPartyDFPAndCurrency } = require('../../../helpers/commonFunctions');
const { getBiddersFromNetworkTree } = require('./commonFunctions');

function getHbConfig(siteId) {
	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(`${docKeys.hb}${siteId}`, {}))
		.catch(err => Promise.resolve({}));
}

function getPrebidModules(hbcf) {
	const hbConfig = hbcf.value.hbcf;
	const modules = new Set();

	for (const bidderCode of Object.keys(hbConfig)) {
		const adpater = hbConfig[bidderCode].adapter;
		adpater ? modules.add(adpater) : console.log(`Prebid Adapter not found for ${bidderCode}`);
	}

	return Array.from(modules).join(',');
}

function gdprProcessing(site) {
	const config = site.get('gdpr');
	const apps = site.get('apps');
	return {
		status: !!(config && config.compliance && apps && apps.consentManagement),
		config: {
			gdpr: config
		}
	};
}

function getActiveUsedBiddersWithAdapter(usedBidders, biddersFromNetworkTree) {
	const activeUsedBidders = {};
	for (const bidderCode in usedBidders) {
		if (
			usedBidders.hasOwnProperty(bidderCode) &&
			!usedBidders[bidderCode].isPaused &&
			biddersFromNetworkTree[bidderCode] &&
			biddersFromNetworkTree[bidderCode].isActive
		) {
			activeUsedBidders[bidderCode] = usedBidders[bidderCode];
			activeUsedBidders[bidderCode].adapter = biddersFromNetworkTree[bidderCode].adapter;
		}
	}

	return activeUsedBidders;
}

function HbProcessing(site, apConfigs) {
	const siteId = site.get('siteId');
	const email = site.get('ownerEmail');
	const apps = site.get('apps') || {
		headerBidding: false,
		apTag: false,
		innovativeAds: false,
		apLite: false
	};
	const { apTag, innovativeAds, apLite } = apps;

	return Promise.join(
		getHbConfig(siteId),
		getBiddersFromNetworkTree(),
		userModel.getUserByEmail(email)
	)
		.then(data => {
			if (apLite) return data;

			return Promise.join(
				...data,
				siteModel.getIncontentAndHbAds(siteId),
				getHbAdsApTag(siteId, apTag),
				getHbAdsInnovativeAds(siteId, innovativeAds)
			);
		})
		.then(
			([
				hbcf,
				biddersFromNetworkTree,
				user,
				incontentAndHbAds = {},
				hbAdsApTag = [],
				hbAdsInnovativeAds = []
			]) => {
				let { incontentAds = [], hbAds = [] } = incontentAndHbAds;
				hbAds = hbAds.concat(hbAdsApTag); // Final Hb Ads

				const isValidHBConfig = !!(
					apps.headerBidding &&
					hbcf.value &&
					hbcf.value.hbcf &&
					Object.keys(hbcf.value.hbcf).length &&
					(apLite || hbAds.length || hbAdsInnovativeAds.length)
				);

				if (!isValidHBConfig) {
					// Returning default response if HB is not active
					const resp = {
						status: false,
						ads: {},
						config: {}
					};

					if (!apLite) resp.ads = { incontentAds };

					return resp;
				}

				hbcf.value.hbcf = getActiveUsedBiddersWithAdapter(hbcf.value.hbcf, biddersFromNetworkTree);

				const adServerSettings = user.get('adServerSettings');
				const isValidCurrencyCnfg =
					adServerSettings &&
					adServerSettings.dfp &&
					isValidThirdPartyDFPAndCurrency(adServerSettings.dfp);
				let computedPrebidCurrencyConfig = {};
				let deviceConfig = '';
				let prebidCurrencyConfig = '';
				let prebidAdapters = getPrebidModules(hbcf);

				if (isValidCurrencyCnfg) {
					const activeAdServer = adServerSettings.dfp;
					computedPrebidCurrencyConfig = {
						adServerCurrency: activeAdServer.activeDFPCurrencyCode,
						granularityMultiplier: Number(activeAdServer.prebidGranularityMultiplier) || 1
					};
				}

				if (isValidHBConfig) {
					deviceConfig = hbcf.value.deviceConfig;

					deviceConfig =
						deviceConfig && deviceConfig.sizeConfig.length
							? `,sizeConfig: ${JSON.stringify(deviceConfig.sizeConfig)}`
							: '';

					prebidAdapters = `${prebidAdapters},currency,schain`;

					prebidCurrencyConfig = `,currency: ${JSON.stringify(computedPrebidCurrencyConfig)}`;
				}

				const output = {
					status: isValidHBConfig,
					ads: {},
					config: {
						deviceConfig: deviceConfig || '',
						prebidCurrencyConfig: prebidCurrencyConfig || '',
						prebidCurrencyConfigObj: computedPrebidCurrencyConfig,
						hbcf,
						prebidAdapters
					}
				};

				if (!apLite) output.ads = { hbAds, incontentAds };

				return output;
			}
		);
}

function init(site, computedConfig) {
	const apps = site.get('apps');
	const { apConfigs, prebidConfig, apLiteConfig } = computedConfig;
	let statusesAndAds = {
		statuses: {
			APTAG_ACTIVE: !!apConfigs.manualModeActive,
			INNOVATIVE_ADS_ACTIVE: !!apConfigs.innovativeModeActive,
			LAYOUT_ACTIVE: !(apps && apps.apLite) && !!apConfigs.mode,
			ADPTAG_ACTIVE: !!prebidConfig,
			SPA_ACTIVE: !!apConfigs.isSPA,
			GENIEE_ACTIVE: !!apConfigs.partner,
			AP_LITE_ACTIVE: !!(apps && apps.apLite && apLiteConfig)
		},
		ads: {},
		config: {}
	};

	return Promise.join(HbProcessing(site, apConfigs), gdprProcessing(site), (hb, gdpr) => {
		if (prebidConfig) {
			prebidConfig.currencyConfig = hb.config.prebidCurrencyConfigObj;
			delete hb.config.prebidCurrencyConfigObj;
		}

		statusesAndAds = {
			...statusesAndAds,
			statuses: {
				...statusesAndAds.statuses,
				HB_ACTIVE: hb.status,
				GDPR_ACTIVE: gdpr.status,
				INCONTENT_ACTIVE: !!(hb.ads.incontentAds && hb.ads.incontentAds.length)
			},
			ads: {
				...hb.ads,
				adpTags: prebidConfig
			},
			config: {
				...hb.config,
				...gdpr.config
			}
		};

		if (!(apps && apps.apLite)) statusesAndAds.ads.layoutInventory = apConfigs.experiment;

		const output = {
			apConfigs,
			prebidConfig,
			statusesAndAds
		};

		if (apps && apps.apLite) output.apLiteConfig = apLiteConfig;

		return output;
	}).catch(err => {
		console.log(
			`Error while creating generate config for site ${site.get('siteId')} and Error is ${err}`
		);
		throw err;
	});
}

module.exports = init;
