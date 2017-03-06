var _ = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	lodash = require('lodash'),
	pageViewsModule = require('../../../../default/apex/pageGroupVariationRPM/modules/pageViews/index'),
	utils = require('../utils/index');

module.exports = {
	setVariationMetrics: function(config, pageGroupData) {
		var computedData = extend(true, {}, pageGroupData);

		return Promise.all(_.map(pageGroupData, function(pageGroupObj, pageGroupKey) {
			return Promise.all(_.map(pageGroupObj.variationData, function(variationObj, variationKey) {
				var computedVariationObject;

				computedData[pageGroupKey].variationData[variationKey] = extend(true, {}, variationObj, { 'click': 0, 'impression': 0, 'revenue': 0.0, 'ctr': 0.0, "pageViews": 0, "pageRPM": 0.0, "pageCTR": 0.0 });
				// Cache computed variation object
				computedVariationObject = extend(true, {}, computedData[pageGroupKey].variationData[variationKey]);

				// Get total page views for any variation
				function getTotalPageViews(config, variation, pageGroup) {
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
				}

				function getDayWisePageViews(config, variation, pageGroup) {
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

				return getTotalPageViews(config, variationObj, pageGroupObj)
					.then(function(totalPageViews) {
						return getDayWisePageViews(config, variationObj, pageGroupObj)
							.then(function(dayWisePageViews) {
								computedVariationObject.dayWisePageViews = dayWisePageViews || 0;

								return Promise.all(_.map(variationObj.zones, function(zoneObj) {
									var revenue, clicks;

									computedVariationObject.click += Number(zoneObj.click);
									computedVariationObject.impression += Number(zoneObj.impression);
									computedVariationObject.revenue += Number(zoneObj.revenue);
									computedVariationObject.ctr += Number(zoneObj.ctr);

									computedVariationObject.click = computedVariationObject.click || 0;
									computedVariationObject.impression = computedVariationObject.impression || 0;
									computedVariationObject.revenue = Number(computedVariationObject.revenue.toFixed(2)) || 0;
									computedVariationObject.ctr = Number(computedVariationObject.ctr.toFixed(2)) || 0;
									computedVariationObject.pageViews = Number(totalPageViews) || 0;

									revenue = computedVariationObject.revenue;
									clicks = computedVariationObject.click;

									computedVariationObject.pageRPM = Number((revenue / totalPageViews * 1000).toFixed(2));
									computedVariationObject.pageCTR = Number((clicks / totalPageViews * 100).toFixed(2));

									computedVariationObject.pageRPM = (computedVariationObject.pageRPM && computedVariationObject.pageRPM !== Infinity) ? computedVariationObject.pageRPM : 0;
									computedVariationObject.pageCTR = (computedVariationObject.pageCTR && computedVariationObject.pageCTR !== Infinity) ? computedVariationObject.pageCTR : 0;

									// Set back computed variation object in its original hierarchy
									computedData[pageGroupKey].variationData[variationKey] = extend(true, {}, computedVariationObject);

									return computedData;
								})).then(function() {
									return computedData;
								});
							});
					});
			})).then(function() {
				return computedData;
			});
		})).then(function() {
			return computedData;
		});
	},
	removeRedundantVariationsObj: function(pageGroupData) {
		var computedData = extend(true, {}, pageGroupData);

		_.forOwn(computedData, function(pageGroupObj, pageGroupKey) {
			computedData[pageGroupKey].variations = extend(true, {}, computedData[pageGroupKey].variationData);
			delete computedData[pageGroupKey].variationData;
		});

		return computedData;
	},
	setVariationsHighChartsData: function(pageGroupData) {
		var self = this,
            computedData = extend(true, {}, pageGroupData),
			highChartsData, datesObj, currentComputedObj, currentDate;

		_.forOwn(computedData, function(pageGroupObj, pageGroupKey) {
			// Reset config for every page group
			highChartsData = {
				highCharts: {
					revenue: [],
					pageviews: [],
					clicks: [],
					pagerpm: [],
					pagectr: []
				}
			};
			datesObj = {
				revenue: {},
				pageviews: {},
				clicks: {},
				pagerpm: {},
				pagectr: {}
			};
			currentComputedObj = {};

			_.forOwn(pageGroupObj.variations, function(variationObj, variationKey) {
				_.forEach(variationObj.zones, function(zonesObj) {
					currentDate = moment(zonesObj.date).valueOf();

					currentComputedObj.revenue = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(zonesObj.revenue)]]
					};
					datesObj.revenue[currentDate] = currentComputedObj.revenue.name;
					
					currentComputedObj.pageviews = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(variationObj.dayWisePageViews[zonesObj.date])]]
					};
					datesObj.pageviews[currentDate] = currentComputedObj.pageviews.name;

					currentComputedObj.clicks = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(zonesObj.click)]]
					};
					datesObj.clicks[currentDate] = currentComputedObj.clicks.name;

					currentComputedObj.pagerpm = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(variationObj.pageRPM)]]
					};
					datesObj.pagerpm[currentDate] = currentComputedObj.pagerpm.name;

					currentComputedObj.pagectr = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(variationObj.pageCTR)]]
					};
					datesObj.pagectr[currentDate] = currentComputedObj.pagectr.name;

					utils.setHighChartsData(currentDate, 'revenue', highChartsData.highCharts, currentComputedObj);
					utils.setHighChartsData(currentDate, 'clicks', highChartsData.highCharts, currentComputedObj);
					utils.setHighChartsData(currentDate, 'pageviews', highChartsData.highCharts, currentComputedObj);
					utils.setHighChartsData(currentDate, 'pagerpm', highChartsData.highCharts, currentComputedObj);
					utils.setHighChartsData(currentDate, 'pagectr', highChartsData.highCharts, currentComputedObj);
				});
			});

			// Add date with empty values
			_.forOwn(datesObj.revenue, function(revenueData, dateKey) {
				utils.setDateWithEmptyValue(dateKey, 'revenue', highChartsData.highCharts);
			});

			_.forOwn(datesObj.pageviews, function(pageviewsData, dateKey) {
				utils.setDateWithEmptyValue(dateKey, 'pageviews', highChartsData.highCharts);
			});

			_.forOwn(datesObj.clicks, function(clicksData, dateKey) {
				utils.setDateWithEmptyValue(dateKey, 'clicks', highChartsData.highCharts);
			});

			_.forOwn(datesObj.pagerpm, function(pagerpmData, dateKey) {
				utils.setDateWithEmptyValue(dateKey, 'pagerpm', highChartsData.highCharts);
			});
			highChartsData.highCharts = utils.updatePageRPMHighChartsData(highChartsData.highCharts);

			_.forOwn(datesObj.pagectr, function(pagectrData, dateKey) {
				utils.setDateWithEmptyValue(dateKey, 'pagectr', highChartsData.highCharts);
			});
			highChartsData.highCharts = utils.updatePageCTRHighChartsData(highChartsData.highCharts);

			computedData[pageGroupKey].variations.data = extend(true, computedData[pageGroupKey].variations.data, highChartsData);
		});
			
		return Promise.resolve(computedData);
	},
	setVariationsTabularData: function(pageGroupData) {
		var computedData = extend(true, {}, pageGroupData),
			variationsTabularData;

		_.forOwn(computedData, function(pageGroupObj, pageGroupKey) {
			variationsTabularData = {
				table: {
					header: ['NAME', 'TRAFFIC DISTRIBUTION', 'REVENUE', 'IMPRESSIONS', 'PAGE VIEWS', 'CLICKS', 'PAGE RPM', 'PAGE CTR', 'REVENUE CONTRIBUTION (%)'],
					rows: [],
					footer: ['TOTAL', 0, 0, 0, 0, 0, 0, 0, 0]
				}
			};
			
			_.forOwn(pageGroupObj.variations, function(variationObj, variationKey) {
				var rowItem = [];

				rowItem[0] = variationObj.name;
				rowItem[1] = variationObj.trafficDistribution;
				variationsTabularData.table.footer[1] += Number(variationObj.trafficDistribution);

				rowItem[2] = variationObj.revenue;
				variationsTabularData.table.footer[2] += Number(variationObj.revenue);
				
				rowItem[3] = variationObj.impression;
				variationsTabularData.table.footer[3] += Number(variationObj.impression);
				
				rowItem[4] = variationObj.pageViews;
				variationsTabularData.table.footer[4] += Number(variationObj.pageViews);
				
				rowItem[5] = variationObj.click;
				variationsTabularData.table.footer[5] += Number(variationObj.click);
				
				rowItem[6] = variationObj.pageRPM;
				variationsTabularData.table.footer[6] += Number(variationObj.pageRPM);
				
				rowItem[7] = variationObj.pageCTR;
				variationsTabularData.table.footer[7] += Number(variationObj.pageCTR);
				
				rowItem[8] = Math.floor((variationObj.revenue / pageGroupObj.revenue) * 100);
				variationsTabularData.table.footer[8] += Number(rowItem[8]);

				variationsTabularData.table.rows.push(rowItem);
			});

			computedData[pageGroupKey].variations.data = extend(true, {}, variationsTabularData);
		});

		return computedData;
	}
};
