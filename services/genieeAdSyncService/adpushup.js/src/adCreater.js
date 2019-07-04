if (INCONTENT_ACTIVE) {
	var incontentAnalyser = require('../libs/aa');
}
var $ = require('../libs/jquery'),
	nodewatcher = require('../libs/nodeWatcher'),
	utils = require('../libs/utils'),
	isAdContainerInView = require('../libs/lazyload'),
	browserConfig = require('../libs/browserConfig'),
	adCodeGenerator = require('./adCodeGenerator'),
	refreshAdSlot = require('./refreshAdSlot'),
	commonConsts = require('../config/commonConsts'),
	shouldPushToADP = function(ad) {
		return (
			(ad.network === 'adpTags' && ad.networkData) ||
			(ad.network === 'geniee' && ad.networkData && ad.networkData.dynamicAllocation)
		);
	},
	segregateAds = function(ads) {
		var a,
			ad,
			structuredAds = [],
			inContentAds = [],
			adpTagUnits = [],
			externalTriggerAds = [],
			medianetAds = [],
			genieeIds = [];
		for (a = 0; a < ads.length; a++) {
			ad = ads[a];

			if (ad.type === commonConsts.AD_TYPES.EXTERNAL_TRIGGER_AD) {
				externalTriggerAds.push(ad);
				continue;
			}

			ad.services = [commonConsts.SERVICES.LAYOUT]; // Set service id for layout ads
			ad.isIncontent ? inContentAds.push(ad) : null;
			ad.network === 'geniee' &&
				ad.networkData &&
				!ad.networkData.dynamicAllocation &&
				!ad.networkData.adCode &&
				genieeIds.push({
					zoneId: ad.networkData.zoneId,
					zoneContainerId: ad.networkData.zoneContainerId
				});
			// 'isADPTags' will be true if atleast one ADP tag is present
			shouldPushToADP(ad) ? (adpTagUnits.push(ad), (window.adpushup.config.isADPTags = true)) : null;

			// Push ads to structural ad array only if ad is not interactive or not incontent
			if (
				ad.type === commonConsts.AD_TYPES.STRUCTURAL ||
				(!ad.formatData && !ad.isIncontent && ad.type !== commonConsts.AD_TYPES.INTERACTIVE_AD) ||
				ad.type === commonConsts.AD_TYPES.DOCKED_STRUCTURAL
			) {
				structuredAds.push(ad);
			}
			if (ad.network === 'medianet' && ad.networkData.adCode) {
				medianetAds.push(ad);
			}
		}

		inContentAds.sort(function(next, prev) {
			return parseInt(next.section, 10) > parseInt(prev.section, 10);
		});
		return {
			structuredAds: structuredAds,
			inContentAds: inContentAds,
			genieeIds: genieeIds,
			adpTagUnits: adpTagUnits,
			externalTriggerAds: externalTriggerAds,
			medianetAds: medianetAds
		};
	},
	getContainer = function(ad, el) {
		if (!el) {
			el = $(ad.xpath);
		}
		var isGenieePartner = !!(ad.network === 'geniee' && !ad.networkData.adCode),
			isGenieeWithoutDFP = !!(isGenieePartner && !ad.networkData.dynamicAllocation),
			isMultipleAdSizes = !!(ad.multipleAdSizes && ad.multipleAdSizes.length),
			isGenieeNetwork = !!(ad.network === 'geniee' && ad.networkData && ad.networkData.zoneId),
			isZoneContainerId = !!(isGenieeNetwork && ad.networkData.zoneContainerId),
			computedSSPContainerId = isZoneContainerId ? ad.networkData.zoneContainerId : ad.networkData.zoneId,
			defaultAdProperties = {
				display: isGenieeWithoutDFP ? 'none' : 'block',
				clear: ad.isIncontent ? null : 'both'
			},
			container;

		computedSSPContainerId = '_ap_apexGeniee_ad_' + computedSSPContainerId;

		if (!isMultipleAdSizes) {
			defaultAdProperties.width = ad.width + 'px';
			defaultAdProperties.height = ad.height + 'px';
		} else {
			defaultAdProperties['text-align'] = 'center';
		}

		container = $('<div/>')
			.css($.extend(defaultAdProperties, ad.css))
			.attr({
				id: isGenieePartner ? computedSSPContainerId : ad.id,
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
	executeAfterJS = function(variation) {
		try {
			utils.runScript(utils.base64Decode(variation.customJs.afterAp));
		} catch (e) {
			window.adpushup.err.push({
				msg: 'Error in afterAp js.',
				js: variation.customJs.afterAp,
				error: e
			});
		}
		window.adpushup.afterJSExecuted = true;
	},
	placeAd = function(container, ad) {
		var adp = window.adpushup;

		try {
			$.ajaxSettings.cache = true;
			container.append(adCodeGenerator.generateAdCode(ad));
			$.ajaxSettings.cache = false;

			if (ad.type && Number(ad.type) === commonConsts.AD_TYPES.DOCKED_STRUCTURAL) {
				// Type 4 is DOCKED
				utils.dockify.dockifyAd('#' + ad.id, ad.formatData, utils);
			}

			// adp.tracker.add(
			// 	container,
			// 	function(id) {
			// 		utils.sendBeacon(
			// 			adp.config.feedbackUrl,
			// 			{ eventType: 2, click: true, id: id },
			// 			{},
			// 			commonConsts.BEACON_TYPE.AD_FEEDBACK
			// 		);
			// 	}.bind(adp, ad.id)
			// );

			var currentTime = new Date().getTime();
			container.attr('data-render-time', currentTime);
			console.log('rendered slot ', ad.id, ' ', new Date(), ' ', document.hasFocus());

			if (ad.networkData && ad.networkData.refreshSlot) {
				refreshAdSlot.refreshSlot(container, ad);
			}
		} catch (e) {
			adp.err.push({ msg: 'Error in placing ad.', ad: ad, error: e });
		}
		return true;
	},
	filterNonInteractiveAds = function(ads) {
		return ads.filter(function(ad) {
			return !ad.type || (ad.type && ad.type !== commonConsts.AD_TYPES.INTERACTIVE_AD);
		});
	},
	createAds = function(adp, variation) {
		var config = adp.config,
			err = adp.err,
			finished = false,
			ads = filterNonInteractiveAds(variation.ads),
			displayCounter = ads.length,
			contentSelector = variation.contentSelector,
			feedbackData = {
				ads: [],
				xpathMiss: [],
				eventType: commonConsts.ERROR_CODES.NO_ERROR,
				mode: commonConsts.MODE.ADPUSHUP,
				referrer: config.referrer,
				tracking: browserConfig.trackerSupported,
				// Replaced '-' with '_' to avoid ElasticSearch split issue
				variationId: variation.id // set the chosenVariation variation in feedback data;
			},
			placeGenieeHeadCode = function(genieeIdCollection) {
				var genieeHeadCode = adCodeGenerator.generateGenieeHeaderCode(genieeIdCollection);
				genieeHeadCode && $('head').append(genieeHeadCode);
			},
			handleContentSelectorFailure = function(inContentAds) {
				feedbackData.contentSelectorMissing = true;
				$.each(inContentAds, function(index, ad) {
					//feedbackData.xpathMiss.push(ad.id);
					next(ad, { success: false });
				});
			},
			next = function(adObj, data) {
				var newFeedbackAdObj = $.extend({}, adObj),
					isContainerVisible;

				if (displayCounter) {
					displayCounter--;
					if (data.success) {
						// Below 'isContainerVisible' check is added for boundary cases where ad can be successfully placed
						// but its container is hidden from layout (.i.e., display none) and thus ad placement and server feedback
						// functionality should not work
						isContainerVisible = !!(data.container && data.container.is(':visible'));

						if (!isContainerVisible) {
							return false;
						}

						// feedbackData.xpathMiss = [];
						// New feedback
						newFeedbackAdObj.status = commonConsts.AD_STATUS.IMPRESSION;
						newFeedbackAdObj.ads = [newFeedbackAdObj];
						feedbackData.newFeedbackAdObj = newFeedbackAdObj;
						feedbackData.eventType = 1;
						feedbackData.mode = 1;

						feedbackData.xpathMiss = [];
						feedbackData.ads = [adObj.id];
						placeAd(data.container, adObj);
						utils.sendFeedbackOld(feedbackData);

						// Old feedback
						// feedbackData.eventType = 1;
						// feedbackData.mode = 1;
						// feedbackData.ads = [adObj.id];
						// utils.sendFeedbackOld(feedbackData);
					} else {
						// New feedback
						newFeedbackAdObj.xpathMiss = true;
						newFeedbackAdObj.status = commonConsts.AD_STATUS.XPATH_MISS;
						newFeedbackAdObj.ads = [newFeedbackAdObj];
						feedbackData.newFeedbackAdObj = newFeedbackAdObj;

						feedbackData.ads = [];
						feedbackData.eventType = 1;
						feedbackData.mode = 1;
						feedbackData.xpathMiss = [adObj.id];
						utils.sendFeedbackOld(feedbackData);

						// Old feedback
						// var oldFeedbackData = $.extend({}, feedbackData);
						// oldFeedbackData.ads = [];
						// oldFeedbackData.eventType = 1;
						// oldFeedbackData.mode = 1;
						// oldFeedbackData.xpathMiss = [adObj.id];
						// utils.sendFeedbackOld(oldFeedbackData);
					}
				}
				if (!displayCounter && !finished) {
					finished = true;
					if (variation.customJs && variation.customJs.afterAp && !adp.afterJSExecuted) {
						executeAfterJS(variation);
					}
					//utils.sendFeedback(feedbackData);
				}
			},
			placeStructuralAds = function(structuredAds) {
				// Process strutural sections
				//window.adpushup.lazyload.cb = next;
				$.each(structuredAds, function(index, ad) {
					getAdContainer(ad, config.xpathWaitTimeout)
						.done(function(data) {
							if (ad.enableLazyLoading === true) {
								isAdContainerInView(data.container).done(function() {
									next(ad, data);
								});
							} else next(ad, data);
						})
						.fail(function(data) {
							//feedbackData.xpathMiss.push(ad.id);
							next(ad, data);
						});
				});
			},
			placeInContentAds = function($incontentElm, inContentAds, globalConfig) {
				var parameters = {
					$: $,
					$selector: $incontentElm,
					placementConfig: inContentAds,
					sectionBracket: globalConfig.sectionBracket,
					selectorsTreeLevel: globalConfig.selectorsTreeLevel
				};
				var successCallback = function(sectionsWithTargetElm) {
					$(inContentAds).each(function(index, ad) {
						var sectionObj = sectionsWithTargetElm[ad.section],
							isValidPlacement = !!(sectionObj && sectionObj.elem),
							isAdCustomCSS = !!ad.customCSS,
							isLazyLoadingEnabled = !!(ad.enableLazyLoading === true),
							$containerElement,
							placementParams;

						if (isValidPlacement) {
							if (isAdCustomCSS) {
								ad.css = $.extend(true, {}, ad.css, ad.customCSS);
							}

							$containerElement = getContainer(ad, sectionObj.elem);
							placementParams = { success: true, container: $containerElement };

							if (isLazyLoadingEnabled) {
								isAdContainerInView($containerElement).done(function() {
									next(ad, placementParams);
								});
							} else {
								next(ad, placementParams);
							}
						}
					});
				};

				incontentAnalyser(parameters).then(successCallback);
			};

		(function main() {
			if (variation.customJs && variation.customJs.beforeAp) {
				try {
					utils.runScript(utils.base64Decode(variation.customJs.beforeAp));
				} catch (e) {
					err.push({
						msg: 'Error in beforeAp js.',
						js: variation.customJs.beforeAp,
						error: e
					});
				}
			}

			ads = segregateAds(ads); // segregate incontent and strutural ads so that they can be placed accordingly.

			if (ads.genieeIds.length) {
				placeGenieeHeadCode(ads.genieeIds);
			}

			if (ads.adpTagUnits.length) {
				adCodeGenerator.executeAdpTagsHeadCode(ads.adpTagUnits, variation.adpKeyValues);
			}

			if (ads.medianetAds.length) {
				adCodeGenerator.generateMediaNetHeadCode();
			}

			// Process and place structural ads
			placeStructuralAds(ads.structuredAds);

			// Process incontent sections
			// If incontent ads thr but no xpath given for content area
			if (ads.inContentAds.length && !contentSelector) {
				handleContentSelectorFailure(ads.inContentAds);
			} else if (ads.inContentAds.length && variation.incontentSectionConfig) {
				nodewatcher
					.watch(contentSelector, config.xpathWaitTimeout)
					.done(function($incontentElm) {
						placeInContentAds($incontentElm, ads.inContentAds, variation.incontentSectionConfig);
					})
					.fail(function() {
						handleContentSelectorFailure(ads.inContentAds);
					});
			}
		})();
	};

module.exports = {
	createAds: createAds,
	placeAd: placeAd,
	executeAfterJS: executeAfterJS
	// renderAd: next
};
