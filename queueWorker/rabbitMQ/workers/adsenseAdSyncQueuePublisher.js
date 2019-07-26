const CONFIG = require('../../../configs/config');
const Publisher = require('../libs/publisher');
const publishJobs = require('../libs/publisherCommon');
const queueConfig = {
	url: CONFIG.RABBITMQ.URL,
	exchange: CONFIG.RABBITMQ.ADSENSE_AD_SYNC.EXCHANGE,
	queue: CONFIG.RABBITMQ.ADSENSE_AD_SYNC.QUEUE
};
const options = {
	queueName: CONFIG.RABBITMQ.ADSENSE_AD_SYNC.QUEUE.name
};
const publisher = new Publisher(queueConfig);

module.exports = {
	publish: function(paramConfig) {
		return publishJobs(publisher, options, paramConfig)
			.then(console.log)
			.catch(console.log);
	}
};
