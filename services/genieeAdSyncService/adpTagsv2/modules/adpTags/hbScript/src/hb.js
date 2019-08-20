// Prebid interfacing module

var constants = require('./constants');
var responsiveAds = require('./responsiveAds');
var adp = require('./adp');
var utils = require('./utils');
var auction = require('./auction');
var hb = {
	createPrebidSlots: function(adpSlotsBatch) {
		var prebidSlots = [];
		var adpBatchId = adpSlotsBatch[0].batchId;

		adpSlotsBatch.forEach(function(adpSlot) {
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

			// Set custom sub id for criteo
			var updatedBidders = adpSlot.bidders.map(function(bidder) {
				if (bidder.bidder === 'criteo') {
					bidder.params.publisherSubId =
						'AP/' + adp.config.siteId + '_' + adp.utils.domanize(adp.config.siteDomain);
				}

				return bidder;
			});

			prebidSlots.push({
				code: adpSlot.containerId,
				mediaTypes: {
					banner: {
						sizes: prebidSizes
					},
					// video: {
					// 	context: constants.PREBID.VIDEO_FORMAT_TYPE,
					// 	playerSize: prebidSizes[0]
					// }
				},
				bids: updatedBidders
			});
		});

		return !prebidSlots.length ? auction.end(adpBatchId) : auction.start(prebidSlots, adpBatchId);
	},
	setBidWonListener: function(w) {
		w.pbjs.que.push(function() {
			w.pbjs.onEvent(constants.EVENTS.PREBID.BID_WON, function(bidData) {
				console.log('===BidWon====', bidData);

				var slot = window.adpushup.adpTags.adpSlots[bidData.adUnitCode];
				var computedCPMValue = utils.currencyConversionActive(adp.config) ? 'originalCpm' : 'cpm';

				slot.feedback.winner = bidData.bidder;
				slot.feedback.winningRevenue = bidData[computedCPMValue] / 1000;
				slot.feedback.winnerAdUnitId = bidData.adId;
			});
		});
	},
	loadPrebid: function(w) {
		/* 
            HB flag passed as a global constant to the webpack config using DefinePlugin 
            (https://webpack.js.org/plugins/define-plugin/#root) 
        */
		if (HB_ACTIVE) {
			(function() {
				require('../../../../../adpushup.js/modules/adpTags/Prebid.js/build/dist/prebid');
			})();
		}

		return this.setBidWonListener(w);
	},
	init: function(w) {
		w.pbjs = w.pbjs || {};
		w.pbjs.que = w.pbjs.que || [];

		return this.loadPrebid(w);
	}
};

module.exports = hb;