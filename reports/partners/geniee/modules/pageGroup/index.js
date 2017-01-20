var _ = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	channelModel = require('../../../../../models/channelModel.js'),
	utils = require('../utils/index');

module.exports = {
	getPageGroupMetrics: function(data) {
		var computedData = {};

		_.forEach(_.keys(data), function(dateKey) {
			var zonesArr = data[dateKey];

			_.forEach(zonesArr, function(zoneObj, zoneKey) {
				if (zoneObj.pageGroupId) {
					if (!computedData.hasOwnProperty(zoneObj.pageGroupId) && !computedData[zoneObj.pageGroupId]) {
						computedData[zoneObj.pageGroupId] = {
							'click': 0,
							'impression': 0,
							'revenue': 0.0,
							'ctr': 0.0,
							zones: [],
							"pageViews": 0,
							"pageRPM": 0.0,
							"pageCTR": 0.0
						};

						computedData[zoneObj.pageGroupId].click += Number(zoneObj.click);
						computedData[zoneObj.pageGroupId].impression += Number(zoneObj.impression);
						computedData[zoneObj.pageGroupId].revenue += Number(zoneObj.revenue);
						computedData[zoneObj.pageGroupId].ctr += Number(zoneObj.ctr);
						computedData[zoneObj.pageGroupId].zones.push(extend(true, {}, zoneObj, {date: dateKey}));

						computedData[zoneObj.pageGroupId].revenue = Number(computedData[zoneObj.pageGroupId].revenue.toFixed(2));
						computedData[zoneObj.pageGroupId].ctr = Number(computedData[zoneObj.pageGroupId].ctr.toFixed(2));
					} else {
						computedData[zoneObj.pageGroupId].click += Number(zoneObj.click);
						computedData[zoneObj.pageGroupId].impression += Number(zoneObj.impression);
						computedData[zoneObj.pageGroupId].revenue += Number(zoneObj.revenue);
						computedData[zoneObj.pageGroupId].ctr += Number(zoneObj.ctr);
						computedData[zoneObj.pageGroupId].zones.push(extend(true, {}, zoneObj, {date: dateKey}));

						computedData[zoneObj.pageGroupId].revenue = Number(computedData[zoneObj.pageGroupId].revenue.toFixed(2));
						computedData[zoneObj.pageGroupId].ctr = Number(computedData[zoneObj.pageGroupId].ctr.toFixed(2));
					}
				}
			});
		});

		return computedData;
	},
	updateMetrics: function(reportData) {
		var computedData = extend(true, {}, reportData),
			dataStr = 'data';

		_.forOwn(reportData.pageGroups, function(pageGroupObj, pageGroupKey) {
			if (pageGroupKey === dataStr) { return false; }

			computedData.pageGroups[pageGroupKey] = extend(true, {}, computedData.pageGroups[pageGroupKey], { 'click': 0, 'impression': 0, 'revenue': 0.0, 'ctr': 0.0, "pageViews": 0, "pageRPM": 0.0, "pageCTR": 0.0 });

			_.forOwn(pageGroupObj.variations, function(variationObj, variationKey) {
				if (variationKey === dataStr) { return false; }

				computedData.pageGroups[pageGroupKey].click += Number(variationObj.click);
				computedData.pageGroups[pageGroupKey].impression += Number(variationObj.impression);
				computedData.pageGroups[pageGroupKey].revenue += Number(variationObj.revenue);
				computedData.pageGroups[pageGroupKey].ctr += Number(variationObj.ctr);
				computedData.pageGroups[pageGroupKey].pageViews += Number(variationObj.pageViews);
				computedData.pageGroups[pageGroupKey].pageRPM += Number(variationObj.pageRPM);
				computedData.pageGroups[pageGroupKey].pageCTR += Number(variationObj.pageCTR);
			});

			computedData.pageGroups[pageGroupKey].revenue = Number(computedData.pageGroups[pageGroupKey].revenue.toFixed(2));
			computedData.pageGroups[pageGroupKey].ctr = Number(computedData.pageGroups[pageGroupKey].ctr.toFixed(2));
			computedData.pageGroups[pageGroupKey].pageRPM = Number(computedData.pageGroups[pageGroupKey].pageRPM.toFixed(2));
			computedData.pageGroups[pageGroupKey].pageCTR = Number(computedData.pageGroups[pageGroupKey].pageCTR.toFixed(2));
		});

		return Promise.resolve(computedData);
	},
	getPageGroupDataById: function(data) {
		var allPageGroupsData = _.map(_.keys(data), function(channelKey) {
			return channelModel.getPageGroupById({id: channelKey, viewName: 'channelByGenieePageGroupId', isExtendedParams: true})
				.then(function(channelData) {
					var computedData = {};

					computedData[channelKey] = channelData;
					return computedData;
				});
		});

		return Promise.all(allPageGroupsData);
	},
	updatePageGroupData: function(pageGroupData, pageGroupMetrics) {
		var computedData = extend(true, {}, pageGroupMetrics);

		_.forEach(pageGroupData, function(pageGroupDataObj) {
			var pageGroupKey = _.keys(pageGroupDataObj)[0];

			computedData[pageGroupKey] = extend(true, {}, pageGroupMetrics[pageGroupKey], pageGroupDataObj[pageGroupKey]);
		});

		return Promise.resolve(computedData);
	},
	setPageGroupsHighChartsData: function(data) {
		var self = this,
			computedData = extend(true, {}, data),
			highChartsData = {
				highCharts: {
					revenue: [],
					pageviews: [],
					clicks: [],
					pagerpm: [],
					pagectr: []
				}
			},
			datesObj = {
				revenue: {},
				pageviews: {},
				clicks: {},
				pagerpm: {},
				pagectr: {}
			},
			currentComputedObj = {}, currentDate;

		_.forOwn(computedData.pageGroups, function(pageGroupObj, pageGroupKey) {
			_.forEach(pageGroupObj.zones, function(zonesObj) {
				currentDate = moment(zonesObj.date).valueOf();

				currentComputedObj.revenue = {
					name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
					data: [[currentDate, Number(zonesObj.revenue)]]
				};
				datesObj.revenue[currentDate] = currentComputedObj.revenue.name;
				// currentComputedObj.pageviews = {
				// 	name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
				// 	data: [[currentDate, 0]],
				// 	tooltip: {valueDecimals: 2}
				// };
				currentComputedObj.clicks = {
					name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
					data: [[currentDate, Number(zonesObj.click)]]
				};
				datesObj.clicks[currentDate] = currentComputedObj.clicks.name;
				// currentComputedObj.pagerpm = {
				// 	name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
				// 	data: [[currentDate, 0]],
				// 	tooltip: {valueDecimals: 2}
				// };
				// currentComputedObj.pagectr = {
				// 	name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
				// 	data: [[currentDate, 0]],
				// 	tooltip: {valueDecimals: 2}
				// };

				utils.setHighChartsData(currentDate, 'revenue', highChartsData.highCharts, currentComputedObj);
				utils.setHighChartsData(currentDate, 'clicks', highChartsData.highCharts, currentComputedObj);
			});
		});

		// Add date with empty values
		_.forOwn(datesObj.revenue, function(revenueData, dateKey) {
			utils.setDateWithEmptyValue(dateKey, 'revenue', highChartsData.highCharts);
		});

		_.forOwn(datesObj.clicks, function(clicksData, dateKey) {
			utils.setDateWithEmptyValue(dateKey, 'clicks', highChartsData.highCharts);
		});

		computedData.pageGroups.data = extend(true, computedData.pageGroups.data, highChartsData);

		return Promise.resolve(computedData);
	},
	setPageGroupsTabularData: function(data) {
		var computedData = extend(true, {}, data),
			pageGroupsTabularData = {
				table: {
					header: [' ', 'NAME', 'PLATFORM', 'REVENUE', 'IMPRESSIONS', 'PAGE VIEWS', 'CLICKS', 'PAGE RPM', 'PAGE CTR', 'NUMBER OF VARIATIONS'],
					rows: [],
					footer: ['TOTAL', ' ', ' ', 0, 0, 0, 0, 0, 0, 0]
				}
			};

		_.forOwn(computedData.pageGroups, function(pageGroupObj, pageGroupKey) {
			var rowItem = [];

			rowItem[0] = ' ';
			rowItem[1] = pageGroupObj.pageGroup;
			rowItem[2] = pageGroupObj.device;

			rowItem[3] = pageGroupObj.revenue;
			pageGroupsTabularData.table.footer[3] += Number(pageGroupObj.revenue);

			rowItem[4] = pageGroupObj.impression;
			pageGroupsTabularData.table.footer[4] += Number(pageGroupObj.impression);
			
			rowItem[5] = pageGroupObj.pageViews;
			pageGroupsTabularData.table.footer[5] += Number(pageGroupObj.pageViews);
			
			rowItem[6] = pageGroupObj.click;
			pageGroupsTabularData.table.footer[6] += Number(pageGroupObj.click);
			
			rowItem[7] = pageGroupObj.pageRPM;
			pageGroupsTabularData.table.footer[7] += Number(pageGroupObj.pageRPM);
			
			rowItem[8] = pageGroupObj.pageCTR;
			pageGroupsTabularData.table.footer[8] += Number(pageGroupObj.pageCTR);
			
			rowItem[9] = _.keys(pageGroupObj.variationData).length;
			pageGroupsTabularData.table.footer[9] += Number(rowItem[9]);

			pageGroupsTabularData.table.rows.push(rowItem);
		});

		computedData.pageGroups.data = extend(true, {}, pageGroupsTabularData);

		return Promise.resolve(computedData);
	}
};
