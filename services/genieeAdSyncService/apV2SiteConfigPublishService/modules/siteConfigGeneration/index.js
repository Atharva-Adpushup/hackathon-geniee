const _ = require('lodash'),
	Promise = require('bluebird'),
	genieeZoneSyncService = require('../../../genieeZoneSyncService/index'),
	config = require('../../../../../configs/config'),
	{ docKeys } = require('../../../../../configs/commonConsts'),
	{ couchbaseService } = require('node-utils'),
	appBucket = couchbaseService(
		`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
		config.couchBase.DEFAULT_BUCKET,
		config.couchBase.DEFAULT_BUCKET_PASSWORD
	);

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

function tagManagerAdsSyncing(currentDataForSyncing, site) {
	/**
	 * FLOW:
	 * 1. Read Tag Manager Doc
	 * 2. Fetch Ads
	 * 3. Filter Unsynced Ads
	 * 4. Set Dummy values to some variables to compliment current working flow
	 * 5. Concat ads from Tag manager to current adpTagsUnsyncedZones
	 */
	return appBucket
		.getDoc(`${docKeys.tagManager}${site.get('siteId')}`)
		.then(docWithCas => {
			const ads = docWithCas.value.ads,
				unSyncedAds = _.map(ads, ad => {
					return genieeZoneSyncService.checkAdpTagsUnsyncedZones(ad, ad);
				});
			currentDataForSyncing.adp.ads = unSyncedAds.length
				? _.concat(currentDataForSyncing.adp.ads, unSyncedAds)
				: null;
			return currentDataForSyncing;
		})
		.catch(err => {
			return err.name && err.name == 'CouchbaseError' && err.code == 13
				? currentDataForSyncing
				: Promise.reject(err);
		});
}

/**
 * TODO:
 * 1. Ads Syncing from Manaul Doc for ADP
 * 2. Ads Syncing from Manaul Doc for Geniee
 */

function getGeneratedPromises(siteModelItem) {
	return genieeZoneSyncService
		.getAllUnsyncedZones(siteModelItem)
		.then(channelAndZones => generateSiteChannelJSON(channelAndZones, siteModelItem))
		.then(currentDataForSyncing => tagManagerAdsSyncing(currentDataForSyncing, siteModelItem));
}

module.exports = {
	generate: getGeneratedPromises
};
