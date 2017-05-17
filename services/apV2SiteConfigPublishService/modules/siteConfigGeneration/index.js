var lodash = require('lodash'),
	Promise = require('bluebird'),
	miscModule = require('../misc/index'),
    genieeZoneSyncService = require('../../../genieeAdSyncService/genieeZoneSyncService/index');

function getGeneratePromises(siteModelItem) {
    return new Promise(function (resolve) {
        return genieeZoneSyncService.getAllUnsyncedZones(siteModelItem)
        .then(resolve);
    })
    .then(function(channelAndZones) {
        var resultData = {
            zones: channelAndZones[0].unsyncedZones,
            siteId: siteModelItem.get('siteId'),
            pageGroupId: channelAndZones[0].channel.genieePageGroupId,
            channelKey: 'chnl::' + siteModelItem.get('siteId') + ':' + channelAndZones[0].channel.platform + ':' + channelAndZones[0].channel.pageGroup
        };
        return resultData;
    });
}

module.exports = {
	generate: function (siteModelItem) {
		return getGeneratePromises(siteModelItem);
	}
};
