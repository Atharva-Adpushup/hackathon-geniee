var couchbase = require('../helpers/couchBaseService');
const uuid = require('uuid');
const { docKeys } = require('../configs/commonConsts');

//@desc       dump request to cocuchdb
const logger = (req, res, next) => {
	var bucketName = 'RequestBucket';

	const reqlDoc = {
		path: `${req.get('host')}${req.baseUrl}${req.path}`,
		method: req.method,
		docType: 'requestLog',
		params: req.query,
		timestamp: +new Date()
	};
	return couchbase
		.connectToBucket(bucketName)
		.then(requestBucket =>
			requestBucket.upsertAsync(`${docKeys.requestLogger}${uuid.v4()}`, reqlDoc, {})
		)
		.then(() => {
			console.log('Doc created');
			next();
		})
		.catch(err => console.log(err));
};

module.exports = logger;
