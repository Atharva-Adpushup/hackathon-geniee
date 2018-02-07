const uuid = require('uuid'),
	{ couchbaseService } = require('node-utils'),
	globalBucket = require('../configs/config').ops.couchBaseBuckets.apGlobalBucket,
	dbHelper = couchbaseService(
		`couchbase://${globalBucket.HOST}`,
		globalBucket.BUCKET_NAME,
		globalBucket.BUCKET_PASSWORD
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
			{}
		)
		.then(() => console.log('Log written to apGlobalBucket'))
		.catch(err => console.log('Error writing log to apGlobalBucket : ', err.message));
}

module.exports = logger;
