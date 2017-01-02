var $ = require('jquery'),
	Bandit = require('bayesian-bandit').Bandit;

module.exports = function() {
	function getChosenVariation(allVariations) {
		var isValidModel = false, bandit, banditArm,
			chosenVariation, armsCollection = [],
			variationsCollection = {}, variationIdCounter = 0;

		// Set model arms and get selected arm if auto optimise is true
		$.each(allVariations, function(variationId, variationObj) {
			var modelObj = {
				count: parseInt(variationObj.count, 10),
				sum: parseInt(variationObj.sum, 10)
			};

			armsCollection.push(modelObj);
			variationsCollection[variationIdCounter.toString()] = $.extend(true, {}, variationObj);
			variationIdCounter++;
		});

		bandit = new Bandit({arms: armsCollection});
		banditArm = parseInt(bandit.selectArm(), 10);
		isValidModel = !!(bandit && (banditArm > -1));

		if (isValidModel) {
			chosenVariation = $.extend(true, {}, variationsCollection[banditArm.toString()]);
			return chosenVariation;
		}

		return false;
	}

	return {
		chooseVariation: getChosenVariation
	};
};
