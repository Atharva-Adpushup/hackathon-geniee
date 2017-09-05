var genieePublisher = require('../../../queueWorker/rabbitMQ/workers/genieeAdSyncQueuePublisher'),
	adpTagPublisher = require('../../../queueWorker/rabbitMQ/workers/adpTagAdSyncQueuePublisher'),
	siteConfigGenerationModule = require('./modules/siteConfigGeneration/index'),
	syncCdn = require('../cdnSyncService/index');
_ = require('lodash'),
	Promise = require('bluebird'),
	extend = require('extend');

function genieePublishWrapper(item) {
	return genieePublisher.publish(item);
}
function adpTagPublisherWrapper(item) {
	return adpTagPublisher.publish(item)
}
function publishToQueueWrapper(siteConfigItems, site) {
	var response = {
		empty: true,
		message: "ZONE_CONFIG_QUEUE_PUBLISH: No unsynced zone for site: " + site.get('siteId')
	}, jobs = [];
	if (!Object.keys(siteConfigItems).length) {
		return response;
	}
	function processing() {
		let genieeUnsynced = !!(siteConfigItems.geniee && siteConfigItems.geniee && siteConfigItems.geniee.length),
			adpUnsynced = !!(siteConfigItems.adp && siteConfigItems.adp.ads && siteConfigItems.adp.ads.length);

		genieeUnsynced ? _.forEach(siteConfigItems.geniee, (item) => jobs.push(genieePublishWrapper(item))) : null;
		adpUnsynced ? jobs.push(adpTagPublisherWrapper(siteConfigItems.adp)) : null;

		if (!(genieeUnsynced || adpUnsynced) || !jobs.length) {
			return Promise.resolve(response);
		}
		return Promise.all(jobs)
		.then(() => {
			return Object.assign(response, {
				empty: false,
				message: "ZONE_CONFIG_QUEUE_PUBLISH: Successfully published zones into queue for site: " + site.get('siteId')
			});
		});
	}
	return processing()
	.then(response => response.empty ? syncCdn(site) : response);
}

module.exports = {
	publish: function (siteModel) {
		return siteConfigGenerationModule
			.generate(siteModel)
			.then(siteConfigItems => publishToQueueWrapper(siteConfigItems, siteModel));
	}
};