const Promise = require('bluebird');
const _ = require('lodash');

const { PREBID_ADAPTERS } = require('../../../configs/commonConsts');
const siteModel = require('../../../models/siteModel');
const userModel = require('../../../models/userModel');
const couchbase = require('../../../helpers/couchBaseService');
const { getHbAdsApTag } = require('./generateAPTagConfig');
const { isValidThirdPartyDFPAndCurrency } = require('../../../helpers/commonFunctions');

function getHbConfig(siteId) {
	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(`hbcf::${siteId}`, {}))
		.catch(err => Promise.resolve({}));
}

function getBiddersFromNetworkTree() {
	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(`data::apNetwork`, {}))
		.then(({ value: networkTree }) => {
			const biddersFromNetworkTree = {};

			for (const bidderCode in networkTree) {
				if (networkTree.hasOwnProperty(bidderCode) && networkTree[bidderCode].isHb) {
					biddersFromNetworkTree[bidderCode] = networkTree[bidderCode];
				}
			}

			return biddersFromNetworkTree;
		})
		.catch(err => Promise.resolve({}));
}

function getPrebidModules(hbcf) {
	const hbConfig = hbcf.value.hbcf;
	const modules = new Set();

	for (const bidderCode of Object.keys(hbConfig)) {
		const adpater = PREBID_ADAPTERS[bidderCode];
		adpater ? modules.add(adpater) : console.log(`Prebid Adapter not found for ${bidderCode}`);
	}

	return Array.from(modules).join(',');
}

function gdprProcessing(site) {
	const config = site.get('gdpr');
	const apps = site.get('apps') || { consentManagement: false };
	return {
		status: config && config.compliance && apps.consentManagement,
		config: {
			gdpr: config
		}
	};
}

function getActiveUsedBidders(usedBidders, biddersFromNetworkTree) {
	const activeUsedBidders = {};
	for (const bidderCode in usedBidders) {
		if (
			usedBidders.hasOwnProperty(bidderCode) &&
			!usedBidders[bidderCode].isPaused &&
			biddersFromNetworkTree[bidderCode] &&
			biddersFromNetworkTree[bidderCode].isActive
		) {
			activeUsedBidders[bidderCode] = usedBidders[bidderCode];
		}
	}

	return activeUsedBidders;
}

function HbProcessing(site, apConfigs) {
	const siteId = site.get('siteId');
	const email = site.get('ownerEmail');
	const isManual = site.get('isManual');
	const apps = site.get('apps') || { headerBidding: false };

	return Promise.join(
		getHbConfig(siteId),
		getBiddersFromNetworkTree(),
		siteModel.getIncontentAndHbAds(siteId),
		getHbAdsApTag(siteId, isManual),
		userModel.getUserByEmail(email),
		(hbcf, biddersFromNetworkTree, incontentAndHbAds, hbAdsApTag, user) => {
			let { incontentAds = [], hbAds = [] } = incontentAndHbAds;
			hbAds = hbAds.concat(hbAdsApTag); // Final Hb Ads
			const isValidHBConfig = !!(
				apps.headerBidding &&
				hbcf.value &&
				hbcf.value.hbcf &&
				hbAds.length
			);

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

			hbcf.value.hbcf = getActiveUsedBidders(hbcf.value.hbcf, biddersFromNetworkTree);

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
						? `,sizeConfig: ${JSON.stringify(deviceConfig.sizeConfig)}`
						: '';

				if (isValidCurrencyConfig) {
					prebidCurrencyConfig = `,currency: ${JSON.stringify(computedPrebidCurrencyConfig)}`;
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
					deviceConfig: deviceConfig || '',
					prebidCurrencyConfig: prebidCurrencyConfig || '',
					prebidCurrencyConfigObj: computedPrebidCurrencyConfig,
					hbcf,
					prebidAdapters
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
			// Adding Innovative Ads Module based on flag value set in site doc "isInnovative", done to support legacy
			// Adpushup Editor Interactive Ads
			// Remove when new dashboard is live
			// INNOVATIVE_ADS_ACTIVE: !!apConfigs.innovativeModeActive,

			// Below is the new condition which is compatible with new dashboard
			// Uncomment the below code when new dashboard is live
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
		if (adpTagsConfig.prebidConfig) {
			adpTagsConfig.prebidConfig.currencyConfig = hb.config.prebidCurrencyConfigObj;
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
		console.log(
			`Error while creating generate config for site ${site.get('siteId')} and Error is ${err}`
		);
		throw err;
	});
}

module.exports = init;
