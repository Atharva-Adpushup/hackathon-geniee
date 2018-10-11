var lazyLoadAds = [], utils = require('./utils');

module.exports = function (el) {
	var defer = $.Deferred();
	if (utils.isElementInViewport(el)) {
		return defer.resolve();
	}
	lazyLoadAds.push({ el: el, defer: defer });

	return defer.promise();
};

$(window).on(
	'scroll',
	utils.throttle(function () {
		lazyLoadAds.forEach(function (lazyLoadAd, index) {
			if (utils.isElementInViewport(lazyLoadAd.el)) {
				lazyLoadAd.defer.resolve();
			}
		});
	}, 200)
);
