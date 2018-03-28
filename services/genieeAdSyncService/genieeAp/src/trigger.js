var adp = window.adpushup,
	$ = adp.$,
	config = require('../config/config'),
	utils = require('../libs/utils'),
	commonConsts = require('../config/commonConsts'),
	placeAd = require('./adCreater').placeAd,
	browserConfig = require('../libs/browserConfig'),
	getContainer = function(ad) {
		var defer = $.Deferred();

		try {
			var $adEl = $('#' + ad.id);
			$adEl.css(
				$.extend(
					{
						width: ad.width,
						height: ad.height,
						background: 'red'
					},
					ad.css
				)
			);

			return defer.resolve($adEl);
		} catch (e) {
			return defer.reject('Unable to get adpushup container');
		}
	},
	trigger = function(adId) {
		if (adp && Array.isArray(adp.manualAds) && adp.manualAds.length) {
			var manualAds = adp.manualAds,
				ad = manualAds.filter(function(ad) {
					return ad.id == adId;
				})[0],
				feedbackData = {
					ads: [ad.id],
					xpathMiss: [],
					eventType: 1,
					mode: config.mode,
					referrer: config.referrer,
					tracking: browserConfig.trackerSupported,
					variationId: commonConsts.MANUAL_ADS.VARIATION
				};

			return getContainer(ad)
				.done(function(container) {
					utils.sendFeedback(feedbackData);
					return placeAd(container, ad);
				})
				.fail(function(err) {
					throw new Error(err);
				});
		}
	};

module.exports = trigger;
