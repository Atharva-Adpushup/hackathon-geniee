const CONSTANTS = require('../constants/constants');

function publishJobs(publisher, options, paramConfig) {
	function publishRabbitMQMessage() {
		return new Promise(function(resolve, reject) {
			return publisher
				.publish(options.queueName, paramConfig)
				.then(function() {
					var message = `${CONSTANTS.SUCCESS_MESSAGES.RABBITMQ.PUBLISHER.MESSAGE_PUBLISHED} to ${
						options.queueName
					}`;

					return resolve(message);
				})
				.catch(function(error) {
					var message =
						CONSTANTS.ERROR_MESSAGES.RABBITMQ.CONSUMER.CONNECT_ERROR + ': ' + error.message;
					return reject(message);
				});
		});
	}
	return publisher
		.makeConnection()
		.then(() => {
			return publishRabbitMQMessage();
		})
		.catch(err => {
			throw err.message;
		});
}

module.exports = publishJobs;
