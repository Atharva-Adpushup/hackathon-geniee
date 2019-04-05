const _ = require('lodash');
const extend = require('extend');
const moment = require('moment');
const lodash = require('lodash');
const { promiseForeach } = require('node-utils');
const siteModel = require('../../../../models/siteModel');
const couchBaseService = require('../../../../helpers/couchBaseService');
const couchbasePromise = require('couchbase');
const sitesByAutoOptimiseParameterQuery = couchbasePromise.ViewQuery.from('app', 'sitesByAutoOptimiseParameter');
const Promise = require('bluebird');

function getDbQueryDateMillis() {
	// NOTE: A date after which console.adpushup.com was made live
	// This date is chosen as startDate to get data parameters (page views, clicks etc) for every site
	// from its day one
	var startDate = '20161201',
		computedObj = {
			startDate: moment(startDate).valueOf(),
			endDate: moment()
				.subtract(4, 'hours')
				.valueOf()
		};

	return computedObj;
}

function getAllSiteModels(results) {
	return lodash.map(results, function(siteObj) {
		return siteModel.getSiteById(siteObj.value.siteId);
	});
}

function siteProcessing(filteredSiteModels, site) {
	const apConfigs = site.get('apConfigs') || false;
	const isAutoOptimiseEnabled =
		apConfigs && apConfigs.hasOwnProperty('autoOptimise') && apConfigs.autoOptimise === true;
	if (isAutoOptimiseEnabled) {
		filteredSiteModels.push(site);
		return Promise.resolve();
	}
	return site.getAllChannels().then(channels => {
		_.forEach(channels, channel => {
			if (channel.hasOwnProperty('autoOptimise') && channel.autoOptimise === true) {
				filteredSiteModels.push(site);
				return false;
			}
		});
		return true;
	});
}

function filterSiteModels(siteModels) {
	let filteredSiteModels = [];

	return promiseForeach(siteModels, siteProcessing.bind(null, filteredSiteModels), err => {
		console.log(err);
		return false;
	}).then(() => filteredSiteModels);
}

module.exports = {
	init: function() {
		const queryDateRange = getDbQueryDateMillis();
		const query = sitesByAutoOptimiseParameterQuery.range(queryDateRange.startDate, queryDateRange.endDate, true);
		const performQuery = couchBaseService.queryViewFromAppBucket(query).then(getAllSiteModels);

		return Promise.all(performQuery)
			.then(filterSiteModels)
			.catch(function(e) {
				throw e;
			});
	}
};
