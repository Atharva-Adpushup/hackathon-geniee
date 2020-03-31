// Prebid interfacing module

var merge = require('lodash/merge');
var constants = require('./constants');
var responsiveAds = require('./responsiveAds');
var adp = require('./adp');
var utils = require('./utils');
var auction = require('./auction');
var config = require('./config');
var feedback = require('./feedback');
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

			var playerSize = utils.getVideoPlayerSize(prebidSizes);

			var prebidSlot = {
				code: adpSlot.containerId,
				mediaTypes: {},
				renderer: {
					url: multiFormatConstants.VIDEO.RENDERER_URL,
					render: function(bid) {
						// push to render queue because jwplayer may not be loaded yet.
						bid.renderer.push(() => {
							var jwPlayerInstance = jwplayer(bid.adUnitCode);
							jwPlayerInstance
								.setup(
									merge(
										{
											width: playerSize[0],
											height: playerSize[1],
											advertising: {
												outstream: true,
												client: 'vast',
												vastxml: bid.vastXml
											}
										},
										multiFormatConstants.VIDEO.JW_PLAYER_CONFIG
									)
								)
								.on('ready', function() {
									var playerElem = jwPlayerInstance.getContainer();
									playerElem.style.margin = '0 auto';
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
				utils.log(
					`%c===${bidData.mediaType.charAt(0).toUpperCase() +
						bidData.mediaType.slice(1)}BidWon====`,
					'background:#00b900; color:white; padding: 5px 8px; font-size:14px; font-weight:bold; border-radius:5px;',
					bidData
				);

				var slot = isApLiteActive
					? window.apLite.adpSlots[bidData.adUnitCode]
					: window.adpushup.adpTags.adpSlots[bidData.adUnitCode];
				var computedCPMValue = utils.currencyConversionActive(config.PREBID_CONFIG.currencyConfig)
					? 'originalCpm'
					: 'cpm';

				if (slot) {
					slot.feedback.winner = bidData.bidder;
					slot.feedback.winningRevenue = bidData[computedCPMValue] / 1000;
					slot.feedback.winnerAdUnitId = bidData.adId;
					slot.feedback.unitFormat = bidData.mediaType;

					if (isApLiteActive)
						slot.feedback.renderedSize = [bidData.width, bidData.height];

					return feedback.send(slot);
				}
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
