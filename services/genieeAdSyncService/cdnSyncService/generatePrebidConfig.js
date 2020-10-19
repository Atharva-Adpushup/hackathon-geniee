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

const generatePrebidConfig = siteId => {
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
		const s2sBiddersWithDifferentParamsPattern = /^.+_s2s$/;
		const s2sBiddersWithDifferentParams = [];
		const biddersDisabledOnRefresh = {};

		for (const bidderCode in usedBidders) {
			if (
				usedBidders.hasOwnProperty(bidderCode) &&
				!usedBidders[bidderCode].isPaused &&
				biddersFromNetworkTree[bidderCode] &&
				biddersFromNetworkTree[bidderCode].isActive
			) {
				/**
				 * This is for those s2s bidders which need different params than client.
				 * If s2s is active then we'll replace it with client bidder later,
				 * otherwise we'll just skip that bidder
				 */
				if (s2sBiddersWithDifferentParamsPattern.test(bidderCode)) {
					if (usedBidders[bidderCode].isS2SActive) {
						s2sBiddersWithDifferentParams.push(bidderCode);
					} else {
						continue;
					}
				}

				activeUsedBidders[bidderCode] = usedBidders[bidderCode];

				activeUsedBidders[bidderCode].isDisabledOnSlotRefresh = !biddersFromNetworkTree[bidderCode]
					.enableRefreshSlot;

				if (activeUsedBidders[bidderCode].isDisabledOnSlotRefresh) {
					biddersDisabledOnRefresh[bidderCode] = true;
				}

				if (biddersFromNetworkTree[bidderCode].alias) {
					activeUsedBidders[bidderCode].alias = biddersFromNetworkTree[bidderCode].alias;
				}
			}
		}

		s2sBiddersWithDifferentParams.forEach(s2sBidderCode => {
			const nonS2SBiddercode = s2sBidderCode.match(/^(.+)_s2s$/)[1];

			activeUsedBidders[nonS2SBiddercode] = activeUsedBidders[s2sBidderCode];
			delete activeUsedBidders[s2sBidderCode];
		});

		hbDoc.value.hbcf = activeUsedBidders;
		hbDoc.value.biddersDisabledOnRefresh = biddersDisabledOnRefresh;

		return hbDoc.value;
	});
};

module.exports = generatePrebidConfig;
