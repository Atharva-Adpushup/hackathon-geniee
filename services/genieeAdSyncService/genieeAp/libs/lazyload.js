var $ = require('jquery'),
	utils = require('./utils');

function renderAdWrapper(cb) {
	var ads = window.adpushup.lazyLoadAds || [];
	if (ads.length) {
		ads.forEach(element => {
			if (utils.isElementInViewport(element.data.container)) {
				cb(element.ad, element.data);
			}
		});
	}
	return false;
}

// (function(w, d) {
// 	$(d).ready(function() {
// 		$(w).on(
// 			'scroll',
// 			utils.throttle(function() {
// 				renderAdWrapper();
// 			}, 200)
// 		);
// 	});
// })(window, document);

function init(cb) {
	// $(document).ready(function() {
	$(window).on(
		'scroll',
		utils.throttle(function() {
			renderAdWrapper(cb);
		}, 200)
	);
	// });
}

module.exports = init;
