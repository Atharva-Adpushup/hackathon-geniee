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

state.cluster = new couchbase.Cluster('couchbase://' + config.couchBase.HOST, {
	operation_timeout: 5000
});

// RBAC (Role Based Access Control) Authentication,
// See https://docs.couchbase.com/server/5.1/security/security-rbac-user-management.html
state.cluster.authenticate(config.couchBase.DEFAULT_USER_NAME, config.couchBase.DEFAULT_USER_PASSWORD);

function connect(bucket) {
	if (state[bucket]) {
		return state[bucket];
	}
	state[bucket] = new Promise(function(resolve, reject) {
		const tempBucket = state.cluster.openBucket(bucket, function(err) {
			if (err) {
				reject(err);
				return;
			}
			resolve(Promise.promisifyAll(tempBucket));
			return;
		});
	});
	return state[bucket];
}

API = {
	connectToBucket: function(bucketName) {
		return connect(bucketName);
	},
	connectToAppBucket: function() {
		return connect(config.couchBase.DEFAULT_BUCKET);
	},
	queryViewFromAppBucket: function(query) {
		return API.connectToAppBucket().then(function(appBucket) {
			return appBucket.queryAsync(query);
		});
	},
	cluster: state.cluster
};

module.exports = API;
