var lodash = require('lodash'),
	Promise = require('bluebird'),
	adCodeSlotModule = require('../adCodeSlot/index'),
	adsenseReportModel = require('../../../../../../models/adsenseModel'),
	userModel = require('../../../../../../models/userModel'),
	adsense = {
		getFullData: function(config, adSlotsArr) {
			var self = this,
				adSlotEarningsPromises = adSlotsArr.map(function(adSlotNum) {
					var adSenseConfig = lodash.assign({}, config);

					adSenseConfig.adCodeSlot = adSlotNum;

					return self.getData(adSenseConfig)
						.then(adCodeSlotModule.getTotalEarnings);
				}),
				getImpressionData = Promise.resolve(config)
					.then((config) => {
						const impressionConfig = lodash.assign(true, { adsenseMetric: 'AD IMPRESSIONS' }, config);

						return self.getData(impressionConfig);
					});

			return Promise.join(Promise.all(adSlotEarningsPromises), getImpressionData, (earningsArr, impressionData) => {
				function getTotalEarnings(earningsArr) {
					let earnings = 0;

					lodash.forEach(earningsArr, (value) => {
						earnings += Number(value);
					});

					return Promise.resolve(earnings);
				}

				return getTotalEarnings(earningsArr)
					.then((earnings) => {
						const result = {
							earnings,
							impressionData
						};

						return result;
					});
			});
		},
		getData: function(config) {
			var userEmail = config.email,
				getUser = userModel.getUserByEmail(userEmail),
				getAdsense = getUser.then(adsenseReportModel.getAdsense),
				prepareConfig = adsenseReportModel.prepareQuery(config);

			return Promise.join(getUser, getAdsense, prepareConfig, function(user, adsense, queryConfig) {
				return adsense.getReport(queryConfig)
					.then(function(report) {
						return Promise.resolve(report);
					});
			});
		}
	};

module.exports = {
	getData: adsense.getFullData.bind(adsense)
};
