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
		forcedVariationId,
		channelContentSelector,
		variationContentSelector,
		isForcedVariation,
		isForcedVariationId,
		isVariationContentSelector,
		contentSelector;

	allVariations = experiment[config.platform][config.pageGroup].variations;
	forcedVariationId = utils.queryParams[config.forceVariation];
	forcedVariation = forcedVariationId ? utils.getObjectByName(allVariations, forcedVariationId) : false;
	isForcedVariation = !!(forcedVariationId && forcedVariation);
	isForcedVariationId = !!(forcedVariationId && allVariations[forcedVariationId]);

	if (!isForcedVariation) {
		moduleConfig.isForced = false;
		moduleConfig.chosenVariation = null;
		return moduleConfig;
	}

	if (!isForcedVariationId) {
		alert("Variation you are trying to force doesn't exist, system will now choose variation automatically");
		moduleConfig.isForced = true;
		moduleConfig.chosenVariation = null;
		return moduleConfig;
	}

	chosenVariation = forcedVariation.obj;
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
		isForcedVariation = !!(moduleConfig && moduleConfig.data && moduleConfig.data.contentSelector,
		moduleConfig.isValidated && moduleConfig.isForced && moduleConfig.chosenVariation);

	if (isForcedVariation) {
		chosenVariation = $.extend(true, {}, moduleConfig.chosenVariation);
		window.adpushup.config = $.extend(true, {}, moduleConfig.data);
		return chosenVariation;
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

	return getPersonalizedVariations(allVariations).then(function(filteredVariations) {
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

		window.adpushup.config = $.extend(true, {}, config);
		return chosenVariation && chosenVariation.ads && chosenVariation.ads.length ? chosenVariation : false;
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
