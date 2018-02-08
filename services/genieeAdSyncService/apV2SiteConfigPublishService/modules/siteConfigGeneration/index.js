var _ = require('lodash'),
	Promise = require('bluebird'),
	genieeZoneSyncService = require('../../../genieeZoneSyncService/index');

function generateSiteChannelJSON(channelAndZones, siteModelItem) {
	let unsyncedGenieeZones = [],
		unsyncedGenieeDFPCreationZones = [],
		adpTagsUnsyncedZones = {
			siteId: siteModelItem.get('siteId'),
			ads: []
		};
	function doIt(channelWithZones) {
		if (
			!(channelWithZones && channelWithZones.unsyncedZones && Object.keys(channelWithZones.unsyncedZones).length)
		) {
			return false;
		}
		var isChannel = !!channelWithZones.channel,
			isPageGroupId = !!(isChannel && channelWithZones.channel.genieePageGroupId);

		_.forEach(channelWithZones.unsyncedZones, (zones, index) => {
			if (Object.keys(zones.genieeUnsyncedZones).length) {
				unsyncedGenieeZones.push({
					zones: zones.genieeUnsyncedZones,
					siteId: siteModelItem.get('siteId'),
					pageGroupId: isPageGroupId ? channelWithZones.channel.genieePageGroupId : '',
					channelKey: isChannel
						? 'chnl::' +
							siteModelItem.get('siteId') +
							':' +
							channelWithZones.channel.platform +
							':' +
							channelWithZones.channel.pageGroup
						: ''
				});
			}
			if (Object.keys(zones.genieeDFPCreationZones).length) {
				unsyncedGenieeDFPCreationZones.push({
					zones: zones.genieeDFPCreationZones,
					siteId: siteModelItem.get('siteId'),
					pageGroupId: isPageGroupId ? channelWithZones.channel.genieePageGroupId : '',
					channelKey: isChannel
						? 'chnl::' +
							siteModelItem.get('siteId') +
							':' +
							channelWithZones.channel.platform +
							':' +
							channelWithZones.channel.pageGroup
						: ''
				});
			}
			if (Object.keys(zones.adpTagsUnsyncedZones).length) {
				adpTagsUnsyncedZones.ads = _.concat(adpTagsUnsyncedZones.ads, zones.adpTagsUnsyncedZones);
			}
		});
	}
	return Promise.map(channelAndZones, doIt).then(() => {
		return {
			geniee: unsyncedGenieeZones,
			adp: adpTagsUnsyncedZones,
			genieeDFP: unsyncedGenieeDFPCreationZones
		};
	});
}

function getGeneratedPromises(siteModelItem) {
	return genieeZoneSyncService
		.getAllUnsyncedZones(siteModelItem)
		.then(channelAndZones => generateSiteChannelJSON(channelAndZones, siteModelItem));
}

module.exports = {
	generate: getGeneratedPromises
};
