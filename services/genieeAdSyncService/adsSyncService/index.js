const _ = require('lodash');
const Promise = require('bluebird');
const genieePublisher = require('../../../queueWorker/rabbitMQ/workers/genieeAdSyncQueuePublisher');
const adpTagPublisher = require('../../../queueWorker/rabbitMQ/workers/adpTagAdSyncQueuePublisher');
const transactionLogPublisher = require('../../../queueWorker/rabbitMQ/workers/transactionLogSyncQueuePublisher');
const siteConfigGenerationModule = require('./modules/siteConfigGeneration/index');
const syncCdn = require('../cdnSyncService/index');

function genieePublishWrapper(item) {
	return genieePublisher.publish(item);
}
function adpTagPublisherWrapper(item) {
	return adpTagPublisher.publish(item);
}
function publishToQueueWrapper(siteConfigItems, site) {
	var response = {
			empty: true,
			message: 'ZONE_CONFIG_QUEUE_PUBLISH: No unsynced zone for site: ' + site.get('siteId')
		},
		jobs = [];
	if (!Object.keys(siteConfigItems).length) {
		return response;
	}
	function processing() {
		const genieeUnsynced = !!(siteConfigItems.geniee && siteConfigItems.geniee.length);
		const adpUnsynced = !!(siteConfigItems.adp && siteConfigItems.adp.ads && siteConfigItems.adp.ads.length);
		const genieeDFPUnsynced = !!(siteConfigItems.genieeDFP && siteConfigItems.genieeDFP.length);
		const logsUnsynced = !!(siteConfigItems.logs && siteConfigItems.logs.ads && siteConfigItems.logs.ads.length);

		genieeUnsynced ? _.forEach(siteConfigItems.geniee, item => jobs.push(genieePublishWrapper(item))) : null;
		genieeDFPUnsynced
			? _.forEach(siteConfigItems.genieeDFP, item => jobs.push(adpTagPublisherWrapper(siteConfigItems.genieeDFP)))
			: null;
		adpUnsynced ? jobs.push(adpTagPublisherWrapper(siteConfigItems.adp)) : null;
		logsUnsynced ? jobs.push(transactionLogPublisher.publish(siteConfigItems.logs)) : null;

		if (!(genieeUnsynced || adpUnsynced || genieeDFPUnsynced || logsUnsynced) || !jobs.length) {
			return Promise.resolve(response);
		}
		return Promise.all(jobs).then(() => {
			return Object.assign(response, {
				empty: false,
				message:
					'ZONE_CONFIG_QUEUE_PUBLISH: Successfully published zones into queue for site: ' + site.get('siteId')
			});
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
