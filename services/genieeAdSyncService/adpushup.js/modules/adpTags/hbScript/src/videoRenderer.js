// @ts-check
var $ = require('../../../../libs/jquery');
var debounce = require('lodash.debounce');
var utils = require('./utils');
var refreshAdSlot = require('../../../../src/refreshAdSlot');
var prebidDataCollector = require('./prebidDataCollector');
var apUtils = require('../../../../libs/utils');
var { removeBbPlayerIfRendered, getBbPlayerId } = require('./bbPlayerUtils');
var config = require('./config');
const multiFormatConfig = require('./multiFormatConfig');

module.exports = function videoRenderer(adpSlot, playerSize, bid) {
	var pbjs = window._apPbJs;
	var container = $(`#${adpSlot.containerId}`);
	var bluebillywig = (window.bluebillywig = window.bluebillywig || {});
	bluebillywig.cmd = bluebillywig.cmd || [];
	var bidWonTime = +new Date();
	var [width, height] = adpSlot.size;

	// TODO: bbPlayer: logging for testing...
	window.adpushup.$.ajax({
		type: 'POST',
		url: '//vastdump-staging.adpushup.com/bb_player_logging',
		data: JSON.stringify({
			eventName: 'video_bid_received',
			adUnitCode: bid.adUnitCode,
			bidder: bid.bidder,
			bidderCode: bid.bidderCode,
			creativeId: bid.creativeId,
			adId: bid.adId,
			size: bid.size,
			mediaType: bid.mediaType,
			status: bid.status,
			eventTime: +new Date(),
			bidWonTime: bidWonTime,
			auctionId: bid.auctionId || '',
			requestId: bid.requestId || ''
		}),
		contentType: 'application/json',
		processData: false,
		dataType: 'json'
	});

	function getBbPlayerConfig(bid) {
		const config = {
			code: bid.adUnitCode // Mandatory for stats
		};

		if (bid.vastXml) {
			config.vastXml = bid.vastXml;
		} else if (bid.vastUrl) {
			config.vastUrl = bid.vastUrl;
		} else {
			return false;
		}

		return config;
	}

	function getBbPlayerRendererId() {
		const { PUBLICATION } = multiFormatConfig.BB_PLAYER_CONFIG;
		return `${PUBLICATION}-${bid.adUnitCode}`; // This is convention to find the renderer on the page
	}

	function getBbPlayerRenderer() {
		const rendererId = getBbPlayerRendererId();

		return bluebillywig.renderers.find(renderer => renderer._id === rendererId);
	}

	function clearSlotContent(slotEl) {
		slotEl.innerHTML = '';
	}

	function renderBbPlayer(bbPlayerConfig, slotEl) {
		const renderer = getBbPlayerRenderer();
		if (!renderer) return;

		clearSlotContent(slotEl);
		renderer.bootstrap(bbPlayerConfig, slotEl);
	}

	function customizeBbPlayer(playerApi, slotAttributesToMigrate, preservedSlotElDataset) {
		const [width, height] = playerSize;
		// Resize player to ad size
		bluebillywig
			.jQuery(playerApi.getWrapper())
			.data('Sizer')
			.setWrapperSize(width, height);

		playerApi.setFitMode('FIT_SMART');

		var playerElem = document.getElementById(bid.adUnitCode);

		// // Center Align BB Player
		// playerElem.style.margin = '0 auto';

		// migrate slot attributes to player el
		slotAttributesToMigrate.forEach(
			attrName =>
				preservedSlotElDataset[attrName] !== undefined &&
				(playerElem.dataset[attrName] = preservedSlotElDataset[attrName])
		);
	}

	function cleanBbPlayerAndRenderBid(playerApi, bid, refreshData = {}) {
		// clean container
		removeBbPlayerIfRendered(
			playerApi._playerId,
			bid.adUnitCode,
			`${bid.adUnitCode} videoRenderer post bid`
		);

		var { adId, refreshTimeoutId, refreshExtendTimeInMs } = refreshData;

		if (adId && refreshTimeoutId && refreshExtendTimeInMs) {
			// clear existing refresh timeout
			clearTimeout(refreshTimeoutId);

			// set new refresh timeout
			refreshAdSlot.setRefreshTimeOutByAdId(adId, refreshExtendTimeInMs);
		}

		pbjs.renderAd(utils.getIframeDocument(container, { width, height }), bid.adId);
	}

	var setupPlayerEvents = function(playerApi) {
		// setup listener for adstarted event to send bid won feedback for video bids.
		playerApi.on('adstarted', function() {
			console.log(`bbPlayer: ${bid.adUnitCode} video started`);

			prebidDataCollector.collectBidWonData(bid);
		});

		// listen video finished event
		playerApi.on('adfinished', function() {
			console.log(`bbPlayer: ${bid.adUnitCode} video finished`);

			// TODO: bbPlayer: logging for testing...
			window.adpushup.$.ajax({
				type: 'POST',
				url: '//vastdump-staging.adpushup.com/bb_player_logging',
				data: JSON.stringify({
					eventName: 'video_bid_received',
					adUnitCode: bid.adUnitCode,
					bidder: bid.bidder,
					bidderCode: bid.bidderCode,
					creativeId: bid.creativeId,
					adId: bid.adId,
					size: bid.size,
					mediaType: bid.mediaType,
					status: bid.status,
					eventTime: +new Date(),
					bidWonTime: bidWonTime,
					auctionId: bid.auctionId || '',
					requestId: bid.requestId || ''
				}),
				contentType: 'application/json',
				processData: false,
				dataType: 'json'
			});

			// check if there is any another highest alive unused bid in cache
			var highestAliveBid = utils.getHighestAliveBid(pbjs, bid.adUnitCode, [
				'banner',
				'native'
			]);

			if (highestAliveBid) {
				console.log(
					`bbPlayer: ${bid.adUnitCode} video finished, highest alive bid available`
				);

				var refreshData = refreshAdSlot.getRefreshDataByAdId(adpSlot.optionalParam.adId);

				console.log(
					`bbPlayer: ${
						bid.adUnitCode
					} video finished, highest alive bid available, refresh data: `,
					refreshData
				);

				if (!refreshData) return;

				var { refreshTimeLeftInMs, refreshTimeoutId } = refreshData;
				var minRefreshTimeoutForImpInMs = 1000;

				// If refresh time left is greater than 1s
				if (refreshTimeLeftInMs >= minRefreshTimeoutForImpInMs) {
					console.log(`bbPlayer: ${bid.adUnitCode} refresh time is greater than 1s`);
					cleanBbPlayerAndRenderBid(playerApi, highestAliveBid);
				}
				// If refresh time left is less than 1s
				else if (
					refreshTimeLeftInMs < minRefreshTimeoutForImpInMs &&
					refreshTimeLeftInMs >= 0
				) {
					console.log(`bbPlayer: ${bid.adUnitCode} refresh time is less than 1s`);

					// Render cached bid
					cleanBbPlayerAndRenderBid(playerApi, highestAliveBid, {
						adId: adpSlot.optionalParam.adId,
						refreshTimeoutId,
						refreshExtendTimeInMs: minRefreshTimeoutForImpInMs
					});
				} else {
					console.log(`bbPlayer: ${bid.adUnitCode} refresh time is less than 0`);
				}
			}
		});

		// ad-hoc data logging
		var bbPlayerEvents = ['error', 'aderror', 'adstarted'];
		bbPlayerEvents.forEach(function(eventName) {
			playerApi.on(eventName, function(e) {
				console.log(`bbPlayer: ${eventName} event fired for ${bid.adUnitCode}: `, e);

				// window.adpushup.$.ajax({
				// 	type: 'POST',
				// 	// TODO: bbPlayer: vast dump service endpoints need to be udpated according to new event names
				// 	url: '//vastdump-staging.adpushup.com/' + eventName,
				// 	data: JSON.stringify({
				// 		data: JSON.stringify(e), // TODO: bbPlayer: `e` is the refrence to DOM, stringify is throwing "Uncaught TypeError: Converting circular structure to JSON"
				// 		bid: JSON.stringify(bid),
				// 		eventTime: +new Date(),
				// 		bidWonTime: bidWonTime,
				// 		auctionId: bid.auctionId || '',
				// 		requestId: bid.requestId || ''
				// 	}),
				// 	contentType: 'application/json',
				// 	processData: false,
				// 	dataType: 'json'
				// });

				// TODO: bbPlayer: logging for testing...
				window.adpushup.$.ajax({
					type: 'POST',
					url: '//vastdump-staging.adpushup.com/bb_player_logging',
					data: JSON.stringify({
						eventName: eventName,
						adUnitCode: bid.adUnitCode,
						bidder: bid.bidder,
						bidderCode: bid.bidderCode,
						creativeId: bid.creativeId,
						adId: bid.adId,
						size: bid.size,
						mediaType: bid.mediaType,
						status: bid.status,
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

	function preserveSlotData(slotEl) {
		return {
			preservedSlotElDataset:
				(slotEl && {
					...slotEl.dataset
				}) ||
				{},
			slotAttributesToMigrate: ['renderTime', 'refreshTime', 'timeout']
		};
	}

	function renderVideoBid() {
		// push to render queue because bbPlayer may not be loaded yet.
		bid.renderer.push(() => {
			var slotEl = document.getElementById(bid.adUnitCode);

			// get existing refresh data from slot (not container)
			var { preservedSlotElDataset, slotAttributesToMigrate } = preserveSlotData(slotEl);

			var bbPlayerConfig = getBbPlayerConfig(bid);
			if (!bbPlayerConfig) return; // TODO: bbPlayer: review this

			window.instantiateBbPlayer(bid.adUnitCode);

			var d1 = new Date();
			console.log(
				`bbPlayer: ${
					bid.adUnitCode
				} rendering... ${d1.getHours()}:${d1.getMinutes()}:${d1.getSeconds()}`
			);

			renderBbPlayer(bbPlayerConfig, slotEl);

			var d2 = new Date();
			console.log(
				`bbPlayer: ${
					bid.adUnitCode
				} rendered... ${d2.getHours()}:${d2.getMinutes()}:${d2.getSeconds()}`
			);

			// Get BB Player Instance
			bluebillywig.cmd.push({
				playerId: getBbPlayerId(bid.adUnitCode),
				callback: function(playerApi) {
					console.log(`bbPlayer: cmd que fired`);

					// TODO: bbPlayer: logging for testing...
					window.adpushup.$.ajax({
						type: 'POST',
						url: '//vastdump-staging.adpushup.com/bb_player_logging',
						data: JSON.stringify({
							eventName: 'bb_queue_fired',
							adUnitCode: bid.adUnitCode,
							bidder: bid.bidder,
							bidderCode: bid.bidderCode,
							creativeId: bid.creativeId,
							adId: bid.adId,
							size: bid.size,
							mediaType: bid.mediaType,
							status: bid.status,
							eventTime: +new Date(),
							bidWonTime: bidWonTime,
							auctionId: bid.auctionId || '',
							requestId: bid.requestId || ''
						}),
						contentType: 'application/json',
						processData: false,
						dataType: 'json'
					});

					customizeBbPlayer(playerApi, slotAttributesToMigrate, preservedSlotElDataset);
					setupPlayerEvents(playerApi);
				}
			});

			if (!window.bbQueueIndexMapping) window.bbQueueIndexMapping = [];
			window.bbQueueIndexMapping.push(bid.adUnitCode);
			console.log(`bbPlayer: ${bid.adUnitCode} pushed to index mapping`);
		});
	}

	var videoSlotInViewWatcher = (function() {
		var bannerAdRenderedTime = new Date();
		var watcherExpiryTimeInMs = 1000;
		var watcherInterval = 50;
		var timeoutId;
		var scrollEventListener;

		return function watcher() {
			var currentTime = new Date();
			var timeSpentInMs = currentTime - bannerAdRenderedTime;

			if (
				!apUtils.checkElementInViewPercent(container) &&
				(config.VIDEO_WAIT_LIMIT_DISABLED ||
					(timeSpentInMs < watcherExpiryTimeInMs && !timeoutId))
			) {
				var computedWatcherInterval = config.VIDEO_WAIT_LIMIT_DISABLED
					? watcherInterval
					: watcherExpiryTimeInMs - timeSpentInMs;

				timeoutId = setTimeout(() => {
					watcher();
				}, computedWatcherInterval);

				var inViewCheck = () => {
					if (apUtils.checkElementInViewPercent(container)) {
						watcher();
					}
				};

				if (!config.VIDEO_WAIT_LIMIT_DISABLED) {
					scrollEventListener = debounce(inViewCheck, 50);
					window.addEventListener('scroll', scrollEventListener);
				}
			} else {
				/**
				 * Clear timeout and scroll event listners
				 * first before rendering video bid
				 */
				if (timeoutId) clearTimeout(timeoutId);
				if (scrollEventListener) window.removeEventListener('scroll', scrollEventListener);

				adpSlot.feedbackSent = false; // reset feedbackSent status for current slot

				renderVideoBid();
			}
		};
	})();

	var highestAliveBannerBid = utils.getHighestAliveBid(pbjs, bid.adUnitCode, ['banner']);

	// slot is not in view
	// and have alive banner bid then render banner bid
	if (!apUtils.checkElementInViewPercent(container) && highestAliveBannerBid) {
		console.log(`bbPlayer: ${bid.adUnitCode} is not in view`);
		pbjs.renderAd(
			utils.getIframeDocument(container, { width, height }),
			highestAliveBannerBid.adId
		);

		// send banner bid won feedback
		prebidDataCollector.collectBidWonData(highestAliveBannerBid);

		// Replace it with video ad when slot come back in view
		videoSlotInViewWatcher();
	}
	// otherwise render video
	else {
		console.log(`bbPlayer: ${bid.adUnitCode} is in view`);
		renderVideoBid();
	}
};
