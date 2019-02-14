// GPT library module

var utils = require('../libs/utils'),
	commonConsts = require('../config/commonConsts'),
	adCodeGenerator = require('./adCodeGenerator'),
	adp = window.adpushup,
	_ = require('lodash'),
	$ = adp.$,
	ads = [],
	inViewAds = [],
	setRefreshTimeOut = function (container, ad, refreshInterval) {
		var refreshInterval = refreshInterval !== undefined ? refreshInterval : commonConsts.AD_REFRESH_INTERVAL;
		setTimeout(refreshAd, refreshInterval, container, ad);
	},
	refreshAd = function (container, ad) {
		if (utils.checkElementInViewPercent(container)) {
			var currentTime = new Date().getTime();
			container.attr('data-refresh-time', currentTime);
			if (ad.network === commonConsts.NETWORKS.ADPTAGS && !ad.networkData.headerBidding) {
				var slot = getAdpSlot(ad);
				refreshGPTSlot(slot.gSlot);
				sendFeedback(ad);
				setRefreshTimeOut(container, ad);
			} else if (ad.network !== commonConsts.NETWORKS.ADPTAGS) {
				container.children().remove();
				container.append(adCodeGenerator.generateAdCode(ad));
				sendFeedback(ad);
				setRefreshTimeOut(container, ad);
			}
		}
	},
	getAdpSlot = function (ad) {
		var adSize = ad.width + 'X' + ad.height,
			siteId = adp.config.siteId,
			slotId = 'ADP_' + siteId + '_' + adSize + '_' + ad.id,
			adpSlots = adp.adpTags.adpSlots,
			slot = adpSlots[slotId];
		return slot;
	},
	sendFeedback = function (ad) {
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
	refreshGPTSlot = function (gSlot) {
		googletag.pubads().refresh([gSlot]);
	},
	setAdInterval = function (container, ad) {
		if (utils.checkElementInViewPercent(container)) {
			var currentTime = new Date().getTime();
			inViewAds.push(ad);
			container.attr('data-refresh-time', currentTime);
			setTimeout(refreshAd, commonConsts.AD_REFRESH_INTERVAL, container, ad);
		}
	},
	getAllInViewAds = function () {
		inViewAds = [];
		for (var i = 0; i < ads.length; i++) {
			if (utils.checkElementInViewPercent(ads[i].container)) inViewAds.push(ads[i]);
		}
	},
	onScroll = function () {
		console.log('scrolled', ads);
		getAllInViewAds();

		for (var i = 0; i < inViewAds.length; i++) {
			var inViewAd = inViewAds[i],
				container = inViewAd.container,
				ad = inViewAd.ad,
				adRenderTime = container.attr('data-render-time'),
				lastRefreshTime = container.attr('data-refresh-time'),
				currentTime = new Date().getTime(),
				timeDifferenceInSec,
				refreshInterval;
			if (lastRefreshTime) {
				// if Ad has been rendered before
				timeDifferenceInSec = currentTime - lastRefreshTime;
				if (timeDifferenceInSec > commonConsts.AD_REFRESH_INTERVAL) {
					// if last refresh turn has been missed
					refreshInterval = 0;
				}
				// else immediatly refresh it;
			} else {
				// If ad is rendering for the first time.
				timeDifferenceInSec = currentTime - adRenderTime;
				if (timeDifferenceInSec > commonConsts.AD_REFRESH_INTERVAL) {
					// wait for 2 sec to count the impression of ad renedered first time.
					refreshInterval = 2000;
				} else refreshInterval = commonConsts.AD_REFRESH_INTERVAL; // lazyloading case (if ad has just rendered, refreesh it after 30sec.)
			}
			setRefreshTimeOut(container, ad, refreshInterval);
		}
	},
	init = function () {
		$(window).on('scroll', _.throttle(onScroll, 1000));
	},
	refreshSlot = function (container, ad) {
		setRefreshTimeOut(container, ad);
		ads.push({ container: container, ad: ad });
	};

module.exports = {
	init: init,
	refreshSlot: refreshSlot
};
