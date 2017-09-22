var couchbase = require('../../helpers/couchBaseService'),
	ViewQuery = require('couchbase-promises').ViewQuery,
	Promise = require('bluebird'),
	API = {
		getAutoAnalysisPageGroupsForSite: function(siteId) {
			var query = ViewQuery.from('ops', 'autoAnalysisPageGroups')
				.range([siteId, null, null], [siteId, [], []], true)
				.group(2);
			delete query.options.group;

			return couchbase.connectToAppBucket().then(function(appBucket) {
				return new Promise(function(resolve, reject) {
					appBucket.query(query, {}, function(err, result) {
						if (err) {
							reject(err);
						}
						resolve({ response_type: 'good', msg: result });
					});
				});
			});
		}
	};

module.exports = API;
