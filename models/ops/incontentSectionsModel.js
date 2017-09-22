var couchbase = require('../../helpers/couchBaseService'),
	ViewQuery = require('couchbase-promises').ViewQuery,
	Promise = require('bluebird'),
	API = {
		getIncontentSectionsPerChannel: function(options) {
			var query = ViewQuery.from('ops', 'incontentSectionsPerChannel');
			if (options.range) {
				query.range(options.range.start, options.range.end, options.range.inclusive_end);
			}
			query.limit(options.limit ? options.limit : 99999);
			if (options.reduce) {
				query.reduce(options.reduce);
				query.group_level(options.groupLevel ? options.groupLevel : -1);
			} else {
				query.reduce(false);
			}

			// delete query.options.group;

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
