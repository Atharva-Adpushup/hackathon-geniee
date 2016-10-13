var couchbase = require('../../helpers/couchBaseService'),
	ViewQuery = require('couchbase-promises').ViewQuery,
	Promise = require('bluebird'), API;

function getResultFromCb(siteId) {
	var query = ViewQuery.from('ops', 'siteMap');

	if (siteId !== null) {
		query.key(siteId);
	}

	return couchbase.connectToAppBucket()
		.then(function(appBucket) {
			return new Promise(function(resolve, reject) {
				appBucket.query(query, {}, function(err, result) {
					if (err) {
						reject(err);
					}
					resolve(result);
				});
			});
		});
}
API = {
	getResult: function(data) {
		var siteId = null;

		if (data.options) {
			siteId = parseInt(data.options.key, 10);
		}
		return getResultFromCb(siteId);

        /* return couchbase.connectToAppBucket()
                .then(function (appBucket) {
                    return appBucket.getAsync("site::1882", {})
                })*/
	}


    // http://docs.couchbase.com/sdk-api/couchbase-node-client-2.0.0/ViewQuery.html
};


module.exports = API;
