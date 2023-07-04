const Promise = require('bluebird');
const siteConfigGenerationModule = require('./modules/siteConfigGeneration/index');
const syncCdn = require('../cdnSyncService/index');
const siteModelAPI = require('../../../models/siteModel');
const adSyncServiceUtils = require('./modules/misc');
const { getSelectiveRolloutFeatureConfig } = require('../../../helpers/commonFunctions');
const queuePublisher = require('../../../queueWorker/rabbitMQ/workers/queuePublisher');

async function syncAds(siteConfigItems, isSelectiveRolloutEnabled, selectiveRolloutFeatureConfig) {
	const { adp, adsense } = siteConfigItems;
	const adSyncingJobs = [];
	const { ADP_TAG_SYNC, ADSENSE_AD_SYNC } = adSyncServiceUtils.getAdSyncQueueConfigs(
		isSelectiveRolloutEnabled,
		selectiveRolloutFeatureConfig
	);

	if (adSyncServiceUtils.hasUnsyncedAdpAds(adp)) {
		adSyncingJobs.push(queuePublisher.publish(ADP_TAG_SYNC, adp));
	}

	if (adSyncServiceUtils.hasUnsyncedAdsenseAds(adsense)) {
		adSyncingJobs.push(queuePublisher.publish(ADSENSE_AD_SYNC, adsense));
	}

	return Promise.all(adSyncingJobs);
}

async function publishToQueueWrapper(siteConfigItems, siteOptions) {
	const {
		site,
		forcePrebidBuild,
		isSelectiveRolloutEnabled,
		selectiveRolloutFeatureConfig,
		options = {}
	} = siteOptions;

	const response = {
		empty: true,
		message: `ADS_SYNC_QUEUE_PUBLISH: No unsynced ads for site: ${site.get('siteId')}`
	};

	if (!Object.keys(siteConfigItems).length) {
		return response;
	}

	if (adSyncServiceUtils.isSiteConfigHasUnSyncedAds(siteConfigItems)) {
		return syncAds(siteConfigItems, isSelectiveRolloutEnabled, selectiveRolloutFeatureConfig);
	} else {
		const syncCdnQueue = adSyncServiceUtils.getSyncCdnQueueConfig(
			site,
			isSelectiveRolloutEnabled,
			selectiveRolloutFeatureConfig
		);
		return syncCdn(site, {
			forcePrebidBuild,
			options,
			syncCdnQueue
		});
	}
}
async function publishWrapper(site, forcePrebidBuild, options = {}) {
	const { selectiveRolloutConfig } = site.get('apConfigs') || {};

	const isSelectiveRolloutEnabled = adSyncServiceUtils.isSelectiveRolloutEnabled(
		selectiveRolloutConfig
	);

	const selectiveRolloutFeatureConfig = isSelectiveRolloutEnabled
		? await getSelectiveRolloutFeatureConfig(selectiveRolloutConfig.feature)
		: null;

	const isConsoleSelectivelyRolledOut = adSyncServiceUtils.isConsoleSelectivelyRolledOut(
		isSelectiveRolloutEnabled,
		selectiveRolloutFeatureConfig
	);

	if (isConsoleSelectivelyRolledOut) {
		return adSyncServiceUtils.redirectToSelectiveConsole(
			selectiveRolloutFeatureConfig,
			site.get('siteId'),
			{
				forcePrebidBuild,
				...options
			}
		);
	}

	return siteConfigGenerationModule.generate(site).then(siteConfigItems =>
		publishToQueueWrapper(siteConfigItems, {
			site,
			forcePrebidBuild,
			options,
			isSelectiveRolloutEnabled,
			selectiveRolloutFeatureConfig
		})
	);
}

module.exports = {
	publish(siteId, forcePrebidBuild, options = {}) {
		const parsedSiteId = parseInt(siteId, 10);
		if (!isNaN(parsedSiteId)) {
			const siteId = parsedSiteId.toString();
			return siteModelAPI
				.getSiteById(siteId)
				.then(siteModel => publishWrapper(siteModel, forcePrebidBuild, options));
		}

		// assuming that siteId is instance of SiteModel
		return publishWrapper(siteId, forcePrebidBuild, options);
	}
};
