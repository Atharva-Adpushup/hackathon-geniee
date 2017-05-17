var Promise = require('bluebird'),
	retry = require('bluebird-retry'),
    lodash = require('lodash'),
	{ fileLogger } = require('../../helpers/logger/file/index'),
	configPublishService = require('../apV2SiteConfigPublishService/index'),
	syncCdn = require('./cdnSyncService/index');

function publishGenieeSyncJobs(site) {
    var paramConfig = {
        zones: {},
        siteId: 0,
        channelKey: '',
        pageGroupId: ''
    };
    return configPublishService.publish(site, paramConfig);
}

function publishCDNSyncJobs(site) {
    return syncCdn(site);
}

module.exports = {
    init: function(site) {
        // @TODO Syncing retry logic to be added 
        if (site.get('partner') === 'geniee') {
            return publishGenieeSyncJobs(site)
            .then(function(response) {
                if (response.empty) {
                    console.log(response.message);
                    return publishCDNSyncJobs(site);
                }
                return response.message;
            })
            .then(console.log)
            .catch(console.log);
        } else {
            return publishCDNSyncJobs(site)
            .then(function() {
                console.log(`APEX CDN Sync jobs published in queue for site : ${site.get('siteId')}`);
                return;
            })
            .catch(console.log);
        }
    }
};
