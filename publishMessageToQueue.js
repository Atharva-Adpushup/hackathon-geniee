var siteModel = require('./models/siteModel'),
	couchbase = require('./helpers/couchBaseService'),
	CouchbasePromises = require('couchbase-promises'),
	Promise = require('bluebird'),
	lodash = require('lodash'),
	N1qlQuery = CouchbasePromises.N1qlQuery,
	configPublishService = require('./services/apV2SiteConfigPublishService/index'),
	WORKER_CONSTANTS = require('./queueWorker/rabbitMQ/constants/constants'),
	CONSTANTS = {
		COUCHBASE: {
			CONNECTION_SUCCESS: 'PUBLISH_LIVE_SITES: Connected to Couchbase',
			SITE_MODEL_CREATED: 'PUBLISH_LIVE_SITES: Site models array created'
		}
	};

function init() {
	var queryString = N1qlQuery.fromString('select siteId from apAppBucket where ARRAY_COUNT(channels) > 0 AND meta().id like "site::3";');

	return couchbase.connectToAppBucket()
		.then(function (appBucket) {
			console.log(CONSTANTS.COUCHBASE.CONNECTION_SUCCESS);

			return appBucket.queryPromise(queryString);
		})
		.then(function (liveSitesArray) {
			var publishAllSitesPromises = lodash.map(liveSitesArray, function (siteObject) {
					if (!siteObject.siteId) { return false; }

					return siteModel.getSiteById(siteObject.siteId)
						.then(function (model) {
							if (!model || !model.get('apConfigs')) { return false; }

							var paramConfig = {
                                zones: {},
                                siteId: 0,
                                // channelKey: ''
							};

							return configPublishService.publish([model], paramConfig);
						});
				}),
				publishAllSites = Promise.all(publishAllSitesPromises);

			return publishAllSites
				.then(function () {
					console.log('LIVE_SITES_PUBLISH: Successful completion!');

					return true;
				});
		})
		.catch(function (err) {
			console.log('Error occurred during sites publication', err);
		})
		.finally(process.exit);
}

// setTimeout(() => {
//     init();
// }, 5000);