const couchbase = require('../helpers/couchBaseStagingService');
const uuid = require('uuid');
const { docKeys } = require('../configs/commonConsts');
const config = require('../configs/config');

//@desc       dump request to cocuchdb
const logger = (req, res, next) => {
	next();

	if (config.couchBaseStaging && config.couchBaseStaging.IS_REQUEST_LOG) {
		const reqlDoc = {
			path: `${req.get('host')}${req.baseUrl}${req.path}`,
			method: req.method,
			docType: 'requestLog',
			params: req.query,
			timestamp: +new Date()
		};

		couchbase
			.connectToBucket(config.couchBaseStaging.REQUEST_LOG_BUCKET)
			.then(requestBucket =>
				requestBucket.upsertAsync(`${docKeys.requestLogger}${uuid.v4()}`, reqlDoc, {})
			)
			.then(() => {
				console.log('Doc created');
			})
			.catch(err => {
				console.log(err);
			});
	}
};

module.exports = logger;
