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
		var isDOMElement = !!document.getElementById(adId);

		// NOTE: Stop execution of this module if related DOM element does not exist
		// The requirement for this check came up as redundant ad ids are being triggered from adpushup queue sometimes
		// and the script (adpushup.js) logic execution breaks as related DOM element does not exist
		// Please check Github issue: #837 for more information
		// Issue url: https://github.com/adpushup/GenieeAdPushup/issues/837
		if (!isDOMElement) {
			return false;
		}

		if (adp && Array.isArray(adp.config.manualAds) && adp.config.manualAds.length && adp.utils.isUrlMatching()) {
			var manualAds = adp.config.manualAds,
				newAdId = utils.uniqueId(),
				manualAd = manualAds.filter(function (ad) {
					return ad.id === adId;
				})[0],
				ad = $.extend(true, {}, manualAd),
				siteId = adp.config.siteId,
				adSize = ad.width + 'x' + ad.height,
				isAdId = !!(ad && ad.id),
				domElem = document.getElementById(ad.id),
				currentTime = new Date().getTime(),
				isAdElement = !!(isAdId && domElem && domElem.children && domElem.children.length === 1);

			ad.id = newAdId;
			document.getElementById(adId).setAttribute('id', newAdId);
			document.getElementById(newAdId).setAttribute('data-section', newAdId);
			document.getElementById(newAdId).setAttribute('data-orig-id', adId);
			document.getElementById(newAdId).setAttribute('data-render-time', currentTime);
			if (ad.network === commonConsts.NETWORKS.ADPTAGS) {
				if (ad.networkData) ad.networkData.zoneContainerId = 'ADP_' + siteId + '_' + adSize + '_' + newAdId;
			}

			ad.status = 1; // Mark ap tag status as successful impression
			ad.services = [commonConsts.SERVICES.TAG]; // Set service id for ap tag ads
			ad.originalId = adId;
			if (isAdElement) {
				var feedbackData = {
					ads: [ad],
					xpathMiss: [],
					eventType: commonConsts.ERROR_CODES.NO_ERROR,
					// mode: 16,
					mode: commonConsts.MODE.ADPUSHUP, // Sending Mode 1 in Manual Ads
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
						if (ad.enableLazyLoading === true) {
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
