const Promise = require('bluebird');
const _ = require('lodash');
const { couchbaseService } = require('node-utils');
const config = require('../../../configs/config');
const { docKeys } = require('../../../configs/commonConsts');

const appBucket = couchbaseService(
	`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
	config.couchBase.DEFAULT_BUCKET,
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);

function getHbAdsApTag(siteId = 0, isManual = false) {
	let response = [];
	if (!siteId || !isManual) {
		return Promise.resolve(response);
	}
	return appBucket
		.getDoc(`${docKeys.apTag}${siteId}`)
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
			return response;
		});
}

module.exports = { getHbAdsApTag };
