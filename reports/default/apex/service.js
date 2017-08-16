var _ = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	siteModel = require('../../../models/siteModel'),
	ctrPerformanceService = require('./ctrPerformanceInTabularData/service'),
	pageGroupVariationRPMService = require('./pageGroupVariationRPM/service'),
	variationModule = require('./modules/variation/index'),
	sqlQueryModule = require('../../default/apex/vendor/mssql/queryHelpers/fullSiteData'),
	{ getSqlValidParameterDates } = require('../../default/apex/vendor/mssql/utils/utils');

module.exports = {
	getReportData: function(reportConfig) {
		const defaultDateConfig = {
			startDate: moment().subtract(7, 'days').startOf('day').valueOf(),
			endDate: moment().subtract(0, 'days').endOf('day').valueOf()
		},
		defaultSqlReportConfig = {
			startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
			endDate: moment().subtract(0, 'days').format('YYYY-MM-DD')
		},
		config = {
			siteId: reportConfig.siteId,
			reportType: 'apex',
			step: '1d',
			startDate: (reportConfig.startDate ? reportConfig.startDate : defaultDateConfig.startDate),
			endDate: (reportConfig.endDate ? reportConfig.endDate : defaultDateConfig.endDate),
			currencyCode: reportConfig.currencyCode
		},
		sqlReportConfig = {
			siteId: reportConfig.siteId,
			startDate: (reportConfig.startDate) ? moment(reportConfig.startDate, 'x').format('YYYY-MM-DD') : defaultSqlReportConfig.startDate,
			endDate: (reportConfig.endDate) ? moment(reportConfig.endDate, 'x').format('YYYY-MM-DD') : defaultSqlReportConfig.endDate,
			mode: (reportConfig.mode) ? reportConfig.mode : 1
		},
		sqlValidDateConfig = { dateFrom: sqlReportConfig.startDate, dateTo: sqlReportConfig.endDate },
		sqlValidDatesObject = getSqlValidParameterDates(sqlValidDateConfig);

		sqlReportConfig.startDate = sqlValidDatesObject.dateFrom;
		sqlReportConfig.endDate = sqlValidDatesObject.dateTo;

		if (reportConfig.queryString) {
			config.queryString = reportConfig.queryString;
		}

		function generateRPMReport(ctrPerformanceConfig, channel, email, variationData) {
			return Promise.all(_.map(variationData, (variationObj, variationKey) => {
				const variationRPMConfig = extend(true, {}, ctrPerformanceConfig, {
					variationKey: variationKey
				}),
				finalVariationObj = {};

				finalVariationObj[variationKey] = extend(true, {}, variationObj);

				return pageGroupVariationRPMService.getReportData(variationRPMConfig, email)
					.then((variationRPMReportData) => {
						const clicks = finalVariationObj[variationKey].click;
						let pageViews;

						finalVariationObj[variationKey].revenue = variationRPMReportData.earnings;
						finalVariationObj[variationKey].pageViews = variationRPMReportData.pageViews;
						pageViews = variationRPMReportData.pageViews;
						
						finalVariationObj[variationKey].pageRPM = variationRPMReportData.rpm;
						finalVariationObj[variationKey].pageCTR = Number((clicks / pageViews * 100).toFixed(2));
						finalVariationObj[variationKey].impression = variationRPMReportData.impressions;

						return finalVariationObj;
					});
			})).then(variationModule.computeReportData.bind(null, channel));
		}

		function generateFullReport(config, email, allChannels) {
			return Promise.all(_.map(allChannels, (channel) => {
				const ctrPerformanceConfig = extend(true, {}, config, {
					platform: channel.platform,
					pageGroup: channel.pageGroup
				});

				return ctrPerformanceService.getReportData(ctrPerformanceConfig)
					.then(variationModule.getMetrics)
					.then(generateRPMReport.bind(null, ctrPerformanceConfig, channel, email));
			})).then(variationModule.getFinalData);
		}

		const siteReportData = sqlQueryModule.getMetricsData(sqlReportConfig),
			getSiteModel = siteModel.getSiteById(config.siteId);

		return Promise.join(siteReportData, getSiteModel, (sqlReportData, siteModelInstance) => {
			console.log(`Apex Report:: Sql Report data: ${JSON.stringify(sqlReportData)}`);

			return Promise.resolve(siteModelInstance)
				.then((site) => {
					const email = site.get('ownerEmail');

					return site.getAllChannels()
						.then(generateFullReport.bind(null, config, email));
				});
		});

	}
};
