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

const generateAdNetworkConfig = siteId => {
	const emptyResponse = {};

	return (
		Promise.resolve({
			value: {
				networkId: 4534534,
				userEmail: 'ravi.jagga@adpushup.com',
				pricePriorityLineItems: []
			}
		})
			// dbHelper
			// 	.getDoc(`${docKeys.apLite}${siteId}`)
			.catch(err => {
				if (err.code == CB_ERRORS.keyNotFound) {
					return emptyResponse;
				}
				throw err;
			})
			.then(adNetworkConfigDoc => {
				var adNetworkConfig = adNetworkConfigDoc.value;
				return adNetworkConfig;
			})
	);
};

module.exports = generateAdNetworkConfig;
