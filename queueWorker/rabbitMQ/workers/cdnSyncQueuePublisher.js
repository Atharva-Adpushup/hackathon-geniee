var Promise = require('bluebird'),
    CONFIG = require('../../../configs/config'),
    CONSTANTS = require('../constants/constants'),
    Publisher = require('../libs/publisher'),
    publishJobs = require('../libs/publisherCommon'),
    queueConfig = {
        url: CONFIG.RABBITMQ.URL,
        exchange: CONFIG.RABBITMQ.CDN_SYNC.EXCHANGE,
        queue: CONFIG.RABBITMQ.CDN_SYNC.QUEUE
    },
    options = {
        queueName: CONFIG.RABBITMQ.CDN_SYNC.QUEUE.name
    },
    publisher = new Publisher(queueConfig);

module.exports = {
	publish: function (paramConfig) {
        return publishJobs(publisher, options, paramConfig)
        .then(console.log)
        .catch(console.log);
	}
};