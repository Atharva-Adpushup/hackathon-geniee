const uuid = require('uuid');
const moment = require('moment');

const { docKeys, tagManagerInitialDoc, INSTREAM_FORMAT_TYPES } = require('../configs/commonConsts');
const config = require('../configs/config');
const {
	appBucket,
	sendDataToZapier,
	createNewDocAndDoProcessing
} = require('../helpers/routeHelpers');
const { generateSectionName } = require('../helpers/clientServerHelpers');
const instreamScriptModel = require('../models/instreamScriptModel');
const { checkIfInstreamAd } = require('../helpers/commonFunctions');
// setting old value to null so that we can have only 1 instreamSectionId key for each ad(platform specific)
function resetInstreamSectionId(data, options) {
	const { platform, responsivePlatform, instreamSectionId } = options;
	return data.map(obj => {
		if (obj.instreamSectionId === instreamSectionId) {
			if (
				(platform !== 'responsive' && platform === obj.formatData.platform) ||
				(platform === 'responsive' && responsivePlatform === obj.formatData.responsivePlatform)
			) {
				obj.instreamSectionId = null;
			}
		}
		return obj;
	});
}

function resetCompanionSectionId(data, framerateSectionId, platform) {
	return data.map(obj => {
		const { framerateCompanionAd } = obj;
		if (
			framerateCompanionAd &&
			framerateCompanionAd.framerateSectionId === framerateSectionId &&
			platform === obj.formatData.platform
		) {
			obj.framerateCompanionAd.framerateSectionId = null;
		}
		return obj;
	});
}

function getFramerateSectionId(ad) {
	const { framerateCompanionAd = {} } = ad || {};
	const { framerateSectionId = '' } = framerateCompanionAd;
	return framerateSectionId;
}

const apTagServices = {
	createAd: (ad, siteId, ownerEmail) => {
		const payload = {
			ad,
			siteId,
			ownerEmail
		};

		return appBucket
			.getDoc(`${docKeys.apTag}${siteId}`)
			.then(doc => apTagServices.processing(doc, payload))
			.catch(err => {
				if (err && err.name === 'CouchbaseError' && err.code === 13) {
					return apTagServices.createNewDocAndDoProcessingWrapper(payload);
				} else {
					return Promise.reject(err);
				}
			})
			.spread(apTagServices.dbWrapper);
	},
	isSuperUser: false,
	createNewDocAndDoProcessingWrapper: payload =>
		createNewDocAndDoProcessing(
			payload,
			tagManagerInitialDoc,
			docKeys.apTag,
			apTagServices.processing
		),
	processing: (data, payload) => {
		const { siteId, ad: payloadAd = {} } = payload;
		const instreamSectionId = payloadAd.instreamSectionId || '';
		const framerateSectionId = getFramerateSectionId(payloadAd);
		const cas = data.cas || false;
		const value = data.value || data;
		const id = uuid.v4();
		const name = generateSectionName({
			width: payload.ad.formatData.type === 'rewardedAds' ? 1 : payload.ad.width,
			height: payload.ad.formatData.type === 'rewardedAds' ? 1 : payload.ad.height,
			platform: payload.ad.formatData.platform || null,
			pagegroup: null,
			id,
			service: 'T'
		});
		const ad = {
			...payload.ad,
			id,
			name,
			createdOn: +new Date(),
			formatData: {
				...payload.ad.formatData
			}
		};
		const { type, platform, responsivePlatform, subType } = ad.formatData;
		const apTagSectionId = id;
		const options = {
			platform,
			responsivePlatform,
			instreamSectionId
		};
		const isInstream = checkIfInstreamAd(type);

		if (isInstream) {
			const isBvs = instreamSectionId && subType === INSTREAM_FORMAT_TYPES.SUBTYPES.BVS;
			const isCompanion =
				framerateSectionId && subType === INSTREAM_FORMAT_TYPES.SUBTYPES.COMPANION;

			try {
				if (isBvs || isCompanion) {
					const adsParam = { siteId, apTagSectionId };

					if (isBvs) {
						adsParam.instreamSectionId = instreamSectionId;
						ad.name = `Bvs_${ad.name}`;
						value.ads = resetInstreamSectionId(value.ads, options);
						instreamScriptModel.updateInstreamConfig(adsParam, ad);
					} else if (isCompanion) {
						adsParam.framerateSectionId = framerateSectionId;
						ad.name = `Cmp_${ad.name}`;
						value.ads = resetCompanionSectionId(value.ads, framerateSectionId, platform);
						instreamScriptModel.updateFramerateCompanionConfig(adsParam, ad);
					}
				}
			} catch (error) {
				console.error(error);
			}
		}

		value.ads.push(ad);
		value.siteDomain = value.siteDomain || payload.siteDomain;
		value.siteId = value.siteId || payload.siteId;
		value.ownerEmail = value.ownerEmail || payload.ownerEmail;

		if (config.environment.HOST_ENV === 'production' && !apTagServices.isSuperUser) {
			sendDataToZapier('https://hooks.zapier.com/hooks/catch/547126/cdt7p8/?', {
				email: value.ownerEmail,
				website: value.siteDomain,
				platform: ad.formatData.platform,
				size: `${ad.width}x${ad.height}`,
				adId: ad.id,
				type: 'action',
				message: 'New Section Created. Please Check',
				createdOn: moment(ad.createdOn).format('dddd, MMMM Do YYYY, h:mm:ss a')
			});
		}

		return Promise.resolve([
			cas,
			value,
			{
				id,
				name
			},
			payload.siteId
		]);
	},
	getAndUpdate: (key, value) =>
		appBucket.getDoc(key).then(result => appBucket.updateDoc(key, value, result.cas)),
	directDBUpdate: (key, value, cas) => appBucket.updateDoc(key, value, cas),
	dbWrapper: (cas, value, toReturn, siteId) => {
		const key = `${docKeys.apTag}${siteId}`;

		function dbOperation() {
			return !cas
				? apTagServices.getAndUpdate(key, value)
				: apTagServices.directDBUpdate(key, value, cas);
		}

		return dbOperation().then(() => toReturn);
	},
	fetchAds: siteId => {
		return appBucket
			.getDoc(`${docKeys.apTag}${siteId}`)
			.then(doc => {
				console.log({ doc });
				return doc.value.ads || [];
			})
			.catch(err => {
				if (err && err.code && err.code === 13) {
					return [];
				}
				throw err;
			});
	},
	updateAds: (siteId, ads = []) => {
		return appBucket
			.getDoc(`${docKeys.apTag}${siteId}`)
			.then(doc => {
				const newDoc = {
					...doc.value,
					ads
				};
				console.dir(newDoc, { depth: 8 });
				return appBucket.updateDoc(`${docKeys.apTag}${siteId}`, newDoc, doc.cas);
			})
			.catch(err => {
				if (err && err.code && err.code === 13) return {};
				throw err;
			});
	}
};

module.exports = apTagServices;
