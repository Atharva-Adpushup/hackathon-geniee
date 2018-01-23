var config = require('../../../configs/config'),
	channelModel = require('../../../models/channelModel'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	rp = require('request-promise'),
	processBatches = require('process-batches'),
	signatureGenerator = require('./signatureGenerator'),
	{ fileLogger } = require('../../../helpers/logger/file/index'),
	crypto = require('crypto'),
	retry = require('bluebird-retry');

module.exports = {
	checkGenieeUnsyncedZones: function(variationId, variationName, section, ad) {
		// isSectionPartnerData = !!(section && section.partnerData),
		// isCustomZoneIdData = !!(isSectionPartnerData && section.partnerData.customZoneId),
		// isValidUnsyncedZone = !!(ad.network === 'geniee' && !ad.networkData && !ad.adCode && !isCustomZoneIdData),
		// partnerData = {
		// 	zonePosition: isSectionPartnerData ? section.partnerData.position : 0,
		// 	firstView: isSectionPartnerData ? Number(section.partnerData.firstFold) : 1,
		// 	useFriendlyIFrameFlag: isSectionPartnerData ? Number(section.partnerData.asyncTag) : 1
		// };
		var isValidUnsyncedZone = !!(ad.network === 'geniee' && ad.networkData && !ad.networkData.zoneId),
			isDynamicAllocationTrue = !!(ad.network === 'geniee' && ad.networkData && ad.networkData.dynamicAllocation);

		if (isValidUnsyncedZone || isDynamicAllocationTrue) {
			return {
				forGenieeDFPCreation: isDynamicAllocationTrue,
				forZoneSyncing: isValidUnsyncedZone,
				zone: {
					isGeniee: true,
					adId: ad.id,
					zoneName: ad.id,
					sectionId: section.id,
					variationId: variationId,
					variationName: variationName,
					sizeWidth: parseInt(ad.width, 10),
					sizeHeight: parseInt(ad.height, 10),
					zoneType: 1,
					zonePosition: ad.position ? position : 0,
					firstView: ad.firstFold ? Number(ad.firstFold) : 1,
					useFriendlyIFrameFlag: ad.asyncTag ? Number(ad.asyncTag) : 1,
					dynamicAllocation: ad.networkData.dynamicAllocation ? ad.networkData.dynamicAllocation : 0,
					zoneId: ad.networkData && ad.networkData.zoneId ? ad.networkData.zoneId : false
				}
			};
		}
		return false;
	},
	checkAdpTagsUnsyncedZones: function(section, ad) {
		if (ad.networkData && Object.keys(ad.networkData).length) {
			if (!ad.networkData.dfpAdunit) {
				return {
					adId: ad.id,
					sizeWidth: parseInt(ad.width, 10),
					sizeHeight: parseInt(ad.height, 10),
					sectionId: section.id
				};
			}
			return false;
		}
		return false;
	},
	getVariationUnsyncedZones: function(variationId, variationName, channelKey, variationSections) {
		// Sample json for geniee zone
		// {"zoneName":"test zone api0","sizeWidth":300,"sizeHeight":250,"zoneType":1,"zonePosition":0,"firstView":1,"useFriendlyIFrameFlag":0}
		var unsyncedZones = {
				genieeUnsyncedZones: [],
				adpTagsUnsyncedZones: [],
				genieeDFPCreationZones: []
			},
			self = this;
		_.each(variationSections, function(section, sectionId) {
			_.each(section.ads, function(ad) {
				switch (ad.network) {
					case 'geniee':
						var unsyncedZone = self.checkGenieeUnsyncedZones(variationId, variationName, section, ad);
						if (unsyncedZone) {
							unsyncedZone.forZoneSyncing
								? unsyncedZones.genieeUnsyncedZones.push(unsyncedZone.zone)
								: null;
							unsyncedZone.forGenieeDFPCreation
								? unsyncedZones.genieeDFPCreationZones.push(unsyncedZone.zone)
								: null;
						}
						// unsyncedZone ? unsyncedZones.genieeUnsyncedZones.push(unsyncedZone) : null;
						break;
					case 'adpTags':
						var unsyncedZone = self.checkAdpTagsUnsyncedZones(section, ad);
						if (unsyncedZone) {
							unsyncedZone.variationId = variationId;
							unsyncedZone.channelKey = channelKey;
							unsyncedZones.adpTagsUnsyncedZones.push(unsyncedZone);
						}
						break;
				}
			});
		});
		return unsyncedZones;
	},
	getAllUnsyncedZones: function(site) {
		var finalZones = [],
			channelUnsyncedZones = [],
			self = this;
		return site.getAllChannels().then(function(allChannels) {
			_.each(allChannels, function(channel) {
				channelUnsyncedZones = [];
				_.each(channel.variations, function(variation, id) {
					let channelKey = `chnl::${site.get('siteId')}:${channel.platform}:${channel.pageGroup}`;
					// channelUnsyncedZones = self.getVariationUnsyncedZones(id, variation.sections);
					channelUnsyncedZones = _.concat(
						channelUnsyncedZones,
						self.getVariationUnsyncedZones(id, variation.name, channelKey, variation.sections)
					);
				});
				finalZones.push({ channel: channel, unsyncedZones: channelUnsyncedZones });
			});
			return finalZones;
		});
	}
};
