var lodash = require('lodash'),
	Promise = require('bluebird'),
	adCodeSlotModule = require('../adCodeSlot/index'),
	impressionModule = require('../impression/index'),
	adsenseReportModel = require('../../../../../../models/adsenseModel'),
	userModel = require('../../../../../../models/userModel'),
	adsense = {
		getFullData: function(config, adSlotsArr) {
			const self = this,
				reportPromises = adSlotsArr.map(adSlotNum => {
					const genericConfig = lodash.assign({ adCodeSlot: adSlotNum }, config),
						impressionConfig = lodash.assign(
							{ adsenseMetric: 'AD IMPRESSIONS', adCodeSlot: adSlotNum },
							config
						),
						genericReport = self.getData(genericConfig),
						impressionReport = self.getData(impressionConfig);

					return Promise.join(genericReport, impressionReport, (genericReportData, impressionReportData) => {
						const getAdCodeSlotEarnings = adCodeSlotModule.getTotalEarnings(genericReportData),
							getImpressions = impressionModule.getTotal(impressionReportData);

						return Promise.join(
							getAdCodeSlotEarnings,
							getImpressions,
							(adCodeSlotEarnings, impressions) => {
								return { earnings: adCodeSlotEarnings, impressions };
							}
						);
					});
				});

			return Promise.join(Promise.all(reportPromises), reportDataArr => {
				function getTotalEarningsAndImpressions(reportDataArr) {
					const result = {
						earnings: 0,
						impressions: 0
					};

					lodash.forEach(reportDataArr, dataItem => {
						result.earnings += dataItem.earnings;
						result.impressions += dataItem.impressions;
					});

					return Promise.resolve(result);
				}

				return getTotalEarningsAndImpressions(reportDataArr);
			});
		},
		getData: function(config) {
			var userEmail = config.email,
				getUser = userModel.getUserByEmail(userEmail),
				getAdsense = getUser.then(adsenseReportModel.getAdsense),
				prepareConfig = adsenseReportModel.prepareQuery(config);

			return Promise.join(getUser, getAdsense, prepareConfig, function(user, adsense, queryConfig) {
				return adsense.getReport(queryConfig).then(function(report) {
					return Promise.resolve(report);
				});
			});
		}
	};

module.exports = {
	getData: adsense.getFullData.bind(adsense)
};
