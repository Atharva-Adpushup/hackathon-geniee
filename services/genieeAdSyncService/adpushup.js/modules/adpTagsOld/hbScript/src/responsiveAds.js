var adSizeConsts = require('../../../../../../../helpers/adSizeMappingConsts'),
	utils = require('../helpers/utils'),
	AdpError = require('../helpers/error'),
	$ = require('./adp').$,
	getMatchedAdSize = function(inputObject) {
		var adCollection = adSizeConsts.IAB_SIZES.ALL,
			widthsWithMultipleAdSizes = adSizeConsts.IAB_SIZES.MULTIPLE_AD_SIZES_WIDTHS_MAPPING,
			adsWithBackwardCompatibleSizesMapping = adSizeConsts.IAB_SIZES.BACKWARD_COMPATIBLE_MAPPING,
			differenceObject = {},
			isValidInput = !!inputObject,
			areValidInputDimensions = !!(
				isValidInput &&
				inputObject.width &&
				inputObject.height &&
				// Below '50' height value is minimum height to consider
				inputObject.height >= 50
			),
			isValidInputWidth = !!(
				isValidInput &&
				inputObject.width &&
				(!inputObject.height || inputObject.height < 50)
			),
			inputSizeWidth,
			inputSizeHeight,
			matchedAdSize,
			computedMatchedSizeArray = [],
			isMatchedWidthInMultipleAdSize,
			multipleAdSizesCollection,
			finalComputedData = {};

		if (!isValidInput) {
			return null;
		}

		if (areValidInputDimensions) {
			inputSizeWidth = inputObject.width;
			inputSizeHeight = inputObject.height;
		} else if (isValidInputWidth) {
			inputSizeWidth = inputObject.width;
		}

		adCollection.forEach(function(adSizeArr) {
			var widthDifference,
				heightDifference,
				overallDifference,
				isValidDifference,
				adSizeWidth = adSizeArr[0],
				adSizeHeight = adSizeArr[1];

			if (areValidInputDimensions) {
				widthDifference = inputSizeWidth - adSizeWidth;
				heightDifference = inputSizeHeight - adSizeHeight;
				isValidDifference = !!(widthDifference >= 0 && heightDifference >= 0);
				isValidDifference ? (overallDifference = widthDifference + heightDifference) : null;
			} else if (isValidInputWidth) {
				widthDifference = inputSizeWidth - adSizeWidth;
				isValidDifference = !!(widthDifference >= 0);
				isValidDifference ? (overallDifference = widthDifference) : null;
			}

			overallDifference ? (differenceObject[overallDifference] = adSizeArr.concat([])) : null;
		});

		matchedAdSize = Math.min.apply(null, Object.keys(differenceObject));
		matchedAdSize = differenceObject[matchedAdSize];

		if (!matchedAdSize) {
			var errorMessage = 'No matched ad for width : ' + inputSizeWidth + 'px';

			utils.log(errorMessage);
			matchedAdSize = [];
		}
		isMatchedWidthInMultipleAdSize = !!widthsWithMultipleAdSizes[matchedAdSize[0]];

		// 'isMatchedWidthInMultipleAdSize' check is added to incorporate backward compatible sizes of all
		// ad sizes that belong to a common width dimension (like 300, 320, 728, 970)
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

		finalComputedData.size = matchedAdSize;
		finalComputedData.collection = computedMatchedSizeArray.concat([]);
		finalComputedData.elementWidth = inputSizeWidth;
		finalComputedData.elementHeight = inputSizeHeight;
		return finalComputedData;
	},
	getElComputedStyles = function(element) {
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
	getRecursiveParentData = function(element) {
		var elStyles = getElComputedStyles(element),
			inlineRegex = /inline/g,
			isInlineLevelEl = !!(inlineRegex.test(elStyles.display) && (!elStyles.width || !elStyles.height));

		while (isInlineLevelEl) {
			inlineRegex = /inline/g;
			element = element.parentNode;
			elStyles = getElComputedStyles(element);
			isInlineLevelEl = !!(inlineRegex.test(elStyles.display) && (!elStyles.width || !elStyles.height));
		}

		return elStyles;
	},
	getImmediateParentData = function(element) {
		var inlineRegex = /inline$/g,
			inlineStylesObject = element.style,
			computedStylesObject = getElComputedStyles(element),
			isValidInlineStyles = !!(
				(inlineStylesObject.width || inlineStylesObject.height) &&
				(parseInt(inlineStylesObject.width, 10) || parseInt(inlineStylesObject.height, 10))
			),
			isValidComputedStyles = !!(
				!inlineRegex.test(computedStylesObject.display) &&
				(computedStylesObject.width || computedStylesObject.height)
			),
			finalComputedStyles = {};

		if (isValidInlineStyles) {
			finalComputedStyles.width = parseInt(inlineStylesObject.width, 10);
			finalComputedStyles.height = parseInt(inlineStylesObject.height, 10);
		} else if (isValidComputedStyles) {
			finalComputedStyles = $.extend({}, computedStylesObject);
		}

		return finalComputedStyles;
	},
	removeBlackListedSizes = function(inputCollection) {
		var blackListedCollection = adSizeConsts.IAB_SIZES.BLACK_LIST,
			filteredCollection = [];

		blackListedCollection.forEach(function(item) {
			filteredCollection = utils.removeElementArrayFromCollection(inputCollection, item);
		});

		return filteredCollection;
	},
	getFilteredData = function(inputData) {
		var windowWidth = $(window).width(),
			thirtyPercentOfWindowWidth = Math.round((30 / 100) * windowWidth),
			primarySizeWidth = inputData.elementWidth,
			isWidthSimulateContentAreaWidth = !!(primarySizeWidth && primarySizeWidth > thirtyPercentOfWindowWidth);

		if (isWidthSimulateContentAreaWidth) {
			inputData.collection = removeBlackListedSizes(inputData.collection);
		}

		return inputData;
	},
	getComputedAdSizes = function(elementSelector) {
		var computedElement = document.getElementById(elementSelector).parentNode,
			immediateParentData = getImmediateParentData(computedElement),
			recursiveParentData = getRecursiveParentData(computedElement),
			isValidImmediateParentData = !!(
				immediateParentData &&
				Object.keys(immediateParentData).length &&
				((immediateParentData.width && immediateParentData.height) || immediateParentData.width)
			),
			isValidRecursiveParentData = !!(
				recursiveParentData &&
				Object.keys(recursiveParentData).length &&
				recursiveParentData.height &&
				recursiveParentData.width
			),
			isValidImmediateParentHeight = !!(
				immediateParentData &&
				immediateParentData.height &&
				!immediateParentData.width &&
				isValidRecursiveParentData
			),
			computedParentData = {},
			matchedSizeData,
			finalComputedData;

		if (isValidImmediateParentData) {
			computedParentData = $.extend({}, immediateParentData);
		} else if (isValidImmediateParentHeight) {
			computedParentData = $.extend({}, recursiveParentData);
			computedParentData.height = immediateParentData.height;
		} else {
			computedParentData = $.extend({}, recursiveParentData);
		}

		matchedSizeData = getMatchedAdSize(computedParentData);
		finalComputedData = getFilteredData(matchedSizeData);
		return finalComputedData;
	};

module.exports = {
	getAdSizes: getComputedAdSizes
};
