const redis = require('redis');
const cron = require('node-cron');
const userModel = require('../../models/userModel');
const request = require('request-promise');
const CC = require('../../configs/commonConsts');
const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient(REDIS_PORT);
const commonConsts = require('../../configs/commonConsts');
const siteModel = require('../../models/siteModel');
const { promiseForeach } = require('node-utils');

function getActiveUsers() {
	return siteModel
		.getActiveSites()
		.then(users => Array.from(new Set(users.map(({ accountEmail }) => accountEmail))));
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

cron.schedule(commonConsts.cronSchedule.prefetchService, getAllUsersMeta);
