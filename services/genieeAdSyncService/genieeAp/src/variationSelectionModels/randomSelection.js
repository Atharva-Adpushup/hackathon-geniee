var $ = require('jquery');

module.exports = function() {
	function getChosenVariation(allVariations) {
		var randomNumber = Math.floor(Math.random() * (100)) + 1,
			chosenVariation, tempNumber = 0;

		$.each(allVariations, function(variationId, variationObj) {
			tempNumber =  (parseInt(variationObj.traffic, 10) + tempNumber);

			if (randomNumber <= tempNumber) {
				chosenVariation = $.extend(true, {}, variationObj);
				return false;
			}
		});

		return (chosenVariation ? chosenVariation : false);
	}

	return {
		chooseVariation: getChosenVariation
	};
};
