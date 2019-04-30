// GPT library module

var utils = require('../libs/utils'),
	commonConsts = require('../config/commonConsts'),
	adCodeGenerator = require('./adCodeGenerator'),
	adp = window.adpushup,
	debounce = require('lodash.debounce'),
	$ = adp.$,
	ads = [],
	inViewAds = [],
	setRefreshTimeOut = function(container, ad, refreshInterval) {
		if (utils.checkElementInViewPercent(container)) {
			var refreshInterval =
				refreshInterval !== undefined
					? refreshInterval
					: parseInt(ad.networkData.refreshInterval) * 1000 || commonConsts.AD_REFRESH_INTERVAL;
			var currentTime = new Date().getTime();
			container.attr('data-refresh-time', currentTime);
			var oldTimeoutId = container.attr('data-timeout');
			oldTimeoutId && clearTimeout(oldTimeoutId);
			var newTimeoutId = setTimeout(refreshAd, refreshInterval, container, ad);
			container.attr('data-timeout', newTimeoutId);
		}
	},
	refreshAd = function(container, ad) {
		if (utils.checkElementInViewPercent(container)) {
			var currentTime = new Date().getTime();
			container.attr('data-refresh-time', currentTime);
			if (ad.network === commonConsts.NETWORKS.ADPTAGS && !ad.networkData.headerBidding) {
				var slot = getAdpSlot(ad);
				refreshGPTSlot(slot.gSlot);
				sendFeedback(ad);
				setRefreshTimeOut(container, ad);
			} else if (ad.network === commonConsts.NETWORKS.ADPTAGS && ad.networkData.headerBidding) {
				//container.children().remove();
				var slot = getAdpSlot(ad);
				slot.hasRendered = false;
				slot.toBeRefresh = true;
				slot.biddingComplete = false;
				slot.feedbackSent = false;
				slot.hasTimedOut = false;
				removeBidderTargeting(slot);
				adp.adpTags.queSlotForBidding(slot);
				setRefreshTimeOut(container, ad);
			} else if (ad.network !== commonConsts.NETWORKS.ADPTAGS) {
				container.children().remove();
				container.append(adCodeGenerator.generateAdCode(ad));
				sendFeedback(ad);
				setRefreshTimeOut(container, ad);
			}
		}
	},
	removeBidderTargeting = function(slot) {
		var targetingKeys = slot.gSlot.getTargetingKeys();
		for (var i = 0; i < targetingKeys.length; i++) {
			if (targetingKeys[i].match(/^hb_/g)) {
				slot.gSlot.clearTargeting(targetingKeys[i]);
			}
		}
	},
	getAdpSlot = function(ad) {
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
			eventType: 1,
			mode: 1,
			referrer: adp.config.referrer,
			tracking: false
		};
		feedbackData.xpathMiss = [];
		feedbackData.ads = [ad.id];
		feedbackData.variationId = adp.config.selectedVariation;
		utils.sendFeedback(feedbackData);
	},
	refreshGPTSlot = function(gSlot) {
		googletag.pubads().refresh([gSlot]);
	},
	getAllInViewAds = function() {
		inViewAds = [];
		for (var i = 0; i < ads.length; i++) {
			if (utils.checkElementInViewPercent(ads[i].container)) {
				inViewAds.push(ads[i]);
			}
		}
	},
	onScroll = function() {
		getAllInViewAds();

		for (var i = 0; i < inViewAds.length; i++) {
			var inViewAd = inViewAds[i],
				container = inViewAd.container,
				ad = inViewAd.ad,
				adRenderTime = container.attr('data-render-time'),
				lastRefreshTime = container.attr('data-refresh-time'),
				currentTime = new Date().getTime(),
				adRefreshInterval = parseInt(ad.networkData.refreshInterval) * 1000 || commonConsts.AD_REFRESH_INTERVAL,
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
	onFocus = function() {
		getAllInViewAds();

		for (var i = 0; i < inViewAds.length; i++) {
			var inViewAd = inViewAds[i],
				container = inViewAd.container,
				ad = inViewAd.ad,
				lastRefreshTime = container.attr('data-refresh-time'),
				currentTime = new Date().getTime(),
				adRefreshInterval = parseInt(ad.networkData.refreshInterval) * 1000 || commonConsts.AD_REFRESH_INTERVAL,
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
			}
		}
	},
	init = function() {
		$(window).on('scroll', debounce(onScroll, 50));
		$(window).on('focus', onFocus);
	},
	refreshSlot = function(container, ad) {
		setRefreshTimeOut(container, ad);

		ads.push({
			container: container,
			ad: ad
		});
	};

module.exports = {
	init: init,
	refreshSlot: refreshSlot
};
