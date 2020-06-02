var $ = require('../../../../libs/jquery');
var merge = require('lodash/merge');
var utils = require('./utils');
var commonConsts = require('../../../../config/commonConsts');
var refreshAdSlot = require('../../../../src/refreshAdSlot');
var prebidDataCollector = require('./prebidDataCollector');
var { multiFormatConstants, mediaTypesConfig } = require('./multiFormatConfig');
var apUtils = require('../../../../libs/utils');

module.exports = (function() {
	var prevRenderedOutOfViewVideoBidId;

	return function videoRenderer(adpSlot, playerSize, bid) {
		var pbjs = window._apPbJs;
		var container = $(`#${adpSlot.containerId}`);

		var getIframeDocument = function() {
			return container
				.find('iframe')
				.contents()
				.get(0);
		};

		function cleanJwPlayerAndRenderBid(jwPlayerInstance, bid) {
			// clean container
			jwPlayerInstance.remove();

			pbjs.renderAd(getIframeDocument(), bid.adId);
		}

		var videoSlotInViewWatcher = (function() {
			var bannerAdRenderedTime = new Date();
			var watcherExpiryTimeInMs = 1000;
			var timeoutId;

			return function watcher() {
				if (timeoutId) timeoutId = clearTimeout(timeoutId);

				var currentTime = new Date();
				var timeSpentInMs = currentTime - bannerAdRenderedTime;

				if (
					!apUtils.checkElementInViewPercent(container) &&
					timeSpentInMs < watcherExpiryTimeInMs
				) {
					timeoutId = setTimeout(() => {
						watcher();
					}, 100);
				} else {
					adpSlot.feedbackSent = false; // reset feedbackSent status for current slot
					pbjs.renderAd(getIframeDocument(), bid.adId);

					console.log('Render Video ad as soon as slot comes in view: ', bid.adUnitCode);
				}
			};
		})();

		// push to render queue because jwplayer may not be loaded yet.
		bid.renderer.push(() => {
			var highestAliveBannerBid = utils.getHighestAliveBid(pbjs, bid.adUnitCode, ['banner']);

			// if video bid is rendering first time,
			// slot is not in view
			// and have alive banner bid then render it
			if (
				prevRenderedOutOfViewVideoBidId !== bid.adId &&
				!apUtils.checkElementInViewPercent(container) &&
				highestAliveBannerBid
			) {
				prevRenderedOutOfViewVideoBidId = bid.adId;

				pbjs.renderAd(getIframeDocument(), highestAliveBannerBid.adId);

				// send banner bid won feedback
				prebidDataCollector.collectBidWonData(highestAliveBannerBid);

				console.log('out of view video slot banner rendered: ', adpSlot.containerId);

				// Replace it with video ad when slot come back in view
				videoSlotInViewWatcher();
			}
			// otherwise render video
			else {
				renderVideoBid();

				console.log('inview video rendered: ', adpSlot.containerId);
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

					jwPlayerInstance = window.jwplayer(bid.adUnitCode);

					jwPlayerInstance
						.setup(
							merge(
								{
									width: playerSize[0],
									height: playerSize[1],
									advertising: {
										outstream: true,
										client: clientType || 'vast',
										adscheduleid: utils.randomAlphaNumericString(8),
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

					// listen video complete event
					jwPlayerInstance.on('adComplete', function() {
						console.log('adComplete event fired: ', bid.adUnitCode);

						// check if there is any another highest alive unused bid in cache
						var highestAliveBid = utils.getHighestAliveBid(pbjs, bid.adUnitCode);

						if (highestAliveBid) {
							var refreshData = refreshAdSlot.getRefreshDataByAdId(
								adpSlot.optionalParam.adId
							);

							if (!refreshData) return;

							var { refreshTimeLeftInMs, refreshTimeoutId } = refreshData;
							var minRefreshTimeoutForImpInMs = 1000;

							// If refresh time left is greater than 1s
							if (refreshTimeLeftInMs >= minRefreshTimeoutForImpInMs) {
								cleanJwPlayerAndRenderBid(jwPlayerInstance, highestAliveBid);
								console.log(
									'Video complete cache bid rendered without extending refresh timout: ',
									highestAliveBid.adUnitCode
								);
							}
							// If refresh time left is less than 1s
							else if (
								refreshTimeLeftInMs < minRefreshTimeoutForImpInMs &&
								refreshTimeLeftInMs >= 0
							) {
								// Render cached bid
								cleanJwPlayerAndRenderBid(jwPlayerInstance, highestAliveBid);

								// clear existing refresh timeout
								clearTimeout(refreshTimeoutId);

								// set new refresh timeout
								refreshAdSlot.setRefreshTimeOutByAdId(
									adpSlot.optionalParam.adId,
									minRefreshTimeoutForImpInMs
								);

								console.log(
									`Video complete cache bid rendered and refresh timout extended by ${minRefreshTimeoutForImpInMs /
										1000}s: `,
									highestAliveBid.adUnitCode
								);
							}
						}
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
	};
})();
