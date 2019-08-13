const AdPushupError = require('../../../helpers/AdPushupError');
const queueWorker = require('../../../queueWorker/rabbitMQ/workers/cdnSyncQueuePublisher');
const CC = require('../../../configs/commonConsts');
const config = require('../../../configs/config');

module.exports = function(site, useDirect = false) {
	const siteId = useDirect ? site : site.get('siteId');
	const paramConfig = {
		siteId
	};
	return queueWorker.publish(paramConfig).then(() => `Published into Sync Cdn Queue ${siteId}`);
};
