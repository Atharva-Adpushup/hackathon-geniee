(function() {
	function IncontentAnalyzer(config) {
		this.$ = window.adpushup.$;
		this.selectedElems = [];
		this.containerWidth;
		this.floatVar;
		this.width;
		this.height;
		this.distanceAddFactor = 0;
		this.rootBackgroundColor;
		this.placements = {};
		this.started = false;
		this.isEvenSpacingAlgo = config.isEvenSpacingAlgo || true;
		this.defaultSectionBracket = config.sectionBracket || 600;

		if (!window.console || !console.log) {
			window.console = {};
			window.console.log = function() {
				// do nothing;
			};
		}

		this.computeBackgroundColor = function(element) {
			var i = 0,
				$ = this.$;

			while (++i < 100) {
				// Sanity check
				var backgroundColor = $(element).css('background-color');

				if (backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== undefined) {
					return backgroundColor;
				}

				if ($(element).prop('tagName') === 'BODY') {
					return 'rgb(255, 255, 255)';
				}

				element = $(element).parent();

				if (!element.prop('tagName')) {
					break;
				}
			}

			return 'rgb(255, 255, 255)';
		};

		this.excludeElems = function(elementSet) {
			var filteredElems = [],
				ref = this,
				$ = ref.$;

			var checkTags = function(elem, tags) {
				for (var i = 0; i < tags.length; i++) {
					var tag = tags[i];

					if ($(elem).is(tag)) {
						return true;
					}

					if ($(elem).find(tag).length > 0) {
						return true;
					}
				}

				return false;
			};

			/** If word is too long it cannot be wrapped alongside float and results in blank space.
			It's best to ignore such words that cannot be wrapped.
		 */
			var isWrappable = function(text, reqLength) {
				var maxWordLength = Math.max.apply(
					this,
					text.split(/\s+/).map(function(word) {
						return word.length || 0;
					})
				);

				if (maxWordLength > reqLength) {
					return false;
				} else {
					return true;
				}
			};

			// Calculate the area of rectangle between two elements.
			var calcArea = function(currElem, nextElem) {
				var currOffset = $(currElem).offset(),
					currHeight = $(currElem).height(),
					currWidth = $(currElem).width();

				var nextOffset = $(nextElem).offset();

				if (nextOffset && currOffset) {
					return (nextOffset.top + $(nextElem).height() - (currOffset.top + currHeight)) * currWidth;
				} else {
					return 0;
				}
			};

			$(elementSet).each(function(i, element) {
				if (ref.floatVar !== 'none') {
					// Container is the main content area. Substracting the width
					// of Ad box, we get the area that needs to be filled.
					var reqArea = (ref.containerWidth - ref.width) * ref.height * 1.3,
						iter = 0,
						nextElem = $(element).next(),
						coveredArea = 0;

					// Iterate over next siblings.
					// If the total area of them is more than float area
					// then the Ad box can be flaoted properly.
					elemLoop: while (nextElem.prop('tagName')) {
						var cssClear = nextElem.css('clear'),
							cssFloat = nextElem.css('float');

						// Clear results in blank space on the side.
						// result = improper floating ad box
						if (cssClear === 'both' || ref.floatVar === cssClear /** In case of clear: left or right */) {
							console.log('Break because cleared');
							break;
						}

						/* Floating multiple elements is hard espicially when one of them can be
					modestly large. Better to ignore and go ahead. */
						if (cssFloat === 'right' || cssFloat === 'left') {
							break;
						}

						/* In case the the following elment is of different background, floating will
					wrap the text but without background. This results in an obvious overlap.
					which can be prevented by checking the background */
						if (ref.rootBackgroundColor !== ref.computeBackgroundColor(nextElem)) {
							console.log(
								'Break Because Different background.',
								ref.rootBackgroundColor,
								ref.computeBackgroundColor(nextElem)
							);
							break;
						}

						// These elements, in most cases, generally can't be floated properly.
						// result = improper floating ad box
						if (ref.floatVar === 'right') {
							/* if ad floats on left then UL and OL won't be an issue */
							if (checkTags(nextElem, ['iframe', 'img', 'table'])) {
								console.log('Break Because IFRAME, IMG, TABLE.');
								break elemLoop;
							}
						} else if (ref.floatVar === 'left') {
							if (checkTags(nextElem, ['ul', 'ol', 'iframe', 'img', 'table'])) {
								console.log('Break because UL, OL, IFRAME.');
								break elemLoop;
							}
						}

						if (!isWrappable($(nextElem).text(), (ref.containerWidth - ref.width) / 10)) {
							console.log('Break Because not wrappable.');
							break elemLoop;
						}

						if (calcArea(element, nextElem) > reqArea) {
							console.log('Inserted', calcArea(element, nextElem), reqArea);
							filteredElems.push($(element));
						}

						nextElem = $(nextElem).next();

						// Sanity Check
						if (iter++ > 15) {
							break;
						}
					}
				} else {
					filteredElems.push($(element));
				}
			});

			return filteredElems;
		};

		this.getAllSectionsBracketRange = function($selector, placementConfig) {
			var sectionCount, sectionBracket, options, allSectionsBracketRange;
			var defaultSectionBracket = this.defaultSectionBracket;
			var selectorHeight = $selector.height();
			var isValidPlacementConfig = !!(placementConfig && placementConfig.length);
			var evenSpacingAlgoSectionBracket = Math.round(selectorHeight / placementConfig.length);
			var isValidEvenSpacingAlgoSectionBracket = evenSpacingAlgoSectionBracket > defaultSectionBracket;
			var isValidEvenSpacingAlgo = !!(isValidPlacementConfig && isValidEvenSpacingAlgoSectionBracket);

			if (isValidEvenSpacingAlgo) {
				sectionCount = placementConfig.length;
				sectionBracket = evenSpacingAlgoSectionBracket;
			} else {
				sectionCount = Math.round(selectorHeight / defaultSectionBracket);
				sectionBracket = defaultSectionBracket;
				this.isEvenSpacingAlgo = false;
			}

			options = { selectorHeight: isValidEvenSpacingAlgo ? null : selectorHeight };
			allSectionsBracketRange = this.getSectionBracketRange(sectionBracket, sectionCount, options);

			return allSectionsBracketRange;
		};

		this.getSectionBracketRange = function(sectionBracket, count, options) {
			var rangeObject = {};
			var contentSelectorHeight = options.contentSelectorHeight;
			var i, isLastIndex, isValidContentSelectorHeight, sectionlowerRange, sectionUpperRange, sectionRange;

			for (i = 1; i <= count; i++) {
				isLastIndex = i === count;
				isValidContentSelectorHeight = !!(isLastIndex && contentSelectorHeight);
				sectionlowerRange = (i - 1) * sectionBracket;
				sectionUpperRange = isValidContentSelectorHeight ? options.contentSelectorHeight : i * sectionBracket;
				sectionRange = { lower: sectionlowerRange, upper: sectionUpperRange };

				rangeObject[i] = sectionRange;
			}

			return rangeObject;
		};

		this.bindJQueryPluginMethods = function() {
			var ref = this,
				$ = ref.$;

			/**
			 * Iterate over children and select elements within specific position coordinates.
			 */
			$.fn.selectBetween = function(top, bottom, selectorsTreeLevel) {
				var $rootThis = $(this),
					isValidSelectorsTreeLevel = !!(
						selectorsTreeLevel &&
						Number(selectorsTreeLevel) &&
						!isNaN(selectorsTreeLevel)
					);

				if ($rootThis.length > 1) {
					console.error('Ambigious content area selector.');
					return this;
				}

				ref.rootBackgroundColor = ref.computeBackgroundColor($rootThis);

				ref.selectedElems = []; // reset selected elem. essentially "selectBetween" is bootstrapping function
				ref.containerWidth = $rootThis.width();

				if (ref.floatVar !== 'none' && ref.width > ref.containerWidth / 1.5) {
					console.error("Ad Size of this size shouldn't be floated.");
					return this;
				}

				var blockChildren = this.find('*').filter(function() {
					var $this = $(this),
						elParentsCount = $this.parentsUntil($rootThis).length + 1,
						isValidSelectorsTreeLevelFilter = isValidSelectorsTreeLevel
							? selectorsTreeLevel === elParentsCount || selectorsTreeLevel >= elParentsCount
							: true;

					return (
						$this.css('display') == 'block' &&
						$this.height() > 10 &&
						$this.width() > 200 &&
						$this.height() < 1000 &&
						isValidSelectorsTreeLevelFilter
					);
				});

				var rootPos = $rootThis.offset();

				$(blockChildren).each(function() {
					var childPos = $(this).offset();
					var childHeight = $(this).height();

					if (childPos.top - rootPos.top >= top && childPos.top - rootPos.top <= bottom) {
						ref.selectedElems.push(this);
					}
				});

				ref.selectedElems = ref.excludeElems(ref.selectedElems);

				return this;
			};

			$.fn.createAds = function(width, height, floatVar) {
				ref.width = width;
				ref.height = height;
				ref.floatVar = floatVar || 'none';

				return this;
			};

			$.fn.ignoreXpaths = function(xPathArr, minGap) {
				// Convert all xPaths into a singular list of elements
				var resolveXpaths = function(xPathArr) {
					var allElems = [];

					xPathArr.forEach(function(xPath) {
						[].push.apply(allElems, $(xPath).toArray());
					});

					return allElems;
				};

				resolveXpaths(xPathArr).forEach(function(xPath) {
					var $xpathEl = $(xPath),
						$xpathOffset = $xpathEl.offset(),
						$xpathHeight = $xpathEl.height();

					$(ref.selectedElems).each(function(i, selectedElem) {
						var selectedOffset = $(selectedElem).offset(),
							selectedHeight = $(selectedElem).height();

						if ($xpathEl.has(selectedElem).length) {
							ref.selectedElems.splice(ref.selectedElems.indexOf(selectedElem), 1);
						}

						if ($xpathOffset.top > selectedOffset.top) {
							// if xpath element is below selected element
							/* Currently choosing to ignore this because
			in case  of wrapping, mostly the elmenents that matter are the ones above */
							if ($xpathOffset.top - (selectedOffset.top + selectedHeight) <= minGap) {
								ref.selectedElems.splice(ref.selectedElems.indexOf(selectedElem), 1);
							}
						} else if (selectedOffset.top - ($xpathOffset.top + $xpathHeight) <= minGap) {
							ref.selectedElems.splice(ref.selectedElems.indexOf(selectedElem), 1);
						}
					});
				});

				return this;
			};

			$.fn.notNear = function(xPathArr, minGap) {
				this.ignoreXpaths(xPathArr, minGap);
				return this;
			};

			$.fn.setPlacementForSection = function(adObj, minDistance) {
				var getValidPlacementData = function(config, placementNumber) {
						var isValidInputData = !!(placementNumber && config),
							isValidCurrentPlacement = !!(
								isValidInputData &&
								config[placementNumber] &&
								Object.keys(config[placementNumber]).length &&
								config[placementNumber].elem &&
								config[placementNumber].hasOwnProperty('isSecondaryCss')
							),
							resultData = null,
							placementId,
							isValidPlacement;

						if (!isValidInputData) {
							return null;
						}

						if (isValidCurrentPlacement) {
							return config[placementNumber];
						}

						placementId = Number(placementNumber);

						while (placementId >= 1) {
							isValidPlacement = !!(
								placementId &&
								config &&
								config[placementId] &&
								Object.keys(config[placementId]).length &&
								config[placementId].elem &&
								config[placementId].hasOwnProperty('isSecondaryCss')
							);

							if (isValidPlacement) {
								resultData = config[placementId];
								break;
							}

							placementId--;
						}

						return resultData;
					},
					section = adObj.section;

				minDistance = Number(minDistance);

				if ($.isEmptyObject(ref.placements) && ref.selectedElems.length) {
					ref.placements[section] = {
						elem: ref.selectedElems[0],
						isSecondaryCss: false
					};

					if (adObj.css.float && adObj.css.float !== 'none') {
						ref.distanceAddFactor = adObj.height;
					} else {
						ref.distanceAddFactor = 0;
					}
				} else {
					var validPlacementsData = getValidPlacementData(ref.placements, section),
						isValidPlacements = !!(
							validPlacementsData &&
							Object.keys(validPlacementsData).length &&
							validPlacementsData.elem
						),
						validPlacements = isValidPlacements ? validPlacementsData.elem : null,
						lastPlacement = ref.placements[section - 1]
							? ref.placements[section - 1].elem
							: validPlacements;

					for (var i = 0; i < ref.selectedElems.length; i++) {
						var currElem = ref.selectedElems[i];

						// If last section didn't have any placement, then there is enough gap for one element
						if (!lastPlacement) {
							ref.placements[section] = {
								elem: currElem,
								isSecondaryCss: false
							};

							break;
						}

						if (
							$(currElem).offset().top - ($(lastPlacement).offset().top + $(lastPlacement).height()) >
							(minDistance || 200) + ref.distanceAddFactor
						) {
							ref.placements[section] = {
								elem: currElem,
								isSecondaryCss: false
							};

							if (adObj.css.float && adObj.css.float !== 'none') {
								ref.distanceAddFactor = adObj.height;
							} else {
								ref.distanceAddFactor = 0;
							}

							break;
						} else {
							// Assign null for the section if no placement for that section.
							ref.placements[section] = null;
						}
					}
				}
			};
		};

		this.findSelectorPlacements = function($selector, placementConfig, doneCallback) {
			var ref = this;
			var $ = ref.$;

			var bootstrapPlacements = function() {
					if (ref.started) {
						return false;
					}

					var allSectionsBracketRange = ref.getAllSectionsBracketRange($selector, placementConfig);

					ref.started = true;
					$(placementConfig).each(function(i, adObj) {
						var sectionNumber = adObj.section;
						var placeFn = function(adObj) {
							var computedSectionNumber = ref.isEvenSpacingAlgo ? i + 1 : adObj.section;
							var isNotNear = !!(adObj.notNear && adObj.notNear.length);
							var isIgnoreXpaths = !!(adObj.ignoreXpaths && adObj.ignoreXpaths.length);
							var sectionBracketRange = allSectionsBracketRange[computedSectionNumber];
							var isValidSectionBracketRange = !!(
								sectionBracketRange &&
								sectionBracketRange.lower > -1 &&
								sectionBracketRange.upper > -1
							);

							if (!isValidSectionBracketRange) {
								return false;
							}

							$selector
								.createAds(adObj.width, adObj.height, adObj.css.float)
								.selectBetween(
									sectionBracketRange.lower,
									sectionBracketRange.upper,
									adObj.selectorsTreeLevel
								);

							if (isIgnoreXpaths) {
								$selector.ignoreXpaths(adObj.ignoreXpaths, 100);
							}

							/** NotNear incontent ads feature implementation
							 * Example data:
							 * "notNear": [{".p-article_heading > h2:eq(2)": "1200"}]
							 **/
							if (isNotNear) {
								adObj.notNear.forEach(function(collectionItem) {
									var itemKeyArr = Object.keys(collectionItem),
										itemKey = itemKeyArr[0],
										itemValue = Number(collectionItem[itemKey]) || 200;

									$selector.notNear(itemKeyArr, itemValue);
								});
							}

							$selector.setPlacementForSection(adObj, adObj.minDistanceFromPrevAd);
						};
						placeFn(adObj);

						if (!ref.placements[sectionNumber]) {
							adObj.css.float = 'none';
							placeFn(adObj);

							if (ref.placements[sectionNumber]) {
								ref.placements[sectionNumber].isSecondaryCss = true;
							}
						}
					});

					doneCallback(ref.placements);
				},
				imgReadyLoop = function() {
					// Check what image tags haven't been loaded.
					// If there are still that don't have a height
					// don't start making placements.
					if (
						$selector.find('img:visible').filter(function() {
							return $(this).get(0).naturalHeight === 0;
						}).length === 0
					) {
						clearInterval(window.intervalId);
						bootstrapPlacements();
					}
				};

			$(document).ready(function() {
				clearInterval(window.intervalId);
				bootstrapPlacements();
			});

			window.intervalId = setInterval(imgReadyLoop, 100);
		};
	}

	function init($selector, placementConfig, doneCallback) {
		var options = { isEvenSpacingAlgo: true, sectionBracket: 600 };
		var instance = new IncontentAnalyzer(options);

		instance.findSelectorPlacements($selector, placementConfig, doneCallback);
	}

	return init;
})();
