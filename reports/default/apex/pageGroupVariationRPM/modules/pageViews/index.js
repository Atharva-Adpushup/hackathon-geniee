var lodash = require('lodash'),
	Promise = require('bluebird'),
	reportsModel = require('../../../../../../models/reportsModel');

module.exports = {
	getTotalCount: function(dataConfig) {
		var config = lodash.assign({}, dataConfig),
			esSpecificVariationKey = dataConfig.variationKey.replace(/-/g, '_');

		config.queryString = 'mode:1 AND variationId:' + esSpecificVariationKey;

		return Promise.resolve(reportsModel.apexReport(config))
			.then(function(report) {
				var pageViews = Number(report.data.tracked.totalPageViews);

				return Promise.resolve(pageViews);
			});
	}
};
