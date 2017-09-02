var genieePublisher = require('../../../queueWorker/rabbitMQ/workers/genieeAdSyncQueuePublisher'),
	adpTagPublisher = require('../../../queueWorker/rabbitMQ/workers/adpTagAdSyncQueuePublisher'),
	siteConfigGenerationModule = require('./modules/siteConfigGeneration/index'),
	syncCdn = require('../cdnSyncService/index');	
	_ = require('lodash'),
	Promise = require('bluebird'),
	extend = require('extend');

function publishToQueueWrapper(siteConfigItems, site) {
	var response = {
		empty: true,
		message: "ZONE_CONFIG_QUEUE_PUBLISH: No unsynced zone for site: " + site.get('siteId')
	}
	if (!siteConfigItems.length) {
		return response;
	}
	return Promise.all(_.map(siteConfigItems, function (item) {
		if (item.zones.genieeUnsyncedZones.length || item.zones.adpTagsUnsyncedZones.length) {
			if (item.zones.genieeUnsyncedZones.length) {
				return genieePublisher.publish({
					channelKey: item.channelKey,
					pageGroupId: item.pageGroupId,
					siteId: item.siteId,
					zones: item.zones.genieeUnsyncedZones
				});
			}
			if (item.zones.adpTagsUnsyncedZones.length) {
				return adpTagPublisher.publish({
					channelKey: item.channelKey,
					siteId: item.siteId,
					zones: item.zones.adpTagsUnsyncedZones
				});
			}
		} else {
			return syncCdn(site);
		}
	}))
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