var extend = require('extend'),
	moment = require('moment'),
	lodash = require('lodash'),
	siteModel = require('../../../../../models/siteModel'),
	couchBaseService = require('../../../../../helpers/couchBaseService'),
	couchbasePromise = require('couchbase-promises'),
	sitesByAutoOptimiseParameterQuery = couchbasePromise.ViewQuery.from('app', 'sitesByAutoOptimiseParameter'),
	Promise = require('bluebird');

function getDbQueryDateMillis() {
	// NOTE: A date after which console.adpushup.com was made live
	// This date is chosen as startDate to get data parameters (page views, clicks etc) for every site
	// from its day one
	var startDate = "20161201",
		computedObj = {
			startDate: moment(startDate).valueOf(),
			endDate: moment().subtract(4, 'hours').valueOf()
		};

	return computedObj;
}

function getAllSiteModels(results) {
	return lodash.map(results, function(siteObj) {
		return siteModel.getSiteById(siteObj.value.siteId);
	});
}

module.exports = {
	init: function() {
		var queryDateRange = getDbQueryDateMillis(),
			query = sitesByAutoOptimiseParameterQuery.range(queryDateRange.startDate, queryDateRange.endDate, true),
			performQuery = couchBaseService.queryViewFromAppBucket(query).then(getAllSiteModels);

		return Promise.all(performQuery).then(function(siteModels) {
			return siteModels;
		})
		.catch(function(e) {
			throw e;
		});
	}
};
