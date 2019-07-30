const { couchbaseService } = require('node-utils');
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

function fetchAllChannels() {
	const query = `SELECT doc.* FROM ${
		config.couchBase.DEFAULT_BUCKET
	} doc where meta().id like "chnl::%"`;
	return dBHelper.queryDB(query);
}

function errorHandler(obj, err) {
	const error = err.message || err;
	console.log('Id:', obj);
	console.log('Error: ', error);
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
	fetchAllChannels,
	errorHandler,
	updateDoc,
	getDoc,
	dBHelper
};
