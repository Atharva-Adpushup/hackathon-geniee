const _ = require('lodash');
const Promise = require('bluebird');
const genieePublisher = require('../../../queueWorker/rabbitMQ/workers/genieeAdSyncQueuePublisher');
const adpTagPublisher = require('../../../queueWorker/rabbitMQ/workers/adpTagAdSyncQueuePublisher');
const adsensePublisher = require('../../../queueWorker/rabbitMQ/workers/adsenseAdSyncQueuePublisher');
const siteConfigGenerationModule = require('./modules/siteConfigGeneration/index');
const syncCdn = require('../cdnSyncService/index');
const siteModelAPI = require('../../../models/siteModel');

// No need for these wrapper functions. Can remove.
function genieePublishWrapper(item) {
	return genieePublisher.publish(item);
}
function adpTagPublisherWrapper(item) {
	return adpTagPublisher.publish(item);
}
function adsensePublisherWrapper(item) {
	return adsensePublisher.publish(item);
}
function publishToQueueWrapper(siteConfigItems, siteOptions) {
    const { site, forcePrebidBuild, options = {}} = siteOptions
	const jobs = [];
	const response = {
		empty: true,
		message: `ADS_SYNC_QUEUE_PUBLISH: No unsynced ads for site: ${site.get('siteId')}`
	};

	if (!Object.keys(siteConfigItems).length) {
		return response;
	}

	function processing() {
		const { adp, adsense, genieeDFP } = siteConfigItems;
		const hasUnsyncedAdpAds = !!(adp && adp.ads && adp.ads.length);
		const hasUnsyncedAdsenseAds = !!(adsense && adsense.ads && adsense.ads.length);

		hasUnsyncedAdpAds ? jobs.push(adpTagPublisherWrapper(adp)) : null;
		hasUnsyncedAdsenseAds ? jobs.push(adsensePublisherWrapper(adsense)) : null;

		const allAdsSynced = (!hasUnsyncedAdpAds && !hasUnsyncedAdsenseAds) || !jobs.length;

		if (allAdsSynced) {
			return Promise.resolve(response);
		}

		console.log('---'.repeat(20));
		hasUnsyncedAdpAds && console.log(`Unsynced Adp ads ${adp.ads.length} (excluding refresh ad units count)`);
		hasUnsyncedAdsenseAds && console.log(`Unsynced Adsense ads ${adsense.ads.length}`);
		console.log('---'.repeat(20));
        
		return Promise.all(jobs).then(() => ({
			...response,
			empty: false,
			message: `ADS_SYNC_QUEUE_PUBLISH: Successfully published ads into queue for site: ${site.get(
				'siteId'
			)}`
		}));
	}
    const useDirect = false;
	return processing().then(response =>
		// syncCdn publishes a job in either consoleCdnSync or selectiveRollOut queue
		response.empty ? syncCdn(site, {forcePrebidBuild, useDirect, options}) : response
	);
}
function publishWrapper(site, forcePrebidBuild, options = {}) {
	return siteConfigGenerationModule
		.generate(site)
		.then(siteConfigItems => publishToQueueWrapper(siteConfigItems, {site, forcePrebidBuild, options}));
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
