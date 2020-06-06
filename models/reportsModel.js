var AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
	moment = require('moment'),
	Promise = require('bluebird'),
	{ fileLogger } = require('../helpers/logger/file/index'),
	couchbaseService = require('./../helpers/couchBaseService'),
	couchbase = require('couchbase');
	// eslint-disable-next-line no-unused-vars 
	getE3lgIndexArrToSearch = function(startDate, endDate) {
		var newStartDate = startDate,
			newEndDate = endDate,
			e3lgIndexArr = [],
			ts,
			date,
			year,
			month,
			indexName,
			nextMonthDate,
			oneHourAgoTime = Date.now() - 3600000;

		if (newStartDate === null || newStartDate < 1448928000000) {
			newStartDate = 1448928000000;
		}
		// start date cant be less than Dec 2015

		if (newEndDate === null) {
			newEndDate = oneHourAgoTime;
		} else if (newEndDate < newStartDate) {
			newEndDate = newStartDate;
		} else if (newEndDate > oneHourAgoTime) {
			newEndDate = oneHourAgoTime;
		}
		// end date cant be greater than oneHourAgoTime because e3lg index might not be created and error will be thrown

		ts = newStartDate;

		if (ts <= newEndDate) {
			while (ts <= newEndDate) {
				date = new Date(ts);
				year = date.getFullYear();
				month = date.getMonth() + 1 + '';

				if (month.length === 1) {
					month = '0' + month;
				}

				indexName = 'e3lg_' + year + '-' + month;

				e3lgIndexArr.push(indexName);

				nextMonthDate = new Date(date.getFullYear(), date.getMonth() + 1);
				ts = nextMonthDate.getTime();
			}
		}

		return e3lgIndexArr;
	},
	resultIsValid = function(result) {
		if (result._shards.failed === 0 && result.timed_out === false) {
			return true;
		}
		return false;
	},
	prepareControlVsAdpushupCtrSearchQuery = function(config) {
		var siteId = config.siteId,
			startDate = config.startDate ? config.startDate : Date.now() - 2592000000,
			endDate = config.endDate ? config.endDate : Date.now(),
			pageGroup = config.pageGroup,
			platform = config.platform,
			step = config.step ? config.step : '1d',
			b = esqm.createBoolFilter(),
			siteFilter = esqm.createTermFilter('siteId', siteId),
			trackingOnlyFilter = esqm.createTermFilter('tracking', true),
			rangeFilter = esqm.createRangeFilter('createdTs', startDate, endDate),
			pageGroupFilter = null,
			platformFilter = null,
			aggs = {
				DATE_HISTOGRAM_AGGR: {
					date_histogram: { field: 'createdTs', interval: step },
					aggs: {
						AP_IMPRESSION_AGGR: { filter: { term: { 'ads.success': true } } },
						AP_CLICKED_AGGR: { filter: { term: { 'ads.clicked': true } } },
						ACTUAL_CONTROL_AGGR: {
							filter: { bool: { should: [{ term: { finalMode: 2 } }, { term: { finalMode: 4 } }] } },
							aggs: {
								CONTROL_IMPRESSION_AGGR: {
									filter: { range: { finalMode: { gt: 1 } } },
									aggs: { CONTROL_CLICKED_AGGR: { filter: { exists: { field: 'clickTs' } } } }
								}
							}
						}
					}
				}
			},
			q;

		if (pageGroup) {
			pageGroupFilter = esqm.createTermFilter('pageGroup', pageGroup);
		}
		if (platform) {
			platformFilter = esqm.createTermFilter('userAnalytics.platform', platform);
		}

		esqm.addFilterToBoolPath(b, 'must', siteFilter);
		esqm.addFilterToBoolPath(b, 'must', trackingOnlyFilter);
		esqm.addFilterToBoolPath(b, 'must', rangeFilter);

		if (platformFilter) {
			esqm.addFilterToBoolPath(b, 'must', platformFilter);
		}
		if (pageGroupFilter) {
			esqm.addFilterToBoolPath(b, 'must', pageGroupFilter);
		}

		q = esqm.getDefaultQuery(b, aggs, 0);

		return q;
	},
	prepareApexSearchQuery = function(config) {
		var initialStartDate = moment()
				.subtract(7, 'days')
				.startOf('day')
				.valueOf(),
			initialEndDate = moment()
				.subtract(0, 'days')
				.endOf('day')
				.valueOf(),
			siteId = config.siteId,
			variationCount = config.variationCount ? config.variationCount : 100,
			startDate = config.startDate
				? moment(config.startDate, 'x')
						.startOf('day')
						.valueOf()
				: initialStartDate,
			endDate = config.endDate
				? moment(config.endDate, 'x')
						.endOf('day')
						.valueOf()
				: initialEndDate,
			pageGroup = config.pageGroup,
			platform = config.platform,
			b = esqm.createBoolFilter(),
			rangeFilter = esqm.createRangeFilter('createdTs', startDate, endDate),
			timeOnSiteAgg = {
				TIME_ON_SITE: {
					terms: { field: 'userAnalytics.timeOnSite', size: 5, order: { _count: 'desc' } },
					aggs: {}
				}
			},
			aggs = {
				PLATFORM: {
					terms: { field: 'userAnalytics.platform', size: 5, order: { _term: 'desc' } },
					aggs: {
						CHOSEN_VARIATION: {
							terms: { field: 'variationId', size: variationCount, order: { _count: 'desc' } },
							aggs: { ADS_CLICKED: { terms: { field: 'ads.clicked', size: 5 } } }
						}
					}
				}
			},
			esQueryString = config.queryString ? config.queryString : 'tracking:true AND mode:1',
			esQuery = {
				query_string: {
					analyze_wildcard: true,
					query: esQueryString
				}
			},
			q;

		if (config.includeTimeOnSite) {
			aggs.TIME_ON_SITE = timeOnSiteAgg.TIME_ON_SITE;
		}

		esQueryString += pageGroup ? ' AND pageGroup:' + pageGroup : '';
		esQueryString += platform ? ' AND userAnalytics.platform:' + platform : '';
		esQueryString += siteId ? ' AND siteId:' + siteId : '';

		esqm.addFilterToBoolPath(b, 'must', rangeFilter);
		esQuery.query_string.query = esQueryString;
		q = esqm.getDefaultQuery(b, aggs, 0, { query: esQuery });

		return q;
	},
	prepareControlVsAdpushupCtrReport = function(r) {
		if (resultIsValid(r)) {
			var header = [
					'Date',
					'Control PageViews',
					'Control Clicks',
					'Control CTR',
					'AdPushup PageViews',
					'AdPushup Clicks',
					'AdPushup CTR'
				],
				rows = [],
				footer = [],
				key,
				histogramBucket = r.aggregations.DATE_HISTOGRAM_AGGR.buckets,
				apImpressionSum = 0,
				apClickSum = 0,
				controlImpressionSum = 0,
				controlClickSum = 0,
				splice,
				dateRepresentation,
				apImpressions,
				apClicks,
				apCtr,
				controlImpressions,
				controlClicks,
				controlCtr,
				apCtrAvg = 0,
				controlCtrAvg = 0,
				result = {};

			// eslint-disable-next-line guard-for-in
			for (key in histogramBucket) {
				splice = histogramBucket[key];
				dateRepresentation = splice.key_as_string.substring(0, 10);
				apImpressions = splice.AP_IMPRESSION_AGGR.doc_count;
				apClicks = splice.AP_CLICKED_AGGR.doc_count;
				apCtr = 0;

				if (apImpressions !== 0) {
					apCtr = Math.round(apClicks * 100 / apImpressions * 1000) / 1000;
					apImpressionSum += apImpressions;
					apClickSum += apClicks;
				}

				controlImpressions = splice.ACTUAL_CONTROL_AGGR.CONTROL_IMPRESSION_AGGR.doc_count;
				controlClicks = splice.ACTUAL_CONTROL_AGGR.CONTROL_IMPRESSION_AGGR.CONTROL_CLICKED_AGGR.doc_count;
				controlCtr = 0;

				if (controlImpressions !== 0) {
					controlCtr = Math.round(controlClicks * 100 / controlImpressions * 1000) / 1000;
					controlImpressionSum += controlImpressions;
					controlClickSum += controlClicks;
				}

				rows.push([
					dateRepresentation,
					controlImpressions,
					controlClicks,
					controlCtr,
					apImpressions,
					apClicks,
					apCtr
				]);
			}

			if (apImpressionSum !== 0) {
				apCtrAvg = Math.round(apClickSum * 100 / apImpressionSum * 1000) / 1000;
			}
			if (controlImpressionSum !== 0) {
				controlCtrAvg = Math.round(controlClickSum * 100 / controlImpressionSum * 1000) / 1000;
			}

			footer = ['-', controlImpressionSum, controlClickSum, controlCtrAvg, apImpressionSum, apClickSum, apCtrAvg];

			result.header = header;
			result.rows = rows;
			result.footer = footer;

			return result;
		}
		return false;
	},
	prepareControlVsAdpushupPageviewSearchQuery = function(config) {
		var siteId = config.siteId,
			startDate = config.startDate ? config.startDate : Date.now() - 2592000000,
			endDate = config.endDate ? config.endDate : Date.now(),
			pageGroup = config.pageGroup,
			platform = config.platform,
			// step = config.step ? config.step : '1d',
			b = esqm.createBoolFilter(),
			siteFilter = esqm.createTermFilter('siteId', siteId),
			rangeFilter = esqm.createRangeFilter('createdTs', startDate, endDate),
			pageGroupFilter = null,
			platformFilter = null,
			aggs = { FINAL_MODE_AGGR: { terms: { field: 'finalMode', size: 100 } } },
			q;

		if (pageGroup) {
			pageGroupFilter = esqm.createTermFilter('pageGroup', pageGroup);
		}
		if (platform) {
			platformFilter = esqm.createTermFilter('userAnalytics.platform', platform);
		}

		esqm.addFilterToBoolPath(b, 'must', siteFilter);
		esqm.addFilterToBoolPath(b, 'must', rangeFilter);

		if (platformFilter) {
			esqm.addFilterToBoolPath(b, 'must', platformFilter);
		}
		if (pageGroupFilter) {
			esqm.addFilterToBoolPath(b, 'must', pageGroupFilter);
		}

		q = esqm.getDefaultQuery(b, aggs, 0);
		return q;
	},
	prepareControlVsAdpushupPageviewReport = function(r) {
		if (resultIsValid(r)) {
			var header = [
					'miscellaneous',
					'AdPushup PageViews',
					'Control - draftMode',
					'Control - determined',
					'Control - planned',
					'Control - forced',
					'Control - requestFail',
					'Control - e3Fail',
					'Control - noAds',
					'Control - modeDiscrepancy',
					'Control - platformDiscrepancy',
					'Control - apMissing',
					'Control - apDelayed',
					'Control - noIncontentAds',
					'Control - standBy'
				],
				footer = [],
				finalModes = r.aggregations.FINAL_MODE_AGGR.buckets,
				i,
				m,
				key,
				docCount,
				result,
				rows = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]; // 15 items, 0 for miscellaneous, 1 for ap,  2-14 for control modes

			for (i = 0; i < finalModes.length; i++) {
				m = finalModes[i];
				key = m.key;
				docCount = m.doc_count;
				if (key < 15) {
					rows[0][key] = docCount;
				}
			}

			footer = new Array(15);
			footer.fill('-');
			result = { header: header, rows: rows, footer: footer };
			return result;
		}
		return false;
	},
	getPageViewsFromApexReport = reportData => {
		return Promise.resolve(reportData).then(reportData => {
			if (resultIsValid(reportData)) {
				const result = {
					tracked: {
						totalPageViews: parseInt(reportData.hits.total, 10)
					}
				};

				return result;
			}

			return false;
		});
	},
	prepareApexReport = function(r) {
		if (resultIsValid(r)) {
			return Promise.resolve(r).then(r => {
				var header = ['Variation', 'CTR (PERFORMANCE %)', 'Traffic (%)'],
					footer = new Array(3),
					variationRegex = /[\w]{8}_[\w]{4}_[\w]{4}_[\w]{4}_[\w]{12}/,
					rows = [],
					trackedData = {},
					platformArr = r.aggregations.PLATFORM.buckets,
					rowItem,
					result,
					chosenVariationArr,
					adsClickedArr;

				platformArr.forEach(function(chosenVariation) {
					chosenVariationArr = chosenVariation.CHOSEN_VARIATION.buckets;

					chosenVariationArr.forEach(function(chosenVariationItem) {
						var variationName,
							pageViews,
							adClicks,
							ctr,
							traffic,
							trackedDataItem = {};
						rowItem = new Array(3);
						adsClickedArr = chosenVariationItem.ADS_CLICKED.buckets;

						// Return if variation key is not a manipulated UUID (- replaced with _)
						if (!variationRegex.test(chosenVariationItem.key)) {
							return true;
						}

						// Variation Name value
						//NOTE: Replacement of '_' as '-' due to Elastic Search default analyzer dash split issue
						variationName = chosenVariationItem.key.replace(/_/g, '-');
						// Traffic value
						traffic = 0;
						// Page Views value
						pageViews = chosenVariationItem.doc_count;
						// Ad Clicks value
						adClicks = adsClickedArr[0].doc_count;
						// CTR value
						ctr = Number((adClicks / pageViews * 100).toFixed(2));

						rowItem[0] = variationName;
						rowItem[1] = ctr;
						rowItem[2] = traffic;

						rows.push(rowItem);

						trackedDataItem.pageViews = pageViews;
						trackedDataItem.adClicks = adClicks;

						trackedData[ctr] = trackedDataItem;
					});
				});

				footer.fill(' ');
				trackedData.totalPageViews = parseInt(r.hits.total, 10);

				result = { header: header, rows: rows, footer: footer, tracked: trackedData };
				return result;
			});
		}

		return Promise.resolve(false);
	},
	prepareEditorStatsSearchQuery = function(config) {
		var siteId = config.siteId,
			startDate = config.startDate ? config.startDate : Date.now() - 2592000000,
			endDate = config.endDate ? config.endDate : Date.now(),
			pageGroup = config.pageGroup,
			platform = config.platform,
			b = esqm.createBoolFilter(),
			siteFilter = esqm.createTermFilter('siteId', siteId),
			trackingOnlyFilter = esqm.createTermFilter('tracking', true),
			rangeFilter = esqm.createRangeFilter('createdTs', startDate, endDate),
			pageGroupFilter = null,
			platformFilter = null,
			aggs = {
				PLATFORMS: {
					terms: { field: 'userAnalytics.platform', size: 3 },
					aggs: {
						PAGEGROUPS: {
							terms: { field: 'pageGroup', size: 15 },
							aggs: {
								NESTED: {
									nested: { path: 'ads' },
									aggs: {
										STRUCTURED_ADS: {
											filter: { term: { 'ads.sectionType': 1 } },
											aggs: {
												SECTIONS: {
													terms: { field: 'ads.sectionMd5', size: 50 },
													aggs: {
														VARIATIONS: {
															terms: { field: 'ads.variationName', size: 50 },
															aggs: {
																IMPRESSIONS: {
																	filter: { term: { 'ads.success': true } }
																},
																CLICKS: { filter: { term: { 'ads.clicked': true } } },
																ACTIVE_VIEWS: {
																	filter: { exists: { field: 'ads.activeView' } }
																}
															}
														}
													}
												}
											}
										},
										INCONTENT_ADS: {
											filter: { term: { 'ads.sectionType': 2 } },
											aggs: {
												IMPRESSIONS: { filter: { term: { 'ads.success': true } } },
												CLICKS: { filter: { term: { 'ads.clicked': true } } },
												ACTIVE_VIEWS: { filter: { term: { 'ads.activeView': true } } }
											}
										}
									}
								}
							}
						}
					}
				}
			},
			q;

		if (pageGroup) {
			pageGroupFilter = esqm.createTermFilter('pageGroup', pageGroup);
		}
		if (platform) {
			platformFilter = esqm.createTermFilter('userAnalytics.platform', platform);
		}

		esqm.addFilterToBoolPath(b, 'must', siteFilter);
		esqm.addFilterToBoolPath(b, 'must', trackingOnlyFilter);
		esqm.addFilterToBoolPath(b, 'must', rangeFilter);

		if (platformFilter) {
			esqm.addFilterToBoolPath(b, 'must', platformFilter);
		}
		if (pageGroupFilter) {
			esqm.addFilterToBoolPath(b, 'must', pageGroupFilter);
		}

		q = esqm.getDefaultQuery(b, aggs, 0);
		return q;
	},
	prepareEditorStatsReport = function(r) {
		if (resultIsValid(r)) {
			var returnable = {
					took: r.took,
					_shards: r._shards,
					platforms: {}
				},
				platformAggregationBuckets = r.aggregations.PLATFORMS.buckets,
				platformBucket,
				platform,
				platformFill,
				pageGroupBuckets;

			for (i in platformAggregationBuckets) {
				var platformBucket = platformAggregationBuckets[i];
				var platform = platformBucket.key;

				var platformFill = { doc_count: platformBucket.doc_count, pageGroups: {} };

				var pageGroupBuckets = platformBucket.PAGEGROUPS.buckets;
				for (ii in pageGroupBuckets) {
					var pageGroupBucket = pageGroupBuckets[ii];
					var pageGroup = pageGroupBucket.key;

					var adNestedAggregation = pageGroupBucket.NESTED;

					var incontentDocCount = adNestedAggregation.INCONTENT_ADS.doc_count;
					var incontentImpressions = adNestedAggregation.INCONTENT_ADS.IMPRESSIONS.doc_count;
					var incontentClicks = adNestedAggregation.INCONTENT_ADS.CLICKS.doc_count;
					var incontentActiveViews = adNestedAggregation.INCONTENT_ADS.ACTIVE_VIEWS.doc_count;

					var incontentFill = {
						doc_count: incontentDocCount,
						impressions: incontentImpressions,
						clicks: incontentClicks,
						active_views: incontentActiveViews
					};

					var structuredAggregationBuckets = adNestedAggregation.STRUCTURED_ADS.SECTIONS.buckets;

					var structuredFill = {};

					for (iii in structuredAggregationBuckets) {
						var sectionBucket = structuredAggregationBuckets[iii];
						var section = sectionBucket.key;
						var sectionDocCount = sectionBucket.doc_count;
						var sectionFill = {
							doc_count: sectionDocCount,
							impressions: 0,
							clicks: 0,
							active_views: 0,
							variations: {}
						};

						var variationBuckets = sectionBucket.VARIATIONS.buckets;
						for (iiii in variationBuckets) {
							var variationBucket = variationBuckets[iiii];
							var variation = variationBucket.key;
							var variationDocCount = variationBucket.doc_count;
							var variationImpressions = variationBucket.IMPRESSIONS.doc_count;
							var variationClicks = variationBucket.CLICKS.doc_count;
							var variationActiveViews = variationBucket.ACTIVE_VIEWS.doc_count;

							var variationFill = {
								doc_count: variationDocCount,
								impressions: variationImpressions,
								clicks: variationClicks,
								active_views: variationActiveViews
							};

							sectionFill.variations[variation] = variationFill;
							sectionFill.impressions += variationImpressions;
							sectionFill.clicks += variationClicks;
							sectionFill.active_views += variationActiveViews;
						}

						structuredFill[section] = sectionFill;
					}

					nestedAdDocCount = adNestedAggregation.doc_count;

					platformFill.pageGroups[pageGroup] = {
						doc_count: pageGroupBucket.doc_count,
						ad_count: nestedAdDocCount,
						incontent: incontentFill,
						structured: structuredFill
					};
				}

				returnable['platforms'][platform] = platformFill;
			}

			return returnable;
		}
		return false;
	},
	success = function(data) {
		return {
			success: true,
			data: data
		};
	},
	fail = function(msg) {
		return {
			success: false,
			msg: msg
		};
	},
	getESSearchResult = function(config) {
		return es
			.search(config.indexes, config.logName, config.queryBody)
			.then(function(result) {
				return Promise.resolve(result);
			})
			.catch(function(err) {
				return Promise.resolve(err.toString());
			});
	},
	performEsSearch = function(config) {
		var defaultConfig = {
			indexes: 'ap_stats_new',
			logName: 'e3lg',
			queryBody: config.queryBody,
			reportType: config.reportType
		};

		// utils.logError(config.queryBody);
		return es
			.search(config.indexes, config.logName, config.queryBody)
			.then(config.reportType)
			.then(reportData => {
				return reportData ? success(reportData) : performEsSearch(defaultConfig);
			})
			.catch(function() {
				if (config.indexes === 'ap_stats_new') {
					throw new AdPushupError(fail('Some error loading reports'));
				}

				return performEsSearch(defaultConfig);
			});
	};

module.exports = {
	doESSearch: function(config) {
		return getESSearchResult(config);
	},
	controlVsAdpushupCtrReport: function(config) {
		var queryBody = prepareControlVsAdpushupCtrSearchQuery(config),
			esSearchConfig = {
				indexes: getE3lgIndexArrToSearch(parseInt(config.startDate, 10), parseInt(config.endDate, 10)),
				logName: 'e3lg',
				queryBody: queryBody,
				reportType: prepareControlVsAdpushupCtrReport
			};

		return performEsSearch(esSearchConfig);
	},

	apexReport: function(config) {
		var queryBody = prepareApexSearchQuery(config),
			esSearchConfig = {
				indexes: 'ex_stats_new',
				logName: 'exlg',
				queryBody: queryBody,
				reportType: config.getOnlyPageViews ? getPageViewsFromApexReport : prepareApexReport
			};
		// trackedReportData = {"took":20,"timed_out":false,"_shards":{"total":12,"successful":12,"failed":0},"hits":{"total":23764,"max_score":0,"hits":[]},"aggregations":{"PLATFORM":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"DESKTOP","doc_count":23764,"CHOSEN_VARIATION":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"6ba336d4-8ab1-4cc4-a833-c06225f3ff73","doc_count":12065,"ADS_CLICKED":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"6ba336d4-8ab1-4cc4-a833-c06225f3ff73","key_as_string":"true","doc_count":121}]}},{"key":"2712dd32-a8b3-416b-9498-ab76ccc8ede0","doc_count":11699,"ADS_CLICKED":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"2712dd32-a8b3-416b-9498-ab76ccc8ede0","key_as_string":"true","doc_count":169}]}}]}}]},"TIME_ON_SITE":{"doc_count_error_upper_bound":36,"sum_other_doc_count":10663,"buckets":[{"key":2001,"doc_count":2705},{"key":2002,"doc_count":1916},{"key":6003,"doc_count":744},{"key":2000,"doc_count":607},{"key":6002,"doc_count":597}]}},"level":"error","message":"","timestamp":"2016-10-05T12:18:10.194Z"},
		// untrackedReportData = {"took":32,"timed_out":false,"_shards":{"total":12,"successful":12,"failed":0},"hits":{"total":17132,"max_score":0,"hits":[]},"aggregations":{"PLATFORM":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"DESKTOP","doc_count":17132,"CHOSEN_VARIATION":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"6ba336d4-8ab1-4cc4-a833-c06225f3ff73","doc_count":17132,"ADS_CLICKED":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"6ba336d4-8ab1-4cc4-a833-c06225f3ff73","key_as_string":"true","doc_count":169}]}}]}},{"key":"DESKTOP","doc_count":33985,"CHOSEN_VARIATION":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"2712dd32-a8b3-416b-9498-ab76ccc8ede0","doc_count":33985,"ADS_CLICKED":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"2712dd32-a8b3-416b-9498-ab76ccc8ede0","key_as_string":"true","doc_count":540}]}}]}}]},"TIME_ON_SITE":{"doc_count_error_upper_bound":29,"sum_other_doc_count":8762,"buckets":[{"key":2001,"doc_count":1386},{"key":2002,"doc_count":1000},{"key":6003,"doc_count":416},{"key":2000,"doc_count":335},{"key":6002,"doc_count":317}]}},"level":"error","message":"","timestamp":"2016-10-05T12:18:11.758Z"},
		// selectedReportData;

		// if (config.queryString) {
		// 	selectedReportData = untrackedReportData;
		// } else {
		// 	selectedReportData = trackedReportData;
		// }

		// return success(prepareApexReport(selectedReportData));
		return performEsSearch(esSearchConfig);
	},

	controlVsAdpushupPageviewsReport: function(config) {
		var queryBody = prepareControlVsAdpushupPageviewSearchQuery(config),
			esSearchConfig = {
				indexes: getE3lgIndexArrToSearch(parseInt(config.startDate, 10), parseInt(config.endDate, 10)),
				logName: 'e3lg',
				queryBody: queryBody,
				reportType: prepareControlVsAdpushupPageviewReport
			};

		return performEsSearch(esSearchConfig);
	},

	editorStatsReport: function(config) {
		var queryBody = prepareEditorStatsSearchQuery(config),
			esSearchConfig = {
				indexes: getE3lgIndexArrToSearch(parseInt(config.startDate, 10), parseInt(config.endDate, 10)),
				logName: 'e3lg',
				queryBody: queryBody,
				reportType: prepareEditorStatsReport
			};
		return performEsSearch(esSearchConfig);
	},
	getSavedReportConfig: function(email) {
		return couchbaseService.connectToAppBucket()
			.then(bucket => bucket.getAsync(`rprt::${email}`))
			.then(result => result.value);
	},
	updateSavedReportConfig: function(reportConfig, email) {
		const dataToUpdate = {...reportConfig, email};
		const query = couchbase.N1qlQuery.fromString(`UPSERT INTO AppBucket (KEY, VALUE) VALUES ("rprt::${email}", ${JSON.stringify(dataToUpdate)})`);
		return couchbaseService.queryViewFromAppBucket(query).then(() => dataToUpdate);
	}
};
