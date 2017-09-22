var Promise = require('bluebird'),
	lodash = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	utils = require('../../../utils/index'),
	apexReport = require('../../../../../../default/apex/service');

module.exports = {
	getReport: function(config, variationObj, pageGroupObj) {
		const defaultDateConfig = {
				startDate: moment()
					.subtract(7, 'days')
					.startOf('day')
					.valueOf(),
				endDate: moment()
					.subtract(1, 'days')
					.endOf('day')
					.valueOf()
			},
			reportConfig = {
				siteId: config.siteId,
				startDate: config.dateFrom
					? moment(config.dateFrom)
							.startOf('day')
							.valueOf()
					: defaultDateConfig.startDate,
				endDate: config.dateTo
					? moment(config.dateTo)
							.endOf('day')
							.valueOf()
					: defaultDateConfig.endDate,
				currencyCode: 'JPY'
			},
			timeStampCollection = utils.getDayWiseTimestamps(config.dateFrom, config.dateTo).collection,
			getDayWiseReport = Promise.all(
				lodash.map(timeStampCollection, timeStampObject => {
					const config = {
						siteId: reportConfig.siteId,
						startDate: timeStampObject.dateFrom,
						endDate: timeStampObject.dateTo,
						currencyCode: reportConfig.currencyCode
					};

					return apexReport.getReportData(config).then(reportData => {
						if (reportData) {
							const result = {},
								dateKey = moment(timeStampObject.dateFrom, 'x').format('YYYY-MM-DD');

							result[dateKey] = reportData;
							return result;
						}

						return false;
					});
				})
			).then(dayWiseReport => utils.getObjectFromCollection(lodash.compact(dayWiseReport))),
			getVariationDayWiseReport = getDayWiseReport.then(dayWiseReport => {
				const computedData = [];

				lodash.forOwn(dayWiseReport, (dayWiseObject, dayWiseKey) => {
					const channelName = `${pageGroupObj.pageGroup}_${pageGroupObj.device}`,
						isReportData = !!(
							dayWiseObject &&
							lodash.isObject(dayWiseObject) &&
							lodash.keys(dayWiseObject).length
						);

					if (isReportData) {
						const variations = dayWiseObject.pageGroups[channelName].variations;

						lodash.forOwn(variations, (apexVariationObj, apexVariationKey) => {
							const isVariationMatch = !!(
								variationObj.id === apexVariationKey && variationObj.name === apexVariationObj.name
							);

							if (isVariationMatch) {
								const metricData = extend(
									true,
									{ date: dayWiseKey, currencyCode: reportConfig.currencyCode },
									apexVariationObj
								);

								computedData.push(metricData);
							}
						});
					}
				});

				return computedData;
			}),
			getFullReport = apexReport.getReportData(reportConfig);

		return Promise.join(
			getDayWiseReport,
			getVariationDayWiseReport,
			getFullReport,
			(dayWiseReport, variationDayWiseReport, fullReport) => {
				return { dayWise: variationDayWiseReport, full: fullReport };
			}
		);
	}
};
