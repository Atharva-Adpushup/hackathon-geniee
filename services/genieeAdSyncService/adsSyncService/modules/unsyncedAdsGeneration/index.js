module.exports = {
	checkGenieeUnsyncedZones: function(variationId, variationName, section, ad) {
		const isValidUnsyncedZone = !!(ad.network === 'geniee' && ad.networkData && !ad.networkData.zoneId);
		const isDynamicAllocationTrue = !!(
			ad.network === 'geniee' &&
			ad.networkData &&
			ad.networkData.dynamicAllocation &&
			!ad.networkData.dfpAdunit &&
			!ad.networkData.dfpAdunitCode
		);
		const isMultipleAdSizes = !!(ad.multipleAdSizes && ad.multipleAdSizes.length);

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
	checkAdpTagsUnsyncedAds: function(section, ad) {
		const hasNetworkData = ad.networkData && Object.keys(ad.networkData).length;
		if (hasNetworkData) {
			if (!ad.networkData.dfpAdunit) {
				const isMultipleAdSizes = !!(ad.multipleAdSizes && ad.multipleAdSizes.length);
				const isResponsive = !!(ad.width === 'responsive' && ad.networkData.isResponsive);
				const isNative = !!(ad.formatData && ad.formatData.type === 'native');
				const defaultAdData = {
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
	checkAdsenseUnsyncedAds: function(section, ad) {
		const hasNetworkData = ad.networkData && Object.keys(ad.networkData).length;
		if (hasNetworkData) {
			const { adunitId, adCode, shouldSync } = ad.networkData;
			const isUnsynced = !adCode && !adunitId && shouldSync;
			if (isUnsynced) {
				const isResponsive = !!(ad.width === 'responsive');
				const defaultAdData = {
					adId: ad.id,
					isResponsive: isResponsive,
					sizeWidth: isResponsive ? 'responsive' : parseInt(ad.width, 10),
					sizeHeight: isResponsive ? 'responsive' : parseInt(ad.height, 10),
					sectionId: section.id,
					sectionName: section.name,
					isManual: ad.isManual || false,
					isInnovativeAd: ad.isInnovativeAd || false,
					network: ad.network,
					networkData: ad.networkData || {}
				};
				return defaultAdData;
			}
			return false;
		}
		return false;
	},
	getVariationUnsyncedAds: function(
		variationId,
		variationName,
		channelKey,
		variationSections,
		additionalInfo = {},
		isControl
	) {
		// Sample json for geniee zone
		// {"zoneName":"test zone api0","sizeWidth":300,"sizeHeight":250,"zoneType":1,"zonePosition":0,"firstView":1,"useFriendlyIFrameFlag":0}
		let unsyncedAds = {
			genieeUnsyncedZones: [],
			adpTagsUnsyncedAds: [],
			genieeDFPCreationZones: [],
			adsenseUnsyncedAds: []
		};
		const self = this;
		_.each(variationSections, function(section, sectionId) {
			_.each(section.ads, function(ad) {
				switch (ad.network) {
					case 'geniee':
						let unsyncedZone = self.checkGenieeUnsyncedZones(variationId, variationName, section, ad);
						if (unsyncedZone) {
							unsyncedZone.variations[0] = {
								...unsyncedZone.variations[0],
								platform: additionalInfo.platform,
								pageGroup: additionalInfo.pageGroup
							};
							unsyncedZone.forZoneSyncing
								? unsyncedAds.genieeUnsyncedZones.push(unsyncedZone.zone)
								: null;
							unsyncedZone.forGenieeDFPCreation
								? unsyncedAds.genieeDFPCreationZones.push(unsyncedZone.zone)
								: null;
						}
						break;
					case 'adsense':
					case 'adpTags':
						let fn = self.checkAdpTagsUnsyncedAds;
						let container = 'adpTagsUnsyncedAds';

						if (ad.network === 'adsense') {
							fn = self.checkAdsenseUnsyncedAds;
							container = 'adsenseUnsyncedAds';
						}

						let unsyncedAd = fn(section, ad);
						if (unsyncedAd) {
							unsyncedAd.variations = [
								{
									variationId: variationId,
									variationName: variationName,
									platform: additionalInfo.platform,
									pageGroup: additionalInfo.pageGroup
								}
							];
							unsyncedAd.channelKey = channelKey;
							unsyncedAds[container].push(unsyncedAd);
						}
						break;
				}
			});
		});
		return unsyncedAds;
	},
	getAllUnsyncedAds: function(site) {
		const finalAds = [];
		const self = this;

		let channelUnsyncedAds = [];

		return site.getAllChannels().then(allChannels => {
			_.each(allChannels, channel => {
				channelUnsyncedAds = [];
				_.each(channel.variations, (variation, id) => {
					// Skip variation config data if it is set disabled from Visual Editor
					const isVariation = !!variation;
					const isDisable = !!(isVariation && variation.disable);

					if (isDisable) {
						return true;
					}

					let channelKey = `chnl::${site.get('siteId')}:${channel.platform}:${channel.pageGroup}`;

					channelUnsyncedAds = _.concat(
						channelUnsyncedAds,
						self.getVariationUnsyncedAds(
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
				finalAds.push({ channel: channel, unsyncedAds: channelUnsyncedAds });
			});
			return finalAds;
		});
	}
};
