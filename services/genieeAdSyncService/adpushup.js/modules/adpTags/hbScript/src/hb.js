// Prebid interfacing module

var constants = require('./constants');
var responsiveAds = require('./responsiveAds');
var adp = require('./adp');
var utils = require('./utils');
var auction = require('./auction');
var config = require('./config');
var { multiFormatConstants, mediaTypesConfig } = require('./multiFormatConfig');
var isApLiteActive = window.adpushup.config.apLiteActive;
var hb = {
	createPrebidSlots: function(adpSlotsBatch) {
		var prebidSlots = [];
		var adpBatchId = adpSlotsBatch[0].batchId;

		adpSlotsBatch.forEach(function(adpSlot) {
			var responsiveSizes = [];
			if (!adp.config.apLiteActive && adpSlot.isResponsive) {
				responsiveSizes = responsiveAds.getAdSizes(adpSlot.optionalParam.adId).collection;
				adpSlot.computedSizes = responsiveSizes;
			}

			if (
				!window.adpushup.services.HB_ACTIVE ||
				!adpSlot.bidders ||
				!adpSlot.bidders.length
			) {
				adpSlot.biddingComplete = true;
				return;
			}

			var size = adpSlot.size;
			var computedSizes = adpSlot.computedSizes;
			var prebidSizes = computedSizes.length ? computedSizes : [size];
			if (
				!adp.config.apLiteActive &&
				adpSlot.optionalParam.overrideActive &&
				adpSlot.optionalParam.overrideSizeTo
			) {
				size = adpSlot.optionalParam.overrideSizeTo.split('x');
			}

			var computedBidders = JSON.parse(JSON.stringify(adpSlot.bidders));
			var sizeConfig = config.PREBID_CONFIG.deviceConfig.sizeConfig;
			computedBidders.forEach(function(val, i) {
				// find size config of current bidder
				var index;
				for (index = 0; index < sizeConfig.length; index++) {
					var element = sizeConfig[index];
					if (element.bidder === val.bidder) {
						break;
					}
				}

				// if found then set its labels as labelAny in current bidder object
				if (!isNaN(index) && sizeConfig[index]) {
					computedBidders[i].labelAny = sizeConfig[index].labels;
				}
			});

			var prebidSlot = {
				code: adpSlot.containerId,
				mediaTypes: {},
				renderer: {
					url: multiFormatConstants.VIDEO.RENDERER_URL,
					render: function(bid) {
						// push to render queue because jwplayer may not be loaded yet.
						bid.renderer.push(() => {
							jwplayer(bid.adUnitCode).setup({
								width: bid.width,
								height: bid.height,
								advertising: {
									outstream: true,
									client: 'vast',
									vastxml: bid.vastXml,
									...multiFormatConstants.VIDEO.RENDERER_CONFIG
								}
							});
						});
					}
				},
				bids: computedBidders
			};

			adpSlot.formats.forEach(function(format) {
				switch (format) {
					case 'display': {
						prebidSlot.mediaTypes.banner = {
							...mediaTypesConfig.banner,
							sizes: prebidSizes
						};
						break;
					}
					case 'video': {
						const playerSize = utils.getVideoPlayerSize(prebidSizes);
						prebidSlot.mediaTypes.video = {
							...mediaTypesConfig.video,
							playerSize
						};
						break;
					}
					case 'native': {
						prebidSlot.mediaTypes.native = {
							...mediaTypesConfig.native
						};
						break;
					}
				}
			});

			prebidSlots.push(prebidSlot);
		});

		return !prebidSlots.length
			? auction.end(adpBatchId)
			: auction.start(prebidSlots, adpBatchId);
	},
	setBidWonListener: function(w) {
		w._apPbJs.que.push(function() {
			w._apPbJs.onEvent(constants.EVENTS.PREBID.BID_WON, function(bidData) {
				utils.log('===BidWon====', bidData);

				var slot = isApLiteActive
					? window.apLite.adpSlots[bidData.adUnitCode]
					: window.adpushup.adpTags.adpSlots[bidData.adUnitCode];
				var computedCPMValue = utils.currencyConversionActive(adp.config)
					? 'originalCpm'
					: 'cpm';

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
				require('../../Prebid.js/build/dist/prebid');
			})();
		}

		return this.setBidWonListener(w);
	},
	init: function(w) {
		w._apPbJs = w._apPbJs || {};
		w._apPbJs.que = w._apPbJs.que || [];

		return this.loadPrebid(w);
	}
};

module.exports = hb;
