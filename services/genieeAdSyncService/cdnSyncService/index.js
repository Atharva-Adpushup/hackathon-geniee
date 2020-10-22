const Promise = require('bluebird');
const AdPushupError = require('../../../helpers/AdPushupError');
const cdnSyncQueuePublisher = require('../../../queueWorker/rabbitMQ/workers/cdnSyncQueuePublisher');
const ampScriptQueuePublisher = require('../../../queueWorker/rabbitMQ/workers/ampScriptQueuePublisher');
const CC = require('../../../configs/commonConsts');
const config = require('../../../configs/config');

// useDirect is only sent `true` from transactionLogQueueConsumer which is no longer used
module.exports = function(site, useDirect = false) {
	const siteId = useDirect ? site : site.get('siteId');
	const isAmpScriptEnabled = !!site.get('apps').ampScript;

	let isSelectiveRolloutEnabled = false;
	const paramConfig = { siteId };

	if (!useDirect) {
		({ isSelectiveRolloutEnabled = false } = site.get('apConfigs') || {});
	}

	if (!isAmpScriptEnabled) {
		return cdnSyncQueuePublisher
			.publish(paramConfig, isSelectiveRolloutEnabled)
			.then(() => `Published into Sync Cdn Queue ${siteId}`);
	}

	return Promise.join(
		cdnSyncQueuePublisher.publish(paramConfig, isSelectiveRolloutEnabled),
		ampScriptQueuePublisher.publish(paramConfig),
		() => `Published into Sync Cdn Queue & AMP Script Queue ${siteId}`
	);
};
