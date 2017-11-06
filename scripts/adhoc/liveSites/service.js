const extend = require('extend'),
	moment = require('moment'),
	lodash = require('lodash'),
	siteModel = require('../../../models/siteModel'),
	couchBaseService = require('../../../helpers/couchBaseService'),
	couchbasePromise = require('couchbase-promises'),
	liveSitesByNonEmptyChannelsQuery = couchbasePromise.ViewQuery.from('app', 'liveSitesByNonEmptyChannels'),
	Promise = require('bluebird');

function getAllSiteModels(results) {
	return lodash.map(results, function(siteObj) {
		return siteModel.getSiteById(siteObj.value);
	});
}

module.exports = {
	init: function() {
		const performQuery = couchBaseService
			.queryViewFromAppBucket(liveSitesByNonEmptyChannelsQuery)
			.then(getAllSiteModels);

		return Promise.all(performQuery)
			.then(siteModels => {
				return siteModels;
			})
			.catch(function(e) {
				throw e;
			});
	}
};
