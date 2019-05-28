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

const { checkForLog } = require('../../../helpers/commonFunctions');

module.exports = {
	checkGenieeUnsyncedZones: function(variationId, variationName, section, ad) {
		var isValidUnsyncedZone = !!(ad.network === 'geniee' && ad.networkData && !ad.networkData.zoneId),
			isDynamicAllocationTrue = !!(
				ad.network === 'geniee' &&
				ad.networkData &&
				ad.networkData.dynamicAllocation &&
				!ad.networkData.dfpAdunit &&
				!ad.networkData.dfpAdunitCode
			),
			isMultipleAdSizes = !!(ad.multipleAdSizes && ad.multipleAdSizes.length);

		if (isValidUnsyncedZone || isDynamicAllocationTrue) {
			const defaultZoneData = {
				forGenieeDFPCreation: isDynamicAllocationTrue,
				forZoneSyncing: isValidUnsyncedZone,
				zone: {
					isGeniee: true,
					adId: ad.id,
					zoneName: ad.id,
					sectionId: section.id,
					sizeWidth: parseInt(ad.width, 10),
					sizeHeight: parseInt(ad.height, 10),
					zoneType: 1,
					zonePosition: ad.position ? position : 0,
					firstView: ad.firstFold ? Number(ad.firstFold) : 1,
					useFriendlyIFrameFlag: ad.asyncTag ? Number(ad.asyncTag) : 1,
					dynamicAllocation: ad.networkData.dynamicAllocation ? ad.networkData.dynamicAllocation : 0,
					zoneId: ad.networkData && ad.networkData.zoneId ? ad.networkData.zoneId : false,
					variations: [
						{
							variationId: variationId,
							variationName: variationName
						}
					],
					network: ad.network,
					networkData: {
						dynamicAllocation: ad.hasOwnProperty('dynamicAllocation')
							? ad.networkData.dynamicAllocation
							: false
					}
				}
			};

			if (isMultipleAdSizes) {
				defaultZoneData.zone.multipleAdSizes = ad.multipleAdSizes.concat([]);
			}

			return defaultZoneData;
		}
		return false;
	},
	checkAdpTagsUnsyncedZones: function(section, ad) {
		if (ad.networkData && Object.keys(ad.networkData).length) {
			if (!ad.networkData.dfpAdunit) {
				const isMultipleAdSizes = !!(ad.multipleAdSizes && ad.multipleAdSizes.length),
					isResponsive = !!(ad.width === 'responsive' && ad.networkData.isResponsive),
					isNative = !!(ad.formatData && ad.formatData.type === 'native'),
					defaultAdData = {
						adId: ad.id,
						isResponsive: isResponsive,
						sizeWidth: isResponsive ? 'responsive' : parseInt(ad.width, 10),
						sizeHeight: isResponsive ? 'responsive' : parseInt(ad.height, 10),
						sectionId: section.id,
						sectionName: section.name,
						type: section.formatData && section.formatData.type ? section.formatData.type : false,
						isManual: ad.isManual || false,
						isInnovativeAd: ad.isInnovativeAd || false,
						isNative: isNative,
						network: ad.network,
						networkData: {
							headerBidding:
								ad.hasOwnProperty('networkData') && ad.networkData.hasOwnProperty('headerBidding')
									? ad.networkData.headerBidding
									: false
						}
					};

				if (isMultipleAdSizes) {
					defaultAdData.multipleAdSizes = ad.multipleAdSizes.concat([]);
				}

				return defaultAdData;
			}
			return false;
		}
		return false;
	},
	getVariationUnsyncedZones: function(
		variationId,
		variationName,
		channelKey,
		variationSections,
		additionalInfo = {},
		isControl
	) {
		// Sample json for geniee zone
		// {"zoneName":"test zone api0","sizeWidth":300,"sizeHeight":250,"zoneType":1,"zonePosition":0,"firstView":1,"useFriendlyIFrameFlag":0}
		var unsyncedZones = {
				genieeUnsyncedZones: [],
				adpTagsUnsyncedZones: [],
				genieeDFPCreationZones: [],
				logsUnsyncedZones: []
			},
			self = this;
		_.each(variationSections, function(section, sectionId) {
			_.each(section.ads, function(ad) {
				if (checkForLog(ad)) {
					unsyncedZones.logsUnsyncedZones.push({
						...ad,
						variations: [
							{
								variationId: variationId,
								variationName: variationName,
								platform: additionalInfo.platform,
								pageGroup: additionalInfo.pageGroup
							}
						],
						channelKey,
						id: sectionId,
						adId: ad.id,
						isControl,
						sectionName: section.name
					});
				}
				switch (ad.network) {
					case 'geniee':
						var unsyncedZone = self.checkGenieeUnsyncedZones(variationId, variationName, section, ad);
						if (unsyncedZone) {
							unsyncedZone.variations[0] = {
								...unsyncedZone.variations[0],
								platform: additionalInfo.platform,
								pageGroup: additionalInfo.pageGroup
							};
							unsyncedZone.forZoneSyncing
								? unsyncedZones.genieeUnsyncedZones.push(unsyncedZone.zone)
								: null;
							unsyncedZone.forGenieeDFPCreation
								? unsyncedZones.genieeDFPCreationZones.push(unsyncedZone.zone)
								: null;
						}
						break;
					case 'adpTags':
						var unsyncedZone = self.checkAdpTagsUnsyncedZones(section, ad);
						if (unsyncedZone) {
							unsyncedZone.variations = [
								{
									variationId: variationId,
									variationName: variationName,
									platform: additionalInfo.platform,
									pageGroup: additionalInfo.pageGroup
								}
							];
							// unsyncedZone.variationId = variationId;
							// unsyncedZone.variationName = variationName;
							// unsyncedZone.pageGroup = additionalInfo.pageGroup;
							// unsyncedZone.platform = additionalInfo.platform;
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
					// Skip variation config data if it is set disabled from Visual Editor
					const isVariation = !!variation,
						isDisable = !!(isVariation && variation.disable);

					if (isDisable) {
						return true;
					}

					let channelKey = `chnl::${site.get('siteId')}:${channel.platform}:${channel.pageGroup}`;
					channelUnsyncedZones = _.concat(
						channelUnsyncedZones,
						self.getVariationUnsyncedZones(
							id,
							variation.name,
							channelKey,
							variation.sections,
							{
								platform: channel.platform,
								pageGroup: channel.pageGroup
							},
							variation.isControl
						)
					);
				});
				finalZones.push({ channel: channel, unsyncedZones: channelUnsyncedZones });
			});
			return finalZones;
		});
	}
};
