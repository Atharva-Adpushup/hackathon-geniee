// GPT library module

var utils = require('../libs/utils'),
	commonConsts = require('../config/commonConsts'),
	adCodeGenerator = require('./adCodeGenerator'),
	adp = window.adpushup,
	$ = adp.$,
	ads = [],
	intervals = [],
	refreshAd = function(container, ad) {
		if (utils.isElementInViewport(container)) {
			container.children().remove();
			container.append(adCodeGenerator.generateAdCode(ad));
		}
	},
	setAdInterval = function(container, ad) {
		var refreshInterval = setInterval(refreshAd, commonConsts.AD_REFRESH_INTERVAL, container, ad);
		intervals.push(refreshInterval);
	},
	clearAdInterval = function() {
		if (intervals.length) {
			for (var i = 0; i < intervals.length; i++) {
				clearInterval(intervals[i]);
			}
			intervals.length = 0;
		}
	},
	init = function(w) {
		w.adpushup.$(w).on('blur', function() {
			clearAdInterval();
		});
		w.adpushup.$(w).on('focus', function() {
			for (var i = 0; i < ads.length; i++) {
				var adContainer = $.extend({}, ads[i]),
					container = adContainer.container,
					ad = adContainer.ad;
				refreshAd(container, ad);
				setAdInterval(container, ad);
			}
		});
	},
	refreshSlot = function(container, ad) {
		setAdInterval(container, ad);
		ads.push({ container: container, ad: ad });
	};

module.exports = {
	init: init,
	refreshSlot: refreshSlot
};
