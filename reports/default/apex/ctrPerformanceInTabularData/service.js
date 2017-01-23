var extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	reports = require('../../../../models/reportsModel'),
	channelModel = require('../../../../models/channelModel'),
	variationModule = require('./modules/variation/index'),
	ctrModule = require('./modules/ctr/index'),
	utilsModule = require('./modules/utils/index'),
	trafficDistributionModule = require('./modules/trafficDistribution/index');

module.exports = {
	getReportData: function(params) {
		// TD = TrafficDistribution, FR = FinalReport
		var config = extend(true, {}, params), getVariations, getReport, getTDConfig, getVariationTD;
		config.siteId = parseInt(config.siteId, 10);
		config.platform = (config.platform) ? config.platform.substring(0, 7) : null;
		config.pageGroup = (config.pageGroup) ? config.pageGroup.substring(0, 30) : null;
		config.startDate = (config.startDate) ? parseInt(config.startDate, 10) : moment().subtract(7, 'days').valueOf();
		config.endDate = (config.endDate) ? parseInt(config.endDate, 10) : moment().subtract(0, 'days').valueOf();

		getVariations = channelModel.getVariations(config.siteId, config.platform, config.pageGroup);
		getReport = getVariations.then(function(variationsData) {
			config.variationCount = (variationsData && variationsData.count) ? parseInt(variationsData.count, 10) : 100;
			return Promise.resolve(reports.apexReport(config));
		});
		getTDConfig = getReport.then(function(report) {
			return trafficDistributionModule.getConfig(config, report);
		});
		getVariationTD = getTDConfig.then(function(trafficDistributionConfig) {
			return variationModule.getTrafficDistribution(trafficDistributionConfig);
		});

		return Promise.join(getVariations, getReport, getTDConfig, getVariationTD, function(allVariations, report, trafficDistributionConfig, trafficDistributionData) {
			return trafficDistributionModule.set(report, trafficDistributionData).then(function(reportWithTD) {
				return ctrModule.setPerformanceData(reportWithTD).then(function(reportWithCTRPerformance) {
					return utilsModule.addEmptyDataFields(reportWithCTRPerformance).then(function(reportWithAddedFields) {
						return reportWithAddedFields;
					});
				});
			});
		});
	}
};
