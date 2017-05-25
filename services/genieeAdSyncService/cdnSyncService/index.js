var AdPushupError = require('../../../helpers/AdPushupError'),
    queueWorker = require('../../../queueWorker/rabbitMQ/workers/cdnSyncQueuePublisher'), 
    CC = require('../../../configs/commonConsts'),
    config = require('../../../configs/config');

module.exports = function (site) {
    var paramConfig = {
        siteId: site.get('siteId')
    };
    return queueWorker.publish(paramConfig)
    .then(function() {
        return 'Published into Sync Cdn Queue';
    });
}