const CONFIG = require('../../../configs/config');
const Publisher = require('../libs/publisher');
const publishJobs = require('../libs/publisherCommon');

const queueConfig = {
	url: CONFIG.RABBITMQ.URL,
	exchange: CONFIG.RABBITMQ.AMP_SCRIPT_SYNC.EXCHANGE,
	queue: CONFIG.RABBITMQ.AMP_SCRIPT_SYNC.QUEUE
};

const options = {
	queueName: CONFIG.RABBITMQ.AMP_SCRIPT_SYNC.QUEUE.name
};

const publisher = new Publisher(queueConfig);

module.exports = {
	publish(paramConfig) {
		return publishJobs(publisher, options, paramConfig)
			.then(console.log)
			.catch(console.log);
	}
};
