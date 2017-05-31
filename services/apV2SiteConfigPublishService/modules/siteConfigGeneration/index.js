var _ = require('lodash'),
	Promise = require('bluebird'),
	miscModule = require('../misc/index'),
    genieeZoneSyncService = require('../../../genieeAdSyncService/genieeZoneSyncService/index');

function getGeneratePromises(siteModelItem) {
    return new Promise(function (resolve) {
        return genieeZoneSyncService.getAllUnsyncedZones(siteModelItem)
        .then(resolve);
    })
    .then(function(channelAndZones) {
        return _.compact(_.map(channelAndZones, function(channelWithZones) {
            if (channelWithZones && channelWithZones.unsyncedZones && channelWithZones.unsyncedZones.length) {
                var isChannel = !!(channelWithZones.channel),
                    isPageGroupId = !!(isChannel && channelWithZones.channel.genieePageGroupId),
                    resultData = {
                        zones: channelWithZones.unsyncedZones,
                        siteId: siteModelItem.get('siteId'),
                        pageGroupId: isPageGroupId ? channelWithZones.channel.genieePageGroupId : '',
                        channelKey: isChannel ? 'chnl::' + siteModelItem.get('siteId') + ':' + channelWithZones.channel.platform + ':' + channelWithZones.channel.pageGroup : ''
                    };
                return resultData;
            }
            return false;
        }));
    });
}

module.exports = {
	generate: function (siteModelItem) {
		return getGeneratePromises(siteModelItem);
	}
};
