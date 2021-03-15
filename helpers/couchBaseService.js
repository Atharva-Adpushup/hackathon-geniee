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
state.cluster.authenticate(
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);

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
	getDoc: (bucketName, docId) => {
		return API.connectToBucket(bucketName)
			.then(bucket => bucket.getAsync(docId))
			.catch(err => {
				if (err && err.code === 13) {
					return { value: {} };
				}
				throw new Error(err);
			});
	},
	replaceDoc: (bucketName, docId, doc) => {
		return API.connectToBucket(bucketName).then(bucket => bucket.replaceAsync(docId, doc));
	},
	upsertDoc: (bucketName, docId, doc) => {
		return API.connectToBucket(bucketName).then(bucket => {
			const upsertQuery = `UPSERT INTO ${bucketName} (KEY, VALUE) VALUES ("${docId}", ${JSON.stringify(
				doc
			)})`;
			return bucket.queryAsync(couchbase.N1qlQuery.fromString(upsertQuery));
		});
	},
	cluster: state.cluster
};

module.exports = API;
