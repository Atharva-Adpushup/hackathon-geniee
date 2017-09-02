var _ = require('lodash'),
	Promise = require('bluebird'),
	genieeZoneSyncService = require('../../../genieeZoneSyncService/index');

function generateSiteChannelJSON(channelAndZones, siteModelItem) {
	const doIt = function (channelWithZones) {
		if (!(channelWithZones && channelWithZones.unsyncedZones && Object.keys(channelWithZones.unsyncedZones).length)) {
			return false;
		}
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
	return _.compact(_.map(channelAndZones, doIt));
}

function getGeneratedPromises(siteModelItem) {
	return genieeZoneSyncService
	.getAllUnsyncedZones(siteModelItem)
	.then(channelAndZones => generateSiteChannelJSON(channelAndZones, siteModelItem));
}

module.exports = {
	generate: getGeneratedPromises
};