var lodash = require('lodash'),
	Promise = require('bluebird'),
	apexSingleVariationModule = require('../../../modules/mssql/singleVariationData');

module.exports = {
	getTotalCount: function(variationId, tableFormatReportData) {
		return apexSingleVariationModule.validateReportData(tableFormatReportData)
			.then(apexSingleVariationModule.getMetrics.bind(null, variationId))
			.then(function(report) {
				var pageViews = Number(report.pageViews);

				return Promise.resolve(pageViews);
			});
	}
};
