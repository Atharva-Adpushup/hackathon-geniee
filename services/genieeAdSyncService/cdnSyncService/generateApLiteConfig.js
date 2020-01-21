const { couchbaseService } = require('node-utils');
const CB_ERRORS = require('couchbase').errors;

const couchBase = require('../../../configs/config').couchBase;
const { docKeys } = require('../../../configs/commonConsts');

const dbHelper = couchbaseService(
	`couchbase://${couchBase.HOST}`,
	couchBase.DEFAULT_BUCKET,
	couchBase.DEFAULT_USER_NAME,
	couchBase.DEFAULT_USER_PASSWORD
);

const generateApLiteConfig = siteId => {
	const emptyResponse = { value: {} };

	return dbHelper
		.getDoc(`${docKeys.apLite}${siteId}`)
		.catch(err => {
			if (err.code == CB_ERRORS.keyNotFound) {
				return emptyResponse;
			}
			throw err;
		})
		.then(apLiteDoc => {
			return apLiteDoc.value;
		});
};

module.exports = generateApLiteConfig;
