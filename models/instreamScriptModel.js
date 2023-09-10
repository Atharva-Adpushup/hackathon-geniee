module.exports = apiModule();

const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');
const { docKeys, COUCHBASE_BUCKETS, site } = require('../configs/commonConsts');

const InstreamScript = model.extend(function() {
	this.keys = ['siteId', 'siteDomain', 'mcmId', 'videoPlayerId', 'prebid', 'ads', 'dateCreated'];
	this.clientKeys = [
		'siteId',
		'siteDomain',
		'mcmId',
		'videoPlayerId',
		'prebid',
		'ads',
		'dateCreated'
	];
	this.validations = {
		required: ['siteId', 'siteDomain']
	};
	this.classMap = {};
	this.defaults = { ads: [] };
	this.constructor = function(data, cas) {
		if (!(data.siteId && data.siteDomain)) {
			throw new Error('siteId and siteDomain required for instream doc');
		}
		this.key = `${docKeys.instreamScript}${data.siteId}`;
		this.super(data, !!cas);
		this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
	};
});

function connectToInstreamAppBucket() {
	return couchbase.connectToBucket(COUCHBASE_BUCKETS.INSTREAM_APP_BUCKET);
}

function getDocumentFromBucket(bucket, key) {
	return bucket.getAsync(key);
}

function createBvsObjectIfNotPresent(existingAd) {
	if (!existingAd.featuresData) {
		existingAd.featuresData = {};
	}
	if (!existingAd.featuresData.bannerReplacementConfig) {
		existingAd.featuresData.bannerReplacementConfig = {
			platforms: {}
		};
	}
	return existingAd;
}

function capitalizeFirstLetter(str) {
	if (typeof str !== 'string') {
		throw new Error('Input must be a String');
	}
	if (str.length === 0) {
		return str;
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
}

function fetchDocument(bucket, key) {
	if (!bucket) {
		throw new Error('Failed to connect to the Couchbase bucket.');
	}
	return getDocumentFromBucket(bucket, key);
}

function getPlatformToUse(ad) {
	const { platform, responsivePlatform } = ad.formatData;
	return platform === 'responsive' ? responsivePlatform.toUpperCase() : platform.toUpperCase();
}

// function to update Bvs data.
function updateBannerReplacementConfigObject(existingConfig, options) {
	const { instreamSectionId, ad, key, apTagSectionId, instreamAppBucket, configKey } = options;

	existingConfig.ads = existingConfig.ads.map(existingAd => {
		if (existingAd.videoSectionId === instreamSectionId) {
			existingAd = createBvsObjectIfNotPresent(existingAd); //creating Bvs Object if it is not present in the instream doc.
			const platformToUse = getPlatformToUse(ad);

			if (!existingAd.featuresData.bannerReplacementConfig.platforms[platformToUse]) {
				existingAd.featuresData.bannerReplacementConfig.platforms[platformToUse] = {};
			}

			// Update the platform-specific object with the apTagSectionId
			existingAd.featuresData.bannerReplacementConfig.platforms[platformToUse][
				key
			] = apTagSectionId;
		}
		return existingAd;
	});

	instreamAppBucket.upsertAsync(configKey, existingConfig, { cas: existingConfig.cas });

	return { success: false, message: 'Key already present, configuration not updated' };
}

function getKeyForInstreamConfig(platform, responsivePlatform) {
	if (platform === 'responsive' && responsivePlatform) {
		return `apSectionId${capitalizeFirstLetter(responsivePlatform)}`;
	} else {
		return `apSectionIdCarpet${capitalizeFirstLetter(platform)}`;
	}
}

function apiModule() {
	const API = {
		getInstreamScriptConfig(siteId) {
			return connectToInstreamAppBucket()
				.then(instreamAppBucket => {
					return fetchDocument(instreamAppBucket, `${docKeys.instreamScript}${siteId}`);
				})
				.then(json => new InstreamScript(json.value, json.cas))
				.catch(err => {
					if (err.code === 13) {
						throw new AdPushupError({
							status: 404,
							message: 'Instream Script Config does not exist'
						});
					}

					return false;
				});
		},

		// adding section id with keys based on the selected responsive platform which we get from frontend.
		updateInstreamConfig(configParams, ad) {
			const { platform, responsivePlatform } = ad.formatData;
			const key = getKeyForInstreamConfig(platform, responsivePlatform);
			return addAptagSectionToInstreamConfig(configParams, key, ad);
		},
		addAptagSectionToInstreamConfig: addAptagSectionToInstreamConfig
	};

	function addAptagSectionToInstreamConfig(configParams, key, ad) {
		const { siteId, instreamSectionId, apTagSectionId } = configParams;
		const configKey = `${docKeys.instreamScript}${siteId}`;
		let instreamAppBucket;

		return connectToInstreamAppBucket()
			.then(bucket => {
				instreamAppBucket = bucket;
				return fetchDocument(instreamAppBucket, configKey);
			})
			.then(doc =>
				updateBannerReplacementConfigObject(doc.value, {
					instreamSectionId,
					ad,
					key,
					apTagSectionId,
					instreamAppBucket,
					configKey
				})
			)
			.catch(error => {
				console.error('Error:', error);
				throw new AdPushupError({
					status: 500,
					message: `Failed to update Instream Script Config: ${error.message}`
				});
			});
	}

	return API;
}
