const _ = require('lodash');
const Promise = require('bluebird');
const { promiseForeach, couchbaseService } = require('node-utils');
const config = require('../../../configs/config');

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

async function findStatuses(site) {
	const { isManual = false, isInnovative = false } = siteDoc;
	const apTagStatus = await findApTagStatus(siteDoc.siteId, isManual);
	const innovativeAdsStatus = await findInnovativeAdsStatus(siteDoc.siteId, isInnovative);
}

function siteProcessing(site) {
	const key = `site::${site.siteId}`;
	const statuses = {
		layout: true
	};
	return getDoc(key)
		.then(result => {
			const cas = result.cas;
			const siteDoc = result.value;

			return updateDoc(key, siteDoc, cas);
		})
		.then(() => console.log('Doc updated : ', key));
}

function processing(sites) {
	if (!sites || !sites.length) {
		throw new Error('No Sites available');
	}
	return promiseForeach(sites, siteProcessing, errorHandler);
}

function init() {
	return fetchAllSites()
		.then(processing)
		.catch(err => console.log('Error occured : ', err));
}

init().then(() => console.log('Processing over'));

/*
	- Fetch all Sites
	- Loop over each site and check
		- isManual --> apTag
		- isInnovative --> innovativeAds
		- layout --> layout
		- hbStatus -> headerBidding
		- gdpr --> gdpr || consentManagement

		"layout": true, // always
		"consentManagement": true, // only if gdpr is currently on
		"headerBidding": true, // if hbcf doc exists and has ads
		"apTag": true, // if tgmr doc exists and toggle is true
		"innovativeAds": true // either toggle or channel has at least one innovative ad
 */
