var rp = require('request-promise'),
    crypto = require('crypto'),
	Promise = require('bluebird'),
	AdPushupError = require('../helpers/AdPushupError'),
	extend = require('extend'),
	moment = require('moment'),
	channelModel = require('../models/channelModel.js'),
	_ = require('lodash'),
	signatureGenerator = require('../services/genieeAdSyncService/genieeZoneSyncService/signatureGenerator.js');

module.exports = (function(requestPromise, crypto, signatureGenerator) {
    function getOauthNonce() {
        return crypto.randomBytes(32).toString('base64').replace(/[^\w]/g, '');
    }

	function removeUnnecessaryZones(data) {
		var computedData = {};

		_.forEach(data, function(zonesObj, rootKey) {
			var formattedDate = moment(zonesObj.date.toString()).format('YYYY-MM-DD');

			computedData[formattedDate] = _.filter(zonesObj.zones, 'type');
		});

		return Promise.resolve(computedData);
	}

	function getMediaMetrics(data) {
		var computedData = {
			"click": 0,
			"pageViews": 0,
			"pageRPM": 0,
			"pageCTR": 0,
			"revenue": 0.0,
			"ctr": 0.0
		};

		_.forEach(_.keys(data), function(dateKey) {
			var zonesArr = data[dateKey];

			_.forEach(zonesArr, function(zoneObj, zoneKey) {
				computedData.click += Number(zoneObj.click);
				computedData.revenue += Number(zoneObj.revenue);
				computedData.ctr += Number(zoneObj.ctr);
			});
		});

		computedData.revenue = Math.round(computedData.revenue);
		computedData.ctr = Number(computedData.ctr.toFixed(2));

		return computedData;
	}

	function getPageGroupMetrics(data) {
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
							"pageRPM": 0,
							"pageCTR": 0
						};

						computedData[zoneObj.pageGroupId].click += Number(zoneObj.click);
						computedData[zoneObj.pageGroupId].impression += Number(zoneObj.impression);
						computedData[zoneObj.pageGroupId].revenue += Number(zoneObj.revenue);
						computedData[zoneObj.pageGroupId].ctr += Number(zoneObj.ctr);
						computedData[zoneObj.pageGroupId].zones.push(extend(true, {}, zoneObj, {date: dateKey}));

						computedData[zoneObj.pageGroupId].revenue = Math.round(computedData[zoneObj.pageGroupId].revenue);
						computedData[zoneObj.pageGroupId].ctr = Number(computedData[zoneObj.pageGroupId].ctr.toFixed(2));
					} else {
						computedData[zoneObj.pageGroupId].click += Number(zoneObj.click);
						computedData[zoneObj.pageGroupId].impression += Number(zoneObj.impression);
						computedData[zoneObj.pageGroupId].revenue += Number(zoneObj.revenue);
						computedData[zoneObj.pageGroupId].ctr += Number(zoneObj.ctr);
						computedData[zoneObj.pageGroupId].zones.push(extend(true, {}, zoneObj, {date: dateKey}));

						computedData[zoneObj.pageGroupId].revenue = Math.round(computedData[zoneObj.pageGroupId].revenue);
						computedData[zoneObj.pageGroupId].ctr = Number(computedData[zoneObj.pageGroupId].ctr.toFixed(2));
					}
				}
			});
		});

		return computedData;
	}

	function getPageGroupDataById(data) {
		var allPageGroupsData = _.map(_.keys(data), function(channelKey) {
			return channelModel.getPageGroupById({id: channelKey, viewName: 'channelByGenieePageGroupId', isExtendedParams: true})
				.then(function(channelData) {
					var computedData = {};

					computedData[channelKey] = channelData;
					return computedData;
				});
		});

		return Promise.all(allPageGroupsData);
	}

	function updatePageGroupData(pageGroupData, pageGroupMetrics) {
		var computedData = extend(true, {}, pageGroupMetrics);

		_.forEach(pageGroupData, function(pageGroupDataObj) {
			var pageGroupKey = _.keys(pageGroupDataObj)[0];

			computedData[pageGroupKey] = extend(true, {}, pageGroupMetrics[pageGroupKey], pageGroupDataObj[pageGroupKey]);
		});

		return Promise.resolve(computedData);
	}

	function getZoneVariations(pageGroupData) {
		var computedData = extend(true, {}, pageGroupData);

		_.forOwn(pageGroupData, function(pageGroupObj, pageGroupKey) {
			computedData[pageGroupKey].variationData = {};

			_.forEach(pageGroupObj.zones, function(zonesObj) {
				_.forOwn(pageGroupObj.variations, function(variationObj, variationKey) {
					_.forOwn(variationObj.sections, function(sectionObj, sectionKey) {
						_.forOwn(sectionObj.ads, function(adObj, adKey) {
							if (adObj.networkData && _.isObject(adObj.networkData) && adObj.networkData.zoneId) {
								if (zonesObj.zoneId == adObj.networkData.zoneId) {
									if (!computedData[pageGroupKey].variationData.hasOwnProperty(variationKey) && !computedData[pageGroupKey].variationData[variationKey]) {
										computedData[pageGroupKey].variationData[variationKey] = {
											id: variationObj.id,
											name: variationObj.name,
											trafficDistribution: variationObj.trafficDistribution,
											zones: []
										};
										computedData[pageGroupKey].variationData[variationKey].zones.push(zonesObj);
									} else {
										computedData[pageGroupKey].variationData[variationKey].zones.push(zonesObj);
									}
								}
							}
						});
					});
				});
			});
		});

		return Promise.resolve(computedData);
	}

	function setVariationMetrics(pageGroupData) {
		var computedData = extend(true, {}, pageGroupData);

		_.forOwn(pageGroupData, function(pageGroupObj, pageGroupKey) {
			_.forOwn(pageGroupObj.variationData, function(variationObj, variationKey) {
				computedData[pageGroupKey].variationData[variationKey] = extend(true, {}, variationObj, { 'click': 0, 'impression': 0, 'revenue': 0.0, 'ctr': 0.0, "pageViews": 0, "pageRPM": 0, "pageCTR": 0 });

				_.forEach(variationObj.zones, function(zoneObj) {
					computedData[pageGroupKey].variationData[variationKey].click += Number(zoneObj.click);
					computedData[pageGroupKey].variationData[variationKey].impression += Number(zoneObj.impression);
					computedData[pageGroupKey].variationData[variationKey].revenue += Number(zoneObj.revenue);
					computedData[pageGroupKey].variationData[variationKey].ctr += Number(zoneObj.ctr);

					computedData[pageGroupKey].variationData[variationKey].revenue = Math.round(computedData[pageGroupKey].variationData[variationKey].revenue);
					computedData[pageGroupKey].variationData[variationKey].ctr = Number(computedData[pageGroupKey].variationData[variationKey].ctr.toFixed(2));
				});
			});
		});
		
		return computedData;
	}

	function removeRedundantVariationsObj(pageGroupData) {
		var computedData = extend(true, {}, pageGroupData);

		_.forOwn(computedData, function(pageGroupObj, pageGroupKey) {
			computedData[pageGroupKey].variations = extend(true, {}, computedData[pageGroupKey].variationData);
			delete computedData[pageGroupKey].variationData;
		});

		return computedData;
	}

	function setVariationsHighChartsData(pageGroupData) {
		var computedData = extend(true, {}, pageGroupData),
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

		_.forOwn(computedData, function(pageGroupObj, pageGroupKey) {
			_.forOwn(pageGroupObj.variations, function(variationObj, variationKey) {
				_.forEach(variationObj.zones, function(zonesObj) {
					currentDate = moment(zonesObj.date).valueOf();

					currentComputedObj.revenue = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(zonesObj.revenue)]]
					};
					datesObj.revenue[currentDate] = currentComputedObj.revenue.name;
					
					// currentComputedObj.pageviews = {
					// 	name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
					// 	data: [[currentDate, 0]],
					// 	tooltip: {valueDecimals: 2}
					// };
					currentComputedObj.clicks = {
						name: (variationObj.name.replace(" ", "-")),
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

					setHighChartsData(currentDate, 'revenue', highChartsData.highCharts, currentComputedObj);
					setHighChartsData(currentDate, 'clicks', highChartsData.highCharts, currentComputedObj);
				});
			});

			// Add date with empty values
			_.forOwn(datesObj.revenue, function(revenueData, dateKey) {
				setDateWithEmptyValue(dateKey, 'revenue', highChartsData.highCharts);
			});

			_.forOwn(datesObj.clicks, function(clicksData, dateKey) {
				setDateWithEmptyValue(dateKey, 'clicks', highChartsData.highCharts);
			});

			computedData[pageGroupKey].variations.data = extend(true, computedData[pageGroupKey].variations.data, highChartsData);
		});
			
		return Promise.resolve(computedData);
	}

	function setVariationsTabularData(pageGroupData) {
		var computedData = extend(true, {}, pageGroupData),
			variationsTabularData = {
				table: {
					header: ['NAME', 'TRAFFIC DISTRIBUTION', 'REVENUE', 'IMPRESSIONS', 'PAGE VIEWS', 'CLICKS', 'PAGE RPM', 'PAGE CTR', 'REVENUE CONTRIBUTION (%)'],
					rows: [],
					footer: ['TOTAL', 0, 0, 0, 0, 0, 0, 0, 0]
				}
			};

		_.forOwn(computedData, function(pageGroupObj, pageGroupKey) {
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

	function setPageGroupsHighChartsData(data) {
		var computedData = extend(true, {}, data),
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

				setHighChartsData(currentDate, 'revenue', highChartsData.highCharts, currentComputedObj);
				setHighChartsData(currentDate, 'clicks', highChartsData.highCharts, currentComputedObj);
			});
		});

		// Add date with empty values
		_.forOwn(datesObj.revenue, function(revenueData, dateKey) {
			setDateWithEmptyValue(dateKey, 'revenue', highChartsData.highCharts);
		});

		_.forOwn(datesObj.clicks, function(clicksData, dateKey) {
			setDateWithEmptyValue(dateKey, 'clicks', highChartsData.highCharts);
		});
		

		computedData.pageGroups.data = extend(true, computedData.pageGroups.data, highChartsData);

		return Promise.resolve(computedData);
	}

	function setHighChartsData(currentDate, metric, mainObj, computedObj) {
		var collectionIndex = -1,
			collectionDataIndex = -1, computedItem;

		_.forEach(mainObj[metric], function(metricObj, index) {
			if (metricObj.name == computedObj[metric].name) {
				collectionIndex = index;
			}
		});

		if (collectionIndex > -1) {
			computedItem = mainObj[metric][collectionIndex];

			_.forEach(computedItem.data, function(dataArr, idx) {
				if (dataArr.indexOf(currentDate) > -1) {
					collectionDataIndex = idx;
				}
			});

			if (collectionDataIndex > -1) {
				mainObj[metric][collectionIndex].data[collectionDataIndex][1] += computedObj[metric].data[0][1];
			} else {
				mainObj[metric][collectionIndex].data.push(computedObj[metric].data[0]);
			}
		} else {
			mainObj[metric].push(extend(true, {}, computedObj[metric]));
		}
	}

	function setDateWithEmptyValue(date, metric, mainObj) {
		var numericDate = Number(date);

		_.forEach(mainObj[metric], function(metricObj, index) {
			var computedDateIndex = -1;

			_.forEach(metricObj.data, function(dataArr, dateIndex) {
				if (dataArr.indexOf(numericDate) > -1) {
					computedDateIndex = dateIndex;
				}
			});

			if (computedDateIndex == -1) {
				mainObj[metric][index].data.push([numericDate, 0]);
			}
		});
	}

	function setPageGroupsTabularData(data) {
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

	function getReportData(params) {
		var json = {
			"dateFrom": params.dateFrom, //"2016-11-01",
			"dateTo": params.dateTo, //"2016-12-04",
			"mediaId": params.mediaId, //920
			"pageGroupId": params.pageGroupId
		},
		httpMethod = 'GET',
		url = 'https://s.geniee.jp/aladdin/adpushup/report/',
		queryParams = _.compact(_.map(_.keys(json), function(key) {
			var value = json[key];

			return (value ? (key + '=' + value) : false);
		})).join("&"),
		nounce = getOauthNonce(),
		ts = new Date().getTime(),
		parameters = {
			dateFrom: json.dateFrom,
			dateTo: json.dateTo,
			oauth_consumer_key: "ZmJiMGZhNDUwOWI4ZjllOA==",
			oauth_nonce: nounce,
			oauth_signature_method: "HMAC-SHA1",
			oauth_timestamp: ts,
			oauth_version: "1.0",
			mediaId: json.mediaId
		},
		consumerSecret = 'M2IyNjc4ZGU1YWZkZTg2OTIyNzZkMTQyOTE0YmQ4Njk=',
		signature;

		url += '?' + queryParams;
		signature = signatureGenerator(httpMethod, url, parameters, consumerSecret);

		var getResponseData = requestPromise({
				uri: url,
				json: true,
				headers: {
					Authorization: 'oauth_consumer_key="ZmJiMGZhNDUwOWI4ZjllOA==", oauth_nonce="' + nounce + '", oauth_signature="' + signature + '", oauth_signature_method="HMAC-SHA1", oauth_timestamp="' + ts + '", oauth_version="1.0"',
					'content-type': 'application/json'
				}
			}),
			getFilteredZones = getResponseData.then(removeUnnecessaryZones),
			getSiteMetrics = getFilteredZones.then(getMediaMetrics),
			getChannelMetrics = getFilteredZones.then(getPageGroupMetrics),
			getChannelData = getChannelMetrics.then(getPageGroupDataById);

			return Promise.join(getResponseData, getFilteredZones, getSiteMetrics, getChannelMetrics, getChannelData, function(allZones, filteredZones, siteMetrics, pageGroupMetrics, pageGroupData) {
				if (!allZones || !allZones.length) {
					throw new AdPushupError('Zones should not be empty');
				}
				
				return updatePageGroupData(pageGroupData, pageGroupMetrics)
					.then(getZoneVariations)
					.then(setVariationMetrics)
					.then(removeRedundantVariationsObj)
					.then(setVariationsTabularData)
					.then(setVariationsHighChartsData)
					.then(function(updatedPageGroupsAndVariationsData) {
						var computedData = {media: siteMetrics, pageGroups: updatedPageGroupsAndVariationsData};

						return setPageGroupsTabularData(computedData)
							.then(setPageGroupsHighChartsData)
							.then(function(finalComputedData) {
								return Promise.resolve(finalComputedData);
							});
					});
			});
	}

	return {
		getReport: getReportData
	}
	//return getReportData({ dateFrom: '2016-11-01', dateTo: '2016-12-04', mediaId: 920 });

})(rp, crypto, signatureGenerator);
