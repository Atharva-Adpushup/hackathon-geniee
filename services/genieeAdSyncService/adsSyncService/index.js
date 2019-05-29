const _ = require('lodash');
const Promise = require('bluebird');
const genieePublisher = require('../../../queueWorker/rabbitMQ/workers/genieeAdSyncQueuePublisher');
const adpTagPublisher = require('../../../queueWorker/rabbitMQ/workers/adpTagAdSyncQueuePublisher');
const adsensePublisher = require('../../../queueWorker/rabbitMQ/workers/adsenseAdSyncQueuePublisher');
const siteConfigGenerationModule = require('./modules/siteConfigGeneration/index');
const syncCdn = require('../cdnSyncService/index');

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
function publishToQueueWrapper(siteConfigItems, site) {
	const response = {
		empty: true,
		message: 'ADS_SYNC_QUEUE_PUBLISH: No unsynced ads for site: ' + site.get('siteId')
	};
	const jobs = [];
	if (!Object.keys(siteConfigItems).length) {
		return response;
	}
	function processing() {
		const { geniee, adp, adsense, genieeDFP } = siteConfigItems;
		const genieeUnsynced = !!(geniee && geniee.length);
		const adpUnsynced = !!(adp && adp.ads && adp.ads.length);
		const adsenseUnsynced = !!(adsense && adsense.ads && adsense.ads.length);
		const genieeDFPUnsynced = !!(genieeDFP && genieeDFP.length);

		genieeUnsynced ? _.forEach(geniee, item => jobs.push(genieePublishWrapper(item))) : null;
		genieeDFPUnsynced ? _.forEach(genieeDFP, item => jobs.push(adpTagPublisherWrapper(genieeDFP))) : null;
		adpUnsynced ? jobs.push(adpTagPublisherWrapper(adp)) : null;
		adsenseUnsynced ? jobs.push(adsensePublisherWrapper(adsense)) : null;

		const shouldPushToCdn = !(genieeUnsynced || adpUnsynced || genieeDFPUnsynced) || !jobs.length;
		if (shouldPushToCdn) {
			return Promise.resolve(response);
		}

		return Promise.all(jobs).then(() => {
			return {
				...response,
				empty: false,
				message: 'ADS_SYNC_QUEUE_PUBLISH: Successfully published ads into queue for site: ' + site.get('siteId')
			};
		});
	}
	return processing().then(response => (response.empty ? syncCdn(site) : response));
}

module.exports = {
	publish: function(siteModel) {
		return siteConfigGenerationModule
			.generate(siteModel)
			.then(siteConfigItems => publishToQueueWrapper(siteConfigItems, siteModel));
	}
};
