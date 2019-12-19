var $ = require('../../libs/jquery'),
	utils = require('../../libs/utils'),
	Bandit = require('bayesian-bandit').Bandit,
	preparePayload = function(allVariations) {
		var obj = { withData: [], withoutData: [], withDataVariations: [], withoutDataVariations: [] },
			modelObj = { count: 1, sum: 1 };

		$.each(allVariations, function(variationId, variationObj) {
			modelObj = {
				count: parseInt(variationObj.count, 10),
				sum: parseInt(variationObj.sum, 10)
			};
			//Count is pageviews, so if pageviews are 1 the this means we don't have data from reports
			if (modelObj.count > 1) {
				obj.withData.push(modelObj);
				obj.withDataVariations.push(variationObj);
			} else {
				obj.withoutData.push(modelObj);
				obj.withoutDataVariations.push(variationObj);
			}
		});
		return obj;
	},
	getBanditBasedChoice = function(arms, variations) {
		var bandit = new Bandit({ arms: arms }),
			banditArmIndex = parseInt(bandit.selectArm(), 10);

		if (banditArmIndex > -1) {
			return variations[banditArmIndex];
		}
		return false;
	},
	getRandomBasedChoice = function(arms, variations) {
		var random = utils.getRandomNumberBetween(1, arms.length);
		/**
		 * Random number is inclusive so from 1 - 3, it can give 3
		 * but array starts from 0 so it is 0,1,2
		 * Hence, random - 1
		 */
		return variations[random - 1];
	},
	getChosenVariation = function(allVariations) {
		var payload = preparePayload(allVariations),
			random = utils.getRandomNumberBetween(1, allVariations.length);
		if (payload.withoutData.length && random <= payload.withoutData.length) {
			return getRandomBasedChoice(payload.withoutData, payload.withoutDataVariations);
		} else if (payload.withData.length) {
			return getBanditBasedChoice(payload.withData, payload.withDataVariations);
		}

		return false;
	};

module.exports = {
	chooseVariation: getChosenVariation
};
