var Promise = require('bluebird'),
	lodash = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	apexReport = require('../../../../../../default/apex/service');

module.exports = {
	getReport: function(config) {
		var reportConfig = {
			siteId: config.siteId,
			startDate: (config.dateFrom ? moment(config.dateFrom).valueOf() : moment().subtract(7, 'days').valueOf()),
			endDate: (config.dateTo ? moment(config.dateTo).valueOf(): moment().subtract(1, 'days').valueOf()),
			currencyCode: 'JPY'
		};

		return apexReport.getReportData(reportConfig);
	}
};
