const { promiseForeach } = require('node-utils');

const siteModel = require('../../../../models/siteModel');
const { fetchAllSites, errorHandler, updateDoc, getDoc, dBHelper } = require('./helpers');

function computeStatus(docKey, status, processing) {
	if (status) return status;
	return dBHelper
		.getDoc(docKey)
		.then(docWithCas => processing(docWithCas))
		.catch(err => {
			console.log(`Error while processing ${docKey} `);
			console.log(err);
			return false;
		});
}

function getApTagStatus(siteId, status) {
	return computeStatus(`tgmr::${siteId}`, status, docWithCas => {
		const { value = { ads: [] } } = docWithCas;
		return !!(value.ads && value.ads.length);
	});
}

function getInnovativeAdsStatus(siteId, status) {
	if (status) return status;
	return siteModel
		.getSiteById(siteId)
		.then(site => site.getAllChannels())
		.then(channels => {
			let response = false;
			channels.some(channel => {
				const { variations = {} } = channel;
				const variationIds = Object.keys(variations);
				variationIds.some(variationId => {
					const variation = variations[variationId];
					const { sections = {} } = variation;
					const sectionIds = Object.keys(sections);
					sectionIds.some(id => {
						const section = sections[id];
						if (section.type === 3 || section.type === 4) {
							response = true;
							return true;
						}
						return false;
					});
					if (response) return response;
				});
				if (response) return response;
			});
			return response;
		})
		.catch(err => {
			console.log('Error while processing innovative ads status for site', siteId);
			console.log(err);
			return false;
		});
}

function getHbStatus(siteId) {
	return computeStatus(`hbcf::${siteId}`, false, docWithCas => {
		const { value: { hbConfig: { bidderAdUnits = {} } = {} } = {} } = docWithCas;
		return !!(bidderAdUnits && Object.keys(bidderAdUnits).length);
	});
}

async function getStatuses(site) {
	const { isManual = false, isInnovative = false } = site;
	const apTagStatus = await getApTagStatus(site.siteId, isManual);
	const innovativeAdsStatus = await getInnovativeAdsStatus(site.siteId, isInnovative);
	const headerBiddingStatus = await getHbStatus(site.siteId);
	const consentManagementStatus = !!(
		site.gdpr &&
		site.gdpr.compliance &&
		site.gdpr.cookieControlConfig
	);

	return {
		layout: true,
		apTag: apTagStatus,
		innovativeAds: innovativeAdsStatus,
		headerBidding: headerBiddingStatus,
		consentManagement: consentManagementStatus
	};
}

function siteProcessing(site) {
	const key = `site::${site.siteId}`;
	let cas;
	let siteDoc;
	return getDoc(key)
		.then(result => {
			cas = result.cas;
			siteDoc = result.value;
			return getStatuses(siteDoc);
		})
		.then(statuses => {
			console.log('Site Id: ', site.siteId, 'Statuses: ', statuses);
			siteDoc.apps = statuses;
		})
		.then(() => updateDoc(key, siteDoc, cas))
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

init()
	.then(() => console.log('Processing over'))
	.then(() => process.exit(0));

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
