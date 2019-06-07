// Prebid interfacing module

var constants = require('./constants');
var responsiveAds = require('./responsiveAds');
var adp = require('./adp');
var utils = require('./utils');
var auction = require('./auction');
var hb = {
	createPrebidSlots: function (adpSlotsBatch) {
		var adUnitCodeForPrebid = [];
		var adpBatchId = adpSlotsBatch[0].batchId;

		adpSlotsBatch.forEach(function (adpSlot) {
			var responsiveSizes = [];
			if (adpSlot.isResponsive) {
				responsiveSizes = responsiveAds.getAdSizes(adpSlot.optionalParam.adId).collection;
				adpSlot.computedSizes = responsiveSizes;
			}

			if (!adpSlot.bidders || !adpSlot.bidders.length) {
				return;
			}

			var size = adpSlot.size;
			var computedSizes = adpSlot.isResponsive ? responsiveSizes : adpSlot.computedSizes;
			var prebidSizes = computedSizes.length ? computedSizes : [size];
			if (adpSlot.optionalParam.overrideActive && adpSlot.optionalParam.overrideSizeTo) {
				size = adpSlot.optionalParam.overrideSizeTo.split('x');
			}

			adUnitCodeForPrebid.push({
				code: adpSlot.containerId,
				mediaTypes: {
					banner: {
						sizes: prebidSizes
					}
				},
				bids: adpSlot.bidders
			});
		});

		if (!adUnitCodeForPrebid.length) {
			return auction.end(adpBatchId);
		}
	},
	setBidWonListener: function (w) {
		w.pbjs.que.push(function () {
			w.pbjs.onEvent(constants.EVENTS.PREBID.BID_WON, function (bidData) {
				console.log('===BidWon====', bidData);

				var slot = adp.adpTags.adpSlots[bidData.adUnitCode];
				var computedCPMValue = utils.isValidThirdPartyDFPAndCurrencyConfig(adp.config) ? 'originalCpm' : 'cpm';

				slot.feedback.winner = bidData.bidder;
				slot.feedback.winningRevenue = bidData[computedCPMValue] / 1000;
				slot.feedback.winnerAdUnitId = bidData.adId;
			});
		});
	},
	loadPrebid: function (w) {
		/* 
            HB flag passed as a global constant to the webpack config using DefinePlugin 
            (https://webpack.js.org/plugins/define-plugin/#root) 
        */
		// if (HB_ACTIVE) {
		// 	(function () {
		// 		require('../../Prebid.js/build/dist/prebid');
		// 	})();
		// }

		return this.setBidWonListener(w);
	},
	init: function (w) {
		w.pbjs = w.pbjs || {};
		w.pbjs.que = w.pbjs.que || [];

		return this.loadPrebid(w);
	}
};

module.exports = hb;
