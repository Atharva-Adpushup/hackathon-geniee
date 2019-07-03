const couchBase = require('../../../configs/config').couchBase,
	{ couchbaseService } = require('node-utils'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	CB_ERRORS = require('couchbase').errors,
	dbHelper = couchbaseService(
		`couchbase://${couchBase.HOST}`,
		couchBase.DEFAULT_BUCKET,
		couchBase.DEFAULT_USER_NAME,
		couchBase.DEFAULT_USER_PASSWORD
	),
	generateDfpConfig = adpTags => {
		let json = {},
			dfpTagsBySize = _.groupBy(adpTags, 'key');
		_.each(dfpTagsBySize, (val, key) => {
			json[key] = _.map(val, 'dfpAdunit');
		});
		return { dfpAdUnits: json };
	},
	generateHBConfig = siteId => {
		// TODO: HB: review empty hbConfig
		const emptyResponse = { hbcf: {} };
		return dbHelper
			.getDoc(`hbcf::${siteId}`)
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
	},
	genrateConfig = (adpTags, siteId) => {
		if (!siteId || !Array.isArray(adpTags) || !adpTags.length) {
			return false;
		}
		return Promise.join(generateDfpConfig(adpTags), generateHBConfig(siteId), (dfpConfig, hbConfig) => {
			return Object.assign({}, dfpConfig, hbConfig);
		});
	};

module.exports = genrateConfig;
