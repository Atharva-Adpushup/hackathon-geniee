// Prebid interfacing module

var $ = require('../../../../libs/jquery');
var merge = require('lodash/merge');
var constants = require('./constants');
var responsiveAds = require('./responsiveAds');
var adp = require('./adp');
var utils = require('./utils');
var auction = require('./auction');
var config = require('./config');
var prebidDataCollector = require('./prebidDataCollector');
var { multiFormatConstants, mediaTypesConfig } = require('./multiFormatConfig');
var utilsNew = require('../../../../libs/utils');
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

			var playerSize = utils.getVideoPlayerSize(prebidSizes);
			var prevRenderedOutOfViewVideoBidId;
			var prebidSlot = {
				code: adpSlot.containerId,
				mediaTypes: {},
				renderer: {
					url: multiFormatConstants.VIDEO.RENDERER_URL,
					render: function(bid) {
						// push to render queue because jwplayer may not be loaded yet.
						bid.renderer.push(() => {
							var pbjs = window._apPbJs;
							var container = $(`#${adpSlot.containerId}`);
							var highestAliveBannerBid = pbjs
								.getBidResponsesForAdUnitCode(bid.adUnitCode)
								.bids.filter(bid => {
									var isBanner = bid.mediaType === 'banner';
									var isUnusedBid = bid.status !== 'rendered';

									// Check if bid is not expired
									function isBidAlive() {
										var timeNow = new Date();
										var bidResponseTime = new Date(bid.responseTimestamp);
										var bidAgeInMs = timeNow - bidResponseTime;
										var bidTtlInMs = (bid.ttl - 1) * 1000; // substracted 1s from bid ttl to adjust rendering time

										return bidAgeInMs <= bidTtlInMs;
									}

									return isBanner && isUnusedBid && isBidAlive(); // check bid alive only in case of banner
								})
								.reduce((highestBid, currentBid) => {
									if (!highestBid || currentBid.cpm > highestBid.cpm)
										return currentBid;

									return highestBid;
								});

							// if video bid is rendering first time,
							// slot is not in view
							// and have alive banner bid then render it
							if (
								prevRenderedOutOfViewVideoBidId !== bid.adId &&
								!utilsNew.checkElementInViewPercent(container) &&
								highestAliveBannerBid
							) {
								prevRenderedOutOfViewVideoBidId = bid.adId;

								var iframeDocument = container
									.find('iframe')
									.contents()
									.get(0);
								pbjs.renderAd(iframeDocument, highestAliveBannerBid.adId);

								console.log('banner rendered: ', adpSlot.containerId);

								// Replace it with video ad when slot come back in view
								var bannerAdRenderedTime = new Date();
								var watcherExpiryTimeInMs = 20000;
								var timeoutId;

								function videoSlotInViewWatcher() {
									if (timeoutId) timeoutId = clearTimeout(timeoutId);

									var currentTime = new Date();
									var timeSpentInMs = currentTime - bannerAdRenderedTime;

									if (
										!utilsNew.checkElementInViewPercent(container) &&
										timeSpentInMs < watcherExpiryTimeInMs
									) {
										timeoutId = setTimeout(() => {
											videoSlotInViewWatcher();
										}, 100);
									} else {
										pbjs.renderAd(iframeDocument, bid.adId);
									}
								}

								videoSlotInViewWatcher();
							}
							// otherwise render video
							else {
								renderVideoBid();

								console.log('video rendered: ', adpSlot.containerId);
							}

							function renderVideoBid() {
								var jwPlayerInstance;
								var playerReInstantiated = false;
								var bidWonTime = +new Date();
								var jwpEvents = [
									'ready',
									'adError',
									'error',
									'setupError',
									'adImpression',
									'adRequest',
									'adStarted',
									'adPlay'
								];
								//var client = utils.getVastClientType(bid.vastXml, bid.adTag);
								var instantiateJwPlayer = function(clientType) {
									// remove if player has already rendered
									if (jwPlayerInstance && !!jwPlayerInstance.getState()) {
										jwPlayerInstance.remove();
									}

									jwPlayerInstance = jwplayer(bid.adUnitCode);

									jwPlayerInstance
										.setup(
											merge(
												{
													width: playerSize[0],
													height: playerSize[1],
													advertising: {
														outstream: true,
														client: clientType || 'vast',
														adscheduleid: utils.randomAlphaNumericString(
															8
														),
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

									setupPlayerEvents(jwPlayerInstance);
								};

								var setupPlayerEvents = function(jwPlayerInstance) {
									// setup listener for adError event to reinstantiate the player with different client type.
									jwPlayerInstance.on('adError', function() {
										if (!playerReInstantiated) {
											playerReInstantiated = true;
											instantiateJwPlayer('googima');
										}
									});

									// setup listener for adImpression event to send bid won feedback for video bids.
									jwPlayerInstance.on('adImpression', function() {
										prebidDataCollector.collectBidWonData(bid);
									});

									// ad-hoc data logging
									jwpEvents.forEach(function(eventName) {
										jwPlayerInstance.on(eventName, function(e) {
											window.adpushup.$.ajax({
												type: 'POST',
												url: '//vastdump-staging.adpushup.com/' + eventName,
												data: JSON.stringify({
													data: JSON.stringify(e),
													bid: JSON.stringify(bid),
													eventTime: +new Date(),
													bidWonTime: bidWonTime,
													auctionId: bid.auctionId || '',
													requestId: bid.requestId || ''
												}),
												contentType: 'application/json',
												processData: false,
												dataType: 'json'
											});
										});
									});
								};

								instantiateJwPlayer();
							}
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

		if (!prebidSlots.length) {
			adpBatch.auctionStatus.prebid = 'done';
			auction.end(adpBatchId);
		} else {
			auction.startPrebidAuction(prebidSlots, adpBatchId);
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

		this.loadPrebid(w);
		this.loadAmazonApsTag(w);
	}
};

module.exports = hb;
