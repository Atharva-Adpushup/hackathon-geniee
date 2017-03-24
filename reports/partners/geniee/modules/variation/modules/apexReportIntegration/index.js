var Promise = require('bluebird'),
	lodash = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	apexReport = require('../../../../../../default/apex/service');

module.exports = {
	getReport: function(config) {
		const defaultDateConfig = {
			startDate: moment().subtract(7, 'days').startOf('day').valueOf(),
			endDate: moment().subtract(1, 'days').endOf('day').valueOf()
		},
		reportConfig = {
			siteId: config.siteId,
			startDate: (config.dateFrom ? moment(config.dateFrom).startOf('day').valueOf() : defaultDateConfig.startDate),
			endDate: (config.dateTo ? moment(config.dateTo).endOf('day').valueOf(): defaultDateConfig.endDate),
			currencyCode: 'JPY'
		};

		return apexReport.getReportData(reportConfig);
	}
};
