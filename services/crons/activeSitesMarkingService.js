const { Promise } = require('bluebird');
const rp = require('request-promise');
const cron = require('node-cron');
const { promiseForeach } = require('node-utils');

const { appBucket } = require('../../helpers/routeHelpers');
const siteModel = require('../../models/siteModel');
const config = require('../../configs/config');
const constants = require('../../configs/commonConsts');

const activeSiteApiUri =
	'https://staging.adpushup.com/CentralReportingWebService/site/activeSiteList';

function getFormattedDate(date, offset) {
	date.setDate(date.getDate() - (offset || 0));
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${year}-${month}-${day}`;
}

function processSite(data) {
	return siteModel
		.getSiteById(data.siteId)
		.then(site => {
			if (!site || site.status === '404') {
				console.log(`c : ${JSON.stringify(site)}`);
				throw { message: 'site not found' };
			}
			site.set(data.key, data.value);
			return site.save();
		})
		.then(() => console.log(`Site saved successfully -- ${data.siteId}`))
		.catch(e => {
			console.log(e);
			e.error = true;
			e.siteId = data.siteId;
			throw e;
		});
}

function getSitesFromDB() {
	const siteListPromise = appBucket
		.queryDB(
			`select raw to_string(siteId) 
		from ${config.couchBase.DEFAULT_BUCKET} where meta().id like 'site::%';`
		)
		.catch(e => {
			console.log(`error in getting site Lists:${e}`);
			throw { error: true };
			// return err;
		});
	return siteListPromise;
	// });
}

function getActiveSites(fromDate, toDate) {
	const options = {
		uri: activeSiteApiUri,
		qs: {
			fromDate,
			toDate
		},
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
		},
		json: true
	};
	const activeSiteListPromise = rp(options).catch(e => {
		console.log(`error in getting active site Lists:${e}`);
		throw { error: true };
		// return err;
	});

	return activeSiteListPromise;
}

function checkforFailedUpdates(siteUpdates) {
	console.log(`checking for any failed updates...`);
	const failedUpdates = [];

	siteUpdates.forEach(obj => {
		if (obj.error) {
			failedUpdates.push(obj.siteId);
			console.log(`error updating  site:${JSON.stringify(obj)}`);
		}
	});

	if (failedUpdates.length) {
		console.log(`Following sites could not be updated:${JSON.stringify(failedUpdates)}`);
	} else {
		console.log('All sites updated successfully');
	}
	console.log(`Executed at:${new Date()}`);
}

function udpateActiveSitesStaus() {
	const pendingActions = [];
	pendingActions.push(getSitesFromDB());

	const fromDate = getFormattedDate(new Date(), 2);
	const toDate = getFormattedDate(new Date());
	const updateResponse = [];

	pendingActions.push(getActiveSites(fromDate, toDate));

	return Promise.all(pendingActions)
		.then(res => {
			// if (!res[0] || !Object.keys(res[0]).length) {
			if (!res[0] || !res[0].length) {
				throw new Error('no sites returned from db');
			}

			// const siteList = Object.assign({}, res[0]);
			const siteList = [...res[0]];
			const sitesFound = {};
			if (res[1] && Object.keys(res[1]).length) {
				const activeSiteList = Object.assign({}, res[1]);
				for (const key in activeSiteList) {
					sitesFound[activeSiteList[key]] = true;
				}
			}
			const siteUpdateData = [];

			// for (const key in siteList) {
			for (let i = 0; i < siteList.length; i++) {
				// const site = siteList[key].AppBucket; // for local - apAppBucket
				siteUpdateData.push({
					siteId: parseInt(siteList[i]),
					key: 'dataFeedActive',
					value: !!sitesFound[siteList[i]]
				});
			}

			return promiseForeach(siteUpdateData, processSite, (data, err) => {
				updateResponse.push(err);
				return true;
			});
		})
		.then(res => {
			checkforFailedUpdates(updateResponse);
			return Promise.resolve();
		})
		.catch(err => {
			console.log(`Error.....\n ${err}`);
		});
}

module.exports = udpateActiveSitesStaus;
