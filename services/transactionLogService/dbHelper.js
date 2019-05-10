const Promise = require('bluebird');
const _ = require('lodash');
const { promiseForeach, couchbaseService } = require('node-utils');
const config = require('../../configs/config');

const dbHelper = couchbaseService(
	config.couchBase.HOST,
	config.couchBase.DEFAULT_BUCKET,
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);

function modifyChannelData(channelDoc, ads) {
	let variations = channelDoc.value.variations;
	_.each(ads, ad => {
		const sectionId = ad.sectionId ? ad.sectionId : ad.id; // id: Refers to Section Id | adId: Refers to adId
		if (
			variations && // if variations exists
			variations[ad.variationId] && // if particular variation exists
			variations[ad.variationId].sections && // if section exists
			variations[ad.variationId].sections[sectionId] && // if particular section exists in the variation
			variations[ad.variationId].sections[sectionId].ads && // has an ads array
			variations[ad.variationId].sections[sectionId].ads[ad.adId] // particular ad exists in the ads array
		) {
			let networkData = variations[ad.variationId].sections[sectionId].ads[ad.adId].networkData || {};
			networkData.logWritten = true; // Setting logWritten to true
			variations[ad.variationId].sections[sectionId].ads[ad.adId].networkData = networkData;
		}
	});
	channelDoc.value.variations = variations;
	return channelDoc;
}

function processChannel(chnlKey, chnlAds) {
	return dbHelper
		.getDoc(chnlKey)
		.then(channelDoc => modifyChannelData(channelDoc, chnlAds))
		.then(channelDoc => dbHelper.updateDoc(chnlKey, channelDoc.value, channelDoc.cas));
}

function updateLayout(ads) {
	if (!ads || !ads.length) {
		return Promise.resolve();
	}
	const adsByChannels = _.groupBy(ads, 'channelKey');
	const keys = Object.keys(adsByChannels);
	return promiseForeach(
		keys,
		chnlKey => processChannel(chnlKey, adsByChannels[chnlKey]),
		err => {
			return false;
		}
	);
}

function customDocProcessing(ads, docKey) {
	if (!ads || !ads.length) {
		return Promise.resolve();
	}
	return dbHelper.getDoc(docKey).then(docWithCas => {
		let adsFromDoc = _.cloneDeep(docWithCas.value.ads);
		_.forEach(adsFromDoc, ad => {
			_.forEach(ads, currentAd => {
				if (ad.id == currentAd.id) {
					ad.networkData = ad.networkData || {};
					ad.networkData.logWritten = true;
				}
			});
		});
		docWithCas.value.ads = adsFromDoc;
		return dbHelper.updateDoc(docKey, docWithCas.value, docWithCas.cas);
	});
}

function updateTagManager(siteId, ads) {
	return customDocProcessing(ads, `tgmr::${siteId}`);
}

function updateInnovativeAdsManager(siteId, ads) {
	return customDocProcessing(ads, `fmrt::${siteId}`);
}

function updateDb(siteId, layoutAds, apTagAds, innovativeAds) {
	return updateLayout(layoutAds)
		.then(() => updateTagManager(siteId, apTagAds))
		.then(() => updateInnovativeAdsManager(siteId, innovativeAds))
		.then(() => console.log(`Docs updated for site: ${siteId}`));
}

module.exports = { updateDb };
