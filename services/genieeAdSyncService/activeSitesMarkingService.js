const { Promise } = require('bluebird');
const rp = require('request-promise');
const cron = require('node-cron');
const { promiseForeach } = require('node-utils');

const { appBucket } = require('../../helpers/routeHelpers');
const siteModel = require('../../Models/siteModel');
const config = require('../../configs/config');

function getFormattedDate(date, offset) {
	date.setDate(date.getDate() - (offset || 0));
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	// console.log('formatted date:' + `${year}-${month}-${day}`);
	return `${year}-${month}-${day}`;
}

function processSite(data) {
	return siteModel
		.getSiteById(data.siteId)
		.then(site => {
			// throw {};
			if (!site || site.status === '404') {
				console.log(`site not found : ${JSON.stringify(site)}`);
				throw {};
			}
			site.set(data.key, data.value);
			return site.save();
		})
		.then(() => console.log(`Site saved successfully -- ${data.siteId}`))
		.catch(e => {
			console.log(JSON.stringify(e));
			e.error = true;
			e.siteId = data.siteId;
			// return e;
			throw e;
		});
}

function getSitesFromDB() {
	const siteListPromise = appBucket
		.queryDB(
			`select *
		from ${config.couchBase.DEFAULT_BUCKET} where meta().id like 'site::%';`
		)
		.catch(e => {
			console.log(`error in getting site Lists:${JSON.stringify(e)}`);
			throw { error: true };
			// return err;
		});
	return siteListPromise;
	// });
}

function getActiveSites(fromDate, toDate) {
	const options = {
		uri: 'https://staging.adpushup.com/CentralReportingWebService/site/activeSiteList',
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
		console.log(`error in getting active site Lists:${JSON.stringify(e)}`);
		throw { error: true };
		// return err;
	});

	return activeSiteListPromise;
}

function checkforFailedUpdates(siteUpdates) {
	console.log(`checking for any failed updates...`);
	const failedUpdates = [];

	siteUpdates.forEach(obj => {
		// console.log(`obj:${JSON.stringify(obj)}`);
		if (obj.error) {
			failedUpdates.push(obj.siteId);
			console.log(`error updating  site:${JSON.stringify(obj)}`);
		}
	});

	if (failedUpdates.length) {
		console.log(`Following sites could not be updated:${JSON.stringify(failedUpdates)}`);
	} else {
		console.log(`all sites updated successfully`);
	}
}

function udpateActiveSitesStaus() {
	const pendingActions = [];
	pendingActions.push(getSitesFromDB());

	const fromDate = getFormattedDate(new Date(), 2);
	const toDate = getFormattedDate(new Date());
	const updateResponse = [];

	pendingActions.push(getActiveSites(fromDate, toDate));

	console.log('Please wait... ');
	Promise.all(pendingActions)
		.then(res => {
			if (!res[0] || !Object.keys(res[0]).length) {
				console.log('no sites returned from db');
				return;
			}
			const siteList = Object.assign({}, res[0]);
			const sitesFound = {};
			// console.log(`siteList:${JSON.stringify(res[0])}`);
			if (res[1] && Object.keys(res[1]).length) {
				const activeSiteList = Object.assign({}, res[1]);
				for (const key in activeSiteList) {
					sitesFound[activeSiteList[key]] = true;
				}
			}
			// console.log(`sitesFound:${JSON.stringify(sitesFound)}`);
			const siteUpdateData = [];

			for (const key in siteList) {
				const site = siteList[key].apAppBucket;
				// console.log(`updating site id:${site.siteId}`);
				siteUpdateData.push({
					siteId: site.siteId,
					key: 'dataFeedActive',
					value: !!sitesFound[site.siteId]
				});
			}

			return promiseForeach(siteUpdateData, processSite, (data, err) => {
				updateResponse.push(err);
				return true;
			});
			// checkforFailedUpdates(siteUpdatePromiseList);
		})
		.then(() => {
			checkforFailedUpdates(updateResponse);
		})
		// .catch(err => {
		// 	console.log(err);
		// 	process.exit();
		// });
		.catch(err => {
			console.log(`Error.....\n ${JSON.stringify(err)}`);
		});
}
// cron.schedule('* 17 * * *', udpateActiveSitesStaus);
udpateActiveSitesStaus();
