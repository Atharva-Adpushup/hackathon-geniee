var Promise = require('bluebird'),
	retry = require('bluebird-retry'),
	configPublishService = require('./apV2SiteConfigPublishService/index'),
	syncCdn = require('./cdnSyncService/index');

function publishCDNWrapper(site) {
	return configPublishService.publish(site)
	.then(response => {
		if (response.empty) {
			console.log(response.message);
			return syncCdn(site);
		}
		return response.message;
	})
	.then(console.log)
	.catch(console.log);
}

module.exports = {
	init: (site) => publishCDNWrapper(site)
};

/*
 * ADP Tags Data requried for Sync
 * Ads/Zone 
 * 	- adId
 * 	- sectionId
 * 	- width
 * 	- height
 * siteId
 * channelKey
 */