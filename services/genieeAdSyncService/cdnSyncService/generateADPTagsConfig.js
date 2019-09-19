const { couchbaseService } = require('node-utils');
const Promise = require('bluebird');
const _ = require('lodash');

const CB_ERRORS = require('couchbase').errors;
const couchBase = require('../../../configs/config').couchBase;
const { docKeys } = require('../../../configs/commonConsts');
const { getBiddersFromNetworkTree } = require('./commonFunctions');

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
	const emptyResponse = { value: { hbcf: {} } };

	return Promise.join(
		dbHelper.getDoc(`${docKeys.hb}${siteId}`).catch(err => {
			if (err.code == CB_ERRORS.keyNotFound) {
				return emptyResponse;
			}
			throw err;
		}),
		getBiddersFromNetworkTree()
	).then(([hbDoc, biddersFromNetworkTree]) => {
		if (!Object.keys(hbDoc.value).length) {
			return emptyResponse;
		}

		const usedBidders = hbDoc.value.hbcf;
		const activeUsedBidders = {};
		for (const bidderCode in usedBidders) {
			if (
				usedBidders.hasOwnProperty(bidderCode) &&
				!usedBidders[bidderCode].isPaused &&
				biddersFromNetworkTree[bidderCode] &&
				biddersFromNetworkTree[bidderCode].isActive
			) {
				activeUsedBidders[bidderCode] = usedBidders[bidderCode];

				if (biddersFromNetworkTree[bidderCode].alias) {
					activeUsedBidders[bidderCode].alias = biddersFromNetworkTree[bidderCode].alias;
				}
			}
		}

		hbDoc.value.hbcf = activeUsedBidders;

		return hbDoc.value;
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
