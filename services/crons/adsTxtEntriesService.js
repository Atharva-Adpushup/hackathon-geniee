const cron = require('node-cron');

const adsTxtModel = require('../../models/adsTxtModel');
const siteModel = require('../../models/siteModel');
const utils = require('../../helpers/utils');
const proxy = require('../../helpers/proxy');

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
				return { ...site, adsTxt: adsTxtArray };
			} else {
				return { ...site, adsTxt: [] };
			}
		})
		.catch(err => console.log(err));
}

function getPublisherAdsTxt() {
	return siteModel
		.getActiveSites()
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
