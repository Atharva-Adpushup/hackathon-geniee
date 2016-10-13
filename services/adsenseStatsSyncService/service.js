var worker = require('./adsenseStatsSync'),
	promiseForEach = require('../../helpers/promiseForeach'),
	_ = require('lodash'),
	couchbase = require('../../helpers/couchBaseService'),
	query = require('couchbase-promises').ViewQuery.from('app', 'sites'),
	later = require('later'),
	Promise = require('bluebird'),
	inProgress = false,
	schedule = later.parse.recur().every(12).hour(),
	syncStats = function() {
		if (inProgress) {
			return false;
		}
		inProgress = true;
		couchbase.connectToAppBucket()
			.then(function(appBucket) {
				// get site id list
				return new Promise(function(resolve, reject) {
					appBucket.query(query, {}, function(err, result) {
						if (err) {
							reject(err);
							return;
						}
						resolve(_.map(result, 'key'));
					});
				});
			})
			.then(function(sites) {
				// run service on all site ids
				return promiseForEach(sites, worker, function(siteId, err) {
					console.log(siteId + ':' + err.name + ':' + err.message);
					return true;
				});
			})
			.then(function() {
				inProgress = false;
				console.log('complete');
			}).catch(function(err) {
				inProgress = false;
				console.log('end due to error', err);
			});
	};
process.nextTick(syncStats);
later.setInterval(syncStats, schedule);
