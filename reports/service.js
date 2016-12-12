var rp = require('request-promise'),
    crypto = require('crypto'),
	Promise = require('bluebird'),
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
			currentComputedObj = {}, currentDate;

		_.forOwn(computedData, function(pageGroupObj, pageGroupKey) {
			_.forOwn(pageGroupObj.variations, function(variationObj, variationKey) {
				_.forEach(variationObj.zones, function(zonesObj) {
					currentDate = moment(zonesObj.date).valueOf();

					currentComputedObj.revenue = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(zonesObj.revenue)]]
					};
					// currentComputedObj.pageviews = {
					// 	name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
					// 	data: [[currentDate, 0]],
					// 	tooltip: {valueDecimals: 2}
					// };
					currentComputedObj.clicks = {
						name: (variationObj.name.replace(" ", "-")),
						data: [[currentDate, Number(zonesObj.click)]]
					};
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
					footer: [' ', 0, 0, 0, 0, 0, 0, 0, 0]
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
			currentComputedObj = {}, currentDate;

		_.forOwn(computedData.pageGroups, function(pageGroupObj, pageGroupKey) {
			_.forEach(pageGroupObj.zones, function(zonesObj) {
				currentDate = moment(zonesObj.date).valueOf();

				currentComputedObj.revenue = {
					name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
					data: [[currentDate, Number(zonesObj.revenue)]]
				};
				// currentComputedObj.pageviews = {
				// 	name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
				// 	data: [[currentDate, 0]],
				// 	tooltip: {valueDecimals: 2}
				// };
				currentComputedObj.clicks = {
					name: (pageGroupObj.pageGroup + '-' + pageGroupObj.device),
					data: [[currentDate, Number(zonesObj.click)]]
				};
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

	function setPageGroupsTabularData(data) {
		var computedData = extend(true, {}, data),
			pageGroupsTabularData = {
				table: {
					header: [' ', 'NAME', 'PLATFORM', 'REVENUE', 'IMPRESSIONS', 'PAGE VIEWS', 'CLICKS', 'PAGE RPM', 'PAGE CTR', 'NUMBER OF VARIATIONS'],
					rows: [],
					footer: [' ', ' ', ' ', 0, 0, 0, 0, 0, 0, 0]
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
		url = 'https://beta-aladdin.geniee.jp/beta2/aladdin/adpushup/report/',
		queryParams = _.compact(_.map(_.keys(json), function(key) {
			var value = json[key];

			return (value ? (key + '=' + value) : false);
		})).join("&"),
		nounce = getOauthNonce(),
		ts = new Date().getTime(),
		parameters = {
			dateFrom: json.dateFrom,
			dateTo: json.dateTo,
			oauth_consumer_key: "NDJiOGRmYTJmMGVhMzU1ZQ==",
			oauth_nonce: nounce,
			oauth_signature_method: "HMAC-SHA1",
			oauth_timestamp: ts,
			oauth_version: "1.0",
			mediaId: json.mediaId
		},
		consumerSecret = 'MDc0N2MzMDYzYTQ2NDk5MDUzNzQ0YjIwMTJkY2UzZDA=',
		signature;

		url += '?' + queryParams;
		signature = signatureGenerator(httpMethod, url, parameters, consumerSecret);

		//TODO: Commented out as ADPUSHUP wifi is under maintenance
		// var getData = requestPromise({
		// 		uri: url,
		// 		json: true,
		// 		headers: {
		// 			Authorization: 'oauth_consumer_key="NDJiOGRmYTJmMGVhMzU1ZQ==", oauth_nonce="' + nounce + '", oauth_signature="' + signature + '", oauth_signature_method="HMAC-SHA1", oauth_timestamp="' + ts + '", oauth_version="1.0"',
		// 			'content-type': 'application/json'
		// 		}
		// 	}),
		var getResponseData = Promise.resolve(true).then(function() {
				// This dummy data is for testing purposes only
				// as reports data does not come up for every synced media
				// TODO: Remove this data once integration is complete
				var dummyData = [{"date":"20161108","zones":[{"mediaId":920,"pageGroupId":52,"zoneId":2320,"impression":14619,"click":41,"revenue":146.229601212,"ctr":2.8045693959915,"ecpm":10.002708886518,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":null,"zoneId":2321,"impression":17906,"click":2,"revenue":2.191934844,"ctr":0.11169440411035,"ecpm":0.12241342812465,"deliveryCost":0,"curenncyCode":"JPY","type":0},{"mediaId":920,"pageGroupId":null,"zoneId":2322,"impression":3435,"click":2,"revenue":13.085360244,"ctr":0.58224163027656,"ecpm":3.8094207406114,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":52,"zoneId":2323,"impression":26227,"click":58,"revenue":103.409398872,"ctr":2.2114614710032,"ecpm":3.9428603680177,"deliveryCost":0,"curenncyCode":"JPY","type":0}]},{"date":"20161109","zones":[{"mediaId":920,"pageGroupId":52,"zoneId":2324,"impression":14551,"click":26,"revenue":69.017820336,"ctr":1.7868187753419,"ecpm":4.7431668157515,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":null,"zoneId":2325,"impression":12836,"click":2,"revenue":11.235548772,"ctr":0.15581177937052,"ecpm":0.87531542318479,"deliveryCost":0,"curenncyCode":"JPY","type":0},{"mediaId":920,"pageGroupId":null,"zoneId":2326,"impression":3309,"click":5,"revenue":10.595266776,"ctr":1.5110305228166,"ecpm":3.201954299184,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":52,"zoneId":2327,"impression":26372,"click":44,"revenue":80.181149292,"ctr":1.6684362202336,"ecpm":3.0403894013347,"deliveryCost":0,"curenncyCode":"JPY","type":1}]},{"date":"20161110","zones":[{"mediaId":920,"pageGroupId":52,"zoneId":2328,"impression":15219,"click":23,"revenue":59.830904232,"ctr":1.5112688087259,"ecpm":3.9313295375517,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":null,"zoneId":2329,"impression":8410,"click":1,"revenue":1.198956492,"ctr":0.11890606420927,"ecpm":0.14256319762188,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":null,"zoneId":2330,"impression":2899,"click":5,"revenue":16.526219724,"ctr":1.7247326664367,"ecpm":5.7006622021387,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":52,"zoneId":2331,"impression":28010,"click":44,"revenue":109.315592064,"ctr":1.5708675473045,"ecpm":3.9027344542663,"deliveryCost":0,"curenncyCode":"JPY","type":0}]},{"date":"20161111","zones":[{"mediaId":920,"pageGroupId":52,"zoneId":2332,"impression":13177,"click":27,"revenue":65.939371704,"ctr":2.0490248159672,"ecpm":5.0041262581771,"deliveryCost":0,"curenncyCode":"JPY","type":0},{"mediaId":920,"pageGroupId":null,"zoneId":2333,"impression":8767,"click":6,"revenue":7.992395604,"ctr":0.68438462415878,"ecpm":0.9116454435953,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":null,"zoneId":2334,"impression":2831,"click":8,"revenue":9.663472368,"ctr":2.8258565877782,"ecpm":3.4134483814906,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":52,"zoneId":2335,"impression":24090,"click":39,"revenue":98.822338416,"ctr":1.6189290161893,"ecpm":4.1022141310087,"deliveryCost":0,"curenncyCode":"JPY","type":1}]},{"date":"20161112","zones":[{"mediaId":920,"pageGroupId":52,"zoneId":2336,"impression":13347,"click":19,"revenue":71.834762196,"ctr":1.4235408706076,"ecpm":5.382090521915,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":null,"zoneId":2337,"impression":14950,"click":2,"revenue":3.352371516,"ctr":0.13377926421405,"ecpm":0.2242388973913,"deliveryCost":0,"curenncyCode":"JPY","type":0},{"mediaId":920,"pageGroupId":null,"zoneId":2338,"impression":2574,"click":4,"revenue":5.926465548,"ctr":1.5540015540016,"ecpm":2.3024341678322,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":52,"zoneId":2339,"impression":24801,"click":40,"revenue":130.702620492,"ctr":1.6128381920084,"ecpm":5.2700544531269,"deliveryCost":0,"curenncyCode":"JPY","type":1}]},{"date":"20161113","zones":[{"mediaId":920,"pageGroupId":52,"zoneId":2340,"impression":12610,"click":25,"revenue":51.873749784,"ctr":1.9825535289453,"ecpm":4.1136994277557,"deliveryCost":0,"curenncyCode":"JPY","type":0},{"mediaId":920,"pageGroupId":null,"zoneId":2341,"impression":16581,"click":2,"revenue":3.151136196,"ctr":0.1206199867318,"ecpm":0.19004500307581,"deliveryCost":0,"curenncyCode":"JPY","type":0},{"mediaId":920,"pageGroupId":null,"zoneId":2342,"impression":2294,"click":6,"revenue":4.93674156,"ctr":2.615518744551,"ecpm":2.152023347864,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":52,"zoneId":2343,"impression":23866,"click":47,"revenue":152.06212512,"ctr":1.9693287521998,"ecpm":6.3714960663706,"deliveryCost":0,"curenncyCode":"JPY","type":1}]},{"date":"20161114","zones":[{"mediaId":920,"pageGroupId":52,"zoneId":2344,"impression":1568,"click":4,"revenue":8.417917224,"ctr":2.5510204081633,"ecpm":5.3685696581633,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":null,"zoneId":2345,"impression":1945,"click":0,"revenue":0.213751656,"ctr":0,"ecpm":0.10989802365039,"deliveryCost":0,"curenncyCode":"JPY","type":0},{"mediaId":920,"pageGroupId":null,"zoneId":2346,"impression":231,"click":0,"revenue":1.148383116,"ctr":0,"ecpm":4.9713554805195,"deliveryCost":0,"curenncyCode":"JPY","type":1},{"mediaId":920,"pageGroupId":52,"zoneId":2347,"impression":2194,"click":2,"revenue":4.33738962,"ctr":0.91157702825889,"ecpm":1.9769323701003,"deliveryCost":0,"curenncyCode":"JPY","type":0}]}];

				return dummyData;
			}),
			getFilteredZones = getResponseData.then(removeUnnecessaryZones),
			getSiteMetrics = getFilteredZones.then(getMediaMetrics),
			getChannelMetrics = getFilteredZones.then(getPageGroupMetrics),
			getChannelData = getChannelMetrics.then(getPageGroupDataById);

			return Promise.join(getResponseData, getFilteredZones, getSiteMetrics, getChannelMetrics, getChannelData, function(allZones, filteredZones, siteMetrics, pageGroupMetrics, pageGroupData) {
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
