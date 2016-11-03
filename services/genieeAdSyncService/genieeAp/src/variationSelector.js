var utils = require('../libs/utils'),
	$ = require('jquery');

module.exports = function(config) {
	var experiment = config.experiment;
	// if no experimnet setup for given platform and pagegroup
	if (!experiment || !experiment[config.platform] || !experiment[config.platform][config.pageGroup] || !experiment[config.platform][config.pageGroup].variations) {
		return false;
	}

	var allVariations = experiment[config.platform][config.pageGroup].variations,
		chosenVariation,
		rand = Math.floor(Math.random() * (100)) + 1,
		tempNumber = 0,
		forcedvariation = utils.queryParams[config.forceVariation];

		//@ TODO
		// if variation is forced
	if (forcedvariation && allVariations[forcedvariation]) {
		//
	} else if (forcedvariation && !allVariations[forcedvariation]) {
		alert('Varition you are trying to force doesn\'t exist, system will now choose variation automatically');
	}

	$.each(allVariations, function(j, variationObj) {
		tempNumber =  parseInt(variationObj.traffic, 10) + tempNumber;
		if (rand <= tempNumber) {
			chosenVariation = variationObj;
			config.contentSelector = experiment[config.platform][config.pageGroup].contentSelector;
			return false;
		}
	});

	return chosenVariation && chosenVariation.ads && chosenVariation.ads.length ? chosenVariation : false;
};
