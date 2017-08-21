var _ = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	siteModel = require('../../../models/siteModel'),
	ctrPerformanceService = require('./ctrPerformanceInTabularData/service'),
	pageGroupVariationRPMService = require('./pageGroupVariationRPM/service'),
	variationModule = require('./modules/variation/index'),
	sqlQueryModule = require('../../default/apex/vendor/mssql/queryHelpers/fullSiteData'),
	parameterModule = require('./modules/params/index');

module.exports = {
	getReportData: function(reportConfig) {
		const paramConfig = parameterModule.getParameterConfig(reportConfig),
			config = extend(true, {}, paramConfig.apex),
			sqlReportConfig = extend(true, {}, paramConfig.sql);
		console.log(`Apex config: ${JSON.stringify(config)}, sqlReportConfig: ${JSON.stringify(sqlReportConfig)}`);

		function generateRPMReport(ctrPerformanceConfig, channel, email, tableFormatReportData, variationData) {
			return Promise.all(_.map(variationData, (variationObj, variationKey) => {
				const variationRPMConfig = extend(true, {}, ctrPerformanceConfig, {
					variationKey: variationKey
				}),
				finalVariationObj = {};

				finalVariationObj[variationKey] = extend(true, {}, variationObj);

				return pageGroupVariationRPMService.getReportData(variationRPMConfig, email, tableFormatReportData)
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

		function isChannelDataInReport(channelName, pageGroupsObject) {
			const isChannelData = !!(pageGroupsObject.hasOwnProperty(channelName) && pageGroupsObject[channelName]),
				isVariation = !!(isChannelData && pageGroupsObject[channelName].variations),
				isVariationData = !!(isVariation && _.isObject(pageGroupsObject[channelName].variations) && _.keys(pageGroupsObject[channelName].variations).length);

			return isVariationData;
		}

		function generateFullReport(config, email, sqlReportData, allChannels) {
			return Promise.all(_.compact(_.map(allChannels, (channel) => {
				const siteId = config.siteId,
					channelName = `${channel.pageGroup}_${channel.platform}`,
					pageGroupsObject = sqlReportData[siteId].pageGroups,
					isValidChannelData = isChannelDataInReport(channelName, pageGroupsObject);

				if (!isValidChannelData) { return false; }

				const ctrPerformanceConfig = extend(true, {}, config, {
					platform: channel.platform,
					pageGroup: channel.pageGroup
				});

				return ctrPerformanceService.getReportData(ctrPerformanceConfig, sqlReportData)
					.spread((updatedReportData, tableFormatReportData) => {
						return Promise.resolve(variationModule.getMetrics(updatedReportData))
							.then(generateRPMReport.bind(null, ctrPerformanceConfig, channel, email, tableFormatReportData));
					});
			}))).then(variationModule.getFinalData);
		}

		const getSqlReportData = sqlQueryModule.getMetricsData(sqlReportConfig),
			getSiteModel = siteModel.getSiteById(config.siteId);

		return Promise.join(getSqlReportData, getSiteModel, (sqlReportData, siteModelInstance) => {
			const isValidReportData = !!(sqlReportData && _.isObject(sqlReportData) && _.keys(sqlReportData).length),
				defaultEmptyData = null;

			if (!isValidReportData) { return defaultEmptyData; }

			return Promise.resolve(siteModelInstance)
				.then((site) => {
					const email = site.get('ownerEmail');

					return site.getAllChannels()
						.then(generateFullReport.bind(null, config, email, sqlReportData));
				});
		});

	}
};
