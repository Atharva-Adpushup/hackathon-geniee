var utils = require('../../libs/utils'),
	bayesianBanditModel = require('./bayesianBandit'),
	randomSelectionModel = require('./randomSelection')();

module.exports = function(config) {
	var experiment = config.experiment,
		isAutoOptimise = !!config.autoOptimise,
		allVariations,
		chosenVariation,
		forcedVariation,
		forcedVariationId,
		channelContentSelector,
		variationContentSelector,
		isVariationContentSelector,
		contentSelector,
		variationObject;

	allVariations = experiment[config.platform][config.pageGroup].variations;
	forcedVariationName = utils.queryParams[config.forceVariation];
	variationObject = utils.getObjectByName(allVariations, forcedVariationName);
	forcedVariation =
		forcedVariationName &&
		variationObject &&
		variationObject.hasOwnProperty('index') &&
		variationObject.name &&
		forcedVariationName === variationObject.name
			? variationObject.obj
			: false;
	isForcedVariation = !!(forcedVariationName && forcedVariation);

	// if no experimnet setup for given platform and pagegroup
	if (
		!experiment ||
		!experiment[config.platform] ||
		!experiment[config.platform][config.pageGroup] ||
		!experiment[config.platform][config.pageGroup].variations
	) {
		return false;
	}

	allVariations = experiment[config.platform][config.pageGroup].variations;
	forcedVariationId = utils.queryParams[config.forceVariation];
	forcedVariation = forcedVariationId ? utils.getObjectByName(allVariations, forcedVariationId) : false;

	// Force a variation using 'forceVariation' query param implementation
	if (forcedVariationId && forcedVariation) {
		chosenVariation = forcedVariation.obj;

		if (chosenVariation) {
			channelContentSelector = experiment[config.platform][config.pageGroup].contentSelector;
			variationContentSelector = chosenVariation.contentSelector;
			isVariationContentSelector = !!variationContentSelector;
			contentSelector = isVariationContentSelector ? variationContentSelector : channelContentSelector;
			config.contentSelector = contentSelector;
		}

	if (isForcedVariation) {
		chosenVariation = $.extend(true, {}, moduleConfig.chosenVariation);
		return { selectedVariation: chosenVariation, config: $.extend(true, {}, moduleConfig.data) };
	}

	var config = moduleConfig.isValidated && moduleConfig.data,
		experiment = config && config.experiment,
		isAutoOptimise = !!config.autoOptimise,
		allVariations = experiment[config.platform][config.pageGroup].variations,
		channelContentSelector,
		variationContentSelector,
		isVariationContentSelector,
		hasVariationsWithNoData,
		contentSelector;

	return getPersonalizedVariations(allVariations, isAutoOptimise).then(function(filteredVariations) {
		if (isAutoOptimise) {
			hasVariationsWithNoData = experiment[config.platform][config.pageGroup].hasVariationsWithNoData;
			chosenVariation = bayesianBanditModel.chooseVariation(allVariations, hasVariationsWithNoData);
		} else {
			chosenVariation = randomSelectionModel.chooseVariation(allVariations);
		}

		if (chosenVariation) {
			channelContentSelector = experiment[config.platform][config.pageGroup].contentSelector;
			variationContentSelector = chosenVariation.contentSelector;
			isVariationContentSelector = !!variationContentSelector;
			contentSelector = isVariationContentSelector ? variationContentSelector : channelContentSelector;
			config.contentSelector = contentSelector;
		}

		var extendedConfig = $.extend(true, {}, config);
		return chosenVariation && chosenVariation.ads && chosenVariation.ads.length
			? { selectedVariation: chosenVariation, config: extendedConfig }
			: { chooseVariation: null, config: extendedConfig };
	});
}

module.exports = function(config) {
	return setModuleConfig(config)
		.then(validateConfigData)
		.then(checkForcedVariation)
		.then(computeChosenVariation)
		.catch(function(err) {
			console.log('Failed to choose variation. Error: ', err);
			return false;
		});
};
