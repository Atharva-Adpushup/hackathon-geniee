var utils = require('../libs/utils'),
	$ = require('jquery'),
	Bandit = require('bayesian-bandit').Bandit;

module.exports = function(config) {
	var experiment = config.experiment,
		isAutoOptimise = !!(config.autoOptimise);

	// if no experimnet setup for given platform and pagegroup
	if (!experiment || !experiment[config.platform] || !experiment[config.platform][config.pageGroup] || !experiment[config.platform][config.pageGroup].variations) {
		return false;
	}

	var allVariations = experiment[config.platform][config.pageGroup].variations,
		chosenVariation, isValidModel = false, modelBandit, modelBanditArm, 
		modelChosenVariation, modelCollection = [],
		modelContentSelector,
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

	// Set model arms and get selected arm if auto optimise is true
	if (isAutoOptimise) {
		$.each(allVariations, function(variationId, variationObj) {
			var modelObj = {
				clicks: variationObj.clicks,
				revenue: variationObj.revenue,
				pageViews: variationObj.pageViews,
				pageRPM: variationObj.pageRPM,
				pageCTR: variationObj.pageCTR
			};

			modelCollection.push(modelObj);
		});

		modelBandit = new Bandit({arms: modelCollection});
		modelBanditArm = parseInt(modelBandit.selectArm(), 10);
		isValidModel = !!(isAutoOptimise && modelBandit && (modelBanditArm > -1));
	}

	$.each(allVariations, function(j, variationObj) {
		tempNumber =  parseInt(variationObj.traffic, 10) + tempNumber;

		//Auto optimiser (Bayesian-bandit) model specific check
		if (isValidModel) {
			if (modelBanditArm === parseInt(variationObj.modelId, 10)) {
				modelChosenVariation = $.extend(true, {}, variationObj);
				modelContentSelector = experiment[config.platform][config.pageGroup].contentSelector;
				return false;
			}
		}

		//Manual (random traffic distribution) model specific check
		if (rand <= tempNumber) {
			chosenVariation = variationObj;
			config.contentSelector = experiment[config.platform][config.pageGroup].contentSelector;
			return false;
		}
	});

	//Set auto optimiser model as final value if a valid result exists
	if (isAutoOptimise && isValidModel && modelChosenVariation && modelContentSelector) {
		chosenVariation = modelChosenVariation;
		config.contentSelector = modelContentSelector;
	}

	return chosenVariation && chosenVariation.ads && chosenVariation.ads.length ? chosenVariation : false;
};
