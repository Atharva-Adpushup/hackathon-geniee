var adp = window.adpushup,
	$ = adp.$,
	apTagQue = [],
	isMedianetHeaderCodePlaced = false,
	config = require('../config/config'),
	utils = require('../libs/utils'),
	commonConsts = require('../config/commonConsts'),
	placeAd = require('./adCreater').placeAd,
	executeAdpTagsHeadCode = require('./adCodeGenerator').executeAdpTagsHeadCode,
	generateMediaNetHeadCode = require('./adCodeGenerator').generateMediaNetHeadCode,
	isAdContainerInView = require('../libs/lazyload'),
	browserConfig = require('../libs/browserConfig'),
	getContainer = function(ad) {
		var defer = $.Deferred(),
			isResponsive = !!(ad.networkData && ad.networkData.isResponsive),
			isFluid = ad.fluid,
			computedStylesObject = {
				textAlign: 'center',
				margin: '0 auto'
			};

		if (!isResponsive && !isFluid) {
			computedStylesObject.width = ad.width;
			computedStylesObject.height = ad.height;
			computedStylesObject.overflow = 'hidden';
		}

		try {
			var $adEl = $('#' + ad.id);

			$adEl.css($.extend(computedStylesObject, ad.css));
			return defer.resolve($adEl);
		} catch (e) {
			return defer.reject('Unable to get adpushup container');
		}
	},
	isDisplayNone = function(el) {
		var elComputedStyles = window.getComputedStyle(el);

		var displayNoneRegex = /none/g;
		return !!displayNoneRegex.test(elComputedStyles.display);
	},
	checkElementDisplay = function(adId) {
		var el = document.getElementById(adId);
		if (!el) {
			return true;
		}

		var isElDisplayNone = isDisplayNone(el);

		while (!isElDisplayNone && el.tagName !== 'BODY') {
			el = el.parentNode;
			isElDisplayNone = isDisplayNone(el);
		}
		return isElDisplayNone;
	},
	trigger = function(adId) {
		var adElement = document.getElementById(adId);

		// utils.log('ApTag id ', adId, 'DOM Element', isDOMElement);

		// NOTE: Stop execution of this module if related DOM element does not exist
		// The requirement for this check came up as redundant ad ids are being triggered from adpushup queue sometimes
		// and the script (adpushup.js) logic execution breaks as related DOM element does not exist
		// Please check Github issue: #837 for more information
		// Issue url: https://github.com/adpushup/GenieeAdPushup/issues/837
		if (!adElement) {
			return false;
		}

		var newAdId = utils.uniqueId(),
			currentTime = new Date().getTime();

		adElement.setAttribute('id', newAdId);

		var newAdElement = document.getElementById(newAdId);
		newAdElement.setAttribute('data-section', newAdId);
		newAdElement.setAttribute('data-orig-id', adId);
		newAdElement.setAttribute('data-render-time', currentTime);

		var isElementDisplayedNone = checkElementDisplay(newAdId);
		if (isElementDisplayedNone) {
			return false;
		}

		if (
			adp &&
			Array.isArray(adp.config.manualAds) &&
			adp.config.manualAds.length &&
			adp.utils.isUrlMatching()
		) {
			var manualAds = adp.config.manualAds,
				manualAd = manualAds.filter(function(ad) {
					return ad.id === adId;
				})[0],
				ad = $.extend(true, {}, manualAd),
				siteId = adp.config.siteId,
				adSize = ad.width + 'x' + ad.height;
			//isAdId = !!(ad && ad.id);
			//domElem = document.getElementById(ad.id),
			//isAdElement = !!(isAdId && domElem);

			// utils.log('APTag found ', manualAd, 'DOM element', domElem);

			ad.id = newAdId;

			if (ad.network === commonConsts.NETWORKS.ADPTAGS) {
				if (ad.networkData)
					ad.networkData.zoneContainerId = 'ADP_' + siteId + '_' + adSize + '_' + newAdId;
			}

			ad.status = commonConsts.AD_STATUS.IMPRESSION; // Mark ap tag status as successful impression
			ad.services = [commonConsts.SERVICES.TAG]; // Set service id for ap tag ads
			ad.originalId = adId;
			//if (isAdElement) {
			var feedbackData = {
				ads: [ad],
				xpathMiss: [],
				errorCode: commonConsts.ERROR_CODES.NO_ERROR,
				mode: commonConsts.MODE.ADPUSHUP, // Sending Mode 1 in Manual Ads
				referrer: config.referrer,
				tracking: browserConfig.trackerSupported,
				variationId: commonConsts.MANUAL_ADS.VARIATION
			};
			var feedbackMetaData = utils.getPageFeedbackMetaData();
			feedbackData = $.extend({}, feedbackData, feedbackMetaData);

			return getContainer(ad)
				.done(function(container) {
					var isLazyLoadingAd = !!(ad.enableLazyLoading === true);
					var isAdNetworkAdpTag = !!(ad.network === commonConsts.NETWORKS.ADPTAGS);
					var isAdNetworkMedianet = !!(
						!isMedianetHeaderCodePlaced && ad.network === commonConsts.NETWORKS.MEDIANET
					);

					adp.config.renderedTagAds = adp.config.renderedTagAds || [];
					adp.config.renderedTagAds.push({ newId: newAdId, oldId: adId });
					// Once container has been found, execute adp head code if ad network is "adpTags"
					if (isAdNetworkAdpTag) {
						executeAdpTagsHeadCode([ad], {}); // This function expects an array of adpTags and optional adpKeyValues
					}
					if (isAdNetworkMedianet) {
						generateMediaNetHeadCode();
						isMedianetHeaderCodePlaced = true;
					}
					if (isLazyLoadingAd) {
						isAdContainerInView(container).done(function() {
							utils.sendFeedback(feedbackData);
							return placeAd(container, ad);
						});
					} else {
						utils.sendFeedback(feedbackData);
						return placeAd(container, ad);
					}
				})
				.fail(function(err) {
					throw new Error(err);
				});
			//}
		}
	};

module.exports = {
	//overwrite original function to execute apTags only if cmp is loaded otherwise push them to a queue for later processing
	triggerAd: function(adId) {
		if (utils.isAdPushupForceDisabled()) {
			utils.log(`AdPushup Force Disabled.. ApTag render blocked`);
			return;
		}
		if (utils.checkForLighthouse(adp.config.siteId)) return;
		if (adp.config.cmpLoaded) {
			utils.log('in triggerAd - cmp loaded', adId);
			trigger(adId);
		} else {
			utils.log('in triggerAd - cmp not loaded yet ', adId);
			apTagQue.push(adId);
		}
	},
	processApTagQue: function() {
		while (apTagQue.length) {
			var adId = apTagQue.shift();
			utils.log('in processApTagQue', adId);
			trigger(adId);
		}
	}
};
