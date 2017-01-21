var _ = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	siteModel = require('../../../models/siteModel'),
	ctrPerformanceService = require('./ctrPerformanceInTabularData/service'),
	pageGroupVariationRPMService = require('./pageGroupVariationRPM/service'),
	variationModule = require('./modules/variation/index');

module.exports = {
	getReportData: function(siteId) {
		var config = {
			siteId: siteId,
			reportType: 'apex',
			step: '1d',
			startDate: moment().subtract(7, 'days').valueOf(),
			endDate: moment().subtract(0, 'days').valueOf()
		}, email;

		return siteModel.getSiteById(config.siteId)
			.then(function(site) {
				email = site.get('ownerEmail');

				return site.getAllChannels()
					.then(function(allChannels) {
						return Promise.all(_.map(allChannels, function(channel) {
							var ctrPerformanceConfig = extend(true, {}, config, {
								platform: channel.platform,
								pageGroup: channel.pageGroup
							});

							return ctrPerformanceService.getReportData(ctrPerformanceConfig)
								.then(variationModule.getMetrics)
								.then(function(variationData) {
									return Promise.all(_.map(variationData, function(variationObj, variationKey) {
										var variationRPMConfig = extend(true, {}, ctrPerformanceConfig, {
											variationKey: variationKey
										}),
										finalVariationObj = {};

										finalVariationObj[variationKey] = extend(true, {}, variationObj);

										return pageGroupVariationRPMService.getReportData(variationRPMConfig, email)
											.then(function(variationRPMReportData) {
												var clicks = finalVariationObj[variationKey].click,
													pageViews;

												finalVariationObj[variationKey].revenue = variationRPMReportData.earnings;
												finalVariationObj[variationKey].pageViews = variationRPMReportData.pageViews;
												pageViews = variationRPMReportData.pageViews;
												
												finalVariationObj[variationKey].pageRPM = variationRPMReportData.rpm;
												finalVariationObj[variationKey].pageCTR = Number((clicks / pageViews * 100).toFixed(2));

												return finalVariationObj;
											});
									})).then(function(computedVariationsData) {
										var channelKey = channel.pageGroup + "_" + channel.platform,
											computedVariationsObj = {};

										computedVariationsObj[channelKey] = {};

										return _.reduce(computedVariationsData, function(hashMap, obj) {
											var key = Object.keys(hashMap)[0];

											hashMap[key] = extend(true, hashMap[key], obj);
											return hashMap;
										}, computedVariationsObj);
									});
								});
						})).then(function(finalVariationData) {
							return finalVariationData;
						});
					})
			})
	}
};
