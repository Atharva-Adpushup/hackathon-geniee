const Promise = require('bluebird');

const siteModel = require('../../../models/siteModel')
const couchbase = require('../../../helpers/couchBaseService');
const { getHbAdsApTag } = require('./generateAPTagConfig');
const { isValidThirdPartyDFPAndCurrency } = require('../../../helpers/commonFunctions');

function getHbConfig() {
	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(`hbcf::${site.get('siteId')}`, {}))
		.catch(err => Promise.resolve({}));
}

function gdprProcessing(site) {
	const config = site.get('gdpr');
	return {
		status: !!config,
		config: {
			gdpr: config
		}
	} 
}

function HbProcessing(site, apConfigs) {
	const siteId = site.get('siteId');
	const isManual = site.get('isManual');

	return Promise.join(
		getHbConfig(),
		siteModel.getIncontentAndHbAds(siteId),
		getHbAdsApTag(siteId, isManual),
		(hbcf, incontentAndHbAds, hbAdsApTag) => {
			let	{ incontentAds, hbAds } = incontentAndHbAds;
			let	isValidCurrencyConfig = isValidThirdPartyDFPAndCurrency(apConfigs);
			let	computedPrebidCurrencyConfig = {};

			// Final Hb Ads
			hbAds = hbAds.concat(hbAdsApTag);

			if (isValidCurrencyConfig) {
				computedPrebidCurrencyConfig = {
					adServerCurrency: apConfigs.activeDFPCurrencyCode,
					granularityMultiplier: Number(apConfigs.prebidGranularityMultiplier),
					rates: {
						USD: {
							[apConfigs.activeDFPCurrencyCode]: Number(apConfigs.activeDFPCurrencyExchangeRate)
						}
					}
				};
			}

			const isValidHBConfig = !!(
				hbcf.value &&
				hbcf.value.hbConfig &&
				hbAds.length
			);
			const isValidCurrencyConfig = !!(
				isValidHBConfig &&
				computedPrebidCurrencyConfig &&
				Object.keys(computedPrebidCurrencyConfig).length &&
				computedPrebidCurrencyConfig.adServerCurrency &&
				computedPrebidCurrencyConfig.granularityMultiplier &&
				computedPrebidCurrencyConfig.rates
			);

			if (isValidHBConfig) {
				let { deviceConfig } = hbcf.value;
				let prebidCurrencyConfig = computedPrebidCurrencyConfig;

				deviceConfig = deviceConfig && deviceConfig.sizeConfig.length ?  ',sizeConfig: ' + JSON.stringify(deviceConfig.sizeConfig) : '';
				prebidCurrencyConfig = isValidCurrencyConfig ? ',currency: ' + JSON.stringify(prebidCurrencyConfig) : '';
			}

			return {
				status: isValidHBConfig,
				ads: {
					hbAds,
					incontentAds
				},
				config: {
					deviceConfig: deviceConfig ? deviceConfig : '',
					prebidCurrencyConfig: prebidCurrencyConfig ? prebidCurrencyConfig : '',
					hbcf
				}
			}
		}
	)
}

function init(site, computedConfig) {
	// const apConfigs = site.get('apConfigs') || {};
	const { apConfigs, adpTagsConfig } = computedConfig;
	const statusesAndAds = {
		statuses: {
			isApTagActive: !!apConfigs.manualModeActive,
			isInnovativeAdsActive: !!apConfigs.innovativeModeActive,
			isLayoutActive: !!apConfigs.mode || false,
			isAdpTagsActive: !!adpTagsConfig
		},
		ads: {},
		config: {}
	}

	return Promise.join(
		HbProcessing(site, apConfigs),
		gdprProcessing(site),
		(hb, gdpr) => {
			statusesAndAds = {
				...statusesAndAds,
				statuses: {
					...statusesAndAds.statuses,
					isHbActive: hb.status,
					isGdprActive: gdpr.status,
					isIncontentActive: !!(hb.ads.incontentAds && hb.ads.incontentAds.length)
				},
				ads: {
					...hb.ads,
					adpTags: adpTagsConfig,
					layoutInventory: apConfigs.experiment
				},
				config: {
					...hb.config,
					...gdpr.config
				}
			}

			return {
				apConfigs,
				adpTagsConfig,
				statusesAndAds
			}
	})
}

module.exports = {
	init
}