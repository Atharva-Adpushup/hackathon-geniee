const { couchbaseService } = require('node-utils');
const Promise = require('bluebird');
const _ = require('lodash');

const CB_ERRORS = require('couchbase').errors;
const couchBase = require('../../../configs/config').couchBase;
const { docKeys } = require('../../../configs/commonConsts');

const dbHelper = couchbaseService(
	`couchbase://${couchBase.HOST}`,
	couchBase.DEFAULT_BUCKET,
	couchBase.DEFAULT_USER_NAME,
	couchBase.DEFAULT_USER_PASSWORD
);

const generateDfpConfig = adpTags => {
	const json = {};

	const dfpTagsBySize = _.groupBy(adpTags, 'key');
	_.each(dfpTagsBySize, (val, key) => {
		json[key] = _.map(val, 'dfpAdunit');
	});
	return { dfpAdUnits: json };
};

const generateHBConfig = siteId => {
	// TODO: HB: review empty hbConfig
	const emptyResponse = { hbcf: {} };
	return dbHelper
		.getDoc(`${docKeys.hb}${siteId}`)
		.then(hbDoc => {
			if (!Object.keys(hbDoc.value).length) {
				return emptyResponse;
			}
			return hbDoc.value;
		})
		.catch(err => {
			if (err.code == CB_ERRORS.keyNotFound) {
				return emptyResponse;
			}
			throw err;
		});
};

const genrateConfig = (adpTags, siteId) => {
	if (!siteId || !Array.isArray(adpTags) || !adpTags.length) {
		return false;
	}
	return Promise.join(generateDfpConfig(adpTags), generateHBConfig(siteId), (dfpConfig, hbConfig) =>
		Object.assign({}, dfpConfig, hbConfig)
	);
};

module.exports = genrateConfig;
