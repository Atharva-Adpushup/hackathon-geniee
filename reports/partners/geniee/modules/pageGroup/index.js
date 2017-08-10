var _ = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	Promise = require('bluebird'),
	channelModel = require('../../../../../models/channelModel.js'),
	utils = require('../utils/index'),
	AdPushupError = require('../../../../../helpers/AdPushupError');
const localizedData = require('../../../../../i18n/reports/geniee/constants');

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
			var computedPageGroupObj;

			if (pageGroupKey === dataStr) { return false; }

			// Cache current computed page group object
			computedPageGroupObj = extend(true, {}, computedData.pageGroups[pageGroupKey]);
			computedPageGroupObj = extend(true, {}, computedPageGroupObj, { 'click': 0, 'impression': 0, 'revenue': 0.0, 'pageViews': 0, 'pageRPM': 0.0, 'pageCTR': 0.0, 'dayWisePageViews': {}, 'days': {} });

			_.forOwn(pageGroupObj.variations, function(variationObj, variationKey) {
				if (variationKey === dataStr) { return false; }

				computedPageGroupObj.click += Number(variationObj.click);
				computedPageGroupObj.impression += Number(variationObj.impression);
				computedPageGroupObj.revenue += Number(variationObj.revenue);
				computedPageGroupObj.pageViews += Number(variationObj.pageViews);

				// Set day wise page views for PageGroup
				_.forOwn(variationObj.dayWisePageViews, function(pageViews, dateKey) {
					var doesDateKeyNotPresent = !computedPageGroupObj.dayWisePageViews.hasOwnProperty(dateKey),
						doesDateKeyNotExist = !!(doesDateKeyNotPresent && !computedPageGroupObj.dayWisePageViews[dateKey]);

					if (doesDateKeyNotExist) {
						computedPageGroupObj.dayWisePageViews[dateKey] = pageViews;
					} else {
						computedPageGroupObj.dayWisePageViews[dateKey] += pageViews;
					}
				});

				// Set days wise data for PageGroup
				_.forOwn(variationObj.days, function(dataObject, dateKey) {
					var doesDateKeyNotPresent = !computedPageGroupObj.days.hasOwnProperty(dateKey),
						doesDateKeyNotExist = !!(doesDateKeyNotPresent && !computedPageGroupObj.days[dateKey]);

					// Set metric object as default object if date key does not exist
					if (doesDateKeyNotExist) {
						computedPageGroupObj.days[dateKey] = extend(true, {}, dataObject);
					} else {
						// Increment all metric object values and set incremented data in final metric object
						const metricObject = extend(true, {}, computedPageGroupObj.days[dateKey]);
						{
							let revenue = metricObject.revenue,
								click = metricObject.click,
								impression = metricObject.impression,
								pageViews = metricObject.pageViews,
								revenueComputedValue, pageRPMComputedValue, pageCTRComputedValue;

							click += dataObject.click;
							impression += dataObject.impression;
							pageViews += dataObject.pageViews;

							revenueComputedValue = Number((dataObject.revenue / 1000).toFixed(2));
							revenue = Number((revenue + revenueComputedValue).toFixed(2));

							// Computed current metric value
							pageRPMComputedValue = Number((revenue / pageViews * 1000).toFixed(2));
							// Check for boundary cases and convert accordingly
							pageRPMComputedValue = (pageRPMComputedValue && pageRPMComputedValue !== Infinity) ? pageRPMComputedValue : 0.0;

							pageCTRComputedValue = Number((click / pageViews * 100).toFixed(2));
							pageCTRComputedValue = (pageCTRComputedValue && pageCTRComputedValue !== Infinity) ? pageCTRComputedValue : 0.0;

							// Update cached object
							metricObject.revenue = revenue;
							metricObject.click = click;
							metricObject.impression = impression;
							metricObject.pageViews = pageViews;
							metricObject.pageRPM = pageRPMComputedValue;
							metricObject.pageCTR = pageCTRComputedValue;

							// Assign back computed cached object value to final date object
							computedPageGroupObj.days[dateKey] = extend(true, {}, metricObject);
						}
					}
				});
			});

			// Set Default value if falsy
			computedPageGroupObj.revenue = Number(computedPageGroupObj.revenue.toFixed(2)) || 0;
			computedPageGroupObj.click = computedPageGroupObj.click || 0;
			computedPageGroupObj.impression = computedPageGroupObj.impression || 0;
			computedPageGroupObj.pageViews = computedPageGroupObj.pageViews || 0;
			computedPageGroupObj.pageRPM = Number((computedPageGroupObj.revenue / computedPageGroupObj.pageViews * 1000).toFixed(2)) || 0;
			computedPageGroupObj.pageCTR = Number((computedPageGroupObj.click / computedPageGroupObj.pageViews * 100).toFixed(2)) || 0;

			// Make Page RPM and CTR fail safe
			computedPageGroupObj.pageRPM = (computedPageGroupObj.pageRPM && computedPageGroupObj.pageRPM !== Infinity) ? computedPageGroupObj.pageRPM : 0;
			computedPageGroupObj.pageCTR = (computedPageGroupObj.pageCTR && computedPageGroupObj.pageCTR !== Infinity) ? computedPageGroupObj.pageCTR : 0;

			// Set computed page group object in its original object hierarchy
			computedData.pageGroups[pageGroupKey] = extend(true, {}, computedPageGroupObj);
		});

		return Promise.resolve(computedData);
	},
	transformAllPageGroupsData: (inputChannelData) => {
		const emptyChannelDataStr = 'Channel data should not be empty';
		if (!inputChannelData || !inputChannelData.length) { throw new AdPushupError(emptyChannelDataStr); }

		const computedData = inputChannelData.concat([]);

		return computedData.reduce((accumulatorObject, channelObject) => {
			accumulatorObject[channelObject.channelName] = {
				id: channelObject.id,
				sampleUrl: channelObject.sampleUrl,
				pageGroup: channelObject.pageGroup,
				device: channelObject.platform,
				channelName: channelObject.channelName,
				variations: extend(true, {}, channelObject.variations)
			};

			return accumulatorObject;
		}, {});
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
	updatePageGroupData: function(siteId, sqlReportData, allChannelsData) {
		const pageGroupData = extend(true, {}, sqlReportData[siteId].pageGroups),
			channelKeys = _.keys(pageGroupData),
			computedData = {};

		_.forEach(channelKeys, (channelKey) => {
			const doesChannelKeyMatch = !!(allChannelsData.hasOwnProperty(channelKey) && allChannelsData[channelKey]),
				reportPageGroupObject = extend(true, {}, pageGroupData[channelKey]),
				channelPageGroupObject = extend(true, {}, allChannelsData[channelKey]);

			if (doesChannelKeyMatch) {
				const reportPageGroupVariationKeys = _.keys(reportPageGroupObject.variations);
				//NOTE: A deep extend will also effect source objects, they also extend each other properties
				// reportPageGroupObject will extend channelPageGroupObject properties and vice versa
				computedData[channelKey] = extend(true, reportPageGroupObject, channelPageGroupObject);

				// Iterate over all page group variations and delete the variation which is
				// non-existent in Sql reports variation data, i.e., Only include the variations which
				// are present in both sql report and database channels data
				_.forOwn(channelPageGroupObject.variations, (variationObject, variationKey) => {
					const doesVariationKeyMatch = _.includes(reportPageGroupVariationKeys, variationKey);

					if (!doesVariationKeyMatch) { delete computedData[channelKey].variations[variationKey]; }
				});
			}
		});

		return Promise.resolve(computedData);
	},
	updateZones: function(reportData) {
		var computedData = extend(true, {}, reportData);

		_.forOwn(computedData.pageGroups, function(pageGroupObj, pageGroupKey) {
			var variationZonesArr = [];

			_.forOwn(pageGroupObj.variations, function(variationObj, variationKey) {
				var isDataKey = !!(variationKey === 'data');

				if (isDataKey) { return true; }

				variationZonesArr = variationZonesArr.concat(variationObj.zones);
			});

			computedData.pageGroups[pageGroupKey].zones = variationZonesArr;
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

		_.forOwn(computedData.pageGroups, function(pageGroupObj) {
			const isDaysObject = !!(pageGroupObj && pageGroupObj.days);
			if (!isDaysObject) { return; }

			const dayWiseDataKeys = Object.keys(pageGroupObj.days);
			
			_.forEach(dayWiseDataKeys, function(dateKey) {
				const dayWiseDataObject = pageGroupObj.days[dateKey];

				currentDate = moment(dateKey).valueOf();

				currentComputedObj.revenue = {
					name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
					data: [[currentDate, Number(dayWiseDataObject.revenue)]]
				};
				datesObj.revenue[currentDate] = currentComputedObj.revenue.name;

				currentComputedObj.pageviews = {
					name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
					data: [[currentDate, Number(dayWiseDataObject.pageViews || pageGroupObj.dayWisePageViews[dayWiseDataObject.date])]]
				};
				datesObj.pageviews[currentDate] = currentComputedObj.pageviews.name;

				currentComputedObj.clicks = {
					name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
					data: [[currentDate, Number(dayWiseDataObject.click)]]
				};
				datesObj.clicks[currentDate] = currentComputedObj.clicks.name;

				currentComputedObj.pagerpm = {
					name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
					data: [[currentDate, Number(dayWiseDataObject.pageRPM || pageGroupObj.pageRPM)]]
				};
				datesObj.pagerpm[currentDate] = currentComputedObj.pagerpm.name;

				currentComputedObj.pagectr = {
					name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
					data: [[currentDate, Number(dayWiseDataObject.pageCTR || pageGroupObj.pageCTR)]]
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

		_.forOwn(datesObj.clicks, function(clicksData, dateKey) {
			utils.setDateWithEmptyValue(dateKey, 'clicks', highChartsData.highCharts);
		});

		_.forOwn(datesObj.pageviews, function(pageviewsData, dateKey) {
			utils.setDateWithEmptyValue(dateKey, 'pageviews', highChartsData.highCharts);
		});

		_.forOwn(datesObj.pagerpm, function(pagerpmData, dateKey) {
			utils.setDateWithEmptyValue(dateKey, 'pagerpm', highChartsData.highCharts);
		});
		//highChartsData.highCharts = utils.updatePageRPMHighChartsData(highChartsData.highCharts);

		_.forOwn(datesObj.pagectr, function(pagectrData, dateKey) {
			utils.setDateWithEmptyValue(dateKey, 'pagectr', highChartsData.highCharts);
		});
		//highChartsData.highCharts = utils.updatePageCTRHighChartsData(highChartsData.highCharts);

		computedData.pageGroups.data = extend(true, computedData.pageGroups.data, highChartsData);

		return Promise.resolve(computedData);
	},
	setPageGroupsTabularData: function(localeCode, data) {
		var computedData = extend(true, {}, data),
			constants = localizedData[localeCode],
			pageGroupsTabularData = {
				table: {
					header: [' ', constants.DATA_TABLE.COMMON.NAME, constants.DATA_TABLE.PAGE_GROUPS.HEADER.PLATFORM, constants.DATA_TABLE.COMMON.REVENUE, constants.DATA_TABLE.COMMON.IMPRESSIONS, constants.DATA_TABLE.COMMON.PAGE_VIEWS, constants.DATA_TABLE.COMMON.CLICKS, constants.DATA_TABLE.COMMON.PAGE_RPM, constants.DATA_TABLE.COMMON.PAGE_CTR, constants.DATA_TABLE.PAGE_GROUPS.HEADER.VARIATION_COUNT],
					rows: [],
					footer: [constants.DATA_TABLE.COMMON.TOTAL, ' ', ' ', 0, 0, 0, 0, 0, 0, 0]
				}
			};

		_.forOwn(computedData.pageGroups, function(pageGroupObj, pageGroupKey) {
			var rowItem = [],
				tempVariationsObj = extend(true, {}, pageGroupObj.variations);

			delete tempVariationsObj.data;

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
			rowItem[8] = pageGroupObj.pageCTR;
			
			rowItem[9] = _.keys(tempVariationsObj).length;
			pageGroupsTabularData.table.footer[9] += Number(rowItem[9]);

			pageGroupsTabularData.table.rows.push(rowItem);
		});

		// Round of metrics to 2 decimal places
		pageGroupsTabularData.table.footer[3] = Number((pageGroupsTabularData.table.footer[3]).toFixed(2));
		// Calculate footer pageRPM
		pageGroupsTabularData.table.footer[7] = Number((pageGroupsTabularData.table.footer[3] / pageGroupsTabularData.table.footer[5] * 1000).toFixed(2));
		// Calculate footer pageCTR
		pageGroupsTabularData.table.footer[8] = Number((pageGroupsTabularData.table.footer[6] / pageGroupsTabularData.table.footer[5] * 100).toFixed(2));

		computedData.pageGroups.data = extend(true, {}, pageGroupsTabularData);

		return Promise.resolve(computedData);
	}
};
