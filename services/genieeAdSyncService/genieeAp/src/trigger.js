var adp = window.adpushup,
	$ = adp.$,
	config = require('../config/config'),
	utils = require('../libs/utils'),
	commonConsts = require('../config/commonConsts'),
	placeAd = require('./adCreater').placeAd,
	executeAdpTagsHeadCode = require('./adCodeGenerator').executeAdpTagsHeadCode,
	isAdContainerInView = require('../libs/lazyload'),
	browserConfig = require('../libs/browserConfig'),
	getContainer = function (ad) {
		var defer = $.Deferred();

		try {
			var $adEl = $('#' + ad.id);
			$adEl.css(
				$.extend(
					{
						width: ad.width,
						height: ad.height
					},
					ad.css
				)
			);

			return defer.resolve($adEl);
		} catch (e) {
			return defer.reject('Unable to get adpushup container');
		}
	},
	trigger = function (adId) {
		if (adp && Array.isArray(adp.config.manualAds) && adp.config.manualAds.length && adp.utils.isUrlMatching()) {
			var manualAds = adp.config.manualAds,
				ad = manualAds.filter(function (ad) {
					return ad.id == adId;
				})[0];

			if (
				ad &&
				ad.id &&
				adp.config.platform.toUpperCase() === ad.formatData.platform.toUpperCase() &&
				document.getElementById(ad.id).children.length === 1
			) {
				var feedbackData = {
					ads: [ad.id],
					xpathMiss: [],
					eventType: 1,
					mode: 16,
					referrer: config.referrer,
					tracking: browserConfig.trackerSupported,
					variationId: commonConsts.MANUAL_ADS.VARIATION
				};

				return getContainer(ad)
					.done(function (container) {
						// Once container has been found, execute adp head code if ad network is "adpTags"
						if (ad.network === commonConsts.NETWORKS.ADPTAGS) {
							executeAdpTagsHeadCode([ad], {}); // This function expects an array of adpTags and optional adpKeyValues
						}
						isAdContainerInView(container).done(function () {
							// Send feedback call
							utils.sendFeedback(feedbackData);
							// Place the ad in the container
							return placeAd(container, ad);
						});
					})
					.fail(function (err) {
						throw new Error(err);
					});
			}
		}
	};

module.exports = trigger;
