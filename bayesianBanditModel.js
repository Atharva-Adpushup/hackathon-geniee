var _ = require('lodash'),
	Bandit = require('bayesian-bandit').Bandit;

module.exports = function() {
	function getChosenVariation(allVariations) {
		var isValidModel = false,
			bandit,
			banditArm,
			chosenVariation,
			armsCollection = [],
			variationsCollection = {},
			variationIdCounter = 0;

		// Set model arms and get selected arm if auto optimise is true
		_.each(allVariations, function(variationId, variationObj) {
			var modelObj = {
				count: parseInt(variationObj.count, 10),
				sum: parseFloat(variationObj.sum)
			};

			armsCollection.push(modelObj);
			variationsCollection[variationIdCounter.toString()] = _.assign({}, variationObj);
			variationIdCounter++;
		});

		bandit = new Bandit({ arms: armsCollection });
		banditArm = parseInt(bandit.selectArm(), 10);
		isValidModel = !!(bandit && banditArm > -1);

		if (isValidModel) {
			chosenVariation = _.assign({}, variationsCollection[banditArm.toString()]);
			return chosenVariation;
		}

		return false;
	}

	return {
		chooseVariation: getChosenVariation
	};
};
