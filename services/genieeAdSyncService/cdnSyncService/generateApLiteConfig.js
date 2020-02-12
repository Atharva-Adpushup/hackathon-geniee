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
	const emptyResponse = {};

	return dbHelper
		.getDoc(`${docKeys.apLite}${siteId}`)
		.catch(err => {
			if (err.code == CB_ERRORS.keyNotFound) {
				return emptyResponse;
			}
			throw err;
		})
		.then(apLiteDoc => {
			var apLiteConfig = apLiteDoc.value;

			// Remove Inactive adUnits
			apLiteConfig.adUnits &&
				Array.isArray(apLiteConfig.adUnits) &&
				(apLiteConfig.adUnits = apLiteConfig.adUnits.filter(adUnit => adUnit.isActive !== false));

			return apLiteConfig;
		});
};

module.exports = generateApLiteConfig;
