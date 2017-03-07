var extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	siteModel = require('../../../../models/siteModel'),
	adCodeSlotModule = require('./modules/adCodeSlot/index'),
	adsenseModule = require('./modules/adsense/index'),
	pageViewsModule = require('./modules/pageViews/index'),
	rpmModule = require('./modules/rpm/index');

module.exports = {
	getReportData: function(params, email) {
		var queryConfig = extend(true, {}, params);

		queryConfig.channelKey = (queryConfig.platform + ":" + queryConfig.pageGroup);
		queryConfig.email = email;

		return siteModel.getSiteById(queryConfig.siteId)
			.then(adCodeSlotModule.get.bind(adCodeSlotModule, queryConfig))
			.then(function(adSlotsArr) {
				// Set default metric values
				if (!adSlotsArr || !adSlotsArr.length) {
					return {success: true, rpm: 0, pageViews: 0, earnings: 0};
				}

				return adsenseModule.getData(queryConfig, adSlotsArr)
					.then(function(adSlotsEarnings) {
						return pageViewsModule.getTotalCount(queryConfig)
							.then(function(pageViews) {
								return rpmModule.calculate(pageViews, adSlotsEarnings)
									.then(function(rpm) {
										return {
											success: true,
											rpm: rpm,
											pageViews: pageViews,
											earnings: adSlotsEarnings
										};
									});
							});
					});
			});
	}
};
