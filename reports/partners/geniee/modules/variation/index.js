var _ = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	pageViewsModule = require('../../../../default/apex/pageGroupVariationRPM/modules/pageViews/index'),
	utils = require('../utils/index');

module.exports = {
	setVariationMetrics: function(config, pageGroupData) {
		var computedData = extend(true, {}, pageGroupData);

		return Promise.all(_.map(pageGroupData, function(pageGroupObj, pageGroupKey) {
			return Promise.all(_.map(pageGroupObj.variationData, function(variationObj, variationKey) {
				computedData[pageGroupKey].variationData[variationKey] = extend(true, {}, variationObj, { 'click': 0, 'impression': 0, 'revenue': 0.0, 'ctr': 0.0, "pageViews": 0, "pageRPM": 0.0, "pageCTR": 0.0 });

				return Promise.all(_.map(variationObj.zones, function(zoneObj) {
					var pageViewsReportConfig = {
						siteId: config.siteId,
						startDate: (config.dateFrom ? moment(config.dateFrom).valueOf() : moment().subtract(31, 'days').valueOf()),
						endDate: (config.dateTo ? moment(config.dateTo).valueOf(): moment().subtract(1, 'days').valueOf()),
						variationKey: variationObj.id,
						platform: pageGroupObj.device,
						pageGroup: pageGroupObj.pageGroup,
						reportType: 'apex',
						step: '1d'
					};

					return pageViewsModule.getTotalCount(pageViewsReportConfig)
						.then(function(pageViews) {
							var revenue, clicks;

							computedData[pageGroupKey].variationData[variationKey].click += Number(zoneObj.click);
							computedData[pageGroupKey].variationData[variationKey].impression += Number(zoneObj.impression);
							computedData[pageGroupKey].variationData[variationKey].revenue += Number(zoneObj.revenue);
							computedData[pageGroupKey].variationData[variationKey].ctr += Number(zoneObj.ctr);

							computedData[pageGroupKey].variationData[variationKey].click = computedData[pageGroupKey].variationData[variationKey].click || 0;
							computedData[pageGroupKey].variationData[variationKey].impression = computedData[pageGroupKey].variationData[variationKey].impression || 0;
							computedData[pageGroupKey].variationData[variationKey].revenue = Number(computedData[pageGroupKey].variationData[variationKey].revenue.toFixed(2)) || 0;
							computedData[pageGroupKey].variationData[variationKey].ctr = Number(computedData[pageGroupKey].variationData[variationKey].ctr.toFixed(2)) || 0;
							computedData[pageGroupKey].variationData[variationKey].pageViews = Number(pageViews) || 0;

							revenue = computedData[pageGroupKey].variationData[variationKey].revenue;
							clicks = computedData[pageGroupKey].variationData[variationKey].click;

							computedData[pageGroupKey].variationData[variationKey].pageRPM = Number((revenue / pageViews * 1000).toFixed(2)) || 0;
							computedData[pageGroupKey].variationData[variationKey].pageCTR = Number((clicks / pageViews * 100).toFixed(2)) || 0;

							return computedData;
						});
				})).then(function() {
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
						data: [[currentDate, Number(variationObj.pageViews)]]
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

			_.forOwn(datesObj.pagectr, function(pagectrData, dateKey) {
				utils.setDateWithEmptyValue(dateKey, 'pagectr', highChartsData.highCharts);
			});

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
