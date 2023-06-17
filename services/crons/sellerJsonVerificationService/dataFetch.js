const couchbase = require('couchbase');
const fetch = require('node-fetch');

const couchbaseService = require('../../../helpers/couchBaseService');
const { URL } = require('./const');

async function fetchAllActiveSites() {
	try {
		const queryFetchAllActiveSites = couchbase.N1qlQuery.fromString(
			"SELECT siteId, ownerEmail FROM `AppBucket` WHERE meta().id like 'site::%' AND dataFeedActive = true"
		);
		const data = await couchbaseService.queryViewFromAppBucket(queryFetchAllActiveSites);
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

async function fetchUserData(allEmails) {
	try {
		const emailSellerChildQuery = `SELECT email, sellerId, mcm.childPublisherId AS childPublisherId FROM \`AppBucket\` WHERE meta().id LIKE 'user::%' AND email IN ["${allEmails.join(
			'", "'
		)}"]`;
		const userN1qlQuery = couchbase.N1qlQuery.fromString(emailSellerChildQuery);
		const userData = await couchbaseService.queryViewFromAppBucket(userN1qlQuery);
		return userData;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

async function fetchSellerJsonData() {
	try {
		const res = await fetch(URL);
		const sellerJsonData = await res.json();
		return sellerJsonData;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

module.exports = {
	fetchAllActiveSites,
	fetchUserData,
	fetchSellerJsonData
};
