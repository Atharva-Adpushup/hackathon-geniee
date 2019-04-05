var AdPushupError = require('../../../helpers/AdPushupError'),
	queueWorker = require('../../../queueWorker/rabbitMQ/workers/cdnSyncQueuePublisher'),
	CC = require('../../../configs/commonConsts'),
	config = require('../../../configs/config');

module.exports = function(site, useDirect = false) {
	const siteId = useDirect ? site : site.get('siteId');
	const paramConfig = {
		siteId: siteId
	};
	return queueWorker.publish(paramConfig).then(function() {
		return 'Published into Sync Cdn Queue ' + siteId;
	});
};
