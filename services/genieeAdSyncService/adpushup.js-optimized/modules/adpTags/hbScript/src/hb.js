// Prebid interfacing module

var clonedeep = require('lodash.clonedeep');
var constants = require('./constants');
var responsiveAds = require('./responsiveAds');
var adp = require('./adp');
var utils = require('./utils');
var auction = require('./auction');
var config = require('./config');
var prebidDataCollector = require('./prebidDataCollector');
var { multiFormatConstants, mediaTypesConfig } = require('./multiFormatConfig');
var videoRenderer = require('./videoRenderer');
var isApLiteActive = window.adpushup.config.apLiteActive;
var amznPubId =
	config.PREBID_CONFIG &&
	config.PREBID_CONFIG.amazonUAMConfig &&
	config.PREBID_CONFIG.amazonUAMConfig.isAmazonUAMActive &&
	config.PREBID_CONFIG.amazonUAMConfig.publisherId;
var hb = {
	start: function(adpSlots) {
		var adpBatches = adp.config.apLiteActive
			? window.apLite.adpBatches
			: window.adpushup.adpTags.adpBatches;
		var adpBatchId = adpSlots[0].batchId;
		var adpBatch = utils.getCurrentAdpSlotBatch(adpBatches, adpBatchId);
		if (window.adpushup.services.HB_ACTIVE) {
			this.createPrebidSlots(adpBatch);
			this.createUAMslots(adpBatch);
		} else {
			/*adpSlots.forEach(function(adpSlot) {
				adpSlot.biddingComplete = true;
			});*/
			adpBatch.auctionStatus.amazonUam = 'done';
			adpBatch.auctionStatus.prebid = 'done';
			auction.end(adpBatchId);
		}
	},
	createPrebidSlots: function(adpBatch) {
		var prebidSlots = [];
		var adpBatchId = adpBatch.batchId;
		var adpSlotsBatch = adpBatch.adpSlots;

		adpSlotsBatch.forEach(function(adpSlot) {
			if (!utils.isPrebidHbEnabled(adpSlot)) {
				//adpSlot.biddingComplete = true;
				return;
			}

			var size = adpSlot.size;
			var computedSizes = adpSlot.computedSizes;
			var prebidSizes = computedSizes.length
				? computedSizes
				: size[0] === 'responsive' && size[1] === 'responsive'
				? []
				: [size];

			if (!prebidSizes || !prebidSizes.length) {
				return;
			}

			if (
				!adp.config.apLiteActive &&
				adpSlot.optionalParam.overrideActive &&
				adpSlot.optionalParam.overrideSizeTo
			) {
				size = adpSlot.optionalParam.overrideSizeTo.split('x');
			}

			var {
				nonFormatWiseBidders = [],
				formatWiseBidders = {}
			} = clonedeep(adpSlot.bidders);
			var sizeConfig = config.PREBID_CONFIG.deviceConfig.sizeConfig;
			nonFormatWiseBidders.forEach(function(val, i) {
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
					nonFormatWiseBidders[i].labelAny = sizeConfig[index].labels;
				}
			});

			Object.keys(formatWiseBidders).forEach(format => {
				const formatBidders = formatWiseBidders[format] || [];
				formatBidders.forEach((bidder, i) => {

					var index;
					for (index = 0; index < sizeConfig.length; index++) {
						var element = sizeConfig[index];
						if (element.bidder === bidder.bidder) {
							break;
						}

						if (!isNaN(index) && sizeConfig[index]) {
							formatWiseBidders[format][i].labelAny = sizeConfig[index].labels;
						}
					}

				});
			});

			var prebidSlot = {
				code: adpSlot.containerId,
				mediaTypes: {},
				sizes: prebidSizes,
				bids: nonFormatWiseBidders
			};

			adpSlot.formats.forEach(function(format) {
				var formatBidders = formatWiseBidders[format] || [];
				var slotForFormat = { 
					code: adpSlot.containerId,
					mediaTypes: {},
					sizes: prebidSizes,
					bids: formatBidders
				};
				switch (format) {
					case 'display': {
						var bannerConfig = {
							...mediaTypesConfig.banner,
							sizes: prebidSizes
						};
						prebidSlot.mediaTypes.banner = bannerConfig;
						slotForFormat.mediaTypes.banner = bannerConfig;
						break;
					}
					case 'video': {
						var playerSize = utils.getVideoPlayerSize(prebidSizes);
						var renderer = {
							url: multiFormatConstants.VIDEO.RENDERER_URL,
							render: videoRenderer.bind(null, adpSlot, playerSize)
						};
						var videoConfig = {
							...mediaTypesConfig.video,
							playerSize
						};
						prebidSlot.renderer = renderer;
						prebidSlot.mediaTypes.video = videoConfig;

						slotForFormat.renderer = renderer;
						slotForFormat.mediaTypes.video = videoConfig;
						break;
					}
					case 'native': {
						var nativeConfig = {
							...mediaTypesConfig.native
						};
						prebidSlot.mediaTypes.native = nativeConfig
						slotForFormat.mediaTypes.native = nativeConfig;
						break;
					}
				}
				if (formatBidders.length) prebidSlots.push(slotForFormat);
			});

			prebidSlots.push(prebidSlot);
		});

		if (!prebidSlots.length) {
			adpBatch.auctionStatus.prebid = 'done';
			auction.end(adpBatchId);
		} else {
			_apPbJs.que.push(function() {
				setTimeout(() => auction.startPrebidAuction(prebidSlots, adpBatchId), 0);
			});
		}
	},
	createUAMslots: function(adpBatch) {
		var amznUamSlots = [];
		var adpBatchId = adpBatch.batchId;
		var adpSlots = adpBatch.adpSlots;
		var hasRefreshSlots = false;

		adpSlots.forEach(function(adpSlot) {
			hasRefreshSlots = hasRefreshSlots || adpSlot.toBeRefreshed;
			if (utils.isAmazonUamEnabled(adpSlot)) {
				var networkId = adpSlot.activeDFPNetwork
					? adpSlot.activeDFPNetwork
					: constants.NETWORK_ID;
				amznUamSlots.push({
					slotName: '/' + networkId + '/' + adpSlot.optionalParam.dfpAdunitCode,
					slotID: adpSlot.containerId,
					sizes: adpSlot.computedSizes
				});
			}
		});

		if (!amznUamSlots.length || !window.apstag || !amznPubId) {
			adpBatch.auctionStatus.amazonUam = 'done';
			auction.end(adpBatchId);
		} else {
			auction.startAmazonAuction(amznUamSlots, adpBatchId, hasRefreshSlots);
		}
	},
	removeBiddersDisabledOnRefresh: function(adUnitsToBeAuctioned) {
		try {
			let biddersDisabledOnRefresh = config.PREBID_CONFIG.biddersDisabledOnRefresh;
			let hasBiddersDisabledOnRefresh = Object.keys(biddersDisabledOnRefresh).length > 0;

			if (hasBiddersDisabledOnRefresh) {
				const adpSlots = isApLiteActive
					? window.apLite.adpSlots
					: window.adpushup.adpTags.adpSlots;

				for (let i = 0; i < adUnitsToBeAuctioned.length; i++) {
					const adUnit = adUnitsToBeAuctioned[i];
					const slot = adpSlots[adUnit.code];

					// slot.removedBiddersDisabledOnRefresh will be [] if we tried to remove bidders before but there were no bidders added to this slot to be removed. [] will skip running this code again
					if (slot && slot.toBeRefreshed && !slot.removedBiddersDisabledOnRefresh) {
						const slotBiddersDisabledOnRefresh = [];

						adUnit.bids = adUnit.bids.filter(bid => {
							if (biddersDisabledOnRefresh[bid.bidder]) {
								if (!slotBiddersDisabledOnRefresh.includes(bid.bidder)) {
									slotBiddersDisabledOnRefresh.push(bid.bidder);
								}
								return false;
							}

							return true;
						});

						slot.removedBiddersDisabledOnRefresh = slotBiddersDisabledOnRefresh;
					}
				}
			}
		} catch (error) {
			Array.isArray(window.adpushup.err) &&
				window.adpushup.err.push({
					msg: 'Error in Prebid Data Collector',
					error: error
				});
		}
	},
	bindBeforeRequestBidsHandler: function(w) {
		let _this = this;
		w._apPbJs.que.push(function() {
			w._apPbJs.onEvent(
				constants.EVENTS.PREBID.BEFORE_REQUEST_BID,
				_this.removeBiddersDisabledOnRefresh
			);
		});
	},
	bindPrebidEvents: function(w) {
		const prebidEvents = constants.EVENTS.PREBID;
		const deps = { w, adp, utils, config, constants };

		this.bindBeforeRequestBidsHandler(w);

		try {
			prebidDataCollector.init(deps);
			let events = [prebidEvents.BID_WON];

			if (adp.config.hbAnalytics) {
				events.push(prebidEvents.AUCTION_END, prebidEvents.BID_TIMEOUT);
			}

			prebidDataCollector.enableEvents(events);
		} catch (error) {
			Array.isArray(window.adpushup.err) &&
				window.adpushup.err.push({
					msg: 'Error in Prebid Data Collector',
					error: error
				});
		}
	},
	loadAmazonApsTag: function(w) {
		if (HB_ACTIVE && amznPubId) {
			(function() {
				require('./amazonUamApsTag');
			})();

			window.apstag.init({
				pubID: amznPubId,
				adServer: 'googletag'
			});
		}
	},
	loadPrebid: function(w) {
		/*
            HB flag passed as a global constant to the webpack config using DefinePlugin
            (https://webpack.js.org/plugins/define-plugin/#root)
        */
		if (!SEPARATE_PREBID && HB_ACTIVE) {
			(function() {
				require('../../Prebid.js/build/dist/prebid');
			})();
		}

		this.bindPrebidEvents(w);
	},
	init: function(w) {
		w._apPbJs = w._apPbJs || {};
		w._apPbJs.que = w._apPbJs.que || [];

		this.loadPrebid(w);
		this.loadAmazonApsTag(w);

		if (HB_ACTIVE) {
			// decision on if inflation should be applied needs to be decided on a page level
			utils.setShouldPerformBidInflation();
		}
	}
};

module.exports = hb;
