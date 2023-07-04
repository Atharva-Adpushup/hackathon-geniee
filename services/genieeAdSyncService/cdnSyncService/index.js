const Promise = require('bluebird');
const queuePublisher = require('../../../queueWorker/rabbitMQ/workers/queuePublisher');
const CC = require('../../../configs/commonConsts');
const {
	getSyncPublisherForScriptType,
	getEnabledPublishersByTypeList
} = require('./commonFunctions');

const {
	RABBITMQ: { CDN_SYNC }
} = require('../../../configs/config');

// useDirect is only sent `true` from transactionLogQueueConsumer which is no longer used
module.exports = function(site, syncOptions) {
	const { forcePrebidBuild, useDirect = false, options = {}, syncCdnQueue } = syncOptions;
	const siteId = useDirect ? site : site.get('siteId');
	const isAmpScriptEnabled = !!site.get('apps').ampScript;
	const isDVCEnabled = !!site.get('apps').ampDVC;

	const paramConfig = { siteId };

	if (forcePrebidBuild === 'true') {
		paramConfig.forcePrebidBuild = true;
	}

	// If Keys provided in parameter, then sync in only one queue based on keys
	if (options.type) {
		const publisher = getSyncPublisherForScriptType(options.type, {
			isAmpScriptEnabled,
			isDVCEnabled
		});

		if (publisher === null) {
			return `${options.type} is not available on site ${siteId}`;
		}
		if (publisher === queuePublisher) {
			return publisher
				.publish(syncCdnQueue || CDN_SYNC, paramConfig)
				.then(() => `Published into ${syncCdnQueue.name} Queue ${siteId}`);
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
		if (publisher === queuePublisher) {
			return publisher.publish(syncCdnQueue || CDN_SYNC, paramConfig);
		} else {
			return publisher.publish(paramConfig);
		}
	});

	return Promise.all(publishTasks).then(() => `Published into ${types.join(', ')} ${siteId}`);
};
