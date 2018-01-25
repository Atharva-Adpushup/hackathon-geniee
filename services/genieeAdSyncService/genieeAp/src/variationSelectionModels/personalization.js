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
	getPersonalizedVariations = function(variations) {
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
				if (variationObj && variationObj.personalization && variationObj.personalization.geo) {
					variationsWhereCountryNeeded.push(variationObj);
				} else {
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
						return resolve(variations);
					});
			}
		});
	};

module.exports = getPersonalizedVariations;
