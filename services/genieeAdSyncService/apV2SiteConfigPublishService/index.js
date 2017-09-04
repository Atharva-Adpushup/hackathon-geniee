var genieePublisher = require('../../../queueWorker/rabbitMQ/workers/genieeAdSyncQueuePublisher'),
	adpTagPublisher = require('../../../queueWorker/rabbitMQ/workers/adpTagAdSyncQueuePublisher'),
	siteConfigGenerationModule = require('./modules/siteConfigGeneration/index'),
	syncCdn = require('../cdnSyncService/index');	
	_ = require('lodash'),
	Promise = require('bluebird'),
	extend = require('extend');

function processing(siteConfigItems, site) {
	
}

function publishToQueueWrapper(siteConfigItems, site) {
	var response = {
		empty: true,
		message: "ZONE_CONFIG_QUEUE_PUBLISH: No unsynced zone for site: " + site.get('siteId')
	};
	if (!Object.keys(siteConfigItems).length) {
		return response;
	}
	function processing() {
		let genieeUnsynced = !!(siteConfigItems.geniee && siteConfigItems.geniee && siteConfigItems.geniee.length),
			adpUnsynced = !!(siteConfigItems.adp && siteConfigItems.adp.ads && siteConfigItems.adp.ads.length);
		if (genieeUnsynced || adpUnsynced) {
			if (genieeUnsynced) {
				return Promise.map(siteConfigItems.geniee, (item) => genieePublisher.publish(item));
			}
			if (adpUnsynced) {
				return adpTagPublisher.publish(siteConfigItems.adp);
			}
		} else {
			return syncCdn(site);
		}
	}
	return processing()
	.then(() => Object.assign(response, {
		empty: false,
		message: "ZONE_CONFIG_QUEUE_PUBLISH: Successfully published zones into queue for site: " + site.get('siteId')
	}));
}

module.exports = {
	publish: function (siteModel) {
		return siteConfigGenerationModule
		.generate(siteModel)
		.then(siteConfigItems => publishToQueueWrapper(siteConfigItems, siteModel));
	}
};