const Promise = require('bluebird');
const _ = require('lodash');

const { PREBID_ADAPTERS } = require('../../../configs/commonConsts');
const siteModel = require('../../../models/siteModel');
const couchbase = require('../../../helpers/couchBaseService');
const { getHbAdsApTag } = require('./generateAPTagConfig');
const { isValidThirdPartyDFPAndCurrency } = require('../../../helpers/commonFunctions');

function getHbConfig(siteId) {
	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(`hbcf::${siteId}`, {}))
		.catch(err => Promise.resolve({}));
}

function getPrebidModules(hbcf) {
	const { hbConfig: { bidderAdUnits = {} } = {} } = hbcf.value;
	const modules = new Set();

	_.forEach(bidderAdUnits, adUnits => {
		_.forEach(adUnits, adUnit => {
			_.forEach(adUnit, values => {
				const adpater = PREBID_ADAPTERS[values.bidder];
				adpater ? modules.add(adpater) : console.log(`Prebid Adapter not found for ${values.bidder}`);
			});
		});
	});

	return Array.from(modules).join(',');
}

function gdprProcessing(site) {
	const config = site.get('gdpr');
	return {
		status: config && config.compliance,
		config: {
			gdpr: config
		}
	};
}

function HbProcessing(site, apConfigs) {
	const siteId = site.get('siteId');
	const isManual = site.get('isManual');

	return Promise.join(
		getHbConfig(siteId),
		siteModel.getIncontentAndHbAds(siteId),
		getHbAdsApTag(siteId, isManual),
		(hbcf, incontentAndHbAds, hbAdsApTag) => {
			let { incontentAds = [], hbAds = [] } = incontentAndHbAds;
			hbAds = hbAds.concat(hbAdsApTag); // Final Hb Ads
			const isValidHBConfig = !!(hbcf.value && hbcf.value.hbConfig && hbAds.length);

			if (!isValidHBConfig) {
				// Returning default response if HB is not active
				return {
					status: false,
					ads: {
						incontentAds
					},
					config: {}
				};
			}

			let isValidCurrencyCnfg = isValidThirdPartyDFPAndCurrency(apConfigs);
			let computedPrebidCurrencyConfig = {};
			let deviceConfig = '';
			let prebidCurrencyConfig = '';
			let prebidAdapters = getPrebidModules(hbcf);

			if (isValidCurrencyCnfg) {
				computedPrebidCurrencyConfig = {
					adServerCurrency: apConfigs.activeDFPCurrencyCode,
					granularityMultiplier: Number(apConfigs.prebidGranularityMultiplier),
					rates: apConfigs.activeDFPCurrencyExchangeRate
				};
			}

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

				deviceConfig =
					deviceConfig && deviceConfig.sizeConfig.length
						? ',sizeConfig: ' + JSON.stringify(deviceConfig.sizeConfig)
						: '';

				if (isValidCurrencyConfig) {
					prebidCurrencyConfig = ',currency: ' + JSON.stringify(computedPrebidCurrencyConfig);
					prebidAdapters = `${prebidAdapters},currency`;
				}
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
					hbcf,
					prebidAdapters: prebidAdapters
				}
			};
		}
	);
}

function init(site, computedConfig) {
	const { apConfigs, adpTagsConfig } = computedConfig;
	let statusesAndAds = {
		statuses: {
			APTAG_ACTIVE: !!(apConfigs.manualModeActive && apConfigs.manualAds && apConfigs.manualAds.length),
			// Adding Innovative Ads Module based on flag value set in site doc "isInnovative", done to support legacy
			// Adpushup Editor Interactive Ads
			// Remove when new dashboard is live
			INNOVATIVE_ADS_ACTIVE: !!apConfigs.innovativeModeActive,

			// Below is the new condition which is compatible with new dashboard
			// Uncomment the below code when new dashboard is live
			// INNOVATIVE_ADS_ACTIVE: !!(
			// 	apConfigs.innovativeModeActive &&
			// 	apConfigs.innovativeAds &&
			// 	apConfigs.innovativeAds.length
			// ),

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
		console.log(`Error while creating generate config for site ${site.get('siteId')} and Error is ${err}`);
		throw err;
	});
}

module.exports = init;