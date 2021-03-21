const Promise = require('bluebird');
const AdPushupError = require('../../../helpers/AdPushupError');
const cdnSyncQueuePublisher = require('../../../queueWorker/rabbitMQ/workers/cdnSyncQueuePublisher');
const ampScriptQueuePublisher = require('../../../queueWorker/rabbitMQ/workers/ampScriptQueuePublisher');
const CC = require('../../../configs/commonConsts');
const config = require('../../../configs/config');

module.exports = function(site, useDirect = false) {
	const siteId = useDirect ? site : site.get('siteId');
	const isAmpScriptEnabled = !!site.get('apps').ampScript;
	const paramConfig = {
		siteId
	};

	if (!isAmpScriptEnabled) {
		return cdnSyncQueuePublisher
			.publish(paramConfig)
			.then(() => `Published into Sync Cdn Queue ${siteId}`);
	}

	return Promise.join(
		cdnSyncQueuePublisher.publish(paramConfig),
		ampScriptQueuePublisher.publish(paramConfig),
		() => `Published into Sync Cdn Queue & AMP Script Queue ${siteId}`
	);
};
