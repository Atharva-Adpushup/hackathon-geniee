var Promise = require('bluebird'),
    extend = require('extend'),
	{ fileLogger } = require('../../../helpers/logger/file/index'),
    
    siteModel = require('../../../models/siteModel'),
    CONFIG = require('../../../configs/config'),
    CONSTANTS = require('../constants/constants'),
    Consumer = require('../libs/consumer'),
    CustomError = require('./customError'),
    syncCDNService = require('../../../services/genieeAdSyncService/cdnSyncService/cdnSyncConsumer.js'),
    queueConfig = {
        url: CONFIG.RABBITMQ.URL,
        exchange: CONFIG.RABBITMQ.CDN_SYNC.EXCHANGE,
        queue: CONFIG.RABBITMQ.CDN_SYNC.QUEUE,
        name: "CDN SYNC Consumer",
        mail: {
            ack: {
                header: "Alert close for Service: CDN SYN Consumer",
                content: "<p>Consumer is up and running.</p>",
            },
            nack: {
                header: "Alert open for Service: CDN SYN Consumer",
                content: "<p>Consumer failed multiple times. Please check on priority.</p>",
            },
            emailId: "yomesh.gupta@adpushup.com, zahin@adpushup.com"
        }
    },
    options = {
        queueName: CONFIG.RABBITMQ.CDN_SYNC.QUEUE.name
    },
    QUEUE = CONFIG.RABBITMQ.CDN_SYNC.QUEUE.name,
    consumer = new Consumer(queueConfig);

function validateMessageData(originalMessage) {
	return new Promise((resolve, reject) => {
		const isObject = !!(originalMessage && Object.keys(originalMessage).length);
		const resultArray = [];
		const errorObject = {};

		if (!isObject) {
			errorObject.message = CONSTANTS.ERROR_MESSAGES.RABBITMQ.CONSUMER.EMPTY_MESSAGE;
			errorObject.data = extend(true, {}, originalMessage);

			return reject(new CustomError(errorObject));
		}

		let decodedMessage = originalMessage.content.toString('utf-8');

		try {
			decodedMessage = JSON.parse(decodedMessage);
		} catch (err) {
			errorObject.message = CONSTANTS.ERROR_MESSAGES.MESSAGE.INVALID_DATA;
			errorObject.data = extend(true, {}, originalMessage);

			return reject(new CustomError(errorObject));
		}

		const isCorrectRootLevelFormat = !!(decodedMessage.siteId);
		const isCorrectMessage = !!(isObject && isCorrectRootLevelFormat);

		if (isCorrectMessage) {
            return resolve([decodedMessage, originalMessage]);
		} else {
			errorObject.message = CONSTANTS.ERROR_MESSAGES.MESSAGE.INVALID_DATA;
			errorObject.data = extend(true, {}, originalMessage);

			return reject(new CustomError(errorObject));
		}
	});
}

function acknowledgeMessage(message) {
	this.acknowledge(message);
	return true;
}

function getStatusObj(status, siteId) {
	var computedObj = {
		status: status,
		siteId: siteId
	};

	return computedObj;
}

function getSuccessStatusObj(siteId) {
    const infoText = `File with site id: ${siteId} generated successfully`;

	fileLogger.info(infoText);
    console.log(infoText);
	return getStatusObj(1, siteId);
}

function getFailureStatusObj(siteId, err) {
    const errorText = `Sync Process Failed: ${err.toString()} for siteId ${siteId}`;

	fileLogger.info(errorText);
    fileLogger.error(err);
    console.log(errorText);
	return getStatusObj(0, siteId);
}

function syncCDN(decodedMessage, originalMessage) {
    if (!decodedMessage.siteId) {
        throw new CustomError({'message': 'Unable to sync file with cdn', 'originalMessage': originalMessage, 'siteId': false});
    }
    const siteId = decodedMessage.siteId;
    return siteModel.getSiteById(siteId)
    .then(site => {
        return syncCDNService(site)
        .then(getSuccessStatusObj.bind(null, siteId))
        .then(response => {
            console.log(`Sync CDN Service over for site id : ${response.siteId} with status : ${response.status}`);
            return originalMessage;
        })
        .catch(err => {
            console.log(err);
            throw new CustomError({'message': 'Unable to sync file with cdn', 'originalMessage': originalMessage, 'siteId': decodedMessage.siteId});
        })
    })
}

function consumeRabbitMQMessage() {
	return consumer
		.getMessage(QUEUE)
		.then(validateMessageData)
		.spread(syncCDN)
		.then(acknowledgeMessage.bind(consumer))
		.then(consumeRabbitMQMessage)
		/**
		 * NOTE:		This catch will handle errors for upper Promise chain
		 * OBJECTIVE:	To catch custom thrown errors and handle them appropriately
		 * DESCRIPTION:	1) It will catch Custom Errors for Empty/Invalid consumer message 
		 * 				2) Throw error to upper level catch if it is not custom
		 * 				3) Acknowledge consumer for Invalid message, log it in console
		 * 				   and restart message consume functionality
		 */
		.catch((error) => {
			let customErrorMessage;
            customErrorMessage = error.message;

			const isEmptyConsumerMessage = !!(customErrorMessage && (customErrorMessage.message === CONSTANTS.ERROR_MESSAGES.RABBITMQ.CONSUMER.EMPTY_MESSAGE) && !Object.keys(customErrorMessage.data).length);
			const isInvalidConsumerMessage = !!(customErrorMessage && (customErrorMessage.message === CONSTANTS.ERROR_MESSAGES.MESSAGE.INVALID_DATA));

			if (isEmptyConsumerMessage || isInvalidConsumerMessage) {
				if (isInvalidConsumerMessage) {
					consumer.acknowledge(customErrorMessage.data);
                    // Restart the consumer immediately if input is invalid which means queue is not empty and no other problem occurs.
                    return setTimeout(consumeRabbitMQMessage, 0);
				}
				console.log(customErrorMessage.message);
			} else if (customErrorMessage.message === CONSTANTS.ERROR_MESSAGES.MESSAGE.CDN_SYNC_ERROR) {
                console.log(`Geniee Sync error : ${customErrorMessage.message} for site id : ${customErrorMessage.siteId}`);
                consumer.reject(customErrorMessage.originalMessage);
            }

			throw error;
		});
}

function init() {
	return consumer.makeConnection()
		.then(consumeRabbitMQMessage)
		.catch((error) => {
			console.log(error.message);
			setTimeout(() => {
				init();
			}, 5000);
		});
}

init();