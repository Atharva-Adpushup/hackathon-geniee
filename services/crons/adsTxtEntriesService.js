const cron = require('node-cron');
const { N1qlQuery } = require('couchbase');

const couchbase = require('../../helpers/couchBaseService');
const adsTxtModel = require('../../models/adsTxtModel');
const constants = require('../../configs/commonConsts');
const utils = require('../../helpers/utils');
const proxy = require('../../helpers/proxy');

function getActiveSites() {
	const query = N1qlQuery.fromString(constants.GET_ACTIVE_SITES_QUERY);

	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.queryAsync(query))
		.then(sites => {
			return sites;
		})
		.catch(err => console.log(2, err));
}

function getExistingSitesAdsTxt(site) {
	let tempUrl = site.domain;
	if (tempUrl.indexOf('http://') == -1 && tempUrl.indexOf('https://') == -1) {
		tempUrl = `http://${tempUrl}`;
	}

	return proxy
		.load(`${utils.rightTrim(tempUrl, '/')}/ads.txt`)
		.then(existingAdsTxt => {
			if (typeof existingAdsTxt === 'string') {
				let adsTxtArray = proxy.parseAdsTxtEntries(existingAdsTxt);

				if (adsTxtArray.length) {
					adsTxtArray = adsTxtArray.map(
						({ domain, pubId, relation, authorityId }) =>
							`${domain}, ${pubId}, ${relation}${authorityId ? `, ${authorityId}` : ''}`
					);
				}
				return { ...site, adsTxt: adsTxtArray };
			}
		})
		.catch(err => console.log(err));
}

function getPublisherAdsTxt() {
	return getActiveSites()
		.then(sites => {
			const sitesPromises = sites.map(site => getExistingSitesAdsTxt(site));
			return Promise.all(sitesPromises);
		})
		.catch(err => {
			console.log(err);
		});
}

function saveAdsTxtEntries() {
	getPublisherAdsTxt()
		.then(adsTxtEntries => {
			// console.log(adsTxtEntries);
			adsTxtEntries.map(adsTxtEntry => {
				adsTxtModel.saveAdsTxt(adsTxtEntry).catch(err => {
					console.log(err);
				});
			});
		})
		.catch(err => {
			console.log(err);
		});
}

// cron.schedule('0 0 */12 * * *', saveAdsTxtEntries);
saveAdsTxtEntries();
