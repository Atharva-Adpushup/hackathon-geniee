// GPT library module

var utils = require('../libs/utils'),
	commonConsts = require('../config/commonConsts'),
	adCodeGenerator = require('./adCodeGenerator'),
	adp = window.adpushup,
	$ = adp.$,
	ads = [],
	intervals = [],
	refreshAd = function (container, ad) {
		if (utils.checkElementInViewPercent(container)) {
			if (ad.network === commonConsts.NETWORKS.ADPTAGS && !ad.networkData.headerBidding) {
				var slot = getAdpSlot(ad);
				refreshGPTSlot(slot.gSlot);
				sendFeedback(ad);
			} else if (ad.network !== commonConsts.NETWORKS.ADPTAGS) {
				container.children().remove();
				container.append(adCodeGenerator.generateAdCode(ad));
				sendFeedback(ad);
			}
		}
	},
	getAdpSlot = function (ad) {
		var adSize = ad.width + 'X' + ad.height,
			siteId = 37902, //adp.config.siteId,
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
		var refreshInterval = setInterval(refreshAd, commonConsts.AD_REFRESH_INTERVAL, container, ad);
		intervals.push(refreshInterval);
	},
	clearAdInterval = function () {
		if (intervals.length) {
			for (var i = 0; i < intervals.length; i++) {
				clearInterval(intervals[i]);
			}
			intervals.length = 0;
		}
	},
	getContainer = function (ad) {
		var defer = $.Deferred(),
			isResponsive = !!(ad.networkData && ad.networkData.isResponsive),
			computedStylesObject = isResponsive
				? {}
				: {
					width: ad.width,
					height: ad.height
				  };

		try {
			var $adEl = $('#' + ad.id);

			$adEl.css($.extend(computedStylesObject, ad.css));
			return defer.resolve($adEl);
		} catch (e) {
			return defer.reject('Unable to get adpushup container');
		}
	},
	setAdTimeOut = function () {},
	getAllInViewAds = function (ads) {
		for (var i = 0; i < ads.length; i++) {
			return getContainer(ad).done(function (container) {
				if (utils.checkElementInViewPercent(container)) {
					var currentTime = new Date().getTime();
					container.setAttribute('data-refresh-time', currentTime);
				}
			});
		}
	},
	init = function (w) {
		w.adpushup.$(w).on('blur', function () {
			clearAdInterval();
		});
		w.adpushup.$(w).on('focus', function () {
			for (var i = 0; i < ads.length; i++) {
				var adContainer = $.extend({}, ads[i]),
					container = adContainer.container,
					ad = adContainer.ad;
				refreshAd(container, ad);
				setAdInterval(container, ad);
			}
		});
	},
	refreshSlot = function (container, ad) {
		setAdInterval(container, ad);
		ads.push({ container: container, ad: ad });
	};

module.exports = {
	init: init,
	refreshSlot: refreshSlot
};
