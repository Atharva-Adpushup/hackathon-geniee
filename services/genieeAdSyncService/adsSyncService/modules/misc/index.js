const axios = require('axios');
const axiosRetry = require('axios-retry');
const { RABBITMQ } = require('../../../../../configs/config');
const _cloneDeep = require('lodash/cloneDeep');
const {
	SELECTIVE_ROLLOUT_DEPENDENCIES: {
		ADP_TAG_SYNC_CONSUMER,
		ADSENSE_AD_SYNC_CONSUMER,
		CDN_SYNC_CONSUMER,
		GENIEE_ADPUSHUP
	}
} = require('../../../../../configs/commonConsts');
const commonConsts = require('../../../../../configs/commonConsts');
const config = require('../../../../../configs/config');
const { sendEmail } = require('../../../../../helpers/queueMailer');
const { filterFalsyObjectKeys } = require('../../../../../helpers/commonFunctions');

axiosRetry(axios, {
	retryDelay: axiosRetry.exponentialDelay
});

module.exports = {
	isRequirePostScribe: function(ads) {
		var isRequired = false,
			iterator,
			adsLength;

		for (iterator = 0, adsLength = ads.length; iterator < adsLength; iterator++) {
			if (!ads[iterator].syncStatus || !ads[iterator].adslot) {
				isRequired = true;
				break;
			}
		}

		return isRequired;
	},
	getSetupMap: function(channels) {
		var setupMap = {},
			iterator,
			channelsLength,
			channelArray,
			platform,
			pageGroup;

		for (iterator = 0, channelsLength = channels.length; iterator < channelsLength; iterator++) {
			channelArray = channels[iterator].split(':');
			platform = channelArray[0];
			pageGroup = channelArray[1];

			if (!setupMap[platform]) {
				setupMap[platform] = [];
			}

			setupMap[platform].push(pageGroup);
		}

		return setupMap;
	},
	isSelectiveRolloutEnabled: function(selectiveRolloutConfig) {
		return (
			selectiveRolloutConfig && selectiveRolloutConfig.enabled && selectiveRolloutConfig.feature
		);
	},
	makeSelectiveQueueConfig: function(queueConfig, selectiveRolloutInstanceId) {
		const selectiveQueue = _cloneDeep(queueConfig);
		selectiveQueue.QUEUE.name += '_' + selectiveRolloutInstanceId;
		return selectiveQueue;
	},
	isServiceSelectivelyRolledOut: function(selectiveRolloutFeatureConfig, service) {
		return selectiveRolloutFeatureConfig?.dependencies[service]?.selectivelyRolledOut;
	},
	hasUnsyncedAdpAds: function(adpConfig) {
		return !!(adpConfig && adpConfig.ads && adpConfig.ads.length);
	},

	hasUnsyncedAdsenseAds: function(adsenseConfig) {
		return !!(adsenseConfig && adsenseConfig.ads && adsenseConfig.ads.length);
	},
	isSiteConfigHasUnSyncedAds: function(siteConfigItems) {
		const { adp, adsense } = siteConfigItems;
		return this.hasUnsyncedAdpAds(adp) || this.hasUnsyncedAdsenseAds(adsense);
	},
	getAdSyncQueueConfigs: function(isSelectiveRolloutEnabled, selectiveRolloutFeatureConfig) {
		const { ADP_TAG_SYNC, ADSENSE_AD_SYNC } = RABBITMQ;

		const queueConfigs = {
			ADP_TAG_SYNC,
			ADSENSE_AD_SYNC
		};

		if (!isSelectiveRolloutEnabled) {
			return queueConfigs;
		}

		const selectiveRolloutInstanceId = selectiveRolloutFeatureConfig.instance.id;

		const isAdpTagSyncConsumerRolledOut = this.isServiceSelectivelyRolledOut(
			selectiveRolloutFeatureConfig,
			ADP_TAG_SYNC_CONSUMER
		);

		if (isAdpTagSyncConsumerRolledOut) {
			queueConfigs.ADP_TAG_SYNC = this.makeSelectiveQueueConfig(
				ADP_TAG_SYNC,
				selectiveRolloutInstanceId
			);
		}

		const isAdsenseAdSyncConsumerRolledOut = this.isServiceSelectivelyRolledOut(
			selectiveRolloutFeatureConfig,
			ADSENSE_AD_SYNC_CONSUMER
		);

		if (isAdsenseAdSyncConsumerRolledOut) {
			queueConfigs.ADSENSE_AD_SYNC = this.makeSelectiveQueueConfig(
				ADSENSE_AD_SYNC,
				selectiveRolloutInstanceId
			);
		}

		return queueConfigs;
	},
	getSyncCdnQueueConfig: function(site, isSelectiveRolloutEnabled, selectiveRolloutFeatureConfig) {
		const apConfigs = site.get('apConfigs') || {};
		const { SELECTIVE_ROLLOUT, CDN_SYNC } = RABBITMQ;

		// TODO: remove below if block once isSelectiveRolloutEnabled is removed
		if (apConfigs.isSelectiveRolloutEnabled) {
			return SELECTIVE_ROLLOUT;
		}

		const isCdnSyncConsumerRolledOut = this.isServiceSelectivelyRolledOut(
			selectiveRolloutFeatureConfig,
			CDN_SYNC_CONSUMER
		);

		// new selective rollout feature
		if (!isSelectiveRolloutEnabled || !isCdnSyncConsumerRolledOut) {
			return CDN_SYNC;
		}

		const selectiveCdnSyncQueueConfig = this.makeSelectiveQueueConfig(
			CDN_SYNC,
			selectiveRolloutFeatureConfig.instance.id
		);

		return selectiveCdnSyncQueueConfig;
	},
	redirectToSelectiveConsole: function(selectiveRolloutFeatureConfig, siteId, queryParams) {
		const validQueryParams = filterFalsyObjectKeys(queryParams);

		const {
			instance: { host },
			feature
		} = selectiveRolloutFeatureConfig;

		const requestConfig = {
			method: 'get',
			url: `${host}/api/utils/syncCdn`,
			params: { ...validQueryParams, sites: siteId }
		};

		return axios(requestConfig)
			.then(() => `Triggered selective rollout site sync - ${siteId}`)
			.catch(err =>
				sendEmail({
					queue: commonConsts.QUEUE_NAMES.MAILER,
					data: {
						to: config.SITE_SYNC_ERROR_ALERT_REPORTER,
						subject: `Can not redirect site sync request for ${feature} - [${config.deployment}]`,
						body: `
					<h3>SiteId: ${siteId}</h3>
					${err.toString()}
				`
					}
				}).then(() => `${commonConsts.SITE_SYNCING_ERROR_MESSAGE} - ${err.toString()} - ${siteId}`)
			);
	},
	isConsoleSelectivelyRolledOut: function(
		isSelectiveRolloutEnabled,
		selectiveRolloutFeatureConfig
	) {
		return (
			isSelectiveRolloutEnabled &&
			selectiveRolloutFeatureConfig?.dependencies[GENIEE_ADPUSHUP]?.selectivelyRolledOut &&
			config.deployment !== selectiveRolloutFeatureConfig.feature
		);
	}
};
