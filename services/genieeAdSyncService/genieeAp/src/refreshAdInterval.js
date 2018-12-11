// GPT library module

var utils = require('../libs/utils'),
	config = require('../config/config.js'),
	commonConsts = require('../config/commonConsts'),
	placeAd = require('./adCreater').placeAd,
	adp = window.adpushup,
	$ = adp.$,
	intervals = [],
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
	setAdInterval = function (ads) {
		for (var i = 0; i < ads.length; i++) {
			var ad = $.extend({}, ads[i]);
			getContainer(ad).done(function (container) {
				var refreshInterval = setInterval(
					function (container, ad) {
						if (utils.isElementInViewport(container)) {
							console.log('refreshed');
							container.children().remove();
							placeAd(container, ad);
						}
					},
					commonConsts.AD_REFRESH_INTERVAL,
					container,
					ad
				);
				intervals.push(refreshInterval);
			});
		}
	},
	clearAdInterval = function () {
		if (intervals.length) {
			for (var i = 0; i < intervals.length; i++) {
				clearInterval(intervals[i]);
			}
		}
	},
	refreshIntervalSwitch = function (w) {
		var ads = [],
			platform = w.adpushup.config.platform,
			pageGroup = w.adpushup.config.pageGroup,
			selectedVariationId = w.adpushup.config.selectedVariation,
			manualAds = w.adpushup.config.manualAds;
		if (platform && pageGroup && selectedVariationId) {
			var variations = w.adpushup.config.experiment[platform][pageGroup].variations;
			if (variations && variations.length) {
				var selectedVariation = variations.filter(function (variation) {
						return variation.id == selectedVariationId;
					})[0],
					layoutAds = selectedVariation.ads;
				if (layoutAds && layoutAds.length) {
					for (var i = 0; i < layoutAds.length; i++) {
						if (
							layoutAds[i].network !== commonConsts.NETWORKS.ADPTAGS &&
							(layoutAds[i].networkData && !!layoutAds[i].networkData.refreshSlot)
						) {
							var ad = $.extend(true, {}, layoutAds[i]);
							ads.push(ad);
						}
					}
				}
			}
		}
		if (manualAds && manualAds.length) {
			for (var i = 0; i < manualAds.length; i++) {
				if (
					manualAds[i].network !== commonConsts.NETWORKS.ADPTAGS &&
					(manualAds[i].networkData && !!manualAds[i].networkData.refreshSlot)
				) {
					var elements = $("div[data-orig-id='" + manualAds[i].id + "']");
					if (elements) {
						elements.each(function () {
							var ad = $.extend(true, {}, manualAds[i], { id: this.id });
							ads.push(ad);
						});
					}
				}
			}
		}
		setAdInterval(ads);
		w.adpushup.$(w).on('blur', function () {
			console.log('blur');
			clearAdInterval();
		});
		w.adpushup.$(w).on('focus', function () {
			setAdInterval(ads);
		});
	};

module.exports = refreshIntervalSwitch;
