(function() {
	var $ = window.adpushup.$,
		selectedElems = [],
		containerWidth,
		floatVar,
		width,
		height,
		distanceAddFactor = 0,
		rootBackgroundColor,
		placements = {},
		started = false;

	if (!window.console || !console.log) {
		window.console = {};
		window.console.log = function() {
			// do nothing;
		};
	}

	function createVisibleDiv(float, counter) {
		return $('<div />')
			.attr({
				class: '__content_' + counter
			})
			.css({
				float: float,
				width: 300,
				height: 250,
				background: 'red'
			});
	}

	var computeBackgroundColor = function(element) {
		var i = 0;

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

	function excludeElems(elementSet) {
		var filteredElems = [];

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
			if (floatVar !== 'none') {
				// Container is the main content area. Substracting the width
				// of Ad box, we get the area that needs to be filled.
				var reqArea = (containerWidth - width) * height * 1.3,
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
					if (cssClear === 'both' || floatVar === cssClear /** In case of clear: left or right */) {
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
					if (rootBackgroundColor !== computeBackgroundColor(nextElem)) {
						console.log(
							'Break Because Different background.',
							rootBackgroundColor,
							computeBackgroundColor(nextElem)
						);
						break;
					}

					// These elements, in most cases, generally can't be floated properly.
					// result = improper floating ad box
					if (floatVar === 'right') {
						/* if ad floats on left then UL and OL won't be an issue */
						if (checkTags(nextElem, ['iframe', 'img', 'table'])) {
							console.log('Break Because IFRAME, IMG, TABLE.');
							break elemLoop;
						}
					} else if (floatVar === 'left') {
						if (checkTags(nextElem, ['ul', 'ol', 'iframe', 'img', 'table'])) {
							console.log('Break because UL, OL, IFRAME.');
							break elemLoop;
						}
					}

					if (!isWrappable($(nextElem).text(), (containerWidth - width) / 10)) {
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
	}

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

		rootBackgroundColor = computeBackgroundColor($rootThis);

		selectedElems = []; // reset selected elem. essentially "selectBetween" is bootstrapping function
		containerWidth = $rootThis.width();

		// if (width > containerWidth) {
		// 	console.error('Ad Size is larger than container.');
		// 	return this;
		// }

		if (floatVar !== 'none' && width > containerWidth / 1.5) {
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
				selectedElems.push(this);
			}
		});

		selectedElems = excludeElems(selectedElems);

		return this;
	};

	/**
	 * Count words and eliminate elements with lesser count
	 */
	$.fn.minWordCount = function(wordCount) {
		var filteredElems = [];

		$(selectedElems).each(function() {
			var elemWordCount = $(this)
				.text()
				.split(/\s+/).length;

			if (elemWordCount > wordCount) {
				filteredElems.push(this);
			}
		});

		selectedElems = filteredElems;

		return this;
	};

	$.fn.createAds = function(_width, _height, _floatVar) {
		width = _width;
		height = _height;
		floatVar = _floatVar || 'none';

		return this;
	};

	$.fn.makeAdAware = function() {
		var adSelectors = [
				'ins.adsbygoogle',
				"[id^='_mN_main_']",
				'.taboola_ads',
				"div[class^='openx']",
				"div[id^='div-gpt-ad-']"
			],
			$content = $(this);

		adSelectors.forEach(function(adSelector) {
			var adElem = $content.find(adSelector);

			if (adElem.length) {
				var adElemOffset = $(adSelector).offset();
				var adElemHeight = $(adSelector).height();

				$(selectedElems).each(function(i, selectedElem) {
					var selectedOffset = $(selectedElem).offset();
					// Distance check between Ad and current element.
					if (Math.abs(adElemOffset.top - selectedOffset.top - adElemHeight) < 400) {
						selectedElems.splice(selectedElems.indexOf(selectedElem), 1);
					}
				});
			}
		});

		return this;
	};

	/*
Don't float beside large elements that are already floating.
 */
	$.fn.makeFloatAware = function() {
		$(this)
			.find('*')
			.each(function() {
				if (
					($(this).css('float') === 'left' || $(this).css('float') === 'right') &&
					(containerWidth - width) * 1.5 >
						$(
							this
						).width() /* Is the floated element larger than what container and ad to be floated would allow */
				) {
					var $floatEl = $(this);
					var currOffset = $floatEl.offset();

					$(selectedElems).each(function(i, selectedElem) {
						var selectedOffset = $(selectedElem).offset();
						// Distance check between Ad and current element.

						if (Math.abs(currOffset.top - selectedOffset.top + $floatEl.height()) < 50) {
							selectedElems.splice(selectedElems.indexOf(selectedElem), 1);
						}
					});
				}
			});

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

			$(selectedElems).each(function(i, selectedElem) {
				var selectedOffset = $(selectedElem).offset(),
					selectedHeight = $(selectedElem).height();

				if ($xpathEl.has(selectedElem).length) {
					selectedElems.splice(selectedElems.indexOf(selectedElem), 1);
				}

				if ($xpathOffset.top > selectedOffset.top) {
					// if xpath element is below selected element
					/* Currently choosing to ignore this because
        in case  of wrapping, mostly the elmenents that matter are the ones above */
					if ($xpathOffset.top - (selectedOffset.top + selectedHeight) <= minGap) {
						selectedElems.splice(selectedElems.indexOf(selectedElem), 1);
					}
				} else if (selectedOffset.top - ($xpathOffset.top + $xpathHeight) <= minGap) {
					selectedElems.splice(selectedElems.indexOf(selectedElem), 1);
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

		if ($.isEmptyObject(placements) && selectedElems.length) {
			placements[section] = {
				elem: selectedElems[0],
				isSecondaryCss: false
			};

			if (adObj.css.float !== 'none') {
				distanceAddFactor = adObj.height;
			} else {
				distanceAddFactor = 0;
			}
		} else {
			var validPlacementsData = getValidPlacementData(placements, section),
				isValidPlacements = !!(
					validPlacementsData &&
					Object.keys(validPlacementsData).length &&
					validPlacementsData.elem
				),
				validPlacements = isValidPlacements ? validPlacementsData.elem : null,
				lastPlacement = placements[section - 1] ? placements[section - 1].elem : validPlacements;

			for (var i = 0; i < selectedElems.length; i++) {
				var currElem = selectedElems[i];

				// If last section didn't have any placement, then there is enough gap for one element
				if (!lastPlacement) {
					placements[section] = {
						elem: currElem,
						isSecondaryCss: false
					};
					break;
				}

				if (
					$(currElem).offset().top - ($(lastPlacement).offset().top + $(lastPlacement).height()) >
					(minDistance || 200) + distanceAddFactor
				) {
					placements[section] = {
						elem: currElem,
						isSecondaryCss: false
					};

					if (adObj.css.float !== 'none') {
						distanceAddFactor = adObj.height;
					} else {
						distanceAddFactor = 0;
					}

					break;
				} else {
					// Assign null for the section if no placement for that section.
					placements[section] = null;
				}
			}
		}
	};

	$.fn.insertAds = function() {
		var args = arguments;

		$(selectedElems).each(function(i, selectedElem) {
			createVisibleDiv(width, height, floatVar, args[i]).insertAfter($(selectedElem));
		});
	};

	function placementStart($selector, placementConfig, doneCallback) {
		var bootstrapPlacements = function() {
				if (started) {
					return false;
				}

				started = true;
				$(placementConfig).each(function(i, adObj) {
					var placeFn = function(adObj) {
						var isNotNear = !!(adObj.notNear && adObj.notNear.length);

						$selector
							.createAds(adObj.width, adObj.height, adObj.css.float)
							.selectBetween((adObj.section - 1) * 500, adObj.section * 600, adObj.selectorsTreeLevel)
							.ignoreXpaths(adObj.ignoreXpaths, 100);

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

					if (!placements[adObj.section]) {
						adObj.css.float = 'none';
						placeFn(adObj);

						if (placements[adObj.section]) {
							placements[adObj.section].isSecondaryCss = true;
						}
					}
				});

				doneCallback(placements);
				/*
			$(placementConfig).each(function(i, adPlacement) {
				createVisibleDiv(adPlacement.float, adPlacement.section).insertAfter(placements[adPlacement.section]);
			});*/
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
	}

	return placementStart;

	// sample input
	/*
	placementStart('.entry-content', [
		{
			'section': 1,
			'width': 300,
			'height': 250,
			'float': 'right',
			'ignoreXpaths': ['blockquote'],
			'minDistanceFromPrevAd': 200
		},
		{
			'section': 2,
			'width': 300,
			'height': 250,
			'float': 'right',
			'ignoreXpaths': ['blockquote'],
			'minDistanceFromPrevAd': 200
		},
		{
			'section': 3,
			'width': 300,
			'height': 250,
			'float': 'right',
			'ignoreXpaths': ['blockquote'],
			'minDistanceFromPrevAd': 200
		}
	], console.log);
	*/
})();
