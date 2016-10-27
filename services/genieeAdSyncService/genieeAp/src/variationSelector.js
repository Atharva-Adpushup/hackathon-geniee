var utils = require('../libs/utils'),
	$ = require('jquery');

module.exports = function(config) {
	// if no experimnet setup for given platform and pagegroup
	if (!config.variations[config.platform] || !config.variations[config.platform][config.pageGroup]) {
		return false;
	}

	var allVariations = config.variations[config.platform][config.pageGroup],
		variationsArray = [],
		variation,
		chosenVariation,
		rand = Math.floor(Math.random() * (100)) + 1,
		tempNumber = 0,
		forcedvariation = utils.queryParams[config.forceVariation];

		// if variation is forced
	if (forcedvariation && allVariations[forcedvariation]) {
		config.chosenVariation = forcedvariation;
		config.contentSelector = allVariations[forcedvariation].contentSelector;
		config.customJs = allVariations[forcedvariation].customJs;
		return allVariations[config.chosenVariation].ads && allVariations[config.chosenVariation].ads.length ? allVariations[config.chosenVariation].ads : false;
	} else if (forcedvariation && !allVariations[forcedvariation]) {
		alert('Varition you are trying to force doesn\'t exist, system will now choose variation automatically');
	}

		// convert object to Array
	for (variation in allVariations) {
		if (allVariations.hasOwnProperty(variation)) {
			allVariations[variation].name = variation;
			variationsArray.push(allVariations[variation]);
		}
	}

	variationsArray.sort(function(a, b) {
		return a.traffic - b.traffic;
	});

	$.each(variationsArray, function(j, variationObj) {
		tempNumber =  variationObj.traffic + tempNumber;
		if (rand <= tempNumber) {
			chosenVariation = variationObj;
			return false;
		}
	});

	return chosenVariation && chosenVariation.ads && chosenVariation.ads.length ? chosenVariation : false;
};
