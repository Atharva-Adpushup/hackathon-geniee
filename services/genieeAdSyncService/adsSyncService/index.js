const Promise = require('bluebird');
const siteConfigGenerationModule = require('./modules/siteConfigGeneration/index');
const syncCdn = require('../cdnSyncService/index');
const siteModelAPI = require('../../../models/siteModel');
const adSyncServiceUtils = require('./modules/misc');
const {
	getSelectiveRolloutFeatureConfig,
	getSelectiveRolloutSiteConfig,
	isMasterDeployment,
	isFeatureDeployment
} = require('../../../helpers/commonFunctions');
const queuePublisher = require('../../../queueWorker/rabbitMQ/workers/queuePublisher');

async function syncAds(siteConfigItems, selectiveRolloutFeatureConfig) {
	const { adp, adsense } = siteConfigItems;
	const adSyncingJobs = [];
	const { ADP_TAG_SYNC, ADSENSE_AD_SYNC } = adSyncServiceUtils.getAdSyncQueueConfigs(
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

async function publishToQueueWrapper(site, siteConfigItems, syncOptions) {
	const { selectiveRolloutFeatureConfig, options = {} } = syncOptions;

	const response = {
		empty: true,
		message: `ADS_SYNC_QUEUE_PUBLISH: No unsynced ads for site: ${site.get('siteId')}`
	};

	if (!Object.keys(siteConfigItems).length) {
		return response;
	}

	if (adSyncServiceUtils.isSiteConfigHasUnSyncedAds(siteConfigItems)) {
		return syncAds(siteConfigItems, selectiveRolloutFeatureConfig);
	} else {
		const syncCdnQueue = adSyncServiceUtils.getSyncCdnQueueConfig(
			site,
			selectiveRolloutFeatureConfig
		);
		return syncCdn(site, {
			options,
			syncCdnQueue
		});
	}
}

async function syncSite(site, syncOptions) {
	return siteConfigGenerationModule
		.generate(site)
		.then(siteConfigItems => publishToQueueWrapper(site, siteConfigItems, syncOptions));
}

async function handleSelectiveDeploymentSync(site, selectiveRolloutFeatureConfig, options) {
	const siteId = site.get('siteId');

	if (isFeatureDeployment(selectiveRolloutFeatureConfig.feature)) {
		return syncSite(site, { options, selectiveRolloutFeatureConfig });
	}

	return adSyncServiceUtils.redirectSyncToMasterConsole(siteId, options);
}

async function handleMasterDeploymentSync(site, selectiveRolloutFeatureConfig, options) {
	const siteId = site.get('siteId');
	const isConsoleSelectivelyRolledOut = adSyncServiceUtils.isConsoleSelectivelyRolledOut(
		selectiveRolloutFeatureConfig
	);

	if (isConsoleSelectivelyRolledOut) {
		return adSyncServiceUtils.redirectToSelectiveConsole(
			selectiveRolloutFeatureConfig,
			siteId,
			options
		);
	}

	return syncSite(site, { options, selectiveRolloutFeatureConfig });
}

async function syncSelectiveRolloutSite(site, selectiveRolloutConfig, options) {
	const selectiveRolloutFeatureConfig = await getSelectiveRolloutFeatureConfig(
		selectiveRolloutConfig.feature
	);

	if (isMasterDeployment()) {
		return handleMasterDeploymentSync(site, selectiveRolloutFeatureConfig, options);
	}

	return handleSelectiveDeploymentSync(site, selectiveRolloutFeatureConfig, options);
}

async function syncNonSelectiveRolloutSite(site, options) {
	const siteId = site.get('siteId');
	if (!isMasterDeployment()) {
		return adSyncServiceUtils.redirectSyncToMasterConsole(siteId, options);
	}

	return syncSite(site, { options });
}

async function publishWrapper(site, forcePrebidBuild, options = {}) {
	const selectiveRolloutConfig = await getSelectiveRolloutSiteConfig(site);

	const isSelectiveRolloutEnabled = adSyncServiceUtils.isSelectiveRolloutEnabled(
		selectiveRolloutConfig
	);

	const syncOptions = { forcePrebidBuild, ...options };

	if (isSelectiveRolloutEnabled) {
		return syncSelectiveRolloutSite(site, selectiveRolloutConfig, syncOptions);
	}

	return syncNonSelectiveRolloutSite(site, syncOptions);
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
