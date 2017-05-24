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
        var isUnsyncedZones = !!(channelAndZones.length && channelAndZones[0].unsyncedZones),
            isPageGroupId = !!(isUnsyncedZones && channelAndZones[0].channel.genieePageGroupId),
            isChannel = !!(isUnsyncedZones && channelAndZones[0].channel),
            resultData = {
                zones: isUnsyncedZones ? channelAndZones[0].unsyncedZones : [],
                siteId: siteModelItem.get('siteId'),
                pageGroupId: isPageGroupId ? channelAndZones[0].channel.genieePageGroupId : '',
                channelKey: isChannel ? 'chnl::' + siteModelItem.get('siteId') + ':' + channelAndZones[0].channel.platform + ':' + channelAndZones[0].channel.pageGroup : ''
            };
        return resultData;
    });
}

module.exports = {
	generate: function (siteModelItem) {
		return getGeneratePromises(siteModelItem);
	}
};
