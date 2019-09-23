const { Promise } = require('bluebird');
const rp = require('request-promise');
const cron = require('node-cron');

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

function processSite(siteId, key, value, failed) {
	return siteModel
		.getSiteById(siteId)
		.then(site => {
			if (!site || site.status === '404') {
				throw {};
			}
			site.set(key, value);
			return site.save();
		})
		.then(
			savedSite =>
				// console.log(`saved Site:${JSON.stringify(savedSite)}`);

				savedSite
		)
		.catch(e => {
			console.log(JSON.stringify(e));
			e.error = true;
			e.siteId = siteId;
			return e;
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

function checkforFailedUpdates(updatePromsieList) {
	console.log(`checking for any failed updates...`);
	const failedUpdates = [];
	Promise.all(updatePromsieList).then(res => {
		res.forEach(obj => {
			// console.log(`obj:${JSON.stringify(obj)}`);
			if (obj.error) {
				failedUpdates.push(obj.siteId);
				console.log(`error updating  site:${JSON.stringify(obj)}`);
			} else {
				// console.log(`obj123:${JSON.stringify(obj)}`);
				console.log(`site updated successfully:${obj.data.siteId}`);
			}
		});

		if (failedUpdates.length) {
			console.log(`Following sites could not be updated:${JSON.stringify(failedUpdates)}`);
		} else {
			console.log(`all sites updated successfully`);
		}
	});
}

function udpateActiveSitesStaus() {
	const pendingActions = [];
	const failed = [];

	pendingActions.push(getSitesFromDB());

	const fromDate = getFormattedDate(new Date(), 2);
	const toDate = getFormattedDate(new Date());

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
			const siteUpdatePromiseList = [];
			for (const key in siteList) {
				const site = siteList[key].apAppBucket;
				console.log(`updating site id:${site.siteId}`);
				siteUpdatePromiseList.push(
					processSite(site.siteId, 'dataFeedActive', !!sitesFound[site.siteId], failed)
				);
			}

			checkforFailedUpdates(siteUpdatePromiseList);
		})
		.catch(err => {
			console.log(`Exiting.....${JSON.stringify(err)}`);
		});
}

// cron.schedule('* 17 * * *', udpateActiveSitesStaus);
udpateActiveSitesStaus();
