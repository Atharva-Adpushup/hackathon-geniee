const uuid = require('uuid');
const { couchbaseService } = require('node-utils');

const config = require('../configs/config');

const globalBucket = config.ops.couchBaseBuckets.apGlobalBucket;
const dbHelper = couchbaseService(
	`couchbase://${globalBucket.HOST}`,
	globalBucket.BUCKET_NAME,
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);

function logger(logData) {
	return dbHelper
		.createDoc(
			`slog::${uuid.v4()}`,
			{
				date: +new Date(),
				source: logData.source || 'CONSOLE LOGS',
				message: logData.message,
				type: logData.type || 3,
				details: logData.details || 'N/A',
				debugData: logData.debugData || 'N/A'
			},
			{
				expiry: Math.floor(new Date() / 1000) + 2592000
			}
		)
		.then(() => console.log('Log written to apGlobalBucket'))
		.catch(err => console.log('Error writing log to apGlobalBucket : ', err.message));
}

module.exports = logger;
