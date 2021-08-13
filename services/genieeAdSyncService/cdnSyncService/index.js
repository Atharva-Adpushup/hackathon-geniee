const Promise = require('bluebird');
const AdPushupError = require('../../../helpers/AdPushupError');
const cdnSyncQueuePublisher = require('../../../queueWorker/rabbitMQ/workers/cdnSyncQueuePublisher');
const ampScriptQueuePublisher = require('../../../queueWorker/rabbitMQ/workers/ampScriptQueuePublisher');
const CC = require('../../../configs/commonConsts');
const config = require('../../../configs/config');

// useDirect is only sent `true` from transactionLogQueueConsumer which is no longer used
module.exports = function(site, forcePrebidBuild, useDirect = false) {
	const siteId = useDirect ? site : site.get('siteId');
	const isAmpScriptEnabled = !!site.get('apps').ampScript;

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

	if (!isAmpScriptEnabled) {
		return cdnSyncQueuePublisher
			.publish(paramConfig, isSelectiveRolloutEnabled)
			.then(() => `Published into ${selectedQueue.name} Queue ${siteId}`);
	}

	return Promise.join(
		cdnSyncQueuePublisher.publish(paramConfig, isSelectiveRolloutEnabled),
		ampScriptQueuePublisher.publish(paramConfig),
		() => `Published into ${selectedQueue.name} Queue & AMP Script Queue ${siteId}`
	);
};
