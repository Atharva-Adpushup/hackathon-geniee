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
			var adUnits = apLiteConfig.adUnits;

			// Remove Inactive adUnits
			adUnits &&
				Object.keys(adUnits).forEach(dfpAdUnitName => {
					if (adUnits[dfpAdUnitName].isActive === false) {
						delete adUnits[dfpAdUnitName];
					}
				});

			return apLiteConfig;
		});
};

module.exports = generateApLiteConfig;
