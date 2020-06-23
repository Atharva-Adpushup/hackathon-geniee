/**
 * Created by Dhiraj on 3/2/2016.
 */
var couchbase = require('couchbase'),
	Promise = require('bluebird'),
	config = require('../configs/config'),
	API = null,
	state = {
		cluster: null,
		apAppBucket: null
	};

if (!config.couchBaseStaging) return;
state.cluster = new couchbase.Cluster('couchbase://' + config.couchBaseStaging.HOST, {
	operation_timeout: 5000
});

// RBAC (Role Based Access Control) Authentication,
// See https://docs.couchbase.com/server/5.1/security/security-rbac-user-management.html
state.cluster.authenticate(
	config.couchBaseStaging.DEFAULT_USER_NAME,
	config.couchBaseStaging.DEFAULT_USER_PASSWORD
);

function connect(bucket) {
	return new Promise(function(resolve, reject) {
		if (state[bucket]) {
			resolve(state[bucket]);
			return;
		}

		state[bucket] = state.cluster.openBucket(bucket, function(err) {
			if (err) {
				reject(err);
				return;
			}
			state[bucket] = Promise.promisifyAll(state[bucket]);
			resolve(state[bucket]);
			return;
		});
	});
}

API = {
	connectToBucket: function(bucketName) {
		return connect(bucketName);
	},
	connectToAppBucket: function() {
		return connect(config.couchBaseStaging.DEFAULT_BUCKET);
	},
	queryViewFromAppBucket: function(query) {
		return API.connectToAppBucket().then(function(appBucket) {
			return appBucket.queryAsync(query);
		});
	},
	cluster: state.cluster
};

module.exports = API;
