// GPT library module

var utils = require('../libs/utils'),
	commonConsts = require('../config/commonConsts'),
	adCodeGenerator = require('./adCodeGenerator'),
	{
		getBbPlayerId,
		removeBbPlayerIfRendered,
		sendBbPlayerLogs
	} = require('../modules/adpTags/hbScript/src/bbPlayerUtils'),
	adp = window.adpushup,
	debounce = require('lodash.debounce'),
	ads = [],
	inViewAds = [],
	setRefreshTimeOut = function(container, ad, refreshInterval) {
		if (container.length && utils.checkElementInViewPercent(container)) {
			var refreshInterval =
				refreshInterval !== undefined
					? refreshInterval
					: parseInt(ad.networkData.refreshInterval) * 1000 || commonConsts.AD_REFRESH_INTERVAL;

			var currentTime = new Date().getTime();
			container.attr('data-refresh-time', currentTime);

			var oldTimeoutId = container.attr('data-timeout');
			oldTimeoutId && clearTimeout(oldTimeoutId);

			var newTimeoutId = setTimeout(refreshAd, refreshInterval, ad);
			container.attr('data-timeout', newTimeoutId);
		}
	},
	getAdObjById = function(adId) {
		if (!adId) return;

		return ads.find(obj => obj.ad.id === adId);
	},
	setRefreshTimeOutByAdId = function(adId, refreshInterval) {
		if (!adId) return;

		var adObj = getAdObjById(adId);
		if (!adObj) return;

		var container = adp.$(`#${adId}`);
		setRefreshTimeOut(container, adObj.ad, refreshInterval);
	},
	getRefreshDataByAdId = function(adId) {
		if (!adId) return;

		var adObj = getAdObjById(adId);
		if (!adObj) return;

		// get updated container (adObj.container is old)
		var container = adp.$(`#${adObj.ad.id}`);

		var { refreshTime: refreshTimeStamp, timeout: refreshTimeoutId } = container[0].dataset;

		if (!refreshTimeStamp || !refreshTimeoutId) return;

		var refreshTimeoutStartTime = new Date(parseInt(refreshTimeStamp, 10));
		var currentTime = new Date();

		var refreshIntervalInMs =
			adObj.ad.networkData.refreshInterval * 1000 || commonConsts.AD_REFRESH_INTERVAL;

		var refreshTimeLeftInMs = refreshIntervalInMs - (currentTime - refreshTimeoutStartTime);

		return {
			refreshTimeoutStartTime,
			refreshTimeLeftInMs,
			refreshTimeoutId
		};
	},
	refreshAd = function(ad) {
		var container = adp.$(`#${ad.id}`);
		if (container.length && utils.checkElementInViewPercent(container)) {
			var currentTime = new Date().getTime();
			container.attr('data-refresh-time', currentTime);
			if (ad.network === commonConsts.NETWORKS.ADPTAGS) {
				//container.children().remove();
				var slot = getAdpSlot(ad);
				slot.toBeRefreshed = true;
				slot.refreshCount = typeof slot.refreshCount === 'undefined' ? 1 : ++slot.refreshCount;

				removeBidderTargeting(slot);

				if (adp.config.isBbPlayerEnabledForTesting) {
					if (adp.config.enableBbPlayerLogging) {
						sendBbPlayerLogs('refresh', 'refreshAd', slot);

						// Temporarily logging video bids which are neither rendered nor thrown any error
						const notRenderedVideoBid =
							adp.config.notRenderedVideoBids && adp.config.notRenderedVideoBids[slot.containerId];

						if (notRenderedVideoBid) {
							sendBbPlayerLogs(
								'not_rendered_video_bid',
								'not_rendered_video_bid',
								{},
								notRenderedVideoBid
							);

							delete adp.config.notRenderedVideoBids[slot.containerId];
						}
					}

					// Remove BB Player if rendered for current adUnit
					var bbPlayerId = getBbPlayerId(slot.containerId);
					removeBbPlayerIfRendered(bbPlayerId);
				}

				adp.config.apLiteActive
					? window.apLite.queSlotForBidding(slot)
					: adp.adpTags.queSlotForBidding(slot);
				setRefreshTimeOut(container, ad);
			} else if (!adp.config.apLiteActive && ad.network !== commonConsts.NETWORKS.ADPTAGS) {
				container.children().remove();
				container.append(adCodeGenerator.generateAdCode(ad));
				sendFeedback(ad);
				setRefreshTimeOut(container, ad);
			}
		}
	},
	removeBidderTargeting = function(slot) {
		if (slot.gSlot) {
			var targetingKeys = slot.gSlot.getTargetingKeys();
			for (var i = 0; i < targetingKeys.length; i++) {
				if (targetingKeys[i].match(/^hb_/g)) {
					slot.gSlot.clearTargeting(targetingKeys[i]);
				}
			}
		}
	},
	getAdpSlot = function(ad) {
		if (adp.config.apLiteActive) {
			var slot = window.apLite.adpSlots[ad.slotId];

			return slot;
		}

		var adSize = ad.width + 'X' + ad.height,
			adSize1 = ad.width + 'x' + ad.height,
			siteId = adp.config.siteId,
			slotId = 'ADP_' + siteId + '_' + adSize + '_' + ad.id,
			slotId1 = 'ADP_' + siteId + '_' + adSize1 + '_' + ad.id,
			adpSlots = adp.adpTags.adpSlots,
			slot;
		if (ad.formatData && ad.formatData.type == 'sticky') {
			slotId = 'STICKY_' + slotId;
			slotId1 = 'STICKY_' + slotId1;
		}
		slot = adpSlots[slotId] || adpSlots[slotId1];
		return slot;
	},
	sendFeedback = function(ad) {
		var feedbackData = {
			ads: [],
			xpathMiss: [],
			errorCode: 1,
			mode: 1,
			referrer: adp.config.referrer,
			tracking: false
		};
		var feedbackMetaData = utils.getPageFeedbackMetaData();
		feedbackData = adp.$.extend({}, feedbackData, feedbackMetaData);
		feedbackData.ads = [ad];
		feedbackData.variationId = adp.config.selectedVariation;
		utils.sendFeedback(feedbackData);
	},
	stopRefreshForASlot = function(adId) {
		var adIndex = ads.findIndex(obj => obj.ad.id === adId);

		if (adIndex !== -1) {
			var container = adp.$(`#${adId}`);
			var oldTimeoutId = container.attr('data-timeout');
			oldTimeoutId && clearTimeout(oldTimeoutId);

			ads.splice(adIndex, 1);
		}
	},
	getAllInViewAds = function() {
		inViewAds = [];
		for (var i = 0; i < ads.length; i++) {
			var container = adp.$(`#${ads[i].ad.id}`);
			if (container.length && utils.checkElementInViewPercent(container)) {
				inViewAds.push(ads[i]);
			}
		}
	},
	handleRefresh = function() {
		getAllInViewAds();

		for (var i = 0; i < inViewAds.length; i++) {
			var inViewAd = inViewAds[i],
				container = adp.$(`#${inViewAd.ad.id}`), // get updated container (inViewAd.container is not updated)
				ad = inViewAd.ad,
				adRenderTime = container.attr('data-render-time'),
				lastRefreshTime = container.attr('data-refresh-time'),
				currentTime = new Date().getTime(),
				adRefreshInterval =
					parseInt(ad.networkData.refreshInterval) * 1000 || commonConsts.AD_REFRESH_INTERVAL,
				timeDifferenceInSec,
				refreshInterval;
			if (lastRefreshTime) {
				// if Ad has been rendered before
				timeDifferenceInSec = currentTime - lastRefreshTime;
				if (timeDifferenceInSec > adRefreshInterval) {
					// if last refresh turn has been missed
					refreshInterval = 0;
					setRefreshTimeOut(container, ad, refreshInterval);
				}
				// else immediatly refresh it;
			} else {
				// If ad is rendering for the first time.
				timeDifferenceInSec = currentTime - adRenderTime;
				if (timeDifferenceInSec > adRefreshInterval) {
					// wait for 2 sec to count the impression of ad renedered first time.
					refreshInterval = 2000;
				} else {
					refreshInterval = adRefreshInterval;
				} // lazyloading case (if ad has just rendered, refreesh it after 30sec.)
				setRefreshTimeOut(container, ad, refreshInterval);
			}
		}
	},
	init = function() {
		adp.$(window).on('scroll', debounce(handleRefresh, 50));
		adp.$(window).on('focus', handleRefresh);
	},
	refreshSlot = function(container, ad) {
		setRefreshTimeOut(container, ad);

		ads.push({
			container: container,
			ad: ad
		});
	};

module.exports = {
	init,
	refreshSlot,
	stopRefreshForASlot,
	setRefreshTimeOutByAdId,
	getRefreshDataByAdId
};
