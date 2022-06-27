const _ = require('lodash');
const Promise = require('bluebird');
const { couchbaseService, promiseForeach } = require('node-utils');

const unsyncedAdsGeneration = require('../unsyncedAdsGeneration/index');
const config = require('../../../../../configs/config');
const { docKeys } = require('../../../../../configs/commonConsts');

const appBucket = couchbaseService(
	`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
	config.couchBase.DEFAULT_BUCKET,
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);

/**
 * receives an array of objects [{ channel: 'channelName', unsyncedAds: [] }]
 * creates group adpTags, adsense, etc and add unsynced ads to a group
 * return an object with unsynced ads grouped into adpTags, adSense, etc
 */
function generateSiteChannelJSON(channelsWithAds, site) {
	const userEmail = site.get('ownerEmail');
	const siteId = site.get('siteId');
	const siteDomain = site.get('siteDomain');

	const unsyncedGenieeZones = [];
	const unsyncedGenieeDFPCreationZones = [];
	let adsenseUnsyncedAds = {};
	const adpTagsUnsyncedAds = {
		siteId,
		siteDomain,
		publisher: {
			email: userEmail,
			name: null,
			id: null
		},
		ads: []
	};

	function doIt(channelWithAds) {
		const noAdsFound = !(
			channelWithAds &&
			channelWithAds.unsyncedAds &&
			Object.keys(channelWithAds.unsyncedAds).length
		);

		if (noAdsFound) return false;

		const isChannel = !!channelWithAds.channel;
		const isPageGroupId = !!(isChannel && channelWithAds.channel.genieePageGroupId);
		const { unsyncedAds, channel } = channelWithAds;
		const channelKey = isChannel ? `chnl::${siteId}:${channel.platform}:${channel.pageGroup}` : '';
		const pageGroupId = isPageGroupId ? channel.genieePageGroupId : '';

		_.forEach(unsyncedAds, zones => {
			if (Object.keys(zones.genieeUnsyncedZones).length) {
				unsyncedGenieeZones.push({
					zones: zones.genieeUnsyncedZones,
					siteId,
					channelKey,
					pageGroupId
				});
			}
			if (Object.keys(zones.genieeDFPCreationZones).length) {
				unsyncedGenieeDFPCreationZones.push({
					zones: zones.genieeDFPCreationZones,
					siteId,
					siteDomain,
					channelKey,
					pageGroupId
				});
			}
			if (zones.adpTagsUnsyncedAds && zones.adpTagsUnsyncedAds.length) {
				adpTagsUnsyncedAds.ads = _.concat(adpTagsUnsyncedAds.ads, zones.adpTagsUnsyncedAds);
			}
			if (zones.adsenseUnsyncedAds && zones.adsenseUnsyncedAds.length) {
				adsenseUnsyncedAds.ads = _.concat(adsenseUnsyncedAds.ads, zones.adsenseUnsyncedAds);
			}
		});
	}

	return appBucket
		.getDoc(`${docKeys.user}${userEmail}`)
		.then(docWithCas => {
			const userData = docWithCas.value;
			const { adNetworkSettings = [], firstName, lastName, adServerSettings = {} } = userData;
			const hasAdNetworkSettings = !!adNetworkSettings.length;
			const {
				dfp: { activeDFPNetwork = false, activeDFPParentId = false, isThirdPartyAdx = false } = {}
			} = adServerSettings;

			let pubId = null;
			let refreshToken = config.ADPUSHUP_GAM.REFRESH_TOKEN;

			if (activeDFPNetwork && activeDFPParentId) {
				adpTagsUnsyncedAds.currentDFP = {
					activeDFPNetwork,
					activeDFPParentId,
					isThirdPartyDFP: !!(activeDFPNetwork != config.ADPUSHUP_GAM.ACTIVE_DFP_NETWORK)
				};
			}

			if (hasAdNetworkSettings) {
				pubId = adNetworkSettings[0].pubId;
				_.some(adNetworkSettings, network => {
					if (network.networkName === 'DFP') {
						refreshToken = network.refreshToken;
						return true;
					}
					return false;
				});
			}

			// update data in adpTagsUnsyncedAds
			adpTagsUnsyncedAds.publisher = {
				...adpTagsUnsyncedAds.publisher,
				...adpTagsUnsyncedAds.currentDFP,
				name: `${firstName} ${lastName}`,
				id: pubId,
				refreshToken,
				isThirdPartyAdx
			};

			// copy adpTagsUnsyncedAds containing publisher, site, currentDFP? data
			adsenseUnsyncedAds = { ...adpTagsUnsyncedAds };

			// call doIt for each item in channelsWithAds which further adds the ads to adpTagsUnsyncedAds, adsenseUnsyncedAds, etc and returns them
			return Promise.map(channelsWithAds, doIt);
		})
		.then(() => ({
			geniee: unsyncedGenieeZones,
			adp: adpTagsUnsyncedAds,
			genieeDFP: unsyncedGenieeDFPCreationZones,
			adsense: adsenseUnsyncedAds
		}));
}

/**
 * syncs only the ads that belong to adpTag network
 */
function getUnsyncedAdpTagAdsData(unSyncedAds, cb, additionalParams, ad) {
	function processCallback(cb) {
		return cb ? cb(ad) : Promise.resolve({});
	}

	return processCallback(cb).then(appSpecficData => {
		// TEST the unsyncedAd
		const unsyncedAd =
			ad.network && ad.network == 'adpTags'
				? unsyncedAdsGeneration.checkAdpTagsUnsyncedAds(ad, ad, additionalParams)
				: false;

		if (unsyncedAd) {
			if (ad.formatData && ad.formatData.platform) {
				unsyncedAd.platform = ad.formatData.platform;
			}
			unSyncedAds.push({
				sectionName: ad.name,
				...appSpecficData,
				...unsyncedAd
			});
		}
		return true;
	});
}

function getUnsyncedAdpTagAdsFromDoc(docKey, unsyncedAdsGroup, cb = false, additionalParams = {}) {
	const unSyncedAdpTagAds = [];
	return appBucket
		.getDoc(docKey)
		.then(docWithCas => {
			const ads = docWithCas.value.ads;
			return promiseForeach(
				ads,
				getUnsyncedAdpTagAdsData.bind(null, unSyncedAdpTagAds, cb, additionalParams),
				(data, err) => {
					console.log(err);
					return false;
				}
			);
		})
		.then(() => {
			unsyncedAdsGroup.adp.ads = unSyncedAdpTagAds.length
				? _.concat(unsyncedAdsGroup.adp.ads, unSyncedAdpTagAds)
				: unsyncedAdsGroup.adp.ads;

			return unsyncedAdsGroup;
		})
		.catch(err =>
			err.name && err.name == 'CouchbaseError' && err.code == 13
				? unsyncedAdsGroup
				: Promise.reject(err)
		);
}

function apTagAdsSyncing(unsyncedAdsGroup, site) {
	/**
	 * FLOW:
	 * 1. Read Tag Manager Doc
	 * 2. Fetch Ads
	 * 3. Filter Unsynced Ads
	 * 4. Set Dummy values to some variables to compliment current working flow
	 * 5. Concat ads from Tag manager to current adp.ads
	 */
	const apTagDocKey = `${docKeys.apTag}${site.get('siteId')}`;

	const callbackForEachAd = ad =>
		Promise.resolve({
			variations: [
				{
					variationName: 'manual',
					variationId: 'manual',
					pageGroup: null,
					platform: ad.formatData.platform
				}
			]
		});

	const refreshAdUnitCodesCount = site.getRefreshAdUnitCodesCount();
	const { isReplaceGptSlotOnRefreshEnabled = false } = site.get('apConfigs') || {};

	return getUnsyncedAdpTagAdsFromDoc(apTagDocKey, unsyncedAdsGroup, callbackForEachAd, {
		refreshAdUnitCodesCount,
		isReplaceGptSlotOnRefreshEnabled
	});
}

function ampScriptAdsSyncing(unSyncedAdGroups, site) {
	/**
	 * FLOW:
	 * 1. Read AMP Script Ads Doc
	 * 2. Fetch Ads
	 * 3. Filter Unsynced Ads
	 * 4. Set Dummy values to some variables to compliment current working flow
	 * 5. Concat ads from Tag manager to current adp.ads
	 */
	const docKey = `${docKeys.ampScript}${site.get('siteId')}`;

	const callbackForEachAd = ad =>
		Promise.resolve({
			variations: [
				{
					variationName: 'manual',
					variationId: 'manual',
					pageGroup: null,
					platform: ad.formatData.platform
				}
			]
		});

	// NOTE: We don't need to create duplicate ad units for amp ads as of now, hence overriding the flags here
	const refreshAdUnitCodesCount = 0;
	const isReplaceGptSlotOnRefreshEnabled = false;

	return getUnsyncedAdpTagAdsFromDoc(docKey, unSyncedAdGroups, callbackForEachAd, {
		refreshAdUnitCodesCount,
		isReplaceGptSlotOnRefreshEnabled
	});
}

function innovativeAdsSyncing(unsyncedAdsGroup, site) {
	// called by getUnsyncedAdpTagAdsFromDoc for each ad in innovativeAds doc
	function generateLogData(site, ad) {
		return site
			.getAllChannels()
			.then(channels =>
				_.compact(
					_.flatMap(
						_.map(channels, channel => {
							const pagegroupAssignedToAd = ad.pagegroups.includes(
								`${channel.platform}:${channel.pageGroup}`
							);

							if (!pagegroupAssignedToAd) {
								return false;
							}

							const variationsExist = channel.variations && Object.keys(channel.variations).length;
							const common = {
								channel: `${channel.platform}:${channel.pageGroup}`,
								pageGroup: channel.pageGroup,
								platform: channel.platform
							};

							if (variationsExist) {
								return _.map(channel.variations, variation =>
									!variation.isControl
										? {
												...common,
												variationId: variation.id,
												variationName: variation.name
										  }
										: false
								);
							}

							return {
								...common,
								variationId: null,
								variationName: null
							};
						})
					)
				)
			)
			.then(variationsData => ({ variations: variationsData }))
			.catch(err => {
				console.log(err.message);
				return Promise.reject(
					new Error(
						`Error while fetching variations for ad - ${ad.id} and site - ${site.get(
							'siteId'
						)} | Innovative Ads`
					)
				);
			});
	}

	const refreshAdUnitCodesCount = site.getRefreshAdUnitCodesCount();
	const { isReplaceGptSlotOnRefreshEnabled = false } = site.get('apConfigs') || {};

	return getUnsyncedAdpTagAdsFromDoc(
		`${docKeys.interactiveAds}${site.get('siteId')}`,
		unsyncedAdsGroup,
		generateLogData.bind(null, site),
		{ refreshAdUnitCodesCount, isReplaceGptSlotOnRefreshEnabled }
	);
}

function getGeneratedPromises(site) {
	return (
		unsyncedAdsGeneration
			/* get all the unsynced ads present accross all the channels (channel => variation => section => ad) */
			.getAllUnsyncedAds(site) // [{ channel: 'channelName', unsyncedAds: [] }]
			/* group the unsynced ads under adSense, adpTags, etc */
			.then(channelsWithAds => generateSiteChannelJSON(channelsWithAds, site))
			/* get all the adpTag network ads from the aptag docs */
			.then(unSyncedAdGroups => apTagAdsSyncing(unSyncedAdGroups, site))
			/* get all the adpTag network ads from the amp docs */
			.then(unSyncedAdGroups => ampScriptAdsSyncing(unSyncedAdGroups, site))
			/* get all the adpTag network ads from the innovative docs */
			.then(unSyncedAdGroups => innovativeAdsSyncing(unSyncedAdGroups, site))
	);
}

module.exports = {
	generate: getGeneratedPromises
};
