var extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	reports = require('../../../../models/reportsModel'),
	apexSingleChannelVariationModule = require('../../apex/modules/mssql/singleChannelVariationData'),
	singleChannelVariationQueryHelper = require('../vendor/mssql/queryHelpers/singleChannelVariationData'),
	channelModel = require('../../../../models/channelModel'),
	variationModule = require('./modules/variation/index'),
	ctrModule = require('./modules/ctr/index'),
	utilsModule = require('./modules/utils/index'),
	trafficDistributionModule = require('./modules/trafficDistribution/index');

module.exports = {
	getReportData: function(params, sqlReportData) {
		// TD = TrafficDistribution, FR = FinalReport
		var config = extend(true, {}, params), siteId, channelName,
			getReport, getTDConfig, getVariationTD;

		config.siteId = parseInt(config.siteId, 10);
		config.platform = (config.platform) ? config.platform.substring(0, 7) : null;
		config.pageGroup = (config.pageGroup) ? config.pageGroup.substring(0, 30) : null;
		config.startDate = (config.startDate) ? parseInt(config.startDate, 10) : moment().subtract(7, 'days').valueOf();
		config.endDate = (config.endDate) ? parseInt(config.endDate, 10) : moment().subtract(0, 'days').valueOf();
		config.channelName = `${config.pageGroup}_${config.platform}`;

		siteId = config.siteId;
		channelName = config.channelName;

		getReport = singleChannelVariationQueryHelper
			.getMatchedVariations(siteId, channelName, sqlReportData)
			.then(apexSingleChannelVariationModule.transformData);

		getTDConfig = getReport.then(function(report) {
			const reportData = {'status': true, 'data': extend(true, {}, report)};

			return trafficDistributionModule.getConfig(config, reportData);
		});
		getVariationTD = getTDConfig.then(function(trafficDistributionConfig) {
			return variationModule.getTrafficDistribution(trafficDistributionConfig);
		});

		return Promise.join(getReport, getTDConfig, getVariationTD, function(report, trafficDistributionConfig, trafficDistributionData) {
			console.log(`Apex Report:: Ctr performance Report: ${JSON.stringify(report)}`);
			const reportData = {'status': true, 'data': extend(true, {}, report)};

			return trafficDistributionModule.set(reportData, trafficDistributionData).then(function(reportWithTD) {
				return ctrModule.setPerformanceData(reportWithTD).then(function(reportWithCTRPerformance) {
					return utilsModule.addEmptyDataFields(reportWithCTRPerformance).then(function(reportWithAddedFields) {
						return [reportWithAddedFields, report];
					});
				});
			});
		});
	}
};