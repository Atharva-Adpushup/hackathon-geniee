var queueWorker = require('../../queueWorker/rabbitMQ/workers/genieeAdSyncQueuePublisher'),
	siteConfigGenerationModule = require('./modules/siteConfigGeneration/index'),
	_ = require('lodash'),
	Promise = require('bluebird'),
	extend = require('extend');

module.exports = {
	publish: function (siteModel, paramConfig) {
		return siteConfigGenerationModule.generate(siteModel)
			.then(function (siteConfigItems) {
                if (!siteConfigItems.length) {
                    var response = {
                        empty: true,
                        message: 'ZONE_CONFIG_QUEUE_PUBLISH: No geniee unsynced zone for site: ' + siteModel.get('siteId')
                    }

                    return response;
                } else {
                    return Promise.all(_.map(siteConfigItems, function(item) {
                        return queueWorker.publish(item);
                    }))
                    .then(function() {
                        var response = {
                            empty: false,
                            message: 'ZONE_CONFIG_QUEUE_PUBLISH: Successfully published geniee zones into queue for site: ' + siteModel.get('siteId')
                        }

                        return response;                        
                    });
                }
                // var parameterConfig = extend(true, {}, paramConfig);

                // parameterConfig.zones = siteConfigItem.zones;
                // parameterConfig.siteId = siteConfigItem.siteId;
                // parameterConfig.channelKey = siteConfigItem.channelKey;
                // parameterConfig.pageGroupId = siteConfigItem.pageGroupId;

                // if (parameterConfig.zones.length == 0) {
                //     var response = {
                //         empty: true,
                //         message: 'ZONE_CONFIG_QUEUE_PUBLISH: No geniee unsynced zone for site: ' + siteConfigItem.siteId
                //     }

                //     return response;
                // }

                // return queueWorker.publish(parameterConfig)
                // .then(function () {
                //     var response = {
                //         empty: false,
                //         message: 'ZONE_CONFIG_QUEUE_PUBLISH: Successfully published geniee zones into queue for site: ' + siteConfigItem.siteId
                //     }

                //     return response;
                // });
			});
	}
};
