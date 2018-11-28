// GPT library module

var utils = require('../libs/utils'),
	config = require('../config/config.js'),
	commonConsts = require('../config/commonConsts'),
	adp = window.adpushup,
	$ = adp.$,
	intervals = [];
refreshIntervalSwitch = function (w) {
	w.adpushup.$(w).on('blur', function () {
		console.log('blur');
		if (intervals.length) {
			for (var i = 0; i < intervals.length; i++) {
				clearInterval(intervals[i]);
			}
		}
		// if (w.adpushup.adpTags.gptRefreshIntervals.length) {
		// 	w.adpushup.adpTags.gptRefreshIntervals.forEach(function (interval) {
		// 		clearInterval(interval.id);
		// 	});
		// }
	});
	w.adpushup.$(w).on('focus', function () {
		var platform = w.adpushup.config.platform,
			pageGroup = w.adpushup.config.pageGroup,
			selectedVariationId = w.adpushup.config.selectedVariation,
			renderedTagAds = w.adpushup.config.renderedTagAds,
			manualAds = w.adpushup.config.manualAds;
		if (platform && pageGroup && selectedVariationId) {
			var variations = w.adpushup.config.experiment[platform][pageGroup].variations;
			if (variations && variations.length) {
				var selectedVariation = variations.filter(function (variation) {
						return variation.id == selectedVariationId;
					})[0],
					ads = selectedVariation.ads;
				if (ads && ads.length) {
					console.log('focused');
					for (var i = 0; i < ads.length; i++) {
						var adCode = ads[i].networkData && ads[i].networkData.adCode ? ads[i].networkData.adCode : '';
						if (adCode && ads[i].network !== commonConsts.NETWORKS.ADPTAGS) {
							var adId = ads[i].id;
							var refreshInterval = setInterval(
								function (adId, adCode) {
									var el = $('#' + adId);
									if (utils.isElementInViewport(el)) {
										el.children().remove();
										el.append(atob(adCode));
									}
								},
								10000,
								adId,
								adCode
							);
							intervals.push(refreshInterval);
						}
					}
				}
			}
		}

		if (renderedTagAds && renderedTagAds.length) {
			for (var i = 0; i < renderedTagAds.length; i++) {
				var renderedTagAd = manualAds.filter(function (manualAd) {
						return manualAd.id == renderedTagAds[i].oldId;
					})[0],
					adCode = renderedTagAd.networkData && renderedTagAd.networkData.adCode
						? renderedTagAd.networkData.adCode
						: '';
				if (adCode && renderedTagAd.network !== commonConsts.NETWORKS.ADPTAGS) {
					var adId = renderedTagAds[i].newId;
					var refreshInterval = setInterval(
						function (adId, adCode) {
							var el = $('#' + adId);
							if (utils.isElementInViewport(el)) {
								el.children().remove();
								el.append(atob(adCode));
							}
						},
						10000,
						adId,
						adCode
					);
					intervals.push(refreshInterval);
				}
			}
		}
	});
};

module.exports = refreshIntervalSwitch;
