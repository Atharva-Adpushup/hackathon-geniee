var adp = window.adpushup,
	$ = adp.$,
	isMedianetHeaderCodePlaced = false,
	config = require('../config/config'),
	utils = require('../libs/utils'),
	commonConsts = require('../config/commonConsts'),
	placeAd = require('./adCreater').placeAd,
	executeAdpTagsHeadCode = require('./adCodeGenerator').executeAdpTagsHeadCode,
	generateMediaNetHeadCode = require('./adCodeGenerator').generateMediaNetHeadCode,
	isAdContainerInView = require('../libs/lazyload'),
	browserConfig = require('../libs/browserConfig'),
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
	trigger = function (adId) {
		if (adp && Array.isArray(adp.config.manualAds) && adp.config.manualAds.length && adp.utils.isUrlMatching()) {
			var manualAds = adp.config.manualAds,
				newAdId = utils.uniqueId(),
				manualAd = manualAds.filter(function (ad) {
					return ad.id == adId;
				})[0],
				ad = $.extend(true, {}, manualAd),
				siteId = adp.config.siteId,
				adSize = ad.width + 'x' + ad.height,
				isAdId = !!(ad && ad.id),
				isAdElement = !!(isAdId && document.getElementById(ad.id).children.length === 1);

			ad.id = newAdId;
			document.getElementById(adId).setAttribute('id', newAdId);
			document.getElementById(newAdId).setAttribute('data-section', newAdId);
			document.getElementById(newAdId).setAttribute('data-orig-id', adId);
			if (ad.network === commonConsts.NETWORKS.ADPTAGS) {
				if (ad.networkData) ad.networkData.zoneContainerId = 'ADP_' + siteId + '_' + adSize + '_' + newAdId;
			}

			if (isAdElement) {
				var feedbackData = {
					ads: [adId],
					xpathMiss: [],
					eventType: 1,
					// mode: 16,
					mode: 1, // Sending Mode 1 in Manual Ads
					referrer: config.referrer,
					tracking: browserConfig.trackerSupported,
					variationId: commonConsts.MANUAL_ADS.VARIATION
				};

				return getContainer(ad)
					.done(function (container) {
						adp.config.renderedTagAds = adp.config.renderedTagAds || [];
						adp.config.renderedTagAds.push({ newId: newAdId, oldId: adId });
						// Once container has been found, execute adp head code if ad network is "adpTags"
						if (ad.network === commonConsts.NETWORKS.ADPTAGS) {
							executeAdpTagsHeadCode([ad], {}); // This function expects an array of adpTags and optional adpKeyValues
						}
						if (!isMedianetHeaderCodePlaced && ad.network === commonConsts.NETWORKS.MEDIANET) {
							generateMediaNetHeadCode();
							isMedianetHeaderCodePlaced = true;
						}
						if (ad.enableLazyLoading == true) {
							isAdContainerInView(container).done(function () {
								// Send feedback call
								utils.sendFeedback(feedbackData);
								// Place the ad in the container
								return placeAd(container, ad);
							});
						} else {
							// Send feedback call
							utils.sendFeedback(feedbackData);
							// Place the ad in the container
							return placeAd(container, ad);
						}
					})
					.fail(function (err) {
						throw new Error(err);
					});
			}
		}
	};

module.exports = trigger;
