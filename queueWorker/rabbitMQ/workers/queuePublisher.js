const CONFIG = require('../../../configs/config');
const Publisher = require('../libs/publisher');
const publishJobs = require('../libs/publisherCommon');

const publishers = {};

module.exports = {
	publish: function(queueConfig, message) {
		const queueName = queueConfig.QUEUE.name;

		if (!publishers[queueName]) {
			const publisherConfig = {
				url: CONFIG.RABBITMQ.URL,
				exchange: queueConfig.EXCHANGE,
				queue: queueConfig.QUEUE
			};
			publishers[queueName] = new Publisher(publisherConfig);
		}

		console.log('LOG:: Publishing message to ', queueName, message);
		const options = { queueName };

		return publishJobs(publishers[queueName], options, message);
	}
};
