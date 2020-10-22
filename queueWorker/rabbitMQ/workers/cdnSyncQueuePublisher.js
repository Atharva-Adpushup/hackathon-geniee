const CONFIG = require('../../../configs/config');
const Publisher = require('../libs/publisher');
const publishJobs = require('../libs/publisherCommon');

const { QUEUE: MAIN_QUEUE, SELECTIVE_ROLLOUT_QUEUE } = CONFIG.RABBITMQ.CDN_SYNC;

const mainQueueConfig = {
	url: CONFIG.RABBITMQ.URL,
	exchange: CONFIG.RABBITMQ.CDN_SYNC.EXCHANGE,
	queue: MAIN_QUEUE
};

const selectiveRolloutQueueConfig = {
	...mainQueueConfig,
	queue: SELECTIVE_ROLLOUT_QUEUE
};

let mainPublisher = new Publisher(mainQueueConfig);
let selectiveRolloutPublisher = new Publisher(selectiveRolloutQueueConfig);

const getPublisherConfig = isSelectiveRolloutEnabled => {
	if (isSelectiveRolloutEnabled) {
		if (!SELECTIVE_ROLLOUT_QUEUE) {
			throw new Error('Selective rollout queue config missing');
		}

		return {
			publisher: selectiveRolloutPublisher,
			options: { queueName: SELECTIVE_ROLLOUT_QUEUE.name }
		};
	}

	return {
		publisher: mainPublisher,
		options: { queueName: MAIN_QUEUE.name }
	};
};

module.exports = {
	publish(paramConfig, isSelectiveRolloutEnabled = false) {
		const { publisher, options } = getPublisherConfig(isSelectiveRolloutEnabled);

		return publishJobs(publisher, options, paramConfig)
			.then(console.log)
			.catch(console.log);
	}
};
