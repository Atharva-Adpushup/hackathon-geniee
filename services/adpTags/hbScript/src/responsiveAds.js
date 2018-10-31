var config = require('./config'),
	getMatchedAdSize = function(object) {
		var adCollection = config.IAB_SIZES.ALL,
			widthsWithMultipleAdSizes = config.IAB_SIZES.MULTIPLE_AD_SIZES_WIDTHS_MAPPING,
			adsWithBackwardCompatibleSizesMapping = config.IAB_SIZES.BACKWARD_COMPATIBLE_MAPPING,
			differenceObject = {},
			adSizeWidth = object.width,
			difference,
			isValidDifference,
			matchedAdSize,
			computedMatchedSizeArray = [],
			isMatchedWidthInMultipleAdSize,
			multipleAdSizesCollection;

		if (!object) {
			return null;
		}

		adCollection.forEach(function(adSizeArr) {
			difference = adSizeWidth - adSizeArr[0];
			isValidDifference = !!(difference >= 0);

			isValidDifference ? (differenceObject[difference] = adSizeArr.concat([])) : null;
		});

		matchedAdSize = Math.min.apply(null, Object.keys(differenceObject));
		matchedAdSize = differenceObject[matchedAdSize];
		isMatchedWidthInMultipleAdSize = !!widthsWithMultipleAdSizes[matchedAdSize[0]];

		if (isMatchedWidthInMultipleAdSize) {
			multipleAdSizesCollection = widthsWithMultipleAdSizes[matchedAdSize[0]];
			multipleAdSizesCollection.forEach(function(adSizeArr) {
				var stringifiedAdSize = adSizeArr.join(',');
				computedMatchedSizeArray = computedMatchedSizeArray.concat(
					adsWithBackwardCompatibleSizesMapping[stringifiedAdSize]
				);
			});
		} else {
			computedMatchedSizeArray = computedMatchedSizeArray.concat(
				adsWithBackwardCompatibleSizesMapping[matchedAdSize]
			);
		}

		return computedMatchedSizeArray;
	},
	getElementStyles = function(element) {
		var elComputedStyles = window.getComputedStyle(element),
			resultObject = {
				display: elComputedStyles['display'],
				width: parseInt(elComputedStyles['width'], 10),
				height: parseInt(elComputedStyles['height'], 10),
				tagName: element.tagName || element.nodeName,
				className: element.className
			};

		return resultObject;
	},
	getContainerDynamicData = function(selector) {
		var element = document.getElementById(selector).parentNode.parentNode,
			elStyles = getElementStyles(element),
			inlineRegex = /inline/g,
			isInlineLevelEl = !!(inlineRegex.test(elStyles.display) && !elStyles.width && !elStyles.height);

		while (isInlineLevelEl) {
			inlineRegex = /inline/g;
			element = element.parentNode;
			elStyles = getElementStyles(element);
			isInlineLevelEl = !!(inlineRegex.test(elStyles.display) && !elStyles.width && !elStyles.height);
		}

		return elStyles;
	},
	getComputedAdSizes = function(elementSelector) {
		var dynamicData = getContainerDynamicData(elementSelector),
			matchedSize = getMatchedAdSize(dynamicData);

		return matchedSize;
	};

module.exports = {
	getAdSizes: getComputedAdSizes
};
