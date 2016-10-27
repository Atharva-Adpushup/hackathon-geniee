var $ = require('jquery'),
	nodewatcher = require('../libs/nodeWatcher'),
	utils = require('../libs/utils'),
	browserConfig = require('../libs/browserConfig'),
	incontentAnalyser = require('../libs/aa'),

	segregateAds = function(ads) {
		var a, ad, structuredAds = [], inContentAds = [];
		for (a = 0; a < ads.length; a++) {
			ad = ads[a];
			ad.isIncontent ? inContentAds.push(ad) : structuredAds.push(ad);
		}
		return { structuredAds: structuredAds, inContentAds: inContentAds };
	},
	getContainer = function(ad, el) {
		if (!el) {
			el = $(ad.xpath);
		}
		var container = $('<div/>').css($.extend({
			'display': 'block',
			'clear': ad.isIncontent ? null : 'both',
			'width': ad.width + 'px',
			'height': ad.height + 'px'
		}, ad.css)).attr({
			'data-section': ad.sectionMd5,
			'class': '_ap_apex_ad',
			'data-xpath': ad.xpath ? ad.xpath : '',
			'data-section-id': ad.section ? ad.section : ''
		});

		switch (ad.operation) {
			case 'Append':
				el.append(container);
				break;
			case 'Prepend':
				el.prepend(container);
				break;
			case 'Insert Before':
				el.before(container);
				break;
			default:
				el.after(container);
		}
		return container;
	},
	getAdContainer = function(ad, xpathWaitTimeout) {
		// eslint-disable-next-line new-cap
		var defer = $.Deferred();
		nodewatcher.watch(ad.xpath, xpathWaitTimeout).done(function() {
			var container = getContainer(ad);
			container ? defer.resolve({ container: container, success: true }) : defer.reject({ xpathMiss: true, success: false });
		}).fail(function() {
			defer.reject({ xpathMiss: true, success: false });
		});
		return defer.promise();
	},

	createAds = function(adp, variation) {
		var config = adp.config,
			tracker = adp.tracker,
			err = adp.error,
			finished = false,
			ads = variation.ads,
			displayCounter = ads.length,
			feedbackData = {
				ads: [],
				xpathMiss: [],
				eventType: 1,
				mode: 1,
				referrer: config.referrer,
				tracking: browserConfig.trackerSupported,
				chosenVariation: variation.id // set the chosenVariation variation in feedback data;
			},
			placeAd = function(container, ad) {
				try {
					$.ajaxSettings.cache = true;
					container.append(utils.base64Decode(ad.adCode));
					$.ajaxSettings.cache = false;
					tracker.add(container, function(sectionMd5) {
						utils.sendBeacon(config.feedbackUrl, {eventType: 2, click: true, sectionMd5: sectionMd5 });
					}.bind(null, ad.sectionMd5));
				} catch (e) {
					err.push({ msg: 'Error in placing ad.', ad: ad, error: e });
				}
				return true;
			},
			next = function(adObj, data) {
				if (displayCounter) {
					displayCounter--;
					if (data.success) {
						placeAd(data.container, adObj);
					}
				}
				if (!displayCounter && !finished) {
					finished = true;
					if (variation.customJs && variation.customJs.afterAp) {
						utils.runScript(utils.base64Decode(variation.customJs.afterAp));
					}
					utils.sendFeedback(feedbackData);
				}
			},
			handleContentSelectorFailure = function(inContentAds) {
				feedbackData.contentSelectorMissing = true;
				$.each(inContentAds, function(index, ad) {
					feedbackData.xpathMiss.push(ad.sectionMd5);
					next(ad, { success: false });
				});
			},
			placeStructuralAds = function(structuredAds) {
			// Process strutural sections
				$.each(structuredAds, function(index, ad) {
					getAdContainer(ad, config.xpathWaitTimeout).done(function(data) {
						// if all well then ad sectionMd5 of ad in feedback to tell system that impression was given
						feedbackData.ads.push(ad.sectionMd5);
						next(ad, data);
					}).fail(function(data) {
						feedbackData.xpathMiss.push(ad.sectionMd5);
						next(ad, data);
					});
				});
			},
			placeInContentAds = function($incontentElm, inContentAds) {
				incontentAnalyser($incontentElm, inContentAds, function(sectionsWithTargetElm) {
					$(inContentAds).each(function(index, ad) {
						var sectionObj = sectionsWithTargetElm[ad.section];

						if (sectionObj && sectionObj.elem) {
							if (!!(sectionObj.isSecondaryCss)) {
								ad.css = $.extend(true, {}, ad.secondaryCss);
							}
							feedbackData.ads.push(ad.sectionMd5);
							next(ad, { success: true, container: getContainer(ad, sectionObj.elem)});
						} else {
							feedbackData.xpathMiss.push(ad.sectionMd5);
							next(ad, { success: false, container: null });
						}
					});
				});
			};


		(function main() {
			if (variation.customJs && variation.customJs.beforeAp) {
				utils.runScript(utils.base64Decode(variation.customJs.beforeAp));
			}

			ads = segregateAds(ads); // segregate incontent and strutural ads so that they can be placed accordingly.

		// Process and place structural ads
			placeStructuralAds(ads.structuredAds);


		// Process incontent sections
		// If incontent ads thr but no xpath given for content area
			if (ads.inContentAds.length && !variation.contentSelector) {
				handleContentSelectorFailure();
			} else if (ads.inContentAds.length) {
				nodewatcher.watch(config.contentSelector, config.xpathWaitTimeout).done(function($incontentElm) {
					placeInContentAds($incontentElm, ads.inContentAds);
				}).fail(function() {
					handleContentSelectorFailure();
				});
			}
		});
	};

module.exports = createAds;
