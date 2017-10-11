var utils = require('../libs/utils'),
	$ = require('jquery'),
	bayesianBanditModel = require('./variationSelectionModels/bayesianBandit')(),
	randomSelectionModel = require('./variationSelectionModels/randomSelection')();

module.exports = function(config) {
	var experiment = config.experiment,
		isAutoOptimise = !!config.autoOptimise,
		allVariations,
		chosenVariation,
		forcedVariation,
		forcedVariationId;

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
			config.contentSelector = chosenVariation.contentSelector;
		}

		return chosenVariation && chosenVariation.ads && chosenVariation.ads.length ? chosenVariation : false;
	} else if (forcedVariationId && !allVariations[forcedVariationId]) {
		alert("Variation you are trying to force doesn't exist, system will now choose variation automatically");
	}

	try {
		if (isAutoOptimise) {
			chosenVariation = bayesianBanditModel.chooseVariation(allVariations);
		} else {
			chosenVariation = randomSelectionModel.chooseVariation(allVariations);
		}

		if (chosenVariation) {
			config.contentSelector = chosenVariation.contentSelector;
		}

		return chosenVariation && chosenVariation.ads && chosenVariation.ads.length ? chosenVariation : false;
	} catch (e) {
		return false;
	}
};
