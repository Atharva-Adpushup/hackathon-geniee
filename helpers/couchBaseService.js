/**
 * Created by Dhiraj on 3/2/2016.
 */
var couchbase = require('couchbase-promises'),
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

function connect(bucket, password) {
	return new Promise(function(resolve, reject) {
		if (state[bucket]) {
			resolve(state[bucket]);
			return;
		}
		state[bucket] = state.cluster.openBucket(bucket, password, function(err) {
			if (err) {
				reject(err);
				return;
			}
			state[bucket] = Promise.promisifyAll(state[bucket], { suffix: 'Promise' });
			resolve(state[bucket]);
			return;
		});
	});
}

API = {
	connectToBucket: function(bucketName) {
		if (bucketName === config.couchBase.DEFAULT_BUCKET || bucketName === 'apLocalBucket') {
			return connect(bucketName, config.couchBase.DEFAULT_BUCKET_PASSWORD, config.couchBase.HOST);
		} else if (bucketName === 'apStatsBucket') {
			return connect(bucketName,  config.ops.couchBaseBuckets.apStatsBucket.BUCKET_PASSWORD,  config.ops.couchBaseBuckets.apStatsBucket.HOST);
		} else if (bucketName === 'apGlobalBucket') {
			return connect(bucketName, config.ops.couchBaseBuckets.apGlobalBucket.BUCKET_PASSWORD, config.ops.couchBaseBuckets.apGlobalBucket.HOST);
		}
	},
	connectToAppBucket: function() {
		return connect(config.couchBase.DEFAULT_BUCKET, config.couchBase.DEFAULT_BUCKET_PASSWORD);
	},
	queryViewFromAppBucket: function(query) {
		return API.connectToAppBucket()
			.then(function(appBucket) {
				return appBucket.queryPromise(query);
			});
	}

};

module.exports = API;

