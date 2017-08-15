var extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	sqlQueryModule = require('../modules/mssql/singleChannelVariationData'),
	channelModel = require('../../../../models/channelModel'),
	variationModule = require('./modules/variation/index'),
	ctrModule = require('./modules/ctr/index'),
	utilsModule = require('./modules/utils/index'),
	trafficDistributionModule = require('./modules/trafficDistribution/index');
const { getSqlValidParameterDates } = require('../../apex/vendor/mssql/utils/utils');

module.exports = {
	getReportData: function(params) {
		// TD = TrafficDistribution, FR = FinalReport
		var config = extend(true, {}, params), getVariations, getReport, getTDConfig, getVariationTD;

		config.siteId = parseInt(config.siteId, 10);
		config.platform = (config.platform) ? config.platform.substring(0, 7) : null;
		config.pageGroup = (config.pageGroup) ? config.pageGroup.substring(0, 30) : null;

		config.startDate = (config.startDate) ? moment(config.startDate, 'x').format('YYYY-MM-DD') : moment().subtract(7, 'days').format('YYYY-MM-DD');
		config.endDate = (config.endDate) ? moment(config.endDate, 'x').format('YYYY-MM-DD') : moment().subtract(0, 'days').format('YYYY-MM-DD');
		const dateParams = { dateFrom: config.startDate, dateTo: config.endDate };
		config.startDate = getSqlValidParameterDates(dateParams).dateFrom;
		config.endDate = getSqlValidParameterDates(dateParams).dateTo;

		config.mode = 1;

		getVariations = channelModel.getVariations(config.siteId, config.platform, config.pageGroup);
		getReport = getVariations.then(function(variationsData) {
			config.variationCount = (variationsData && variationsData.count) ? parseInt(variationsData.count, 10) : 100;
			return sqlQueryModule.getData(config);
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
