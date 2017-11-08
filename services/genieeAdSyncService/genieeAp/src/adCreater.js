var $ = require('jquery'),
	nodewatcher = require('../libs/nodeWatcher'),
	utils = require('../libs/utils'),
	browserConfig = require('../libs/browserConfig'),
	incontentAnalyser = require('../libs/aa'),
	adCodeGenerator = require('./adCodeGenerator'),
	segregateAds = function(ads) {
		var a,
			ad,
			structuredAds = [],
			inContentAds = [],
			adpTagUnits = [],
			genieeIds = [];
		for (a = 0; a < ads.length; a++) {
			ad = ads[a];
			ad.isIncontent ? inContentAds.push(ad) : structuredAds.push(ad);
			ad.network === 'geniee' && !ad.adCode && ad.networkData && genieeIds.push(ad.networkData.zoneId);
			ad.network === 'adpTags' && ad.networkData && adpTagUnits.push(ad);
		}

		inContentAds.sort(function(next, prev) {
			return parseInt(next.section, 10) > parseInt(prev.section, 10);
		});
		return {
			structuredAds: structuredAds,
			inContentAds: inContentAds,
			genieeIds: genieeIds,
			adpTagUnits: adpTagUnits
		};
	},
	getContainer = function(ad, el) {
		if (!el) {
			el = $(ad.xpath);
		}
		var container = $('<div/>')
			.css(
				$.extend(
					{
						display: ad.network === 'geniee' && !ad.adCode ? 'none' : 'block',
						clear: ad.isIncontent ? null : 'both',
						width: ad.width + 'px',
						height: ad.height + 'px'
					},
					ad.css
				)
			)
			.attr({
				id: ad.network === 'geniee' && !ad.adCode ? '_ap_apexGeniee_ad_' + ad.networkData.zoneId : ad.id,
				'data-section': ad.id,
				class: '_ap_apex_ad',
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
		nodewatcher
			.watch(ad.xpath, xpathWaitTimeout)
			.done(function() {
				var container = getContainer(ad);
				container
					? defer.resolve({ container: container, success: true })
					: defer.reject({ xpathMiss: true, success: false });
			})
			.fail(function() {
				defer.reject({ xpathMiss: true, success: false });
			});
		return defer.promise();
	},
	createAds = function(adp, variation) {
		var config = adp.config,
			tracker = adp.tracker,
			err = adp.err,
			finished = false,
			ads = variation.ads,
			displayCounter = ads.length,
			contentSelector = variation.contentSelector,
			feedbackData = {
				ads: [],
				xpathMiss: [],
				eventType: 1,
				mode: 1,
				referrer: config.referrer,
				tracking: browserConfig.trackerSupported,
				// Replaced '-' with '_' to avoid ElasticSearch split issue
				variationId: variation.id // set the chosenVariation variation in feedback data;
			},
			pushAdToGlobalConfig = function(obj, containerId) {
				var isAdsObject = !!(adp.config && adp.config.ads),
					adObject = $.extend(true, {}, obj);

				adObject.containerId = containerId || '';
				!isAdsObject ? (adp.config.ads = []) : null;
				adp.config.ads.push(adObject);
			},
			placeGenieeHeadCode = function(genieeIds) {
				var genieeHeadCode = adCodeGenerator.generateGenieeHeaderCode(genieeIds);
				genieeHeadCode && $('head').append(genieeHeadCode);
			},
			placeAd = function(container, ad) {
				try {
					$.ajaxSettings.cache = true;
					container.append(adCodeGenerator.generateAdCode(ad));
					$.ajaxSettings.cache = false;
					tracker.add(
						container,
						function(id) {
							utils.sendBeacon(config.feedbackUrl, { eventType: 2, click: true, id: id });
						}.bind(null, ad.id)
					);
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
					} else {
						adObj.xpathMiss = true;
					}
				}
				if (!displayCounter && !finished) {
					finished = true;
					if (variation.customJs && variation.customJs.afterAp) {
						try {
							utils.runScript(utils.base64Decode(variation.customJs.afterAp));
						} catch (e) {
							err.push({ msg: 'Error in afterAp js.', js: variation.customJs.afterAp, error: e });
						}
					}
					utils.sendFeedback(feedbackData);
				}
			},
			handleContentSelectorFailure = function(inContentAds) {
				feedbackData.contentSelectorMissing = true;
				$.each(inContentAds, function(index, ad) {
					feedbackData.xpathMiss.push(ad.id);
					next(ad, { success: false });
				});
			},
			placeStructuralAds = function(structuredAds) {
				// Process strutural sections
				$.each(structuredAds, function(index, ad) {
					getAdContainer(ad, config.xpathWaitTimeout)
						.done(function(data) {
							var isContainerElement = !!(data.container && data.container.length),
								containerId = isContainerElement ? data.container.get(0).id : '';

							// if all well then ad id of ad in feedback to tell system that impression was given
							feedbackData.ads.push(ad.id);
							// Add 'ad' object to global config ads array
							pushAdToGlobalConfig(ad, containerId);
							next(ad, data);
						})
						.fail(function(data) {
							feedbackData.xpathMiss.push(ad.id);
							next(ad, data);
						});
				});
			},
			placeInContentAds = function($incontentElm, inContentAds) {
				incontentAnalyser($incontentElm, inContentAds, function(sectionsWithTargetElm) {
					$(inContentAds).each(function(index, ad) {
						var sectionObj = sectionsWithTargetElm[ad.section],
							$containerElement,
							isContainerElement,
							containerId;

						if (sectionObj && sectionObj.elem) {
							if (!!sectionObj.isSecondaryCss) {
								ad.css = $.extend(true, {}, ad.secondaryCss);
							}

							feedbackData.ads.push(ad.id);

							$containerElement = getContainer(ad, sectionObj.elem);
							isContainerElement = !!($containerElement && $containerElement.length);
							containerId = isContainerElement ? $containerElement.get(0).id : '';

							// Add 'ad' object to global config ads array
							pushAdToGlobalConfig(ad, containerId);
							next(ad, { success: true, container: $containerElement });
						} else {
							feedbackData.xpathMiss.push(ad.id);
							next(ad, { success: false, container: null });
						}
					});
				});
			};

		(function main() {
			if (variation.customJs && variation.customJs.beforeAp) {
				try {
					utils.runScript(utils.base64Decode(variation.customJs.beforeAp));
				} catch (e) {
					err.push({ msg: 'Error in beforeAp js.', js: variation.customJs.beforeAp, error: e });
				}
			}

			ads = segregateAds(ads); // segregate incontent and strutural ads so that they can be placed accordingly.

			if (ads.genieeIds.length) {
				placeGenieeHeadCode(ads.genieeIds);
			}

			if (ads.adpTagUnits.length) {
				adCodeGenerator.executeAdpTagsCode(ads.adpTagUnits);
			}

			// Process and place structural ads
			placeStructuralAds(ads.structuredAds);

			// Process incontent sections
			// If incontent ads thr but no xpath given for content area
			if (ads.inContentAds.length && !contentSelector) {
				handleContentSelectorFailure(ads.inContentAds);
			} else if (ads.inContentAds.length) {
				nodewatcher
					.watch(contentSelector, config.xpathWaitTimeout)
					.done(function($incontentElm) {
						placeInContentAds($incontentElm, ads.inContentAds);
					})
					.fail(function() {
						handleContentSelectorFailure(ads.inContentAds);
					});
			}
		})();
	};

module.exports = createAds;
