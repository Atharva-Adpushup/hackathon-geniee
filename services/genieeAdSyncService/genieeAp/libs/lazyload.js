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
		for (var i = lazyLoadAds.length - 1; i >= 0; i--) {
			if (utils.isElementInViewport(lazyLoadAds[i].el)) {
				lazyLoadAds[i].defer.resolve();
				lazyLoadAds.splice(i, 1);
			}
		}
	}, 200)
);
