const moment = require('moment'),
	extend = require('extend'),
	{ getSqlValidParameterDates } = require('../../vendor/mssql/utils/utils');

module.exports = {
	getParameterConfig: reportConfig => {
		const defaultDateConfig = {
				startDate: moment()
					.subtract(7, 'days')
					.startOf('day')
					.valueOf(),
				endDate: moment()
					.subtract(0, 'days')
					.endOf('day')
					.valueOf(),
				sqlValidStartDate: moment()
					.subtract(7, 'days')
					.format('YYYY-MM-DD'),
				sqlValidEndDate: moment()
					.subtract(0, 'days')
					.format('YYYY-MM-DD')
			},
			parameterConfig = {
				siteId: reportConfig.siteId,
				reportType: 'apex',
				step: '1d',
				startDate: reportConfig.startDate ? reportConfig.startDate : defaultDateConfig.startDate,
				endDate: reportConfig.endDate ? reportConfig.endDate : defaultDateConfig.endDate,
				// Sql report compatible format of date params
				sqlValidStartDate: reportConfig.startDate
					? moment(reportConfig.startDate, 'x').format('YYYY-MM-DD')
					: defaultDateConfig.sqlValidStartDate,
				sqlValidEndDate: reportConfig.endDate
					? moment(reportConfig.endDate, 'x').format('YYYY-MM-DD')
					: defaultDateConfig.sqlValidEndDate,
				currencyCode: reportConfig.currencyCode,
				mode: reportConfig.mode ? reportConfig.mode : 1
			},
			sqlValidDateConfig = {
				dateFrom: parameterConfig.sqlValidStartDate,
				dateTo: parameterConfig.sqlValidEndDate
			},
			sqlValidDatesObject = getSqlValidParameterDates(sqlValidDateConfig);

		parameterConfig.sqlValidStartDate = sqlValidDatesObject.dateFrom;
		parameterConfig.sqlValidEndDate = sqlValidDatesObject.dateTo;

		const sqlParameterConfig = {
				mode: parameterConfig.mode,
				startDate: parameterConfig.sqlValidStartDate,
				endDate: parameterConfig.sqlValidEndDate,
				siteId: parameterConfig.siteId
			},
			computedConfig = {
				sql: extend(true, {}, sqlParameterConfig),
				apex: extend(true, {}, parameterConfig)
			};

		return computedConfig;
	}
};
