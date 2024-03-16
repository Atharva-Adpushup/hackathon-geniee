const Promise = require('bluebird');
const CONFIG = require('../../../configs/config');
const CONSTANTS = require('../constants/constants');
const Consumer = require('../libs/consumer');
const CustomError = require('./customError');
const adpushup = require('../../../helpers/adpushupEvent');

const queueConfig = {
	url: CONFIG.RABBITMQ.URL,
	exchange: CONFIG.RABBITMQ.EXISTING_MESSAGE_EXISTS.EXCHANGE,
	queue: CONFIG.RABBITMQ.EXISTING_MESSAGE_EXISTS.QUEUE,
	name: 'TRANSACTION LOG SYNC Consumer',
	mail: {}
};
const QUEUE = CONFIG.RABBITMQ.EXISTING_MESSAGE_EXISTS.QUEUE.name;
const consumer = new Consumer(queueConfig);

function validateMessageData(originalMessage) {
	return new Promise((resolve, reject) => {
		const isObject = !!(originalMessage && Object.keys(originalMessage).length);
		if (!isObject) {
			return CONSTANTS.ERROR_MESSAGES.RABBITMQ.CONSUMER.EMPTY_MESSAGE;
		}
		let decodedMessage = originalMessage.content.toString('utf-8');
		try {
			decodedMessage = JSON.parse(decodedMessage);
			return decodedMessage;
		} catch (err) {
			return reject(new CustomError(CONSTANTS.ERROR_MESSAGES.MESSAGE.INVALID_DATA));
		}
	});
}

async function doProcessingAndAck(originalMessage) {
	return validateMessageData(originalMessage)
		.then(message => {
			return message;
		})
		.catch(error => console.log(error));
}

function consumeRabbitMQMessage() {
	return consumer.getMessage(QUEUE).then(doProcessingAndAck);
}

async function init() {
	console.log('Code reached here');
	return consumer
		.makeConnection()
		.then(consumeRabbitMQMessage)
		.then(message => message)
		.catch(error => {
			let message = error.message || 'Site syncing message fetch failed';
			return message;
		});
}

init();
