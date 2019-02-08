const _ = require('lodash');
const Promise = require('bluebird');
const genieeZoneSyncService = require('../../../genieeZoneSyncService/index');
const config = require('../../../../../configs/config');
const { docKeys } = require('../../../../../configs/commonConsts');
const { couchbaseService } = require('node-utils');
const { checkForLog } = require('../../../../../helpers/commonFunctions');

const appBucket = couchbaseService(
	`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
	config.couchBase.DEFAULT_BUCKET,
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);

function generateSiteChannelJSON(channelAndZones, siteModelItem) {
	const userEmail = siteModelItem.get('ownerEmail');
	let unsyncedGenieeZones = [];
	let unsyncedGenieeDFPCreationZones = [];
	let adpTagsUnsyncedZones = {
		siteId: siteModelItem.get('siteId'),
		siteDomain: siteModelItem.get('siteDomain'),
		publisherEmailAddress: userEmail,
		publisherName: '',
		ads: []
	};
	let logsUnsyncedZones = {
		siteId: siteModelItem.get('siteId'),
		siteDomain: siteModelItem.get('siteDomain'),
		publisherEmailAddress: userEmail,
		publisherName: '',
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
					siteDomain: siteModelItem.get('siteDomain'),
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
				const apConfigs = siteModelItem.get('apConfigs') || false;
				const activeDFPNetwork = apConfigs && apConfigs.activeDFPNetwork ? apConfigs.activeDFPNetwork : false;
				const activeDFPParentId =
					apConfigs && apConfigs.activeDFPParentId ? apConfigs.activeDFPParentId : false;
				if (activeDFPNetwork && activeDFPParentId) {
					adpTagsUnsyncedZones.currentDFP = {
						activeDFPNetwork,
						activeDFPParentId
					};
				}
				adpTagsUnsyncedZones.ads = _.concat(adpTagsUnsyncedZones.ads, zones.adpTagsUnsyncedZones);
			}
			if (zones.logsUnsyncedZones && zones.logsUnsyncedZones.length) {
				logsUnsyncedZones.ads = _.concat(logsUnsyncedZones.ads, zones.logsUnsyncedZones);
			}
		});
	}

	return appBucket.getDoc(`${docKeys.user}${userEmail}`).then(docWithCas => {
		const userData = docWithCas.value;

		logsUnsyncedZones.publisherName = `${userData.firstName} ${userData.lastName}`;
		adpTagsUnsyncedZones.publisherName = `${userData.firstName} ${userData.lastName}`;

		return Promise.map(channelAndZones, doIt).then(() => {
			return {
				geniee: unsyncedGenieeZones,
				adp: adpTagsUnsyncedZones,
				genieeDFP: unsyncedGenieeDFPCreationZones,
				logs: logsUnsyncedZones
			};
		});
	});
}

function tagManagerAdsSyncing(currentDataForSyncing, site) {
	/**
	 * FLOW:
	 * 1. Read Tag Manager Doc
	 * 2. Fetch Ads
	 * 3. Filter Unsynced Ads
	 * 4. Set Dummy values to some variables to compliment current working flow
	 * 5. Concat ads from Tag manager to current adp.ads
	 */
	return appBucket
		.getDoc(`${docKeys.apTag}${site.get('siteId')}`)
		.then(docWithCas => {
			let logUnsyncedAds = [];

			const ads = docWithCas.value.ads;
			const unSyncedAds = _.compact(
				_.map(ads, ad => {
					if (checkForLog(ad)) {
						const computedData = {
							variationName: 'manual',
							sectionName: ad.name,
							...ad
						};
						logUnsyncedAds.push(computedData);
					}
					let unsyncedZone =
						ad.network && ad.network == 'adpTags'
							? genieeZoneSyncService.checkAdpTagsUnsyncedZones(ad, ad)
							: false;

					if (unsyncedZone) {
						if (ad.formatData && ad.formatData.platform) {
							unsyncedZone.platform = ad.formatData.platform;
						}

						return {
							variationName: 'manual',
							sectionName: ad.name,
							...unsyncedZone
						};
					}

					return unsyncedZone;
				})
			);

			currentDataForSyncing.adp.ads = unSyncedAds.length
				? _.concat(currentDataForSyncing.adp.ads, unSyncedAds)
				: currentDataForSyncing.adp.ads;

			currentDataForSyncing.logs.ads = logUnsyncedAds.length
				? _.concat(currentDataForSyncing.logs.ads, logUnsyncedAds)
				: currentDataForSyncing.logs.ads;

			return currentDataForSyncing;
		})
		.catch(err => {
			return err.name && err.name == 'CouchbaseError' && err.code == 13
				? currentDataForSyncing
				: Promise.reject(err);
		});
}

function getGeneratedPromises(siteModelItem) {
	return genieeZoneSyncService
		.getAllUnsyncedZones(siteModelItem)
		.then(channelAndZones => generateSiteChannelJSON(channelAndZones, siteModelItem))
		.then(currentDataForSyncing => tagManagerAdsSyncing(currentDataForSyncing, siteModelItem));
}

module.exports = {
	generate: getGeneratedPromises
};
