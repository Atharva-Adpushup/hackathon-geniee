var moment = require('moment'),
	Promise = require('bluebird'),
	utils = require('../../../utils/index'),
	lodash = require('lodash'),
	pageViewsModule = require('../../../../../../default/apex/pageGroupVariationRPM/modules/pageViews/index');

module.exports = {
	// Get total page views for any variation
	getTotalPageViews: function(config, variation, pageGroup) {
		var pageViewsReportConfig = {
			siteId: config.siteId,
			startDate: (config.dateFrom ? moment(config.dateFrom).valueOf() : moment().subtract(31, 'days').valueOf()),
			endDate: (config.dateTo ? moment(config.dateTo).valueOf(): moment().subtract(1, 'days').valueOf()),
			variationKey: variation.id,
			platform: pageGroup.device,
			pageGroup: pageGroup.pageGroup,
			reportType: 'apex',
			step: '1d'
		};
		
		return pageViewsModule.getTotalCount(pageViewsReportConfig);
	},
	getDayWisePageViews: function(config, variation, pageGroup) {
		var timeStampCollection = utils.getDayWiseTimestamps(config.dateFrom, config.dateTo).collection;

		return Promise.all(timeStampCollection.map(function(object) {
			var dayWisePageViewsConfig = {
				siteId: config.siteId,
				startDate: object.dateFrom,
				endDate: object.dateTo,
				variationKey: variation.id,
				platform: pageGroup.device,
				pageGroup: pageGroup.pageGroup,
				reportType: 'apex',
				step: '1d'
			};

			return pageViewsModule.getTotalCount(dayWisePageViewsConfig)
				.then(function(pageViews) {
					var date = moment(object.dateFrom, 'x').format('YYYY-MM-DD'),
						result = {};

					result[date] = pageViews;
					return result;
				})
				.catch(function() {
					return false;
				});
		}))
		.then(function(pageViewsCollection) {
			return utils.getObjectFromCollection(lodash.compact(pageViewsCollection));
		});
	}
};
