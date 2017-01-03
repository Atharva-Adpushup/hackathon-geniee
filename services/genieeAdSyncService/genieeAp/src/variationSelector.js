var utils = require('../libs/utils'),
	$ = require('jquery'),
	bayesianBanditModel = require('./variationSelectionModels/bayesianBandit')(),
	randomSelectionModel = require('./variationSelectionModels/randomSelection')();

module.exports = function(config) {
	var experiment = config.experiment,
		isAutoOptimise = !!(config.autoOptimise),
		allVariations, chosenVariation, forcedvariation;

	// if no experimnet setup for given platform and pagegroup
	if (!experiment || !experiment[config.platform] || !experiment[config.platform][config.pageGroup] || !experiment[config.platform][config.pageGroup].variations) {
		return false;
	}

	allVariations = experiment[config.platform][config.pageGroup].variations;
	forcedvariation = utils.queryParams[config.forceVariation];

	//@ TODO Handle when a variation is forced
	if (forcedvariation && allVariations[forcedvariation]) {
	} else if (forcedvariation && !allVariations[forcedvariation]) {
		alert('Variation you are trying to force doesn\'t exist, system will now choose variation automatically');
	}

	try {
		if (isAutoOptimise) {
			chosenVariation = bayesianBanditModel.chooseVariation(allVariations);
		} else {
			chosenVariation = randomSelectionModel.chooseVariation(allVariations);
		}

		if (chosenVariation) {
			config.contentSelector = experiment[config.platform][config.pageGroup].contentSelector;
		}

		return chosenVariation && chosenVariation.ads && chosenVariation.ads.length ? chosenVariation : false;
	} catch (e) {
		return false;
	}
};
