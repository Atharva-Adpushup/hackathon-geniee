// Responsive ads module

var AD_SIZE_MAPPING = require('./constants').AD_SIZE_MAPPING;
var utils = require('./utils');
var $ = require('./adp').$;

var getMatchedAdSize = function(inputObject, adpSlot) {
	var computedMatchedSizeArray = [],
		finalComputedData = {};

	/**
	 * If we don't get inputSizeHeight, use Infinity as maxHeight since we want to allow all the downward compatible heights
	 */
	let maxWidth = inputObject.width;
	let maxHeight = inputObject.height || Infinity;

	let [sizeMappingWidth, sizeMappingHeight] = utils.getDimensionsFromSizeMapping(adpSlot);

	if (sizeMappingWidth && sizeMappingHeight) {
		maxWidth = Math.min(sizeMappingWidth, maxWidth);
		maxHeight = Math.min(sizeMappingHeight, maxHeight);
	}

	computedMatchedSizeArray = utils.getDownwardCompatibleSizes(maxWidth, maxHeight);

	finalComputedData.collection = computedMatchedSizeArray.concat([]);
	finalComputedData.elementWidth = inputObject.width;
	finalComputedData.elementHeight = inputObject.height;
	return finalComputedData;
};
var getElComputedStyles = function(element) {
	var elComputedStyles = window.getComputedStyle(element),
		resultObject = {
			display: elComputedStyles['display'],
			width: parseInt(elComputedStyles['width'], 10),
			height: parseInt(elComputedStyles['height'], 10),
			tagName: element.tagName || element.nodeName,
			className: element.className
		};

	return resultObject;
};
var getRecursiveParentData = function(element) {
	var elStyles = getElComputedStyles(element),
		inlineRegex = /inline/g,
		isInlineLevelEl = !!(
			inlineRegex.test(elStyles.display) &&
			(!elStyles.width || !elStyles.height)
		);

	while (isInlineLevelEl) {
		inlineRegex = /inline/g;
		element = element.parentNode;
		elStyles = getElComputedStyles(element);
		isInlineLevelEl = !!(
			inlineRegex.test(elStyles.display) &&
			(!elStyles.width || !elStyles.height)
		);
	}

	return elStyles;
};
var getImmediateParentData = function(element) {
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
};
var removeBlackListedSizes = function(inputCollection) {
	var blackListedCollection = AD_SIZE_MAPPING.IAB_SIZES.BLACK_LIST,
		filteredCollection = [];

	var blackListedCollectionStringified = [];
	blackListedCollection.forEach(function(item) {
		blackListedCollectionStringified.push(item.join('x'));
	});
	inputCollection.forEach(function(item) {
		if (blackListedCollectionStringified.indexOf(item.join('x'))) {
			filteredCollection.push(item);
		}
	});

	return filteredCollection;
};
var getFilteredData = function(inputData) {
	var windowWidth = $(window).width(),
		thirtyPercentOfWindowWidth = Math.round((30 / 100) * windowWidth),
		primarySizeWidth = inputData.elementWidth,
		isWidthSimulateContentAreaWidth = !!(
			primarySizeWidth && primarySizeWidth > thirtyPercentOfWindowWidth
		);

	if (isWidthSimulateContentAreaWidth) {
		inputData.collection = removeBlackListedSizes(inputData.collection);
	}

	return inputData;
};
var getComputedAdSizes = function(adpSlot) {
	var elementSelector = adpSlot.optionalParam.adId;
	if (!elementSelector || !document.getElementById(elementSelector)) return { collection: [] };

	var currentEle = document.getElementById(elementSelector),
		computedElement = currentEle.parentNode,
		immediateParentData = getImmediateParentData(computedElement),
		recursiveParentData = getRecursiveParentData(computedElement),
		isValidImmediateParentData = !!(
			immediateParentData &&
			Object.keys(immediateParentData).length &&
			immediateParentData.width
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
	} else {
		computedParentData = $.extend({}, recursiveParentData);
		computedParentData.height = isValidImmediateParentHeight
			? immediateParentData.height
			: computedParentData.height;
	}

	if (
		!computedParentData ||
		!computedParentData.width ||
		(computedParentData.height && computedParentData.height < 50)
	) {
		utils.log('No matched ad for width : ' + computedParentData.width + 'px');
		return {
			collection: [],
			elementWidth: null,
			elementHeight: null
		};
	}
	if (currentEle.hasAttribute('max-height')) {
		let maxHeight = parseInt(currentEle.getAttribute('max-height'), 10);

		if (maxHeight) {
			computedParentData.height = Math.min(computedParentData.height || Infinity, maxHeight);
			//computedParentData.maxHeight = maxHeight;
		}
	}

	matchedSizeData = getMatchedAdSize(computedParentData, adpSlot);
	finalComputedData = getFilteredData(matchedSizeData);
	return finalComputedData;
};

module.exports = {
	getAdSizes: getComputedAdSizes
};
