var _ = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	siteModel = require('../../../models/siteModel'),
	ctrPerformanceService = require('./ctrPerformanceInTabularData/service'),
	pageGroupVariationRPMService = require('./pageGroupVariationRPM/service'),
	variationModule = require('./modules/variation/index');

module.exports = {
	getReportData: function(reportConfig) {
		const defaultDateConfig = {
			startDate: moment().subtract(7, 'days').startOf('day').valueOf(),
			endDate: moment().subtract(0, 'days').endOf('day').valueOf()
		},
		config = {
			siteId: reportConfig.siteId,
			reportType: 'apex',
			step: '1d',
			startDate: (reportConfig.startDate ? reportConfig.startDate : defaultDateConfig.startDate),
			endDate: (reportConfig.endDate ? reportConfig.endDate : defaultDateConfig.endDate),
			currencyCode: reportConfig.currencyCode
		};

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
						finalVariationObj[variationKey].impressions = variationRPMReportData.impressions;

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

		return siteModel.getSiteById(config.siteId)
			.then((site) => {
				const email = site.get('ownerEmail');

				return site.getAllChannels()
					.then(generateFullReport.bind(null, config, email));
			})
	}
};
