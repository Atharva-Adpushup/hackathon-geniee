const config = require('../../../../configs/config');

const dBHelper = couchbaseService(
	`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
	config.couchBase.DEFAULT_BUCKET,
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);

function fetchAllSites() {
	const query = `SELECT a.siteId FROM ${
		config.couchBase.DEFAULT_BUCKET
	} a where meta().id like "site::%"`;
	return dBHelper.queryDB(query);
}

function errorHandler(obj, err) {
	const error = err.message;
	console.log(`Site : ${obj.siteId} | ${error.message}`);
	return true;
}

function updateDoc(key, value, cas) {
	return dBHelper.updateDoc(key, value, cas);
}

function getDoc(key) {
	return dBHelper.getDoc(key);
}

module.exports = {
	fetchAllSites,
	errorHandler,
	updateDoc,
	getDoc
};
