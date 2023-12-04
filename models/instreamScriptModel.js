module.exports = apiModule();

const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');
const {
	docKeys,
	COUCHBASE_BUCKETS,
	site,
	FRAMERATE_COMPANION,
	DATABASE_SUCCESS_RESPONSE_MESSAGES
} = require('../configs/commonConsts');

const { INTERNAL_SERVER_ERROR } = require('../configs/httpStatusConsts');

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

function createCompanionObjectIfNotPresent(existingAd) {
	if (!existingAd.networkData) {
		existingAd.networkData = {};
	}
	if (!existingAd.networkData.apCompanionAds) {
		existingAd.networkData.apCompanionAds = {};
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

	return instreamAppBucket.upsertAsync(configKey, existingConfig, { cas: existingConfig.cas });
}

function updateFramrateCompanionConfigObject(existingConfig = {}, options = {}) {
	const { framerateSectionId, ad, key, apTagSectionId, instreamAppBucket, configKey } = options;

	if (!existingConfig.ads) {
		return;
	}
	existingConfig.ads = modifyCompanionConfigObject(existingConfig, {
		framerateSectionId,
		ad,
		key,
		apTagSectionId
	});

	return instreamAppBucket.upsertAsync(configKey, existingConfig, { cas: existingConfig.cas });
}

function modifyCompanionConfigObject(existingConfig, options) {
	const { framerateSectionId, ad, key, apTagSectionId } = options;

	const ads = existingConfig.ads.map(existingAd => {
		if (existingAd.videoSectionId === framerateSectionId) {
			const { platform } = ad.formatData;
			if (!platform) {
				return existingAd;
			}
			const upperCasePlatform = platform.toUpperCase();
			existingAd = createCompanionObjectIfNotPresent(existingAd); // creating companion object if it is not present in the instream config.
			const apCompanionAds = existingAd.networkData.apCompanionAds;
			if (!apCompanionAds[upperCasePlatform]) {
				apCompanionAds[upperCasePlatform] = {};
			}
			apCompanionAds[upperCasePlatform][key] = apTagSectionId;
		}
		return existingAd;
	});
	return ads;
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
		updateFramerateCompanionConfig(companionParams, ad) {
			const key = FRAMERATE_COMPANION.SECTION_KEY;
			return addAptagSectionToFramerateConfig(companionParams, key, ad);
		},
		addAptagSectionToInstreamConfig,
		addAptagSectionToFramerateConfig
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
			.then(result => {
				console.log(DATABASE_SUCCESS_RESPONSE_MESSAGES.CONFIG_UPDATED, result);
			})
			.catch(error => {
				console.error('Error:', error);
				throw new AdPushupError({
					status: INTERNAL_SERVER_ERROR,
					message: `Failed to update Instream Script Config: ${error.message}`
				});
			});
	}

	function addAptagSectionToFramerateConfig(configParams, key, ad) {
		const { siteId, framerateSectionId, apTagSectionId } = configParams;
		const configKey = `${docKeys.instreamScript}${siteId}`;
		let instreamAppBucket;

		return connectToInstreamAppBucket()
			.then(bucket => {
				instreamAppBucket = bucket;
				return fetchDocument(instreamAppBucket, configKey);
			})
			.then(doc =>
				updateFramrateCompanionConfigObject(doc.value, {
					framerateSectionId,
					ad,
					key,
					apTagSectionId,
					instreamAppBucket,
					configKey
				})
			)
			.then(result => {
				console.log(DATABASE_SUCCESS_RESPONSE_MESSAGES.CONFIG_UPDATED, result);
			})
			.catch(error => {
				console.error('Error:', error);
				throw new AdPushupError({
					status: INTERNAL_SERVER_ERROR,
					message: `Failed to update Instream Script Config: ${error.message}`
				});
			});
	}

	return API;
}
