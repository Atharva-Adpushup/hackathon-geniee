let ADPTags = [];
let finalJson = {};

const Promise = require('bluebird');
const _ = require('lodash');
const { promiseForeach, couchbaseService } = require('node-utils');

const AdPushupError = require('../../../helpers/AdPushupError');
const { ERROR_MESSAGES, docKeys } = require('../../../configs/commonConsts');
const config = require('../../../configs/config');

const appBucket = couchbaseService(
	`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
	config.couchBase.DEFAULT_BUCKET,
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);

const isAdSynced = ad => {
	if (!ad.network || !ad.networkData) {
		return false;
	}
	if (
		(ad.network === 'geniee' && ad.networkData.zoneId) ||
		(ad.network === 'adpTags' && ad.networkData.dfpAdunit) ||
		(typeof ad.networkData.adCode === 'string' && ad.networkData.adCode.length) ||
		(ad.network === 'custom' && ad.networkData.forceByPass)
	) {
		return true;
	}
	return false;
};

const pushToAdpTags = (ad, json) => {
	const isMultipleAdSizes = !!(ad.multipleAdSizes && ad.multipleAdSizes.length);
	const isNetwork = !!ad.network;
	const isNetworkData = !!ad.networkData;
	const isDynamicAllocation = !!(isNetworkData && ad.networkData.dynamicAllocation);
	const isZoneContainerId = !!(isNetworkData && ad.networkData.zoneContainerId);
	const isAdpTagsNetwork = !!(isNetwork && ad.network === 'adpTags');
	const isGenieeNetwork = !!(isNetwork && ad.network === 'geniee');

	if (isAdpTagsNetwork || (isGenieeNetwork && isDynamicAllocation)) {
		const adData = {
			key: `${json.width}x${json.height}`,
			height: json.height,
			width: json.width,
			fluid: json.fluid,
			dfpAdunit: isZoneContainerId ? ad.networkData.zoneContainerId : ad.networkData.dfpAdunit,
			dfpAdunitCode: ad.networkData.dfpAdunitCode,
			headerBidding: ad.networkData.headerBidding,
			keyValues: ad.networkData.keyValues,
			minViewPortSize: ad.minViewPortSize
		};

		if (isMultipleAdSizes) {
			adData.multipleAdSizes = ad.multipleAdSizes.concat([]);
		}

		ADPTags.push(adData);
	}
};

const getAdConfig = (adType, section) => {
	const ad =
		adType === 'layout'
			? section.ads[Object.keys(section.ads)[0]] // for now we have only one ad inside a section
			: section;

	const {
		network,
		networkData: { isResponsive },
		css,
		height,
		width,
		multipleAdSizes,
		fluid,
		sizeMapping,
		downwardSizesDisabled,
		sizeFilters,
		collapseUnfilled,
		poweredByBanner,
		enableLazyLoading,
		disableReuseVacantAdSpace,
		minViewPortSize = { height: 0, width: 0 }
	} = ad;
	const { name: sectionName, id, formatData } = section;
	let json = {
		id,
		sectionName,
		network,
		css,
		height: isResponsive ? height : parseInt(height, 10),
		width: isResponsive ? width : parseInt(width, 10),
		formatData,
		fluid: collapseUnfilled ? true : fluid === true,
		sizeMapping,
		downwardSizesDisabled: !!downwardSizesDisabled,
		collapseUnfilled: !!collapseUnfilled,
		poweredByBanner,
		minViewPortSize,
		disableReuseVacantAdSpace: !!disableReuseVacantAdSpace
	};

	// Add 'multipleAdSizes' property if exists
	const isMultipleAdSizes = !!(multipleAdSizes && multipleAdSizes.length);

	if (isMultipleAdSizes) {
		json.multipleAdSizes = multipleAdSizes.concat([]);
	}
	if (enableLazyLoading) {
		json.enableLazyLoading = enableLazyLoading;
	}

	if (sizeFilters && Object.keys(sizeFilters).length) {
		json.sizeFilters = sizeFilters;
	}

	switch (adType) {
		case 'layout': {
			const { enableLazyLoading, type } = section;

			json = {
				...json,
				enableLazyLoading,
				type // Format type of ad like, 1 for structural, 2 for incontent
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

			break;
		}
		case 'innovativeAds': {
			const { isInnovativeAd, networkData, pagegroups, type } = ad;

			json = {
				...json,
				isInnovativeAd,
				networkData,
				pagegroups,
				type
			};

			break;
		}
		case 'apTag': {
			const { isManual, networkData, type } = ad;

			json = {
				...json,
				isManual,
				networkData,
				type
			};

			break;
		}
		default:
	}

	pushToAdpTags(ad, json);

	return json;
};

const getSectionsPayload = (variationSections, platform, pagegroup, selectorsTreeLevel) => {
	const ads = [];
	let ad = null;
	let json;

	_.each(variationSections, (section, sectionId) => {
		if (!Object.keys(section.ads).length) {
			return true;
		}
		ad = section.ads[Object.keys(section.ads)[0]]; // for now we have only one ad inside a section

		//if ad is inActive don't process it
		if (ad.hasOwnProperty('isActive') && !ad.isActive) return;

		// In case if even one ad inside variation is unsynced then we don't generate JS as unsynced ads will have no impression and hence loss of revenue'
		if (!isAdSynced(ad)) {
			throw new AdPushupError({
				message: ERROR_MESSAGES.MESSAGE.UNSYNCED_SETUP,
				ad,
				sectionId,
				platform: platform || 'Not Present',
				pagegroup: pagegroup || 'Not Present'
			});
		}

		const isEditorInnovativeSection = !!(
			section.type === 3 ||
			section.type === 4 ||
			section.type === 5
		);

		if (!isEditorInnovativeSection) {
			json = getAdConfig('layout', section);

			// Sending whole network data object in ad.
			json.networkData = ad.networkData;

			ads.push(json);
		}
	});

	return ads;
};

const getVariationPayload = (variation, platform, pageGroup, variationData, finalJson) => {
	const isVariation = !!variation;
	const isDisable = !!(isVariation && variation.disable);

	if (isDisable) {
		return true;
	}

	let ads = [];
	if (variation.sections && Object.keys(variation.sections).length) {
		ads = getSectionsPayload(variation.sections, platform, pageGroup, variation.selectorsTreeLevel);
	}

	let computedVariationObj;
	const contentSelector = variation.contentSelector;
	const isContentSelector = !!contentSelector;

	/*if (!ads.length) {
		return true;
	}*/

	computedVariationObj = {
		id: variation.id,
		name: variation.name,
		traffic: variation.trafficDistribution,
		customJs: variation.customJs,
		adpKeyValues: variation.adpKeyValues,
		contentSelector: isContentSelector ? contentSelector : '',
		isControl: variation.isControl ? variation.isControl : false,
		ads,
		incontentSectionConfig: {
			selectorsTreeLevel: variation.selectorsTreeLevel || '',
			sectionBracket: variation.incontentSectionBracket,
			isEvenSpacingAlgo: variation.enableIncontentEvenSpacingAlgo || false
		},
		personalization: variation.personalization,
		isControl: !!variation.isControl,
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
};

const getPageGroupPattern = (pageGroupPattern, platform, pageGroup) => {
	if (!pageGroupPattern || !_.isObject(pageGroupPattern)) {
		return null;
	}
	const patterns = pageGroupPattern[platform];
	if (!patterns || !patterns.length) {
		return null;
	}

	for (let i = 0; i < patterns.length; i++) {
		if (patterns[i].pageGroup === pageGroup) {
			return patterns[i].pattern;
		}
	}
	return null;
};

const getChannelPayload = (channel, pageGroupData, pageGroupPattern) => {
	const { platform, pageGroup } = channel;

	if (!finalJson[platform]) {
		finalJson[platform] = {};
	}

	finalJson[platform][pageGroup] = {
		variations: [],
		contentSelector: channel.contentSelector,
		pageGroupPattern: getPageGroupPattern(pageGroupPattern, platform, pageGroup),
		hasVariationsWithNoData: false,
		// ampSettings: channel.ampSettings ? { isEnabled: channel.ampSettings.isEnabled } : { isEnabled: false },
		autoOptimise: channel.hasOwnProperty('autoOptimise') ? channel.autoOptimise : false
	};

	_.each(channel.variations, (variation, id) => {
		const variationData =
			pageGroupData && _.isObject(pageGroupData)
				? pageGroupData.variations[id.toUpperCase()]
				: null;
		const variationPayload = getVariationPayload(
			variation,
			platform,
			pageGroup,
			variationData,
			finalJson
		);
		if (typeof variationPayload === 'object' && Object.keys(variationPayload).length) {
			finalJson[platform][pageGroup].variations.push(variationPayload);
			finalJson[platform][pageGroup].hasVariationsWithNoData =
				finalJson[platform][pageGroup].hasVariationsWithNoData == false
					? variationData == null
					: finalJson[platform][pageGroup].hasVariationsWithNoData;
		}
	});
	if (Object.keys(finalJson[platform][pageGroup].variations).length) {
		// delete finalJson[platform][pageGroup];
		// } else {
		finalJson[platform][pageGroup].variations.sort((a, b) => a.traffic - b.traffic);
	}
	return finalJson;
};

const getSections = (docKey, siteId) =>
	appBucket.getDoc(docKey).then(docWithCas => {
		const ads = docWithCas.value.ads.filter(ad => !ad.hasOwnProperty('isActive') || ad.isActive);
		return ads;
	});

const getAdsAndPushToAdp = (identifier, docKey, site) => {
	const apps = site.get('apps') || { [identifier]: false };

	if (!apps[identifier]) {
		return Promise.resolve([]);
	}

	return getSections(docKey, site.get('siteId'))
		.then(sections => sections.map(section => getAdConfig(identifier, section)))
		.catch(err =>
			err.code && err.code === 13 && err.message.includes('key does not exist')
				? []
				: Promise.reject(err)
		);
};

const generatePayload = (site, pageGroupData) => {
	// Empty finaJson and dfpAunits
	finalJson = {};
	ADPTags = [];
	const pageGroupPattern = site.get('apConfigs').pageGroupPattern;
	const siteId = site.get('siteId');
	const apps = site.get('apps');
	const isAmpApliteEnabled = apps && apps.ampAplite;
	const apTagDocKey = isAmpApliteEnabled
		? `${docKeys.ampAplite}${siteId}` // amp aplite is rendered as aptag but has data in different doc
		: `${docKeys.apTag}${siteId}`;

	return site
		.getAllChannels()
		.then(channels =>
			promiseForeach(
				channels,
				channel => getChannelPayload(channel, pageGroupData, pageGroupPattern),
				err => false
			)
		)
		.then(() =>
			Promise.join(
				getAdsAndPushToAdp('apTag', apTagDocKey, site),
				getAdsAndPushToAdp('innovativeAds', `fmrt::${site.get('siteId')}`, site),
				(manualAds, innovativeAds) => [finalJson, ADPTags, manualAds, innovativeAds]
			)
		);
};

module.exports = generatePayload;
