const Promise = require('bluebird');
const CC = require('../../../configs/commonConsts');
const {
	getQueueNameForScriptType
} = require('./commonFunctions');

const {publishToRabbitMqQueue} = require("../../../helpers/utils");

// useDirect is only sent `true` from transactionLogQueueConsumer which is no longer used
module.exports = function(site, syncOptions) {
	const { useDirect = false, options = {}, syncCdnQueue } = syncOptions;
	const siteId = useDirect ? site : site.get('siteId');
	const isAmpScriptEnabled = !!site.get('apps').ampScript;
	const isDVCEnabled = !!site.get('apps').ampDVC;

	const paramConfig = { siteId };

	if (options.forcePrebidBuild === 'true') {
		paramConfig.forcePrebidBuild = true;
	}


	// If Keys provided in parameter, then sync in only one queue based on keys
	if (options.type) {
		const queueName = getQueueNameForScriptType(options.type, {
			isAmpScriptEnabled,
			isDVCEnabled
		});

		if (queueName === null) {
			return `${options.type} is not available on site ${siteId}`;
		}
		return publishToRabbitMqQueue(queueName, paramConfig);
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

	const publishTasks = types.map(type => {
		const queueName = getQueueNameForScriptType(type, {
			isAmpScriptEnabled,
			isDVCEnabled
		});
		return publishToRabbitMqQueue(queueName, paramConfig);
	});

	return Promise.all(publishTasks).then(() => `Published into ${types.join(', ')} ${siteId}`);
};
