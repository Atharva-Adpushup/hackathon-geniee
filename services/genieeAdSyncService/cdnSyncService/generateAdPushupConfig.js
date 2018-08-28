let ADPTags = [],
	finalJson = {};
const _ = require('lodash'),
	AdPushupError = require('../../../helpers/AdPushupError'),
	{ ERROR_MESSAGES } = require('../../../configs/commonConsts'),
	config = require('../../../configs/config'),
	{ promiseForeach, couchbaseService } = require('node-utils'),
	appBucket = couchbaseService(
		`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
		config.couchBase.DEFAULT_BUCKET,
		config.couchBase.DEFAULT_BUCKET_PASSWORD
	),
	isAdSynced = ad => {
		if (!ad.network || !ad.networkData) {
			return false;
		}
		if (
			(ad.network == 'geniee' && ad.networkData.zoneId) ||
			(ad.network == 'adpTags' && ad.networkData.dfpAdunit) ||
			(typeof ad.networkData.adCode == 'string' && ad.networkData.adCode.length) ||
			(ad.network == 'custom' && ad.networkData.forceByPass)
		) {
			return true;
		}
		return false;
	},
	pushToAdpTags = function(ad, json) {
		const isMultipleAdSizes = !!(ad.multipleAdSizes && ad.multipleAdSizes.length);

		if (ad.network == 'adpTags' || (ad.network == 'geniee' && ad.networkData.dynamicAllocation)) {
			let adData = {
				key: `${json.width}x${json.height}`,
				height: json.height,
				width: json.width,
				dfpAdunit: ad.networkData.dfpAdunit,
				dfpAdunitCode: ad.networkData.dfpAdunitCode,
				headerBidding: ad.networkData.headerBidding,
				keyValues: ad.networkData.keyValues
			};

			if (isMultipleAdSizes) {
				adData.multipleAdSizes = ad.multipleAdSizes.map(object => [
					Number(object.width),
					Number(object.height)
				]);
			}

			ADPTags.push(adData);
		}
	},
	getSectionsPayload = function(variationSections, platform, pagegroup) {
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
				throw new AdPushupError({
					message: ERROR_MESSAGES.MESSAGE.UNSYNCED_SETUP,
					ad: ad,
					sectionId: sectionId,
					platform: platform || 'Not Present',
					pagegroup: pagegroup || 'Not Present'
				});
			}

			json = {
				id: sectionId,
				network: ad.network,
				//Format type of ad like, 1 for structural, 2 for incontent
				type: section.type,
				formatData: section.formatData,
				css: ad.css,
				height: parseInt(ad.height, 10),
				width: parseInt(ad.width, 10)
			};

			// Add 'multipleAdSizes' property if exists
			const isMultipleAdSizes = !!(ad.multipleAdSizes && ad.multipleAdSizes.length);

			if (isMultipleAdSizes) {
				json.multipleAdSizes = ad.multipleAdSizes.map(object => [Number(object.width), Number(object.height)]);
			}

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
				if (ad.customCSS) {
					json.customCSS = ad.customCSS;
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
			pushToAdpTags(ad, json);

			//Sending whole network data object in ad.
			json.networkData = ad.networkData;

			ads.push(json);
		});

		return ads;
	},
	getVariationPayload = (variation, platform, pageGroup, variationData, finalJson) => {
		const isVariation = !!variation,
			isDisable = !!(isVariation && variation.disable);

		if (isDisable) {
			return true;
		}

		var ads = getSectionsPayload(variation.sections, platform, pageGroup),
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
			personalization: variation.personalization,
			// Data required for auto optimiser model
			// Page revenue is mapped as sum
			sum:
				variationData && parseFloat(variationData.pageRevenue) > -1
					? variationData.pageRevenue < 1
						? 1
						: Math.round(variationData.pageRevenue)
					: 1,
			// Data required for auto optimiser model
			// Page view is mapped as count
			count:
				variationData && parseInt(variationData.pageViews, 10) > -1
					? variationData.pageViews < 1
						? 1
						: Math.round(variationData.pageViews)
					: 1
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
			pageGroupPattern: getPageGroupPattern(pageGroupPattern, platform, pageGroup),
			hasVariationsWithNoData: false,
			ampSettings: channel.ampSettings ? { isEnabled: channel.ampSettings.isEnabled } : { isEnabled: false }
		};

		_.each(channel.variations, (variation, id) => {
			let variationData = pageGroupData && _.isObject(pageGroupData) ? pageGroupData.variations[id] : null;
			let variationPayload = getVariationPayload(variation, platform, pageGroup, variationData, finalJson);
			if (typeof variationPayload == 'object' && Object.keys(variationPayload).length) {
				finalJson[platform][pageGroup].variations.push(variationPayload);
				finalJson[platform][pageGroup].hasVariationsWithNoData =
					finalJson[platform][pageGroup].hasVariationsWithNoData == false
						? variationData == null
							? true
							: false
						: finalJson[platform][pageGroup].hasVariationsWithNoData;
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
	getManualAds = site => {
		const siteId = site.get('siteId');
		return appBucket
			.getDoc(`tgmr::${siteId}`)
			.then(docWithCas => {
				const ads = docWithCas.value.ads.filter(ad => !ad.hasOwnProperty('isActive') || ad.isActive);
				return ads;
			})
			.catch(err => Promise.reject(new Error(`Error fetching tgmr doc for ${siteId}`)));
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
			.then(() => {
				if (site.get('isManual')) {
					return getManualAds(site);
				}
				return Promise.resolve();
			})
			.then(manualAds => {
				_.map(manualAds, ad => {
					pushToAdpTags(ad, ad);
				});
				return [finalJson, ADPTags, manualAds];
			});
	};

module.exports = generatePayload;
