var couchbase = require('../../helpers/couchBaseService'),
	// eslint-disable-next-line no-unused-vars
	ViewQuery = require('couchbase-promises').ViewQuery,
	// eslint-disable-next-line no-unused-vars
	Promise = require('bluebird'), API;

function pullDoc(bucketName, key) {
	console.log('pulling doc from bucket : ' + bucketName + ' for docId : ' + key);

	return couchbase.connectToBucket(bucketName)
		.then(function(bucket) {
			return bucket.getAsync(key, {});
		})
		.then(function(d) {
			return { 'response_type': 'good', 'msg': d.value };
		});
}
function pushDoc(bucketName, key, val) {
	if (val !== null) {
		return couchbase.connectToBucket(bucketName)
			.then(function(bucket) {
				return bucket.upsertAsync(key, val, {});
			})
			.then(function(d) {
				return { 'response_type': 'good', 'msg': JSON.stringify(d) };
			});
	}
	throw Error("doc value can't be null");
}
API = {
	getResult: function(data) {
		// eslint-disable-next-line no-unused-vars
		var siteId = null;

		if (data.options) {
			siteId = parseInt(data.options.key, 10);
		}

		if (data.push === true) {
			return pushDoc(data.bucketName, data.docId, data.doc);
		} else if (data.push === false) {
			return pullDoc(data.bucketName, data.docId);
		}
	}
};

module.exports = API;
