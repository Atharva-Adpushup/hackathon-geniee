const { couchbaseService } = require('node-utils');
const uuid = require('uuid');

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

function fetchAllTgmrDocs() {
	const query = `SELECT doc.* FROM ${
		config.couchBase.DEFAULT_BUCKET
	} doc where meta().id like "tgmr::%"`;
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

function generateSectionName({ service, platform = null, pagegroup = null, width, height }) {
	const name = ['AP', service];

	if (platform) name.push(platform.toUpperCase().slice(0, 1));
	if (pagegroup) name.push(pagegroup.toUpperCase().replace(/\s/g, '-'));

	name.push(`${width}X${height}`);
	name.push(uuid.v4().slice(0, 5));

	return name.join('_');
}

module.exports = {
	fetchAllSites,
	fetchAllChannels,
	fetchAllTgmrDocs,
	errorHandler,
	updateDoc,
	getDoc,
	dBHelper,
	generateSectionName
};
