var couchbase = require('../../helpers/couchBaseService'),
	ViewQuery = require('couchbase-promises').ViewQuery,
	es = require('../../helpers/elasticSearchService'),
	esqm = require('../../helpers/ElasticsearchQueryMaker'),
	Promise = require('bluebird'),
	resultIsValid, API;

function getSiteQuicks(siteDoc) {
	var quicks = {},
		dateCreatedTs = siteDoc.dateCreated,
		date;

	if (dateCreatedTs !== null) {
		date = new Date(dateCreatedTs);
		quicks.dateCreated = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
	}

	if (siteDoc.apConfigs) {
		quicks.apPerc = siteDoc.apConfigs.adpushupPercentage;
		quicks.apMode = siteDoc.apConfigs.mode;
		quicks.explicitPlatform = siteDoc.apConfigs.explicitPlatform;
	}
	return quicks;
}

function getQuickChannelData(queryResult) {
	var chnls = {},
		i, d, result, platform, pageGroup,
		contentSelector, channelName;

	for (i = 0; i < queryResult.length; i++) {
		result = queryResult[i];
		platform = result.key[1];
		pageGroup = result.key[2];
		contentSelector = result.key[3];
		channelName = result.id;

		d = {};
		d.contentSelector = contentSelector;
		d.id = channelName;

		if (!chnls[platform]) {
			chnls[platform] = {};
		}
		chnls[platform][pageGroup] = d;
	}
	return chnls;
}

function siteWiseFill(config, toFill) {
	var siteId = config.siteId,
		dateStart = config.dateStart,
		dateEnd = config.dateEnd,
		b = esqm.createBoolFilter(),
		q,
		siteFilter = esqm.createTermFilter('siteId', siteId),
		rangeFilter = esqm.createRangeFilter('createdTs', dateStart, dateEnd),
		aggr = { 'PAGE_GROUPS': { 'terms': { 'field': 'pageGroup', 'size': 0 }, 'aggs': { 'PLATFORMS': { 'terms': { 'field': 'userAnalytics.platform', 'size': 0 } } } } };

	esqm.addFilterToBoolPath(b, 'must', siteFilter);
	esqm.addFilterToBoolPath(b, 'must', rangeFilter);

	q = esqm.getDefaultQuery(b, aggr, 0);

	return es.search('ap_stats_new', 'e3lg', q).then(function(result) {
		if (resultIsValid(result)) {
			var totalDocs = result.hits.total,
				i, j, res, pageGroup, d, platformsResult,
				ress, platform, p, pageGroups, pageGroupsResult;

			toFill.siteWise.doc_count = totalDocs;
			pageGroups = {};
			pageGroupsResult = result.aggregations.PAGE_GROUPS.buckets;

			for (i = 0; i < pageGroupsResult.length; i++) {
				res = pageGroupsResult[i];
				pageGroup = res.key;
				d = {};
				d.doc_count = res.doc_count;
				d.perc = Math.round(d.doc_count * 100 * 1000 / totalDocs) / 1000;
				platformsResult = res.PLATFORMS.buckets;

				for (j = 0; j < platformsResult.length; j++) {
					ress = platformsResult[j];
					platform = ress.key;
					p = {};
					p.doc_count = ress.doc_count;
					p.perc = Math.round(p.doc_count * 100 * 1000 / d.doc_count) / 1000;

					d[platform] = p;
				}

				pageGroups[pageGroup] = d;
			}

			toFill.siteWise.pageGroups = pageGroups;

			return true;
		}
		return false;
	});
}

function channelWiseFill(config, toFill) {
	var siteId = config.siteId,
		dateStart = config.dateStart,
		dateEnd = config.dateEnd,
		b = esqm.createBoolFilter(),
		siteFilter = esqm.createTermFilter('siteId', siteId),
		rangeFilter = esqm.createRangeFilter('createdTs', dateStart, dateEnd),
		aggr = { 'TOP_URLS': { 'terms': { 'field': 'urlNormalized', 'size': 15, 'collect_mode': 'breadth_first' } }, 'TOP_BROWSERS': { 'terms': { 'field': 'userAnalytics.apBrowser', 'size': 15, 'collect_mode': 'breadth_first' } }, 'CONTROL_MODES': { 'terms': { 'field': 'finalMode', 'size': 20 } }, 'AP': { 'filter': { 'term': { 'ads.success': true } }, 'aggs': { 'TRACKING': { 'filter': { 'term': { 'tracking': true } }, 'aggs': { 'CLICKS': { 'filter': { 'term': { 'ads.clicked': true } } } } } } }, 'CONTROL': { 'filter': { 'range': { 'finalMode': { 'gt': 1 } } }, 'aggs': { 'TRACKING': { 'filter': { 'term': { 'tracking': true } }, 'aggs': { 'CLICKS': { 'filter': { 'exists': { 'field': 'clickTs' } } } } } } } },
		q = esqm.getDefaultQuery(b, aggr, 0);

	esqm.addFilterToBoolPath(b, 'must', siteFilter);
	esqm.addFilterToBoolPath(b, 'must', rangeFilter);

	if (config.platform !== null && config.platform !== 'ALL') {
		esqm.addFilterToBoolPath(b, 'must', esqm.createTermFilter('userAnalytics.platform', config.platform));
	}
	if (config.pageGroup !== null && config.pageGroup !== 'ALL') {
		esqm.addFilterToBoolPath(b, 'must', esqm.createTermFilter('pageGroup', config.pageGroup));
	}

	return es.search('ap_stats_new', 'e3lg', q).then(function(result) {
		if (resultIsValid(result)) {
			var totalDocs = result.hits.total,
				topBrowsers = result.aggregations.TOP_BROWSERS.buckets,
				apNumbers = {
					'perc': 0,
					'doc_count': 0,
					'TRACKING': {
						'perc': 0,
						'doc_count': 0,
						'CLICKS': {
							'ctr': 0,
							'doc_count': 0
						}
					}
				},
				controlNumbers = {
					'perc': 0,
					'doc_count': 0,
					'TRACKING': {
						'perc': 0,
						'doc_count': 0,
						'CLICKS': {
							'ctr': 0,
							'doc_count': 0
						}
					}
				},
				miscNumbers = {
					'doc_count': 0,
					'perc': 0
				}, apResult, apTrackingResult, apClickResult,
				controlResult, controlTrackingResult, controlClickResult, overallModes,
				topUrls;

			if (totalDocs !== 0) {
				// adding ap results
				apResult = result.aggregations.AP;
				apNumbers.doc_count = apResult.doc_count;
				apNumbers.perc = calcPerc(apNumbers.doc_count, totalDocs);

				if (apNumbers.doc_count !== 0) {
					apTrackingResult = apResult.TRACKING;
					apNumbers.TRACKING.doc_count = apTrackingResult.doc_count;
					apNumbers.TRACKING.perc = calcPerc(apTrackingResult.doc_count, apNumbers.doc_count);

					if (apTrackingResult.doc_count !== 0) {
						apClickResult = apTrackingResult.CLICKS;
						apNumbers.TRACKING.CLICKS.doc_count = apClickResult.doc_count;
						apNumbers.TRACKING.CLICKS.ctr = calcPerc(apClickResult.doc_count, apTrackingResult.doc_count);
					}
				}

				// adding control results
				controlResult = result.aggregations.CONTROL;
				controlNumbers.doc_count = controlResult.doc_count;
				controlNumbers.perc = calcPerc(controlNumbers.doc_count, totalDocs);

				if (controlNumbers.doc_count !== 0) {
					controlTrackingResult = controlResult.TRACKING;
					controlNumbers.TRACKING.doc_count = controlTrackingResult.doc_count;
					controlNumbers.TRACKING.perc = calcPerc(controlTrackingResult.doc_count, controlNumbers.doc_count);

					if (controlTrackingResult.doc_count !== 0) {
						controlClickResult = controlTrackingResult.CLICKS;
						controlNumbers.TRACKING.CLICKS.doc_count = controlClickResult.doc_count;
						controlNumbers.TRACKING.CLICKS.ctr = calcPerc(controlClickResult.doc_count, controlTrackingResult.doc_count);
					}
				}


				miscNumbers.doc_count = totalDocs - (apNumbers.doc_count + controlNumbers.doc_count);
				miscNumbers.perc = calcPerc(miscNumbers.doc_count, totalDocs);
			}

			overallModes = result.aggregations.CONTROL_MODES.buckets;
			topUrls = result.aggregations.TOP_URLS.buckets;

			fillPercentages(overallModes, totalDocs);
			fillPercentages(topUrls, totalDocs);
			fillPercentages(topBrowsers, totalDocs);

			toFill.channelWise.doc_count = totalDocs;
			toFill.channelWise.numbers.ap = apNumbers;
			toFill.channelWise.numbers.control = controlNumbers;
			toFill.channelWise.numbers.misc = miscNumbers;

			toFill.channelWise.topUrls = topUrls;
			toFill.channelWise.topBrowsers = topBrowsers;
			toFill.channelWise.overallModes = overallModes;

			return true;
		}
		return false;
	});
}

function calcPerc(numerator, denominator) {
	return Math.round(numerator * 100 * 1000 / denominator) / 1000;
}

function fillPercentages(arr, total) {
	var i;

	// eslint-disable-next-line guard-for-in
	for (i in arr) {
		arr[i].perc = calcPerc(arr[i].doc_count, total);
	}
}

resultIsValid = function(result) {
	if (result._shards.failed === 0 && result.timed_out === false) {
		return true;
	}
	return false;
};

API = {
	getResult: function(req) {
		var config = req.config,
			appBucket = null, toReturn;

		if (config.dateEnd === null) {
			config.dateEnd = Date.now();
		}

		if (config.dateStart === null) {
			config.dateStart = 1; // beginning of time
		}

		toReturn = {
			config: config,
			siteWise: {},
			channelWise: {
				'numbers': {}
			}
		};

		return couchbase.connectToAppBucket()
			.then(function(bucket) {
				appBucket = bucket;
			})
			// get site quicks
			.then(function() {
				return appBucket.getAsync('site::' + config.siteId, {})
					.then(function(siteDocObj) {
						toReturn.siteWise.siteDoc = getSiteQuicks(siteDocObj.value);
						return true;
					});
			})
			.then(function() {
				var query = ViewQuery.from('ops', 'channelsPerSite').range([config.siteId, null, null], [config.siteId, [], []], true);
				return new Promise(function(resolve, reject) {
					appBucket.query(query, {}, function(err, result) {
						if (err) {
							reject(err);
						}
						toReturn.siteWise.chnls = getQuickChannelData(result);
						resolve(true);
					});
				});
			})
			.then(function() {
				return siteWiseFill(config, toReturn);
			})
			.then(function() {
				return channelWiseFill(config, toReturn);
			})
			.then(function() {
				return { 'response_type': 'good', 'msg': toReturn };
			});
	}
};

module.exports = API;
