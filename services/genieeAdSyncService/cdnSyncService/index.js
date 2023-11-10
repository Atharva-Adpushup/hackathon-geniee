const Promise = require('bluebird');
const CC = require('../../../configs/commonConsts');
const { getQueueNameForScriptType } = require('./commonFunctions');

const { publishToRabbitMqQueue } = require('../../../helpers/utils');

function syncSiteForScriptType(scriptType, { siteConfig, typesApplicable }, syncCdnQueue) {
	const queueName = getQueueNameForScriptType(scriptType, typesApplicable, syncCdnQueue);

	if (queueName === null) {
		return `${options.type} is not available on site ${siteId}`;
	}
	return publishToRabbitMqQueue(queueName, siteConfig);
}

// useDirect is only sent `true` from transactionLogQueueConsumer which is no longer used
module.exports = function(site, syncOptions) {
	const { useDirect = false, options = {}, syncCdnQueue } = syncOptions;
	const siteId = useDirect ? site : site.get('siteId');
	const isAmpScriptEnabled = !!site.get('apps').ampScript;
	const isDVCEnabled = !!site.get('apps').ampDVC;

	const siteConfig = { siteId };

	if (options.forcePrebidBuild === 'true') {
		siteConfig.forcePrebidBuild = true;
	}

	const typesApplicable = {
		isAmpScriptEnabled,
		isDVCEnabled
	};

	// If Keys provided in parameter, then sync in only one queue based on keys
	if (options.type) {
		return syncSiteForScriptType(options.type, { siteConfig, typesApplicable }, syncCdnQueue);
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
		return syncSiteForScriptType(type, { siteConfig, typesApplicable }, syncCdnQueue);
	});

	return Promise.all(publishTasks).then(() => `Published into ${types.join(', ')} ${siteId}`);
};
