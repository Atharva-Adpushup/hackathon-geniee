const Promise = require('bluebird');
const AdPushupError = require('../../../helpers/AdPushupError');
const cdnSyncQueuePublisher = require('../../../queueWorker/rabbitMQ/workers/cdnSyncQueuePublisher');
const CC = require('../../../configs/commonConsts');
const config = require('../../../configs/config');
const { getSyncPublisherForScriptType, getEnabledPublishersByTypeList } = require('./commonFunctions');

// useDirect is only sent `true` from transactionLogQueueConsumer which is no longer used
module.exports = function(site, syncOptions) {
	const { forcePrebidBuild, useDirect = false, options = {} } = syncOptions;
	const siteId = useDirect ? site : site.get('siteId');
	const isAmpScriptEnabled = !!site.get('apps').ampScript;
	const isDVCEnabled = !!site.get('apps').ampDVC;

	let isSelectiveRolloutEnabled = false;
	const paramConfig = { siteId };

	if (forcePrebidBuild === 'true') {
		paramConfig.forcePrebidBuild = true;
	}
	if (!useDirect) {
		({ isSelectiveRolloutEnabled = false } = site.get('apConfigs') || {});
	}

	const {
		CDN_SYNC: { QUEUE: MAIN_QUEUE },
		SELECTIVE_ROLLOUT: { QUEUE: SELECTIVE_ROLLOUT_QUEUE }
	} = config.RABBITMQ;

	let selectedQueue = isSelectiveRolloutEnabled ? SELECTIVE_ROLLOUT_QUEUE : MAIN_QUEUE;

	// If Keys provided in parameter, then sync in only one queue based on keys
	if (options.type) {
		const publisher = getSyncPublisherForScriptType(options.type, { isAmpScriptEnabled, isDVCEnabled });

		if (publisher === null) {
			return `${options.type} is not available on site ${siteId}`;
		}
		if (publisher === cdnSyncQueuePublisher) {
			return publisher
				.publish(paramConfig, isSelectiveRolloutEnabled)
				.then(() => `Published into ${selectedQueue.name} Queue ${siteId}`);
		}
		return publisher
			.publish(paramConfig)
			.then(() => `Published into ${options.type} Queue ${siteId}`);
	}

	// For No Key Provided
	const types = [];

	if (isDVCEnabled) {
		types.push(CC.SCRIPT_TYPE.DVC);
	}

	if (isAmpScriptEnabled) {
		types.push(CC.SCRIPT_TYPE.AMP);
	}

	types.push(CC.SCRIPT_TYPE.ADPUSHUPJS);

	const publishers = getEnabledPublishersByTypeList(types, { isAmpScriptEnabled, isDVCEnabled });

	const publishTasks = publishers.map(publisher => {
		if (publisher === cdnSyncQueuePublisher) {
			return publisher.publish(paramConfig, isSelectiveRolloutEnabled);
		} else {
			return publisher.publish(paramConfig);
		}
	});

	return Promise.all(publishTasks).then(() => `Published into ${types.join(', ')} ${siteId}`);
};
