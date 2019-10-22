const Promise = require('bluebird');
const _ = require('lodash');

const { docKeys } = require('../../../configs/commonConsts');
const { appBucket } = require('../../../helpers/routeHelpers');

function findAds(siteId, isActive, docKey) {
	const response = [];

	if (!siteId || !isActive) return Promise.resolve(response);

	return appBucket
		.getDoc(`${docKey}${siteId}`)
		.then(docWithCas => {
			const doc = docWithCas.value;
			const ads = doc.ads || false;

			if (ads && ads.length) {
				_.forEach(ads, ad => {
					const networkData =
						ad.network &&
						ad.networkData &&
						typeof ad.networkData === 'object' &&
						Object.keys(ad.networkData).length
							? ad.networkData
							: false;

					const isHeaderBiddingEnabled = !!(
						networkData &&
						networkData.dfpAdunitCode &&
						networkData.dfpAdunit &&
						(networkData.headerBidding || networkData.dynamicAllocation)
					);

					isHeaderBiddingEnabled ? response.push(ad) : null;
				});
			}
			return response;
		})
		.catch(err => {
			console.log(err.message);
			return err.code && err.code === 13 && err.message.includes('key does not exist')
				? []
				: Promise.reject(err);
		});
}

function getHbAdsApTag(siteId = 0, isActive = false) {
	return findAds(siteId, isActive, docKeys.apTag);
}

function getHbAdsInnovativeAds(siteId = 0, isActive = false) {
	return findAds(siteId, isActive, docKeys.interactiveAds);
}

module.exports = { getHbAdsApTag, getHbAdsInnovativeAds };
