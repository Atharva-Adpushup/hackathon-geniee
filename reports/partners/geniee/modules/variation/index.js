var _ = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	selfChosenVariationModule = require('./modules/chosenVariation/index'),
	apexReport = require('./modules/apexReportIntegration/index'),
	utils = require('../utils/index');
const { fileLogger } = require('../../../../../helpers/logger/file/index'),
	localizedData = require('../../../../../i18n/reports/geniee/constants');

module.exports = {
	setVariationMetrics: function(config, sqlReportData, pageGroupData) {
		var computedData = extend(true, {}, pageGroupData),
			isSqlReportData = !!(sqlReportData && Object.keys(sqlReportData).length);

		return Promise.all(_.map(pageGroupData, function(pageGroupObj, pageGroupKey) {
			return Promise.all(_.map(pageGroupObj.variationData, function(variationObj, variationKey) {
				var computedVariationObject;

				// Extend variation object with default metric values
				computedData[pageGroupKey].variationData[variationKey] = extend(true, {}, variationObj, { 'click': 0, 'impression': 0, 'revenue': 0.0, 'ctr': 0.0, 'pageViews': 0, 'pageRPM': 0.0, 'pageCTR': 0.0, 'dayWisePageViews': {}, 'days': {} });
				// If variation is custom (Contains AdSense ad codes only),
				// return computed data with default metric values
				if (variationObj.isCustom) {
					return apexReport.getReport(config, variationObj, pageGroupObj)
						.then(function(reportDataConfig) {
							var fullReportData = reportDataConfig.full,
								dayWiseReportData = reportDataConfig.dayWise,
								channelName = `${pageGroupObj.pageGroup}_${pageGroupObj.device}`,
								isReportData = !!(fullReportData && _.isObject(fullReportData) && _.keys(fullReportData).length),
								variations;

							if (isReportData) {
								variations = fullReportData.pageGroups[channelName].variations;

								_.forOwn(variations, function(apexVariationObj, apexVariationKey) {
									var isVariationMatch = !!((variationKey === apexVariationKey) && (variationObj.name === apexVariationObj.name));

									if (isVariationMatch) {
										computedData[pageGroupKey].variationData[variationKey] = extend(true, { zones: dayWiseReportData }, computedData[pageGroupKey].variationData[variationKey], apexVariationObj);
										return false;
									}
								});

								return computedData;
							}

							return computedData;
						});
				}
				if (!isSqlReportData) { return computedData; }

				// Cache computed variation object
				computedVariationObject = extend(true, {}, computedData[pageGroupKey].variationData[variationKey]);

				return selfChosenVariationModule.getData(config, sqlReportData, variationObj, pageGroupObj)
					.then(function(chosenVariationData) {
						const isValidVariationData = !!(chosenVariationData && Object.keys(chosenVariationData).length);
						let revenue, clicks, pageViews;

						if (!isValidVariationData) { return computedData; }

						computedVariationObject.dayWisePageViews = extend(true, {}, chosenVariationData.dayWisePageViews) || 0;
						computedVariationObject.days = extend(true, {}, chosenVariationData.days) || {};

						computedVariationObject.click = Number(chosenVariationData.click);
						computedVariationObject.impression = Number(chosenVariationData.impression);
						computedVariationObject.revenue = Number((chosenVariationData.revenue / 1000).toFixed(2));
						computedVariationObject.ctr = 0;
						computedVariationObject.pageViews = Number(chosenVariationData.pageViews);

						revenue = computedVariationObject.revenue;
						clicks = computedVariationObject.click;
						pageViews = computedVariationObject.pageViews;

						computedVariationObject.pageRPM = Number((revenue / pageViews * 1000).toFixed(2));
						computedVariationObject.pageCTR = Number((clicks / pageViews * 100).toFixed(2));

						computedVariationObject.pageRPM = (computedVariationObject.pageRPM && computedVariationObject.pageRPM !== Infinity) ? computedVariationObject.pageRPM : 0;
						computedVariationObject.pageCTR = (computedVariationObject.pageCTR && computedVariationObject.pageCTR !== Infinity) ? computedVariationObject.pageCTR : 0;

						// Set back computed variation object in its original hierarchy
						computedData[pageGroupKey].variationData[variationKey] = extend(true, {}, computedVariationObject);

						return computedData;
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
		var computedData = extend(true, {}, pageGroupData),
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

			_.forOwn(pageGroupObj.variations, function(variationObj) {
				_.forEach(variationObj.zones, function(zonesObj) {
					currentDate = moment(zonesObj.date).valueOf();

					currentComputedObj.revenue = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(zonesObj.revenue)]]
					};
					datesObj.revenue[currentDate] = currentComputedObj.revenue.name;

					currentComputedObj.pageviews = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(zonesObj.pageViews || variationObj.dayWisePageViews[zonesObj.date])]]
					};
					datesObj.pageviews[currentDate] = currentComputedObj.pageviews.name;

					currentComputedObj.clicks = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(zonesObj.click)]]
					};
					datesObj.clicks[currentDate] = currentComputedObj.clicks.name;

					currentComputedObj.pagerpm = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(zonesObj.pageRPM || variationObj.pageRPM)]]
					};
					datesObj.pagerpm[currentDate] = currentComputedObj.pagerpm.name;

					currentComputedObj.pagectr = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(zonesObj.pageCTR || variationObj.pageCTR)]]
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
	setVariationsTabularData: function(localeCode, pageGroupData) {
		var computedData = extend(true, {}, pageGroupData),
			constants = localizedData[localeCode];

		_.forOwn(computedData, function(pageGroupObj, pageGroupKey) {
			var variationsTabularData = {
				table: {
					header: [' ', constants.DATA_TABLE.COMMON.NAME, constants.DATA_TABLE.VARIATIONS.HEADER.TRAFFIC_DISTRIBUTION, constants.DATA_TABLE.COMMON.REVENUE, constants.DATA_TABLE.COMMON.IMPRESSIONS, constants.DATA_TABLE.COMMON.PAGE_VIEWS, constants.DATA_TABLE.COMMON.CLICKS, constants.DATA_TABLE.COMMON.PAGE_RPM, constants.DATA_TABLE.COMMON.PAGE_CTR, constants.DATA_TABLE.VARIATIONS.HEADER.REVENUE_CONTRIBUTION],
					rows: [],
					footer: [' ', constants.DATA_TABLE.COMMON.TOTAL, 0, 0, 0, 0, 0, 0, 0, 0]
				}
			}, footerMetrics = {
				revenue: 0,
				impressions: 0,
				pageViews: 0,
				clicks: 0,
				pageRPM: 0,
				pageCTR: 0
			};
			
			_.forOwn(pageGroupObj.variations, function(variationObj) {
				var rowItem = [];

				rowItem[0] = ' ';
				rowItem[1] = variationObj.name;
				rowItem[2] = variationObj.trafficDistribution;
				variationsTabularData.table.footer[2] += Number(variationObj.trafficDistribution);

				rowItem[3] = variationObj.revenue;
				footerMetrics.revenue += Number(variationObj.revenue);
				
				rowItem[4] = variationObj.impression;
				footerMetrics.impressions += Number(variationObj.impression);

				rowItem[5] = variationObj.pageViews;
				footerMetrics.pageViews += Number(variationObj.pageViews);

				rowItem[6] = variationObj.click;
				footerMetrics.clicks += Number(variationObj.click);

				rowItem[7] = variationObj.pageRPM;
				rowItem[8] = variationObj.pageCTR;

				rowItem[9] = (variationObj.revenue);
				variationsTabularData.table.footer[9] += Number(rowItem[9]);

				variationsTabularData.table.rows.push(rowItem);
			});

			// Iterate over rows and set Revenue Contribution for each item
			_.forEach(variationsTabularData.table.rows, (rowItem, rowItemIndex) => {
				const variationRevenue = variationsTabularData.table.rows[rowItemIndex][9];

				variationsTabularData.table.rows[rowItemIndex][9] = Math.round((variationRevenue / variationsTabularData.table.footer[9]) * 100);
			});

			// Explicitly set total revenue contribution value
			variationsTabularData.table.footer[9] = 100;

			// Round of metrics to 2 decimal places
			footerMetrics.revenue = Number((footerMetrics.revenue).toFixed(2));
			// Calculate footer pageRPM
			footerMetrics.pageRPM  = Number((footerMetrics.revenue / footerMetrics.pageViews * 1000).toFixed(2));
			footerMetrics.pageRPM = (footerMetrics.pageRPM && (footerMetrics.pageRPM !== Infinity)) ? footerMetrics.pageRPM : 0;

			// Calculate footer pageCTR
			footerMetrics.pageCTR = Number((footerMetrics.clicks / footerMetrics.pageViews * 100).toFixed(2));
			footerMetrics.pageCTR = (footerMetrics.pageCTR && (footerMetrics.pageCTR !== Infinity)) ? footerMetrics.pageCTR : 0;

			variationsTabularData.table.footer[3] = footerMetrics.revenue;
			variationsTabularData.table.footer[4] = footerMetrics.impressions;
			variationsTabularData.table.footer[5] = footerMetrics.pageViews;
			variationsTabularData.table.footer[6] = footerMetrics.clicks;
			variationsTabularData.table.footer[7] = footerMetrics.pageRPM;
			variationsTabularData.table.footer[8] = footerMetrics.pageCTR;

			computedData[pageGroupKey].variations.data = extend(true, {}, variationsTabularData);
		});

		return computedData;
	}
};
