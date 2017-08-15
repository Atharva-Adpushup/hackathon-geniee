var lodash = require('lodash'),
	moment = require('moment'),
	Promise = require('bluebird'),
	sqlQueryModule = require('../../../modules/mssql/singleVariationData');
	// reportsModel = require('../../../../../../models/reportsModel');

module.exports = {
	getTotalCount: function(dataConfig) {
		var config = lodash.assign({}, dataConfig);
			// esSpecificVariationKey = dataConfig.variationKey.replace(/-/g, '_');
		// config.queryString = 'mode:1 AND variationId:' + esSpecificVariationKey;
		config.variationId = `${config.variationKey}`;
		delete config.variationKey;
		config.startDate = moment(config.startDate, 'x').format('YYYY-MM-DD');
		config.endDate = moment(config.endDate, 'x').format('YYYY-MM-DD');
		config.mode = 1;

		// return Promise.resolve(reportsModel.apexReport(config))
		return sqlQueryModule.getData(config)
			.then(function(report) {
				var pageViews = Number(report.pageViews);

				return Promise.resolve(pageViews);
			});
	}
};
