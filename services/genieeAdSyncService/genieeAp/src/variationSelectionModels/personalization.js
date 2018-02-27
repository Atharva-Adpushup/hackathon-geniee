var utils = require('../../libs/utils'),
	$ = require('jquery'),
	filterVariationsByCountry = function(variations, country) {
		var finalVariations = [],
			country = country.toUpperCase(),
			type,
			values;

		$.each(variations, function(variations, variationObj) {
			type = variationObj.personalization.geo.type;
			values = variationObj.personalization.geo.values;

			if (!Array.isArray(values) || typeof type !== 'string') {
				return true;
			}
			if (type == 'in' && values.indexOf(country) !== -1) {
				finalVariations.push(variationObj);
			} else if (type == 'not' && values.indexOf(country) == -1) {
				finalVariations.push(variationObj);
			}
		});
		return finalVariations;
	},
	getPersonalizedVariations = function(variations, isAutoOptimise) {
		/*personalization: {
        geo: {
            type: "not" //in
            values: ["IN"]
        }
    }*/
		return new Promise(function(resolve, reject) {
			var variationsWhereCountryNeeded = [],
				remainingVariations = [];

			$.each(variations, function(variationId, variationObj) {
				//NOTE: Though this check should have been added in variationSelection module,
				//it is added here to avoid one more variation loop execution time and because
				//all variations will always go through personalisation module before they are chosen
				//using 'randomSelection' or 'autoOptimise' models
				var isValidRandomSelectionVariation = !!(!isAutoOptimise && variationObj.traffic),
					isValidAutoOptimiseVariation = !!(
						isAutoOptimise &&
						variationObj.hasOwnProperty('sum') &&
						variationObj.hasOwnProperty('count')
					),
					isValidVariation = isValidRandomSelectionVariation || isValidAutoOptimiseVariation;

				if (
					variationObj &&
					variationObj.personalization &&
					variationObj.personalization.geo &&
					isValidVariation
				) {
					variationsWhereCountryNeeded.push(variationObj);
				} else if (isValidVariation) {
					remainingVariations.push(variationObj);
				}
			});

			if (!variationsWhereCountryNeeded.length) {
				return resolve(variations);
			} else {
				utils
					.getCountry()
					.then(function(countryCode) {
						var filteredVariations = filterVariationsByCountry(variationsWhereCountryNeeded, countryCode);
						if (filteredVariations.length) {
							return resolve(filteredVariations);
						} else {
							return resolve(remainingVariations);
						}
					})
					.catch(function(err) {
						return resolve(remainingVariations);
					});
			}
		});
	};

module.exports = getPersonalizedVariations;
