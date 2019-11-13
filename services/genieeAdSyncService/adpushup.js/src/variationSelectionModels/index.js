var utils = require('../../libs/utils'),
	$ = require('jquery'),
	getPersonalizedVariations = require('./personalization'),
	bayesianBanditModel = require('./bayesianBandit'),
	randomSelectionModel = require('./randomSelection')();

function setModuleConfig(config) {
	var moduleConfig = {
		isForced: false,
		isValidated: false,
		data: $.extend(true, {}, config),
		chosenVariation: null
	};

	return Promise.resolve(moduleConfig);
}

function validateConfigData(moduleConfig) {
	var isConfig = moduleConfig && moduleConfig.data,
		experiment = isConfig && moduleConfig.data.experiment,
		isNotValid =
			!experiment ||
			!experiment[moduleConfig.data.platform] ||
			!experiment[moduleConfig.data.platform][moduleConfig.data.pageGroup] ||
			!experiment[moduleConfig.data.platform][moduleConfig.data.pageGroup].variations;

	if (isNotValid) {
		throw new Error('ValidateConfigData: Config data is not valid');
	}

	moduleConfig.isValidated = true;
	return moduleConfig;
}

function checkForcedVariation(moduleConfig) {
	var config = moduleConfig.isValidated && moduleConfig.data,
		experiment = config && config.experiment,
		allVariations,
		chosenVariation,
		forcedVariation,
		forcedVariationName,
		channelContentSelector,
		variationContentSelector,
		isForcedVariation,
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

	if (!forcedVariationName) {
		moduleConfig.isForced = false;
		moduleConfig.chosenVariation = null;
		return moduleConfig;
	}

	if (!isForcedVariation) {
		alert("Variation you are trying to force doesn't exist, system will now choose variation automatically");
		moduleConfig.isForced = true;
		moduleConfig.chosenVariation = null;
		return moduleConfig;
	}

	chosenVariation = forcedVariation;
	if (chosenVariation) {
		channelContentSelector = experiment[config.platform][config.pageGroup].contentSelector;
		variationContentSelector = chosenVariation.contentSelector;
		isVariationContentSelector = !!variationContentSelector;
		contentSelector = isVariationContentSelector ? variationContentSelector : channelContentSelector;
		config.contentSelector = contentSelector;
	}

	moduleConfig.isForced = true;
	moduleConfig.chosenVariation =
		chosenVariation && chosenVariation.ads && chosenVariation.ads.length ? chosenVariation : null;
	return moduleConfig;
}

function computeChosenVariation(moduleConfig) {
	var chosenVariation = null,
		isForcedVariation = !!(
			moduleConfig &&
			moduleConfig.data &&
			moduleConfig.isValidated &&
			moduleConfig.isForced &&
			moduleConfig.chosenVariation
		);

	if (isForcedVariation) {
		chosenVariation = $.extend(true, {}, moduleConfig.chosenVariation);
		return { selectedVariation: chosenVariation, config: $.extend(true, {}, moduleConfig.data) };
	}

	var config = moduleConfig.isValidated && moduleConfig.data,
		experiment = config && config.experiment,
		isAutoOptimise = !!(experiment[config.platform][config.pageGroup].hasOwnProperty('autoOptimise')
			? experiment[config.platform][config.pageGroup].autoOptimise
			: config.autoOptimise),
		// isAutoOptimise = !!config.autoOptimise,
		allVariations = experiment[config.platform][config.pageGroup].variations,
		channelContentSelector,
		variationContentSelector,
		isVariationContentSelector,
		hasVariationsWithNoData,
		contentSelector;

	return getPersonalizedVariations(allVariations, isAutoOptimise).then(function(filteredVariations) {
		if (isAutoOptimise) {
			hasVariationsWithNoData = experiment[config.platform][config.pageGroup].hasVariationsWithNoData;
			chosenVariation = bayesianBanditModel.chooseVariation(filteredVariations, hasVariationsWithNoData);
		} else {
			chosenVariation = randomSelectionModel.chooseVariation(filteredVariations);
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
			utils.log('Failed to choose variation. Error: ', err);
			return false;
		});
};
