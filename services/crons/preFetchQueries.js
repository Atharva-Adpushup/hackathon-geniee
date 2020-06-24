const redis = require('redis');
const cron = require('node-cron');
const userModel = require('../../models/userModel');
const request = require('request-promise');
const CC = require('../../configs/commonConsts');
const config = require('../../configs/config');
const REDIS_PORT = config.environment.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT);
const commonConsts = require('../../configs/commonConsts');
const siteModel = require('../../models/siteModel');
const couchbase = require('../../helpers/couchBaseService');
const { promiseForeach } = require('node-utils');
const { isEqual } = require('lodash');

let oldLastRunInfo = null;

function getActiveUsers() {
	return (
		siteModel
			.getActiveSites()
			// .then(users => Array.from(new Set(users.map(({ accountEmail }) => accountEmail))))
			// .catch(err => console.log(err))
			.then(users => ['yash.garg@adpushup.com'])
	);
}

function getUserSites(ownerEmail) {
	let siteid = [];

	return userModel.getUserByEmail(ownerEmail).then(user => {
		const userSites = user.get('sites');

		userSites.map(({ siteId }) => {
			siteid.push(siteId.toString());
		});
		return siteid.sort((a, b) => a - b).join();
	});
}

function preFetchMeta(ownerEmail) {
	return getUserSites(ownerEmail).then(siteid => {
		const params = { siteid, isSuperUser: false };

		const requestQuery = { sites: params.siteid };
		return request({
			uri: `${CC.ANALYTICS_API_ROOT}${CC.ANALYTICS_METAINFO_URL}`,
			json: true,
			qs: params
		})
			.then(response => {
				const data = response.data;
				console.log(data);
				client.setex(JSON.stringify(requestQuery), 3600, JSON.stringify(data));
			})
			.catch(err => console.log(err));
	});
}

function getAllUsersMeta() {
	getActiveUsers().then(ownerEmails =>
		promiseForeach(ownerEmails, preFetchMeta, (data, err) => {
			console.log(err);
			return true;
		})
	);
}

function getLastRunInfo() {
	return couchbase
		.connectToBucket('apLocalBucket')
		.then(requestBucket =>
			requestBucket.getAsync('config::apnd:last-run-info').then(doc => {
				let newLastRunInfo = doc.value;
				if (!isEqual(oldLastRunInfo, newLastRunInfo)) getAllUsersMeta();

				oldLastRunInfo = newLastRunInfo;
			})
		)
		.catch(err => console.log(err));
}

// cron.schedule('* * * * *', getLastRunInfo);
getLastRunInfo();
