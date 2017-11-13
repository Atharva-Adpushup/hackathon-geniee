const Promise = require('bluebird'),
	{ promiseForeach, couchbaseService } = require('node-utils'),
	_ = require('lodash'),
	config = require('../../../configs/config'),
	dBHelper = couchbaseService(
		`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
		config.couchBase.DEFAULT_BUCKET,
		config.couchBase.DEFAULT_BUCKET_PASSWORD
	);

function fetchAllSites() {
	let query = `SELECT a.siteId FROM ${config.couchBase.DEFAULT_BUCKET} a where meta().id like "site::%"`;
	return dBHelper.queryDB(query);
}

function errorHandler(obj, err) {
	let error = err.message;
	console.log(`Site : ${obj.siteId} | ${error.message}`);
	return true;
}

function updateDoc(key, value, cas) {
	return dBHelper.updateDoc(key, value, cas);
}

function getDoc(key) {
	return dBHelper.getDoc(key);
}

function siteProcessing(site) {
	let key = `site::${site.siteId}`;
	return getDoc(key)
		.then(result => {
			let cas = result.cas,
				siteDoc = result.value;

			siteDoc.adNetworkSettings = {
				revenueShare: 10,
				negate: ['adsense']
			};
			return updateDoc(key, siteDoc, cas);
		})
		.then(() => console.log('Doc updated : ', key));
}

function processing(sites) {
	if (!sites || !sites.length) {
		throw new Error('No Sites available');
	} else {
		return promiseForeach(sites, siteProcessing, errorHandler);
	}
}

function init() {
	return fetchAllSites()
		.then(processing)
		.catch(err => console.log('Error occured : ', err));
}

init().then(() => console.log('Processing over'));
