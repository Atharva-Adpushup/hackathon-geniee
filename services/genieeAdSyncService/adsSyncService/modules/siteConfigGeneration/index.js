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

function generateSiteChannelJSON(channelsWithAds, site) {
	const userEmail = site.get('ownerEmail');
	const siteId = site.get('siteId');
	const siteDomain = site.get('siteDomain');

	const unsyncedGenieeZones = [];
	const unsyncedGenieeDFPCreationZones = [];
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
	let adsenseUnsyncedAds = {};

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
			let isThirdPartyDFP = false;

			if (activeDFPNetwork && activeDFPParentId) {
				adpTagsUnsyncedAds.currentDFP = {
					activeDFPNetwork,
					activeDFPParentId
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

			if (activeDFPNetwork && activeDFPNetwork != config.ADPUSHUP_GAM.ACTIVE_DFP_NETWORK)
				isThirdPartyDFP = true;

			adpTagsUnsyncedAds.publisher = {
				...adpTagsUnsyncedAds.publisher,
				...adpTagsUnsyncedAds.currentDFP,
				name: `${firstName} ${lastName}`,
				id: pubId,
				refreshToken,
				isThirdPartyAdx,
				isThirdPartyDFP
			};

			adsenseUnsyncedAds = { ...adpTagsUnsyncedAds };

			return Promise.map(channelsWithAds, doIt);
		})
		.then(() => ({
			geniee: unsyncedGenieeZones,
			adp: adpTagsUnsyncedAds,
			genieeDFP: unsyncedGenieeDFPCreationZones,
			adsense: adsenseUnsyncedAds
		}));
}

function unSyncedAdsWrapper(unSyncedAds, cb, ad) {
	function processCallback(cb) {
		return cb ? cb(ad) : Promise.resolve({});
	}

	return processCallback(cb).then(appSpecficData => {
		const unsyncedAd =
			ad.network && ad.network == 'adpTags'
				? unsyncedAdsGeneration.checkAdpTagsUnsyncedAds(ad, ad)
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

function adGeneration(docKey, currentDataForSyncing, cb = false) {
	const unSyncedAds = [];
	return appBucket
		.getDoc(docKey)
		.then(docWithCas => {
			const ads = docWithCas.value.ads;
			return promiseForeach(ads, unSyncedAdsWrapper.bind(null, unSyncedAds, cb), (data, err) => {
				console.log(err);
				return false;
			});
		})
		.then(() => {
			currentDataForSyncing.adp.ads = unSyncedAds.length
				? _.concat(currentDataForSyncing.adp.ads, unSyncedAds)
				: currentDataForSyncing.adp.ads;

			return currentDataForSyncing;
		})
		.catch(err =>
			err.name && err.name == 'CouchbaseError' && err.code == 13
				? currentDataForSyncing
				: Promise.reject(err)
		);
}

function apTagAdsSyncing(currentDataForSyncing, site) {
	/**
	 * FLOW:
	 * 1. Read Tag Manager Doc
	 * 2. Fetch Ads
	 * 3. Filter Unsynced Ads
	 * 4. Set Dummy values to some variables to compliment current working flow
	 * 5. Concat ads from Tag manager to current adp.ads
	 */
	return adGeneration(`${docKeys.apTag}${site.get('siteId')}`, currentDataForSyncing, ad =>
		Promise.resolve({
			variations: [
				{
					variationName: 'manual',
					variationId: 'manual',
					pageGroup: null,
					platform: ad.formatData.platform
				}
			]
		})
	);
}

function innovativeAdsSyncing(currentDataForSyncing, site) {
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
							if (pagegroupAssignedToAd) {
								const variationsExist =
									channel.variations && Object.keys(channel.variations).length;
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
							}
							return false;
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

	return adGeneration(
		`${docKeys.interactiveAds}${site.get('siteId')}`,
		currentDataForSyncing,
		generateLogData.bind(null, site)
	);
}

function getGeneratedPromises(site) {
	return unsyncedAdsGeneration
		.getAllUnsyncedAds(site)
		.then(channelWithAds => generateSiteChannelJSON(channelWithAds, site))
		.then(currentDataForSyncing => apTagAdsSyncing(currentDataForSyncing, site))
		.then(currentDataForSyncing => innovativeAdsSyncing(currentDataForSyncing, site));
}

module.exports = {
	generate: getGeneratedPromises
};
