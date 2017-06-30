var moment = require('moment'),
	Promise = require('bluebird'),
	utils = require('../../../utils/index'),
	lodash = require('lodash'),
	pageViewsModule = require('../../../../../../default/apex/pageGroupVariationRPM/modules/pageViews/index'),
	keenIOPageViewsModule = require('../../../../../../default/apex/vendor/keenIO/queries/pageViewsBySiteId/service');
const { fileLogger } = require('../../../../../../../helpers/logger/file/index');

module.exports = {
	// Get total page views for any variation
	getTotalPageViews: function(config, variation, pageGroup) {
		// 'defaultStartDate', this is a KeenIO specific start date
		// From this day, KeenIO integration for pageviews went live in production
		var defaultStartDate = '2017-06-01',
			pageViewsReportConfig = {
				mode: 1,
				siteId: config.siteId,
				startDate: (config.dateFrom ? moment(config.dateFrom).format('YYYY-MM-DD') : defaultStartDate),
				endDate: (config.dateTo ? moment(config.dateTo).add(1, 'days').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')),
				variationId: variation.id.replace(/-/g, '_'),
				platform: pageGroup.device,
				pageGroup: pageGroup.pageGroup,
				reportType: 'apex',
				step: '1d',
				getOnlyPageViews: true
			};

		console.log(`getTotalPageViews: Page views count for siteId: ${pageViewsReportConfig.siteId}`);
		console.log(`Date From: ${pageViewsReportConfig.startDate}, Date To: ${pageViewsReportConfig.endDate}`);

		fileLogger.info('/*****Variation total pageViews config*****/');
		fileLogger.info(pageViewsReportConfig);

		return keenIOPageViewsModule.getPageViews(pageViewsReportConfig);
		//return pageViewsModule.getTotalCount(pageViewsReportConfig);
	},
	getDayWisePageViews: function(config, variation, pageGroup) {
		var timeStampCollection = utils.getDayWiseTimestamps(config.dateFrom, config.dateTo).collection;

		return Promise.all(timeStampCollection.map(function(object) {
			var dayWisePageViewsConfig = {
				mode: 1,
				siteId: config.siteId,
				startDate: moment(object.dateFrom, 'x').format('YYYY-MM-DD'),
				endDate: moment(object.dateTo, 'x').add(1, 'days').format('YYYY-MM-DD'),
				variationId: variation.id.replace(/-/g, '_'),
				platform: pageGroup.device,
				pageGroup: pageGroup.pageGroup,
				reportType: 'apex',
				step: '1d',
				getOnlyPageViews: true
			};

			fileLogger.info('/*****Variation daywise pageViews config*****/');
			fileLogger.info(dayWisePageViewsConfig);

			function getPageViewObject(pageViews) {
				var date = moment(object.dateFrom, 'x').format('YYYY-MM-DD'),
					result = {};

				result[date] = pageViews;
				return result;
			}

			//return pageViewsModule.getTotalCount(dayWisePageViewsConfig)
			return keenIOPageViewsModule.getPageViews(dayWisePageViewsConfig)
				.then(getPageViewObject)
				.catch(function() {
					var defaultPageView = 0;

					return getPageViewObject(defaultPageView);
				});
		}))
		.then(function(pageViewsCollection) {
			return utils.getObjectFromCollection(lodash.compact(pageViewsCollection));
		});
	}
};
