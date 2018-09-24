const Promise = require('bluebird'),
	_ = require('lodash'),
	moment = require('moment');

const sqlHelper = require('../../reports/default/common/mssql/dbhelper'),
	sendMail = require('../mailService/index');

const config = require('../../configs/config'),
	{ couchbaseService } = require('node-utils'),
	localBucket = couchbaseService(
		`couchbase://${config.couchBase.HOST}`,
		'apLocalBucket',
		config.couchBase.DEFAULT_USER_NAME,
		config.couchBase.DEFAULT_USER_PASSWORD
	);

const logger = require('../../helpers/globalBucketLogger');

const {
	ANAMOLY_PAGE_VIEW_IMPRESSION_XPATH_MISS,
	ANAMOLY_CPM,
	ANAMOLY_DETERMINED_MODE
} = require('../../reports/default/adpTags/constants');

const weekStartDate = moment()
		.subtract(8, 'days')
		.format('YYYY-MM-DD'),
	weekEndDate = moment()
		.subtract(2, 'days')
		.format('YYYY-MM-DD'),
	yesterdayDate = moment()
		.subtract(1, 'days')
		.format('YYYY-MM-DD');

function getAnomalyThresholds() {
	return localBucket
		.getDoc('data::anomaly-thresholds')
		.then(function(obj) {
			return obj.value;
		})
		.catch(function(ex) {
			// Incase threshold config doc missing from apLocalBucket.
			mainLogger(ex);

			let defaultObj = {
				codeRemoved: 80,
				pageView: 20,
				minPageView: 5000,
				xPathMiss: 10,
				minXPathMiss: 100,
				impression: 10,
				minImpression: 2000,
				revenue: 10,
				minRevenue: 10,
				cpm: 20,
				minCpm: 0,
				determinedMode: 10,
				minDeterminedMode: 1000
			};

			logger({
				source: 'AnomalyDetectionService',
				message: 'Using default threshold values',
				details: 'Values used : ' + JSON.stringify(defaultObj),
				type: 1
			});

			return defaultObj;
		});
}

init();

function init() {
	return getAnomalyThresholds()
		.then(getDataSetFromSql)
		.then(prepareAnomalyList)
		.then(raiseSupportTickets)
		.then(writeExecutionLog)
		.catch(mainLogger);
}

function getDataSetFromSql(thresholds) {
	const pVIXInputParameterCollection = [
			{
				name: '__weekStartDate__',
				type: 'Date',
				value: weekStartDate
			},
			{
				name: '__weekEndDate__',
				type: 'Date',
				value: weekEndDate
			},
			{
				name: '__yesterdayDate__',
				type: 'Date',
				value: yesterdayDate
			},
			{
				name: '__codeRemovedThreshold__',
				type: 'INT',
				value: thresholds.codeRemoved
			},
			{
				name: '__pageViewThreshold__',
				type: 'INT',
				value: thresholds.pageView
			},
			{
				name: '__pageViewMinThreshold__',
				type: 'INT',
				value: thresholds.minPageView
			},
			{
				name: '__impressionThreshold__',
				type: 'INT',
				value: thresholds.impression
			},
			{
				name: '__impressionMinThreshold__',
				type: 'INT',
				value: thresholds.minImpression
			},
			{
				name: '__xpathMissThreshold__',
				type: 'INT',
				value: thresholds.xPathMiss
			},
			{
				name: '__xpathMissMinThreshold__',
				type: 'INT',
				value: thresholds.minXPathMiss
			}
		],
		pVIXConfig = {
			inputParameters: pVIXInputParameterCollection.concat([]),
			query: ANAMOLY_PAGE_VIEW_IMPRESSION_XPATH_MISS
		};

	const cpmInputParameterCollection = [
			{
				name: '__weekStartDate__',
				type: 'Date',
				value: weekStartDate
			},
			{
				name: '__weekEndDate__',
				type: 'Date',
				value: weekEndDate
			},
			{
				name: '__yesterdayDate__',
				type: 'Date',
				value: yesterdayDate
			},
			{
				name: '__pageViewMinThreshold__',
				type: 'INT',
				value: thresholds.minPageView
			},
			{
				name: '__cpmThreshold__',
				type: 'INT',
				value: thresholds.cpm
			},
			{
				name: '__cpmMinThreshold__',
				type: 'INT',
				value: thresholds.minCpm
			}
		],
		cpmConfig = {
			inputParameters: cpmInputParameterCollection.concat([]),
			query: ANAMOLY_CPM
		};

	const dmInputParameterCollection = [
			{
				name: '__weekStartDate__',
				type: 'Date',
				value: weekStartDate
			},
			{
				name: '__weekEndDate__',
				type: 'Date',
				value: weekEndDate
			},
			{
				name: '__yesterdayDate__',
				type: 'Date',
				value: yesterdayDate
			},
			{
				name: '__pageViewMinThreshold__',
				type: 'INT',
				value: thresholds.minPageView
			},
			{
				name: '__determinedModeThreshold__',
				type: 'INT',
				value: thresholds.determinedMode
			},
			{
				name: '__determinedModeMinThreshold__',
				type: 'INT',
				value: thresholds.minDeterminedMode
			}
		],
		dmConfig = {
			inputParameters: dmInputParameterCollection.concat([]),
			query: ANAMOLY_DETERMINED_MODE
		};

	return Promise.join(
		sqlHelper.queryDB(pVIXConfig),
		sqlHelper.queryDB(cpmConfig),
		sqlHelper.queryDB(dmConfig),
		(PVIXARecords, cpmARecords, DMRecords) => Promise.resolve([PVIXARecords, cpmARecords, DMRecords])
	);
}

function prepareAnomalyList(dataSets) {
	let speratedPVIX = _.filter(_.map(dataSets[0], seperateEachPVIX), function(obj) {
		return !_.isEmpty(obj);
	});

	return filterApAppBucketSites([speratedPVIX, dataSets[1], dataSets[2]]).then(function(combinedAnomally) {
		return Promise.resolve(
			_.groupBy(combinedAnomally, function(obj) {
				return obj.siteId;
			})
		);
	});
}

function raiseSupportTickets(anomalyList) {
	let executionLog = {},
		anomalyCount = 0,
		sentMailCount = 0;

	let emailId = `support@adpushup.com`;
	let cc = '';
	let from = 'services.daemon@adpushup.com';

	const headerTemplate = `AdPushup Anomaly Report:@__siteId__:@__siteName__:Count:-@__anomalyCount__`;

	const mailContentTemplate = `<h3><span style="color: #d35400;">Anomaly Detected on @__siteName__ (@__siteId__)</span></h3><h4>Details:</h4><table border="1" cellspacing="0" cellpadding="8"><thead><tr><td>Anomaly Name</td><td>Last Week's Value</td><td>Yesterday's Value</td><td>Diff %</td></tr></thead><tbody>@__rows__</tbody></table><p>&nbsp;</p>`;
	const tableRowTemplate = `<tr><td>@__reason__</td><td>@__oldValue__</td><td>@__newValue__</td><td>@__diff__</td></tr>`;

	_.forEach(anomalyList, function(siteAnomalyArray, siteId) {
		anomalyCount += siteAnomalyArray.length;

		let siteName,
			rowContent = '';

		let headerReason = '';

		_.forEach(siteAnomalyArray, function(value, key) {
			headerReason = value.reason;

			siteName = value.siteName;

			let diff;
			if (value.oldValue > value.newValue) {
				diff = (value.oldValue - value.newValue) / value.oldValue * 100;
			} else {
				diff = (value.newValue - value.oldValue) / value.newValue * 100;
			}

			let oldValue = numberWithCommas(value.oldValue),
				newValue = numberWithCommas(value.newValue);

			switch (value.reason) {
				case 'XpathIncrease':
					oldValue += '%';
					newValue += '%';
					break;
			}

			let mapObj = {
				'@__reason__': value.reason,
				'@__oldValue__': oldValue,
				'@__newValue__': newValue,
				'@__diff__': diff
			};

			rowContent += tableRowTemplate.replace(/@__reason__|@__oldValue__|@__newValue__|@__diff__/gi, function(
				matched
			) {
				return mapObj[matched];
			});
		});

		let content = mailContentTemplate.replace(/@__siteName__/g, siteName);
		content = content.replace(/@__siteId__/g, siteId);
		content = content.replace(/@__rows__/g, rowContent);

		let header = headerTemplate.replace(/@__siteId__/g, siteId);
		header = header.replace(/@__siteName__/g, siteName);
		header = header.replace(/@__anomalyCount__/g, siteAnomalyArray.length);

		if (siteAnomalyArray.length == 1) {
			header += ':' + headerReason;
		}

		sendMail({ header, content, emailId, cc, from });
		sentMailCount++;
	});

	executionLog.anomalyCount = anomalyCount;
	executionLog.siteCount = _.size(anomalyList);
	executionLog.sentMailCount = sentMailCount;

	return Promise.resolve(executionLog);
}

function writeExecutionLog(executionLog) {
	logger({
		source: 'AnomalyDetectionService.ExecutionLogs',
		message:
			'Successfull Execution on ' +
			moment()
				.utcOffset('+05:30')
				.format('MMMM Do YYYY, h:mm:ss a'),
		details: JSON.stringify(executionLog),
		type: 1
	});
}

function mainLogger(ex) {
	logger({
		source: 'AnomalyDetectionService',
		message: ex.message,
		details: _.toString(ex)
	});
}

function seperateEachPVIX(obj) {
	let returnObj = {};

	switch (obj.reason) {
		case 'CodeRemoved':
			{
				returnObj.siteId = obj.siteId;
				returnObj.siteName = obj.siteName;
				returnObj.oldValue = obj.weekPageViews;
				returnObj.newValue = obj.yesterdayPageViews;
				returnObj.reason = obj.reason;
			}
			break;

		case 'PageViewDrop':
			{
				returnObj.siteId = obj.siteId;
				returnObj.siteName = obj.siteName;
				returnObj.oldValue = obj.weekPageViews;
				returnObj.newValue = obj.yesterdayPageViews;
				returnObj.reason = obj.reason;
			}
			break;

		case 'ImpressionDrop':
			{
				returnObj.siteId = obj.siteId;
				returnObj.siteName = obj.siteName;
				returnObj.oldValue = obj.weekImpressions;
				returnObj.newValue = obj.yesterdayImpressions;
				returnObj.reason = obj.reason;
			}
			break;

		case 'XpathIncrease':
			{
				returnObj.siteId = obj.siteId;
				returnObj.siteName = obj.siteName;
				returnObj.oldValue = obj.weekXpathMiss;
				returnObj.newValue = obj.yesterdayXpathMiss;
				returnObj.reason = obj.reason;
			}
			break;

		default: {
			logger({
				source: 'AnomalyDetectionService',
				message: 'Unknown Reson in PVIX Object',
				details: 'Reason Value =' + obj.reason,
				debugData: JSON.stringify(obj)
			});
		}
	}

	return returnObj;
}

function numberWithCommas(x) {
	if (x === undefined || x === null || x === 'null' || x.toString().length < 1) {
		return x;
	}

	if (x.toString().includes('.')) {
		return x.toFixed(2);
	}

	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function filterApAppBucketSites(dataSets) {
	let couchBaseService = require('../../helpers/couchBaseService'),
		couchbasePromise = require('couchbase-promises');

	let query = couchbasePromise.ViewQuery.from('AdpTagReporting', 'SiteUserMapping')
		.stale(1)
		.reduce(false);

	let performQuery = couchBaseService.queryViewFromAppBucket(query).then(function(results) {
		let activeSites = [];

		_.map(results, function(siteObj) {
			if (siteObj.key !== undefined && !_.includes(activeSites, siteObj.key)) {
				activeSites.push(siteObj.key);
			}
		});

		return Promise.resolve(activeSites);
	});

	return Promise.all(performQuery)
		.then(function(activeSites) {
			let finalAnomalySet = [];

			_.forEach(dataSets[0], function(anomalyObj) {
				if (_.includes(activeSites, anomalyObj.siteId)) {
					finalAnomalySet.push(anomalyObj);
				}
			});

			_.forEach(dataSets[1], function(anomalyObj) {
				if (_.includes(activeSites, anomalyObj.siteId)) {
					finalAnomalySet.push(anomalyObj);
				}
			});

			_.forEach(dataSets[2], function(anomalyObj) {
				if (_.includes(activeSites, anomalyObj.siteId)) {
					finalAnomalySet.push(anomalyObj);
				}
			});

			return Promise.resolve(finalAnomalySet);
		})
		.catch(function(err) {
			throw err;
		});
}
