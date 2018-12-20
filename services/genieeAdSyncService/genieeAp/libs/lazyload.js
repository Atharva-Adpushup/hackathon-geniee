var utils = require('./utils'),
	commonConsts = require('../config/commonConsts'),
	$ = window.adpushup.$ || $,
	lazyLoadAds = [];

module.exports = function(el) {
	var defer = $.Deferred();
	if (utils.isElementInViewport(el, commonConsts.LAZY_LOAD.SCROLL_THRESHOLD)) {
		return defer.resolve();
	}
	lazyLoadAds.push({ el: el, defer: defer });

	return defer.promise();
};

function onScroll() {
	return utils.throttle(function() {
		if (lazyLoadAds.length) {
			for (var i = lazyLoadAds.length - 1; i >= 0; i--) {
				if (utils.isElementInViewport(lazyLoadAds[i].el, commonConsts.LAZY_LOAD.SCROLL_THRESHOLD)) {
					lazyLoadAds[i].defer.resolve();
					lazyLoadAds.splice(i, 1);
				}
			}
		} else {
			$(window).off('scroll', onScroll);
		}
	}, 200)();
}

$(window).on('scroll', onScroll);
