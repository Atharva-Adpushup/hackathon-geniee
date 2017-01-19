var	siteModel = require('../../../../../models/siteModel');

module.exports = {
	getTrafficDistribution: function(config) {
		return siteModel.getSiteById(config.siteId).then(function(site) {
			return site.getVariationConfig().then(function(variationConfig) {
				var computedObj = {};

				if (!!variationConfig) {
					config.variations.forEach(function(variationKey) {
						var variationObj = variationConfig[variationKey];

						if (variationConfig.hasOwnProperty(variationKey) && variationObj && (Number(variationObj.trafficDistribution) > -1)) {
							computedObj[variationKey] = {
								'name': variationObj.name,
								'id': variationObj.id,
								'value': variationObj.trafficDistribution
							};
						}
					});

					return computedObj;
				}

				return computedObj;
			});
		});
	}
};
