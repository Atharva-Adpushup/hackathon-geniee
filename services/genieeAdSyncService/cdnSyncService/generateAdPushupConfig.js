let ADPTags = [],
	finalJson = {};
const _ = require('lodash'),
	AdPushupError = require('../../../helpers/AdPushupError'),
	{ ERROR_MESSAGES } = require('../../../configs/commonConsts'),
	{ promiseForeach } = require('node-utils'),
	isAdSynced = ad => {
		if (!ad.network || !ad.networkData) {
			return false;
		}
		if (
			(ad.network == 'geniee' && ad.networkData.zoneId) ||
			(ad.network == 'adpTags' && ad.networkData.dfpAdunit) ||
			(typeof ad.networkData.adCode == 'string' && ad.networkData.adCode.length)
		) {
			return true;
		}
		return false;
	},
	getSectionsPayload = function(variationSections) {
		var ads = [],
			ad = null,
			json,
			unsyncedAds = false;
		_.each(variationSections, function(section, sectionId) {
			if (!Object.keys(section.ads).length) {
				return true;
			}
			ad = section.ads[Object.keys(section.ads)[0]]; // for now we have only one ad inside a section

			//In case if even one ad inside variation is unsynced then we don't generate JS as unsynced ads will have no impression and hence loss of revenue'
			if (!isAdSynced(ad)) {
				throw new AdPushupError(ERROR_MESSAGES.MESSAGE.UNSYNCED_SETUP);
			}

			json = {
				id: sectionId,
				network: ad.network,
				css: ad.css,
				height: parseInt(ad.height, 10),
				width: parseInt(ad.width, 10)
			};
			if (section.isIncontent) {
				_.extend(json, {
					isIncontent: true,
					float: section.float,
					minDistanceFromPrevAd: section.minDistanceFromPrevAd,
					ignoreXpaths: section.ignoreXpaths || [],
					section: parseInt(section.sectionNo, 10)
				});
				if (ad.secondaryCss) {
					json.secondaryCss = ad.secondaryCss;
				}
				if (section.notNear) {
					json.notNear = section.notNear;
				}
			} else {
				_.extend(json, {
					xpath: section.xpath,
					operation: section.operation
				});
			}
			//for geniee provide networkData
			if (ad.network == 'adpTags') {
				ADPTags.push({
					key: `${json.width}x${json.height}`,
					height: json.height,
					width: json.width,
					dfpAdunit: ad.networkData.dfpAdunit,
					dfpAdunitCode: ad.networkData.dfpAdunitCode,
					headerBidding: ad.networkData.headerBidding,
					keyValues: ad.networkData.keyValues
				});
			}
			//Sending whole network data object in ad.
			json.networkData = ad.networkData;

			ads.push(json);
		});

		return ads;
	},
	getVariationPayload = (variation, platform, pageGroup, variationData, finalJson) => {
		var ads = getSectionsPayload(variation.sections),
			computedVariationObj,
			contentSelector = variation.contentSelector,
			isContentSelector = !!contentSelector;

		if (!ads.length) {
			return true;
		}

		computedVariationObj = {
			id: variation.id,
			name: variation.name,
			traffic: variation.trafficDistribution,
			customJs: variation.customJs,
			adpKeyValues: variation.adpKeyValues,
			contentSelector: isContentSelector ? contentSelector : '',
			ads: ads,
			// Data required for auto optimiser model
			// pageRPM is mapped as sum
			sum: variationData && parseFloat(variationData.pageRPM) > -1 ? variationData.pageRPM : 1,
			// Data required for auto optimiser model
			// Page view is mapped as count
			count: variationData && parseInt(variationData.pageViews, 10) > -1 ? variationData.pageViews : 1
		};

		return computedVariationObj;
	},
	getPageGroupPattern = (pageGroupPattern, platform, pageGroup) => {
		if (!pageGroupPattern || !_.isObject(pageGroupPattern)) {
			return null;
		}
		const patterns = pageGroupPattern[platform];
		if (!patterns || !patterns.length) {
			return null;
		}

		for (var i = 0; i < patterns.length; i++) {
			if (patterns[i].pageGroup === pageGroup) {
				return patterns[i].pattern;
			}
		}
		return null;
	},
	getChannelPayload = (channel, pageGroupData, pageGroupPattern) => {
		const { platform, pageGroup } = channel;

		if (!finalJson[platform]) {
			finalJson[platform] = {};
		}

		finalJson[platform][pageGroup] = {
			variations: [],
			contentSelector: channel.contentSelector,
			pageGroupPattern: getPageGroupPattern(pageGroupPattern, platform, pageGroup)
		};

		_.each(channel.variations, (variation, id) => {
			let variationData = pageGroupData && _.isObject(pageGroupData) ? pageGroupData.variations[id] : null;
			let variationPayload = getVariationPayload(variation, platform, pageGroup, variationData, finalJson);
			if (typeof variationPayload == 'object' && Object.keys(variationPayload).length) {
				finalJson[platform][pageGroup].variations.push(variationPayload);
			}
		});
		if (!Object.keys(finalJson[platform][pageGroup].variations).length) {
			delete finalJson[platform][pageGroup];
		} else {
			finalJson[platform][pageGroup].variations.sort(function(a, b) {
				return a.traffic - b.traffic;
			});
		}
		return finalJson;
	},
	generatePayload = (site, pageGroupData) => {
		//Empty finaJson and dfpAunits
		finalJson = {};
		ADPTags = [];
		let pageGroupPattern = site.get('apConfigs').pageGroupPattern;

		return site
			.getAllChannels()
			.then(channels =>
				promiseForeach(
					channels,
					channel => getChannelPayload(channel, pageGroupData, pageGroupPattern),
					err => false
				)
			)
			.then(() => [finalJson, ADPTags]);
	};

module.exports = generatePayload;
