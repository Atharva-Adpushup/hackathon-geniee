const uuid = require('uuid');
const { couchbaseService } = require('node-utils');
const config = require('../configs/config');
const dbHelper = couchbaseService(
	`couchbase://${config.globalBucket.HOST}`,
	config.globalBucket.DEFAULT_BUCKET,
	config.globalBucket.DEFAULT_BUCKET_PASSWORD
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
