var _ = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	lodash = require('lodash'),
	selfPageViewsModule = require('./modules/pageViews/index'),
	pageViewsModule = require('../../../../default/apex/pageGroupVariationRPM/modules/pageViews/index'),
	apexReport = require('./modules/apexReportIntegration/index'),
	utils = require('../utils/index');

module.exports = {
	setVariationMetrics: function(config, pageGroupData) {
		var computedData = extend(true, {}, pageGroupData);

		return Promise.all(_.map(pageGroupData, function(pageGroupObj, pageGroupKey) {
			return Promise.all(_.map(pageGroupObj.variationData, function(variationObj, variationKey) {
				var computedVariationObject;

				computedData[pageGroupKey].variationData[variationKey] = extend(true, {}, variationObj, { 'click': 0, 'impression': 0, 'revenue': 0.0, 'ctr': 0.0, 'pageViews': 0, 'pageRPM': 0.0, 'pageCTR': 0.0, 'dayWisePageViews': {} });
				// If variation is custom (Contains AdSense ad codes only),
				// return computed data with default metric values
				if (variationObj.isCustom) {
					return apexReport.getReport(config)
						.then(function(reportData) {
							var channelName = pageGroupObj.pageGroup + '_' + pageGroupObj.device,
								isReportData = !!(reportData && _.isObject(reportData) && _.keys(reportData).length),
								variations;

							if (isReportData) {
								variations = reportData[channelName].variations;

								_.forOwn(variations, function(apexVariationObj, apexVariationKey) {
									var isVariationMatch = !!((variationKey === apexVariationKey) && (variationObj.name === apexVariationObj.name));

									if (isVariationMatch) {
										computedData[pageGroupKey].variationData[variationKey] = extend(true, computedData[pageGroupKey].variationData[variationKey], apexVariationObj);
										return false;
									}
								});

								return computedData;
							}

							return computedData;
						});
				}

				// Cache computed variation object
				computedVariationObject = extend(true, {}, computedData[pageGroupKey].variationData[variationKey]);

				return selfPageViewsModule.getTotalPageViews(config, variationObj, pageGroupObj)
					.then(function(totalPageViews) {
						return selfPageViewsModule.getDayWisePageViews(config, variationObj, pageGroupObj)
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
		var computedData = extend(true, {}, pageGroupData);

		_.forOwn(computedData, function(pageGroupObj, pageGroupKey) {
			var variationsTabularData = {
				table: {
					header: ['NAME', 'TRAFFIC DISTRIBUTION', 'REVENUE', 'IMPRESSIONS', 'PAGE VIEWS', 'CLICKS', 'PAGE RPM', 'PAGE CTR', 'REVENUE CONTRIBUTION (%)'],
					rows: [],
					footer: ['TOTAL', 0, 0, 0, 0, 0, 0, 0, 0]
				}
			}, footerMetrics = {
				revenue: 0,
				impressions: 0,
				pageViews: 0,
				clicks: 0,
				pageRPM: 0,
				pageCTR: 0
			};
			
			_.forOwn(pageGroupObj.variations, function(variationObj, variationKey) {
				var rowItem = [];

				rowItem[0] = variationObj.name;
				rowItem[1] = variationObj.trafficDistribution;
				variationsTabularData.table.footer[1] += Number(variationObj.trafficDistribution);

				rowItem[2] = variationObj.revenue;
				footerMetrics.revenue += Number(variationObj.revenue);
				
				rowItem[3] = variationObj.impression;
				footerMetrics.impressions += Number(variationObj.impression);

				rowItem[4] = variationObj.pageViews;
				footerMetrics.pageViews += Number(variationObj.pageViews);

				rowItem[5] = variationObj.click;
				footerMetrics.clicks += Number(variationObj.click);

				rowItem[6] = variationObj.pageRPM;
				rowItem[7] = variationObj.pageCTR;

				rowItem[8] = Math.floor((variationObj.revenue / pageGroupObj.revenue) * 100);
				variationsTabularData.table.footer[8] += Number(rowItem[8]);

				variationsTabularData.table.rows.push(rowItem);
			});

			// Round of metrics to 2 decimal places
			footerMetrics.revenue = Number((footerMetrics.revenue).toFixed(2));
			// Calculate footer pageRPM
			footerMetrics.pageRPM  = Number((footerMetrics.revenue / footerMetrics.pageViews * 1000).toFixed(2));
			footerMetrics.pageRPM = (footerMetrics.pageRPM && (footerMetrics.pageRPM !== Infinity)) ? footerMetrics.pageRPM : 0;

			// Calculate footer pageCTR
			footerMetrics.pageCTR = Number((footerMetrics.clicks / footerMetrics.pageViews * 100).toFixed(2));
			footerMetrics.pageCTR = (footerMetrics.pageCTR && (footerMetrics.pageCTR !== Infinity)) ? footerMetrics.pageCTR : 0;

			variationsTabularData.table.footer[2] = footerMetrics.revenue;
			variationsTabularData.table.footer[3] = footerMetrics.impressions;
			variationsTabularData.table.footer[4] = footerMetrics.pageViews;
			variationsTabularData.table.footer[5] = footerMetrics.clicks;
			variationsTabularData.table.footer[6] = footerMetrics.pageRPM;
			variationsTabularData.table.footer[7] = footerMetrics.pageCTR;

			computedData[pageGroupKey].variations.data = extend(true, {}, variationsTabularData);
		});

		return computedData;
	}
};
