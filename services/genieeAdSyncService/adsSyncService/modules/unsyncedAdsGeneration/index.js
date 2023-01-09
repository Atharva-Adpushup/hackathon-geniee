const _ = require('lodash');

module.exports = {
	checkGenieeUnsyncedZones: function(variationId, variationName, section, ad) {
		const isValidUnsyncedZone = !!(
			ad.network === 'geniee' &&
			ad.networkData &&
			!ad.networkData.zoneId
		);
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
					dynamicAllocation: ad.networkData.dynamicAllocation
						? ad.networkData.dynamicAllocation
						: 0,
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
	/**
	 * checks if th ad has networkData available
	 * if not, return false
	 * else,
	 * 		check if we have dfpAdunit saved in the networkData (which means the ad has been synced with the GAM)
	 * 		if yes, return false
	 * 		else, create an object with the ad details and return it
	 */
	checkAdpTagsUnsyncedAds: function(section, ad, additionalParams) {
		const hasNetworkData = ad.networkData && Object.keys(ad.networkData).length;
		const { refreshAdUnitCodesCount, isAmpAds = false } = additionalParams;
		const { formatData = {}, isReplaceGptSlotOnRefreshEnabled = false } = ad;
		const { type: adType, maxInstances = 0 } = formatData;
		const shouldReplaceGptSlotOnRefresh = isAmpAds ? false : isReplaceGptSlotOnRefreshEnabled;
		const isChainedDockedAd = adType === 'chainedDocked';

		if (!hasNetworkData) {
			return false;
		}

		const { dfpAdunit, refreshAdUnitCodes, chainedDockedAdUnitCodes } = ad.networkData;

		const hasDfpAdunitCode = !!dfpAdunit;
		const refreshAdUnitCodesMissing = !Array.isArray(refreshAdUnitCodes);
		const shouldSyncRefreshAdUnitCodes =
			shouldReplaceGptSlotOnRefresh &&
			(refreshAdUnitCodesMissing || refreshAdUnitCodes.length != refreshAdUnitCodesCount);

		/*for chained docked ad, we save maxInstances in ad config to know how many instances do we want to create, that is why we are using maxInstances here , it is an integer value
		For each instance of Chained Docked Ad that we render, we want to render a different gpt slot 
		(having different dfpAdunitCodes). So, we're creating as many adunits on GAM as the number of maxInstances */

		const chainedDockedNumberOfInstances = maxInstances;
		const chainedDockedCodesMissing = !Array.isArray(chainedDockedAdUnitCodes);

		const shouldSyncChainedDockedCodes =
			isChainedDockedAd &&
			(chainedDockedCodesMissing ||
				//chainedDockedNumberOfInstances can be changed by user from the UI, suppose we earlier had 10 instances and now we have 6,if we check with inequality operator it will return true which results shouldSyncChainedDockedCodes in true and it  will be wrong in this case because we  already have 6 chainedDockedcodes
				chainedDockedAdUnitCodes.length < chainedDockedNumberOfInstances);

		const isAdSynced =
			hasDfpAdunitCode && !shouldSyncRefreshAdUnitCodes && !shouldSyncChainedDockedCodes;

		if (isAdSynced) {
			return false;
		}

		const isMultipleAdSizes = !!(ad.multipleAdSizes && ad.multipleAdSizes.length);
		const isResponsive = !!(ad.width === 'responsive' && ad.networkData.isResponsive);
		const isNative = !!(ad.formatData && ad.formatData.type === 'native');

		let defaultAdData = {
			adId: ad.id,
			isResponsive: isResponsive,
			sizeWidth: isResponsive ? 'responsive' : parseInt(ad.width, 10),
			sizeHeight: isResponsive ? 'responsive' : parseInt(ad.height, 10),
			sectionId: section.id,
			sectionName: section.name,
			type: section.formatData && section.formatData.type ? section.formatData.type : false,
			isManual: ad.isManual || false,
			isInnovativeAd: ad.isInnovativeAd || false,
			isAmpScriptAd: !!ad.isAmpScriptAd,
			isNative: isNative,
			network: ad.network,
			networkData: {
				headerBidding:
					ad.hasOwnProperty('networkData') && ad.networkData.hasOwnProperty('headerBidding')
						? ad.networkData.headerBidding
						: false
			}
		};

		//We do not want to enable refreshAdUnitCodes feature for Chained Docked ads
		if (isChainedDockedAd) {
			defaultAdData = {
				...defaultAdData,
				chainedDockedAdUnitCodes,
				chainedDockedNumberOfInstances,
				shouldSyncChainedDockedCodes
			};
		} else {
			defaultAdData = {
				...defaultAdData,
				refreshAdUnitCodes,
				refreshAdUnitCodesCount,
				shouldSyncRefreshAdUnitCodes
			};
		}

		if (isMultipleAdSizes) {
			defaultAdData.multipleAdSizes = ad.multipleAdSizes.concat([]);
		}

		return defaultAdData;
	},
	/**
	 * if the ad doesn't have adCode and adUnit and shouldSync is true
	 * create an object with the ad details and return
	 */
	checkAdsenseUnsyncedAds: function(section, ad) {
		const hasNetworkData = ad.networkData && Object.keys(ad.networkData).length;

		if (!hasNetworkData) {
			return false;
		}

		const { adunitId, adCode, shouldSync, isLink = false } = ad.networkData;
		const isAdUnsynced = !adCode && !adunitId && shouldSync;

		if (!isAdUnsynced) {
			return false;
		}

		const isResponsive = !!(ad.width === 'responsive');
		const defaultAdData = {
			adId: ad.id,
			isResponsive,
			isLink,
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
	},
	/**
	 * iterates over the sections of the given variation (for now each section contains only 1 ad)
	 * get sync status of the ad basis its network type
	 * if the ad is not synced, create an ad object with the details to be used for syncing the ad
	 * returns an object of unsynced ads with ads grouped basis the network
	 */
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
					case 'adsense':
					case 'adpTags':
						let fn = self.checkAdpTagsUnsyncedAds;
						let container = 'adpTagsUnsyncedAds';

						if (ad.network === 'adsense') {
							fn = self.checkAdsenseUnsyncedAds;
							container = 'adsenseUnsyncedAds';
						}

						const unsyncedAd = fn(section, ad, additionalInfo);
						// undsyncedAd contains the ad details
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
	/**
	 * gets all the channels and their data for the given site
	 * iterates over each channel
	 * 		iterates over each variation of the channel
	 * 			iterates over each section of the channel
	 * 				finds the ad that is unsynced
	 *
	 * returns an array of objects which contains channel and unsyncedAd
	 */
	getAllUnsyncedAds: function(site) {
		const finalAds = [];
		const self = this;
		let channelUnsyncedAds = [];

		return site.getAllChannels().then(allChannelsData => {
			_.each(allChannelsData, channel => {
				channelUnsyncedAds = [];
				_.each(channel.variations, (variation, id) => {
					// Skip variation config data if it is set disabled from Visual Editor
					const isVariation = !!variation;
					const isDisable = !!(isVariation && variation.disable);

					if (isDisable) {
						return true;
					}

					const channelKey = `chnl::${site.get('siteId')}:${channel.platform}:${channel.pageGroup}`;

					const additionalParams = {
						platform: channel.platform,
						pageGroup: channel.pageGroup,
						refreshAdUnitCodesCount: site.getRefreshAdUnitCodesCount()
					};

					channelUnsyncedAds = _.concat(
						channelUnsyncedAds,
						self.getVariationUnsyncedAds(
							id,
							variation.name,
							channelKey,
							variation.sections,
							additionalParams,
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
