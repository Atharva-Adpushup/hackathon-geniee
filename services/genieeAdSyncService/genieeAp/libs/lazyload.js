var $ = require('jquery'),
	utils = require('./utils');

function renderAdWrapper() {
	var ads = window.adpushup.lazyload.ads || [],
		cb = window.adpushup.lazyload.cb;
	if (ads.length) {
		ads.forEach(function(element, index) {
			if (utils.isElementInViewport(element.data.container, 10)) {
				ads.splice(index, 1);
				cb(element.ad, element.data);
			}
		});
	}
	return false;
}

function init() {
	$(window).on(
		'scroll',
		utils.throttle(function() {
			renderAdWrapper();
		}, 200)
	);
}

module.exports = init;
