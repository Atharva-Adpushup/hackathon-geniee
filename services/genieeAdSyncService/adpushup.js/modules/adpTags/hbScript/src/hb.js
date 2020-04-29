// Prebid interfacing module

var merge = require('lodash/merge');
var constants = require('./constants');
var responsiveAds = require('./responsiveAds');
var adp = require('./adp');
var utils = require('./utils');
var auction = require('./auction');
var config = require('./config');
var prebidDataCollector = require('./prebidDataCollector');
var { multiFormatConstants, mediaTypesConfig } = require('./multiFormatConfig');

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
			var prebidSizes = computedSizes.length
				? computedSizes
				: size[0] === 'responsive' && size[1] === 'responsive'
				? [[0, 0]]
				: [size];
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
							var jwPlayerInstance = jwplayer(bid.adUnitCode);
							var playerSize = utils.getVideoPlayerSize(prebidSizes);
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
						const { DEFAULT_JW_PLAYER_SIZE } = constants;
						prebidSlot.mediaTypes.video = {
							...mediaTypesConfig.video,
							playerSize: DEFAULT_JW_PLAYER_SIZE
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
	bindPrebidEvents: function(w) {
		const prebidEvents = constants.EVENTS.PREBID;
		const deps = { w, adp, utils, config, constants };

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

		this.bindPrebidEvents(w);
	},
	init: function(w) {
		w._apPbJs = w._apPbJs || {};
		w._apPbJs.que = w._apPbJs.que || [];

		return this.loadPrebid(w);
	}
};

module.exports = hb;
