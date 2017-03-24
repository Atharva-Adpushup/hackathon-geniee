var Promise = require('bluebird'),
	lodash = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	utils = require('../../../utils/index'),
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
		},
		timeStampCollection = utils.getDayWiseTimestamps(config.dateFrom, config.dateTo).collection,
		getDayWiseReport = Promise.all(lodash.map(timeStampCollection, (timeStampObject) => {
			const config = {
				siteId: reportConfig.siteId,
				startDate: timeStampObject.dateFrom,
				endDate: timeStampObject.dateTo,
				currencyCode: reportConfig.currencyCode
			};

			return apexReport.getReportData(config);
		})).then((dayWiseReport) => lodash.compact(dayWiseReport)),
		getFullReport = apexReport.getReportData(reportConfig);

		return Promise.join(getDayWiseReport, getFullReport, (dayWiseReport, fullReport) => {
			return { dayWise: dayWiseReport, full: fullReport };
		});
	}
};
