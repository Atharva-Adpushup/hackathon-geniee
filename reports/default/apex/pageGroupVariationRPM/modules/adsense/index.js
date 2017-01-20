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
				});

			return Promise.all(adSlotEarningsPromises)
				.then(function(earningsArr) {
					var earnings = 0;

					lodash.forEach(earningsArr, function(value) {
						earnings += Number(value);
					});

					return Promise.resolve(earnings);
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
