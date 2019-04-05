const Promise = require('bluebird');
const CONFIG = require('../../../configs/config');
const CONSTANTS = require('../constants/constants');
const Consumer = require('../libs/consumer');
const CustomError = require('./customError');
const logger = require('../../../helpers/globalBucketLogger');
const createTransactionLog = require('../../../services/transactionLogService/index');
const syncCdn = require('../../../services/genieeAdSyncService/cdnSyncService/index');

const queueConfig = {
	url: CONFIG.RABBITMQ.URL,
	exchange: CONFIG.RABBITMQ.TRANSACTION_LOG_SYNC.EXCHANGE,
	queue: CONFIG.RABBITMQ.TRANSACTION_LOG_SYNC.QUEUE,
	name: 'TRANSACTION LOG SYNC Consumer',
	mail: {
		ack: {
			header: 'Alert close for Service: TRANSACTION LOG SYNC Consumer',
			content: '<p>Consumer is up and running.</p>'
		},
		nack: {
			header: 'Alert open for Service: TRANSACTION LOG SYNC Consumer',
			content: '<p>Consumer failed multiple times. Please check on priority.</p>'
		},
		emailId: 'yomesh.gupta@adpushup.com, zahin@adpushup.com'
	}
};
const QUEUE = CONFIG.RABBITMQ.TRANSACTION_LOG_SYNC.QUEUE.name;
const consumer = new Consumer(queueConfig);

let counter = 0;

function validateMessageData(originalMessage) {
	return new Promise((resolve, reject) => {
		const isObject = !!(originalMessage && Object.keys(originalMessage).length);
		if (!isObject) {
			return reject(new CustomError(CONSTANTS.ERROR_MESSAGES.RABBITMQ.CONSUMER.EMPTY_MESSAGE));
		}
		let decodedMessage = originalMessage.content.toString('utf-8');
		try {
			decodedMessage = JSON.parse(decodedMessage);
		} catch (err) {
			return reject(new CustomError(CONSTANTS.ERROR_MESSAGES.MESSAGE.INVALID_DATA));
		}
		const isCorrectRootLevelFormat = !!(decodedMessage.siteId && decodedMessage.siteDomain && decodedMessage.ads);
		const isCorrectMessage = !!(isObject && isCorrectRootLevelFormat);
		if (isCorrectMessage) {
			return resolve(decodedMessage);
		} else {
			return reject(new CustomError(CONSTANTS.ERROR_MESSAGES.MESSAGE.INVALID_DATA));
		}
	});
}

function errorHandler(error, originalMessage) {
	let customErrorMessage = error.message;
	const isEmptyConsumerMessage = !!(customErrorMessage === CONSTANTS.ERROR_MESSAGES.RABBITMQ.CONSUMER.EMPTY_MESSAGE);
	const isInvalidConsumerMessage = !!(customErrorMessage === CONSTANTS.ERROR_MESSAGES.MESSAGE.INVALID_DATA);

	if (isEmptyConsumerMessage || isInvalidConsumerMessage) {
		isInvalidConsumerMessage ? consumer.acknowledge(originalMessage) : null;
		console.log(customErrorMessage);
		return isEmptyConsumerMessage ? 5000 : 0; // Restart the consumer if input is invalid or queue is empty.
	} else if (counter > CONSTANTS.CDN_SYNC_MAX_ATTEMPTS) {
		counter = 0;
		let decodedMessage = originalMessage.content.toString('utf-8');
		decodedMessage = JSON.parse(decodedMessage);
		logger({
			source: 'TRANSACTION SYNC ERROR LOGS',
			message: `Error while DB TRANSACTION SYNC and error messgae : ${customErrorMessage}`,
			debugData: `Site id : ${decodedMessage.siteId}`,
			details: `${JSON.stringify(error)}`
		});

		return syncCdn(decodedMessage.siteId, true).then(() => {
			consumer.acknowledge(originalMessage);
			return Promise.reject(error);
		});
	}
	counter = counter + 1; // increase counter
	consumer.reject(originalMessage);
	return Promise.reject(error);
}

function doProcessingAndAck(originalMessage) {
	return validateMessageData(originalMessage)
		.then(createTransactionLog)
		.then(() => {
			counter = 0;
			consumer.acknowledge(originalMessage);
			return 0;
		})
		.catch(error => errorHandler(error, originalMessage));
}

function consumeRabbitMQMessage() {
	return consumer.getMessage(QUEUE).then(doProcessingAndAck);
}

function init() {
	return consumer
		.makeConnection()
		.then(consumeRabbitMQMessage)
		.then((timer = 0) => setTimeout(init, timer))
		.catch(error => {
			let message = error.message || 'TRANSACTION LOGS SYNC FAILED';
			console.log(message);
			setTimeout(() => {
				init();
			}, 5000);
		});
}

init();
