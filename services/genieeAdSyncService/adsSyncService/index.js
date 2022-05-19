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
function publishToQueueWrapper(siteConfigItems, site, forcePrebidBuild) {
	const response = {
		empty: true,
		message: `ADS_SYNC_QUEUE_PUBLISH: No unsynced ads for site: ${site.get('siteId')}`
	};
	const jobs = [];
	if (!Object.keys(siteConfigItems).length) {
		return response;
	}
	function processing() {
		const { geniee, adp, adsense, genieeDFP } = siteConfigItems;
		const hasUnsyncedGenieeAds = !!(geniee && geniee.length);
		const hasUnsyncedAdpAds = !!(adp && adp.ads && adp.ads.length);
		const hasUnsyncedAdsenseAds = !!(adsense && adsense.ads && adsense.ads.length);
		const hasUnsyncedGenieeDFPAds = !!(genieeDFP && genieeDFP.length);

		hasUnsyncedGenieeAds ? _.forEach(geniee, item => jobs.push(genieePublishWrapper(item))) : null;
		hasUnsyncedGenieeDFPAds
			? _.forEach(genieeDFP, item => jobs.push(adpTagPublisherWrapper(item)))
			: null;
		hasUnsyncedAdpAds ? jobs.push(adpTagPublisherWrapper(adp)) : null;
		hasUnsyncedAdsenseAds ? jobs.push(adsensePublisherWrapper(adsense)) : null;

		const allAdsSynced =
			!(hasUnsyncedGenieeAds || hasUnsyncedAdpAds || hasUnsyncedGenieeDFPAds || hasUnsyncedAdsenseAds) ||
			!jobs.length;
		if (allAdsSynced) {
			return Promise.resolve(response);
		}

		return Promise.all(jobs).then(() => ({
			...response,
			empty: false,
			message: `ADS_SYNC_QUEUE_PUBLISH: Successfully published ads into queue for site: ${site.get(
				'siteId'
			)}`
		}));
	}
	return processing().then(response =>
		// syncCdn publishes a job in either consoleCdnSync or selectiveRollOut queue 
		response.empty ? syncCdn(site, forcePrebidBuild) : response
	);
}
function publishWrapper(site, forcePrebidBuild) {
	return siteConfigGenerationModule
		.generate(site)
		.then(siteConfigItems => publishToQueueWrapper(siteConfigItems, site, forcePrebidBuild));
}

module.exports = {
	publish(siteId, forcePrebidBuild) {
		const parsedSiteId = parseInt(siteId, 10);
		if (!isNaN(parsedSiteId)) {
			const siteId = parsedSiteId.toString();
			return siteModelAPI
				.getSiteById(siteId)
				.then(siteModel => publishWrapper(siteModel, forcePrebidBuild));
		}

		// assuming that siteId is instance of SiteModel
		return publishWrapper(siteId, forcePrebidBuild);
	}
};
