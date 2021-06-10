const Promise = require('bluebird');

const siteModel = require('../../../models/siteModel');
const userModel = require('../../../models/userModel');
const CONFIG = require('../../../configs/config');
const CONSTANTS = require('../constants/constants');
const Consumer = require('../libs/consumer');
const CustomError = require('./customError');
const logger = require('../../../helpers/globalBucketLogger');
const syncCDNService = require('../../../services/genieeAdSyncService/cdnSyncService/cdnSyncConsumer');
const syncPrebidBundle = require('../../../services/genieeAdSyncService/cdnSyncService/prebidBundleSync');
const helperUtils = require('../../../helpers/utils');

const queueConfig = {
	url: CONFIG.RABBITMQ.URL,
	exchange: CONFIG.RABBITMQ.CDN_SYNC.EXCHANGE,
	queue: CONFIG.RABBITMQ.CDN_SYNC.QUEUE,
	name: 'CDN SYNC Consumer',
	mail: {
		ack: {
			header: 'Alert close for Service: CDN SYN Consumer [console.adpushup.com]',
			content: '<p>Consumer is up and running.</p>'
		},
		nack: {
			header: 'Alert open for Service: CDN SYN Consumer [console.adpushup.com]',
			content: '<p>Consumer failed multiple times. Please check on priority.</p>'
		},
		emailId:
			'abhinav.choudhri@adpushup.com,anil.panghal@adpushup.com, ravi.jagga@adpushup.com, rahul.ranjan@adpushup.com'
	}
};
const QUEUE = CONFIG.RABBITMQ.CDN_SYNC.QUEUE.name;
const consumer = new Consumer(queueConfig);
// const SITES_TO_PROCESS = [
// 	39233,
// 	39403,
// 	39420,
// 	39428,
// 	39451,
// 	39472,
// 	39498,
// 	39632,
// 	39699,
// 	39820,
// 	37723,
// 	37902,
// 	38288,
// 	39286,
// 	35539,
// 	39489
// ];
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
		const isCorrectRootLevelFormat = !!decodedMessage.siteId;

		const isCorrectMessage = !!(isObject && isCorrectRootLevelFormat);
		if (isCorrectMessage) {
			return resolve(decodedMessage);
		}
		return reject(new CustomError(CONSTANTS.ERROR_MESSAGES.MESSAGE.INVALID_DATA));
	});
}

function terminateIfSelectiveRollout(decodedMessage) {
	return siteModel.getSiteById(decodedMessage.siteId).then(site => {
		const apConfigs = site.get('apConfigs');
		const isSelectiveRolloutEnabled = !!apConfigs && apConfigs.isSelectiveRolloutEnabled === true;

		if (isSelectiveRolloutEnabled) {
			// push job to selectiveRollout queue
			helperUtils.publishToRabbitMqQueue(
				CONFIG.RABBITMQ.SELECTIVE_ROLLOUT.QUEUE.name,
				decodedMessage
			);

			// Throw error to terminate cdnSync process
			throw new CustomError(CONSTANTS.ERROR_MESSAGES.MESSAGE.SELECTIVE_ROLLOUT_ENABLED);
		}

		return { decodedMessage, site };
	});
}

function processPrebidModule(data) {
	const [site] = data;
	const apConfigs = site.get('apConfigs');
	const {
		isSeparatePrebidDisabled = false,
		isSiteSpecificSeparatePrebidEnabled = false
	} = apConfigs;

	if (isSeparatePrebidDisabled) {
		console.log('Separate Prebid bundle feature is disabled.');
		return data;
	}

	console.log('Separate Prebid bundle feature is enabled.');
	const siteIdForSpecificPrebid = isSiteSpecificSeparatePrebidEnabled ? site.get('siteId') : null;
	return syncPrebidBundle(siteIdForSpecificPrebid).then(({ name: prebidBundleName }) => [
		...data,
		prebidBundleName
	]);
}

function processPrebidAndSyncCdn({ decodedMessage, site }) {
	// if (!SITES_TO_PROCESS.includes(decodedMessage.siteId)) {
	// 	console.log(`Skipping cdn processing for ${decodedMessage.siteId}`);
	// 	return decodedMessage.siteId;
	// }

	return Promise.join(site, userModel.getUserByEmail(site.get('ownerEmail')))
		.then(processPrebidModule)
		.then(syncCDNService)
		.then(() => decodedMessage.siteId);
}

function errorHandler(error, originalMessage) {
	let customErrorMessage;
	customErrorMessage = error.message;

	if (!customErrorMessage) {
		customErrorMessage = error && error[0] ? error[0].message : 'Unsynced ads in setup';
		if (typeof customErrorMessage === 'object') {
			customErrorMessage = `[LOG FROM CONSOLE] Unsynced ads in setup | Pagegroup - ${
				customErrorMessage.pagegroup
			} | Platform - ${customErrorMessage.platform} | SectionId - ${
				customErrorMessage.sectionId
			} | adId - ${customErrorMessage.ad.id} | Network - ${customErrorMessage.ad.network}`;
		}
	}

	const isEmptyConsumerMessage =
		customErrorMessage === CONSTANTS.ERROR_MESSAGES.RABBITMQ.CONSUMER.EMPTY_MESSAGE;
	const isInvalidConsumerMessage =
		customErrorMessage === CONSTANTS.ERROR_MESSAGES.MESSAGE.INVALID_DATA;
	const isSelectiveRolloutEnabled =
		customErrorMessage === CONSTANTS.ERROR_MESSAGES.MESSAGE.SELECTIVE_ROLLOUT_ENABLED;

	if (isEmptyConsumerMessage || isInvalidConsumerMessage || isSelectiveRolloutEnabled) {
		if (isInvalidConsumerMessage || isSelectiveRolloutEnabled) {
			consumer.acknowledge(originalMessage);
			console.log(customErrorMessage);
		}
		return isEmptyConsumerMessage ? 5000 : 0; // Restart the consumer if input is invalid or queue is empty.
	}
	if (counter > CONSTANTS.CDN_SYNC_MAX_ATTEMPTS) {
		counter = 0;
		let decodedMessage = originalMessage.content.toString('utf-8');
		decodedMessage = JSON.parse(decodedMessage);
		// customErrorMessage = customErrorMessage == undefined ? 'Unsynced ad units must be present' : customErrorMessage;
		logger({
			source: 'CDN SYNC ERROR LOGS',
			message: `Error while CDN SYNC and error messgae : ${customErrorMessage}`,
			debugData: `Site id : ${decodedMessage.siteId}`,
			details: `${JSON.stringify(error)}`
		});
		consumer.acknowledge(originalMessage);
		throw error;
	}
	counter += 1; // increase counter
	consumer.reject(originalMessage);
	throw error;
}

function doProcessingAndAck(originalMessage) {
	return validateMessageData(originalMessage)
		.then(terminateIfSelectiveRollout)
		.then(processPrebidAndSyncCdn)
		.then((siteId = 'N/A') => {
			counter = 0;
			logger({
				source: 'CDN SYNC CONSUMPTION LOGS',
				message: `Job consumed for site id : ${siteId}`
			});
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
			const message = error.message || 'CDN SYNC FAILED';
			console.log(message);
			setTimeout(() => {
				init();
			}, 5000);
		});
}

init();
