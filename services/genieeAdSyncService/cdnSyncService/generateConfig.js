const Promise = require('bluebird');

const siteModel = require('../../../models/siteModel');
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
	};
}

function HbProcessing(site, apConfigs) {
	const siteId = site.get('siteId');
	const isManual = site.get('isManual');

	return Promise.join(
		getHbConfig(),
		siteModel.getIncontentAndHbAds(siteId),
		getHbAdsApTag(siteId, isManual),
		(hbcf, incontentAndHbAds, hbAdsApTag) => {
			let { incontentAds, hbAds } = incontentAndHbAds;
			let isValidCurrencyCnfg = isValidThirdPartyDFPAndCurrency(apConfigs);
			let computedPrebidCurrencyConfig = {};
			let deviceConfig = false;
			let prebidCurrencyConfig = false;

			// Final Hb Ads
			hbAds = hbAds.concat(hbAdsApTag);

			if (isValidCurrencyCnfg) {
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

			const isValidHBConfig = !!(hbcf.value && hbcf.value.hbConfig && hbAds.length);
			const isValidCurrencyConfig = !!(
				isValidHBConfig &&
				computedPrebidCurrencyConfig &&
				Object.keys(computedPrebidCurrencyConfig).length &&
				computedPrebidCurrencyConfig.adServerCurrency &&
				computedPrebidCurrencyConfig.granularityMultiplier &&
				computedPrebidCurrencyConfig.rates
			);

			if (isValidHBConfig) {
				deviceConfig = hbcf.value.deviceConfig;
				prebidCurrencyConfig = computedPrebidCurrencyConfig;

				deviceConfig =
					deviceConfig && deviceConfig.sizeConfig.length
						? ',sizeConfig: ' + JSON.stringify(deviceConfig.sizeConfig)
						: '';
				prebidCurrencyConfig = isValidCurrencyConfig
					? ',currency: ' + JSON.stringify(prebidCurrencyConfig)
					: '';
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
			};
		}
	);
}

function init(site, computedConfig) {
	const { apConfigs, adpTagsConfig } = computedConfig;
	let statusesAndAds = {
		statuses: {
			APTAG_ACTIVE: !!apConfigs.manualModeActive,
			INNOVATIVE_ADS_ACTIVE: !!apConfigs.innovativeModeActive,
			LAYOUT_ACTIVE: !!apConfigs.mode || false,
			ADPTAG_ACTIVE: !!adpTagsConfig,
			SPA_ACTIVE: !!apConfigs.isSPA,
			GENIEE_ACTIVE: !!apConfigs.partner
		},
		ads: {},
		config: {}
	};

	return Promise.join(HbProcessing(site, apConfigs), gdprProcessing(site), (hb, gdpr) => {
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
				adpTags: adpTagsConfig,
				layoutInventory: apConfigs.experiment
			},
			config: {
				...hb.config,
				...gdpr.config
			}
		};

		return {
			apConfigs,
			adpTagsConfig,
			statusesAndAds
		};
	}).catch(err => {
		console.log(err);
	});
}

module.exports = init;
