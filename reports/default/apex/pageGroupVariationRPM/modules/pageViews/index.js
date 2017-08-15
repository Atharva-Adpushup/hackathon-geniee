var lodash = require('lodash'),
	moment = require('moment'),
	Promise = require('bluebird'),
	sqlQueryModule = require('../../../modules/mssql/singleVariationData');
const { getSqlValidParameterDates } = require('../../../vendor/mssql/utils/utils');

module.exports = {
	getTotalCount: function(dataConfig) {
		var config = lodash.assign({}, dataConfig);

		config.variationId = `${config.variationKey}`;
		delete config.variationKey;

		config.startDate = moment(config.startDate, 'x').format('YYYY-MM-DD');
		config.endDate = moment(config.endDate, 'x').format('YYYY-MM-DD');
		const dateParams = { dateFrom: config.startDate, dateTo: config.endDate };
		config.startDate = getSqlValidParameterDates(dateParams).dateFrom;
		config.endDate = getSqlValidParameterDates(dateParams).dateTo;
		
		config.mode = 1;
		return sqlQueryModule.getData(config)
			.then(function(report) {
				var pageViews = Number(report.pageViews);

				return Promise.resolve(pageViews);
			});
	}
};
