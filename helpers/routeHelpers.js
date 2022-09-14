const Promise = require('bluebird');
const _ = require('lodash');
const { couchbaseService } = require('node-utils');
const jsondiffpatch = require('jsondiffpatch').create();

const request = require('request-promise');
const couchbase = require('../helpers/couchBaseService'),
	couchbaseModule = require('couchbase'),
	{ N1qlQuery, ViewQuery } = couchbaseModule;

const config = require('../configs/config');
const siteModel = require('../models/siteModel');
const HTTP_STATUS = require('../configs/httpStatusConsts');
const adpushup = require('./adpushupEvent');
const AdPushupError = require('./AdPushupError');
const { sendErrorResponse, sendSuccessResponse } = require('./commonFunctions');
const {
	PRODUCT_LIST_API,
	APP_KEYS,
	GOOGLE_BOT_USER_AGENT,
	DEFAULT_APP_STATUS_RESPONSE,
	ADS_TXT_REDIRECT_PATTERN,
	AUDIT_LOGS_ACTIONS: { OPS_PANEL },
	docKeys,
	AMP_REFRESH_INTERVAL
} = require('../configs/commonConsts');
const channelModel = require('../models/channelModel');
const userModel = require('../models/userModel')
const hubSpotService = require('../apiServices/associatedAccountAccessControlService');

const appBucket = couchbaseService(
	`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
	config.couchBase.DEFAULT_BUCKET,
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);

const helpers = {
	adUpdateProcessing: (req, res, key, processing) =>
		appBucket
			.getDoc(`${key}${req.params.siteId}`)
			.then(docWithCas => processing(docWithCas))
			.then(() => emitEventAndSendResponse(req.body.siteId || req.params.siteId, res))
			.catch(err => {
				let error = err;
				if (err && err.code && err.code === 13) {
					error = new AdPushupError({
						message: 'No Doc Found',
						code: HTTP_STATUS.BAD_REQUEST
					});
				}
				return errorHandler(error, res);
			}),
	directDBUpdate: (key, value, cas) => {
		return appBucket.updateDoc(key, value, cas);
	}
};

function verifyOwner(siteId, userEmail) {
	return siteModel
		.getSiteById(siteId)
		.then(site => {
			if (site.get('ownerEmail') !== userEmail) {
				throw new AdPushupError({
					message: 'Unauthorized Request',
					code: HTTP_STATUS.PERMISSION_DENIED
				});
			}
			return site;
		})
		.catch(err => {
			if (err instanceof AdPushupError) throw err;
			throw new AdPushupError({
				message: 'Request Failed',
				code: HTTP_STATUS.BAD_REQUEST
			});
		});
}

function errorHandler(err, res, code = HTTP_STATUS.BAD_REQUEST, debugData = {}) {
	const customMessage = err.message || err;
	const isCustomMessageNonEmptyString = !!(
		typeof customMessage === 'string' && customMessage !== ''
	);

	let errorCode = code;
	let message = customMessage || 'Opertion Failed';

	if (isCustomMessageNonEmptyString === false) {
		errorCode = customMessage.code || errorCode;
		message = customMessage.message || message;
	}
	return sendErrorResponse({ message, code: errorCode, debugData }, res, errorCode);
}

function sendDataToZapier(uri, data) {
	const options = {
		method: 'GET',
		uri,
		qs: data,
		json: true
	};

	return request(options)
		.then(() => console.log('Ad Creation. Called made to Zapier'))
		.catch(() => console.log('Ad creation call to Zapier failed'));
}

function emitEventAndSendResponse(siteId, res, data = {}) {
	return siteModel.getSiteById(siteId).then(site => {
		adpushup.emit('siteSaved', site); // Emitting Event for Ad Syncing
		return sendSuccessResponse(
			{
				message: 'Operation Successfull',
				...data
			},
			res
		);
	});
}
function sendDataToAuditLogService(data) {
	const { prevConfig, currentConfig, action = {}, ...restLogData } = data;
	const delta = jsondiffpatch.diff(prevConfig, currentConfig) || {};

	// don't need to send current config to elastic service
	const options = {
		method: 'POST',
		uri: `${config.auditLogElasticServer.host}`,
		body: {
			...restLogData,
			prevConfig,
			logData: {
				delta,
				action
			}
		},
		json: true
	};
	return request(options)
		.then(() => console.log('Audit Logs saved'))
		.catch(err => console.log('Audit Logs failed', err));
}

function fetchAds(req, res, docKey) {
	if (!req.query || !req.query.siteId) {
		return sendErrorResponse(
			{
				message: 'Incomplete Parameters. Please check siteId'
			},
			res
		);
	}
	const { siteId } = req.query;
	return verifyOwner(siteId, req.user.email)
		.then(() => appBucket.getDoc(`${docKey}${siteId}`))
		.then(docWithCas =>
			sendSuccessResponse(
				{
					ads: docWithCas.value.ads || []
				},
				res
			)
		)
		.catch(err =>
			err.code && err.code === 13 && err.message.includes('key does not exist')
				? sendSuccessResponse(
					{
						ads: []
					},
					res
				)
				: errorHandler(err, res)
		);
}

function createNewDocAndDoProcessing(payload, initialDoc, docKey, processing) {
	const defaultDocCopy = _.cloneDeep(initialDoc);
	return appBucket
		.createDoc(`${docKey}${payload.siteId}`, defaultDocCopy, {})
		.then(() => appBucket.getDoc(`site::${payload.siteId}`))
		.then(docWithCas => {
			payload.siteDomain = docWithCas.value.siteDomain;
			return processing(defaultDocCopy, payload);
		});
}

function masterSave(req, res, adUpdateProcessing, directDBUpdate, docKey, mode = 1) {
	if (
		!req.body ||
		!req.body.siteId ||
		!req.body.ads ||
		!req.user.isSuperUser ||
		(mode == 2 && !req.body.meta)
	) {
		return sendErrorResponse(
			{
				message: 'Invalid Parameters.'
			},
			res
		);
	}
	return adUpdateProcessing(req, res, docKey, docWithCas => {
		const doc = docWithCas.value;
		const { siteId } = req.body;
		if (doc.ownerEmail !== req.user.email) {
			throw new AdPushupError({
				message: 'Unauthorized Request',
				code: HTTP_STATUS.PERMISSION_DENIED
			});
		}
		if (!doc.ads.length) {
			doc.ads = req.body.ads;
		} else {
			const newAds = [];

			_.forEach(doc.ads, adFromDoc => {
				_.forEach(req.body.ads, adFromClient => {
					if (adFromDoc.id === adFromClient.id) {
						newAds.push({
							...adFromDoc,
							...adFromClient,
							networkData: {
								...adFromDoc.networkData,
								...adFromClient.networkData
							}
						});
					}
				});
			});
			doc.ads = newAds;
		}
		if (mode === 2 && (doc.meta || req.body.meta)) {
			doc.meta = req.body.meta;
		}
		return directDBUpdate(`${docKey}${siteId}`, doc, docWithCas.cas);
	});
}

function modifyAd(req, res, adUpdateProcessing, directDBUpdate, key) {
	if (!req.body || !req.body.siteId || !req.body.adId) {
		return sendErrorResponse(
			{
				message: 'Invalid Parameters.'
			},
			res
		);
	}
	return adUpdateProcessing(req, res, key, docWithCas => {
		const doc = docWithCas.value;
		if (doc.ownerEmail !== req.user.email) {
			throw new AdPushupError({
				message: 'Unauthorized Request',
				code: HTTP_STATUS.PERMISSION_DENIED
			});
		}
		_.forEach(doc.ads, (ad, index) => {
			if (ad.id === req.body.adId) {
				doc.ads[index] = { ...ad, ...req.body.data };
				return false;
			}
		});
		if (req.body.metaUpdate && Object.keys(req.body.metaUpdate).length) {
			const { mode, logs } = req.body.metaUpdate;
			doc.meta[mode] = logs;
		}
		return directDBUpdate(`${key}${req.body.siteId}`, doc, docWithCas.cas);
	});
}

function fetchStatusesFromReporting(site) {
	const options = {
		method: 'GET',
		uri: PRODUCT_LIST_API,
		qs: { siteid: site.get('siteId') },
		json: true
	};

	return request(options)
		.then(response => {
			const { data = {}, code } = response;
			const output = {};

			if (!code || code !== 1) {
				throw new Error(`APP Status API Failed and err is ${data}`);
			}

			_.forEach(data, (isActive, product) => {
				if (isActive) {
					const productInfo = APP_KEYS[product.toLowerCase()];
					output[productInfo.key] = productInfo;
				}
			});
			return output;
		})
		.catch(err => {
			console.log(err.message);
			return DEFAULT_APP_STATUS_RESPONSE;
		});
}

function getChannelsAndComputeStatuses(site) {
	return site
		.getAllChannels()
		.then(channels => {
			const response = {};
			if (channels && channels.length) {
				_.forEach(channels, channel => {
					const isAutoOptimiseOn = !!(
						Object.prototype.hasOwnProperty.call(channel, 'autoOptimise') && channel.autoOptimise
					);
					const isAMPEnabled = !!(
						Object.prototype.hasOwnProperty.call(channel, 'ampSettings') &&
						channel.ampSettings &&
						channel.ampSettings.isEnabled
					);

					isAMPEnabled ? (response['6'] = APP_KEYS['6']) : null;
					isAutoOptimiseOn ? (response['4'] = APP_KEYS['4']) : null;
				});
			}
			return response;
		})
		.catch(err => {
			console.log(err);
			return DEFAULT_APP_STATUS_RESPONSE;
		});
}

function checkManageAdsTxtStatus(site) {
	const siteDomain = site.get('siteDomain');
	const lastChar = siteDomain[siteDomain.length - 1] !== '/' ? '/' : '';
	const sanitizedDomain = `${siteDomain}${lastChar}`;
	const options = {
		method: 'GET',
		uri: `${sanitizedDomain}ads.txt`,
		headers: {
			'User-Agent': GOOGLE_BOT_USER_AGENT
		},
		simple: false,
		resolveWithFullResponse: true
	};

	return request(options)
		.then(response => {
			const output = {};
			const isRedirecting = response.request.uri.href.indexOf(ADS_TXT_REDIRECT_PATTERN) !== -1;

			isRedirecting ? (output['8'] = APP_KEYS['manageadstxt']) : null;
			return output;
		})
		.catch(err => {
			console.log(err);
			return DEFAULT_APP_STATUS_RESPONSE;
		});
}

function fetchCustomStatuses(site) {
	return Promise.join(
		getChannelsAndComputeStatuses(site),
		checkManageAdsTxtStatus(site),
		(statusesFromChannels, statusFromManageAds) =>
			Promise.resolve({
				...statusesFromChannels,
				...statusFromManageAds
			})
	).catch(err => {
		console.log(err);
		return DEFAULT_APP_STATUS_RESPONSE;
	});
}

function checkParams(toCheck, req, mode, checkLight = false) {
	return new Promise((resolve, reject) => {
		const container = mode === 'post' ? req.body : req.query;
		if (container) {
			if (checkLight === false) {
				_.forEach(toCheck, (value, key) => {
					if (!(value in container)) {
						return reject(
							new AdPushupError({
								message: `Missing params. ${value} is required.`,
								code: HTTP_STATUS.BAD_REQUEST
							})
						);
					}
				});
			}
			return resolve();
		}
		return reject(new customError('Missing params'));
	});
}

function createNewAmpDocAndDoProcessing(payload, initialDoc, docKey, processing) {
	const defaultDocCopy = _.cloneDeep(initialDoc);
	return appBucket
		.createDoc(`${docKey}${payload.siteId}:${payload.id}`, defaultDocCopy, {})
		.then(() => appBucket.getDoc(`site::${payload.siteId}`))
		.then(docWithCas => {
			payload.siteDomain = docWithCas.value.siteDomain;
			return processing(defaultDocCopy, payload);
		});
}

// for new AMP Tag format
function createNewAmpScriptDocAndDoProcessing(payload, initialDoc, docKey, processing) {
	const defaultDocCopy = _.cloneDeep(initialDoc);
	return appBucket
		.createDoc(`${docKey}${payload.siteId}`, defaultDocCopy, {})
		.then(() => appBucket.getDoc(`${docKey}${payload.siteId}`))
		.then(docWithCas => {
			payload.siteDomain = docWithCas.value.siteDomain;
			return processing(defaultDocCopy, payload);
		});
}

function getAmpAds(siteId) {
	const GET_ALL_AMP_ADS_QUERY = `SELECT _amtg as doc
	FROM AppBucket _amtg
	WHERE meta(_amtg).id LIKE 'amtg::%' AND _amtg.siteId = "${siteId}";`;

	const query = N1qlQuery.fromString(GET_ALL_AMP_ADS_QUERY);

	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.queryAsync(query))
		.then(ads => ads)
		.catch(err => console.log(err));
}

// for new AMP Ad format
function getNewAmpAds(siteId) {
	return couchbase
		.connectToAppBucket()
		.then(appBucket =>
			appBucket.getAsync(`${docKeys.ampScript}${siteId}`, {}).then(ampdDoc => {
				const {
					value: { ads }
				} = ampdDoc;
				return ads;
			})
		)
		.catch(err => console.log(err));
}

const updateNonLayoutAds = (req, res, docKey, adData) => {
	const { adUnitId, newData, siteDomain } = adData;

	return helpers
		.adUpdateProcessing(req, res, docKey, docWithCas => {
			const doc = docWithCas.value;

			// Add isAdmin Check
			if (!req.user.isSuperUser) {
				throw new AdPushupError({
					message: 'Unauthorized Request',
					code: HTTP_STATUS.PERMISSION_DENIED
				});
			}

			let prevConfig = {},
				currentConfig = {};

			_.forEach(doc.ads, (ad, index) => {
				if (ad.id === adUnitId) {
					prevConfig = { ...ad };
					currentConfig = { ...ad, ...newData };
					doc.ads[index] = currentConfig;
					return false;
				}
				return true;
			});

			const { siteId } = req.params;
			const appName = 'Ad Unit Inventory';
			const { email, originalEmail } = req.user;

			// log config changes
			sendDataToAuditLogService({
				siteId,
				siteDomain,
				appName,
				type: 'app',
				impersonateId: email,
				userId: originalEmail,
				prevConfig,
				currentConfig,
				action: {
					name: OPS_PANEL.TOOLS,
					data: `Ad Inventory Change - Non Layout Ad Doc Updated`
				}
			});

			return helpers.directDBUpdate(`${docKey}${req.params.siteId}`, doc, docWithCas.cas);
		})
		.catch(err => errorHandler(err, res));
};

const updateApTagAd = (req, res, adData) => {
	const docKey = docKeys.apTag;
	return updateNonLayoutAds(req, res, docKey, adData);
};

const updateInnovativeAd = (req, res, adData) => {
	const docKey = docKeys.interactiveAds;
	return updateNonLayoutAds(req, res, docKey, adData);
};

const updateApLiteAd = (req, res, adData, logServiceNames) => {
	const { logType, actionName, serviceName } = logServiceNames || {};
	const docKey = docKeys.apLite;
	const { adUnitId, adUnitData, siteDomain } = adData;

	return helpers
		.adUpdateProcessing(req, res, docKey, docWithCas => {
			const doc = docWithCas.value;

			// Add isAdmin Check
			if (!req.user.isSuperUser) {
				throw new AdPushupError({
					message: 'Unauthorized Request',
					code: HTTP_STATUS.PERMISSION_DENIED
				});
			}

			let prevConfig = {},
				currentConfig = {};
			_.forEach(doc.adUnits, (ad, index) => {
				if (ad.dfpAdUnit == adUnitId) {
					prevConfig = { ...ad };
					currentConfig = { ...ad, ...adUnitData };
					doc.adUnits[index] = currentConfig;
					return false;
				}
				return true;
			});

			const { siteId } = req.params;
			const appName = 'Ad Unit Inventory';
			const { email, originalEmail } = req.user;

			// log config changes
			sendDataToAuditLogService({
				siteId,
				siteDomain,
				appName,
				type: 'app',
				impersonateId: email,
				userId: originalEmail,
				prevConfig,
				currentConfig,
				action: {
					name: OPS_PANEL.TOOLS,
					data: `Ad Inventory Change - Non Layout Ad Doc Updated`
				}
			});

			return helpers.directDBUpdate(`${docKey}${req.params.siteId}`, doc, docWithCas.cas);
		})
		.catch(err => {
			console.log(err);
			return errorHandler(err, res);
		});
};

function fetchAmpAds(req, res, docKey) {
	if (!req.query || !req.query.siteId) {
		return sendErrorResponse(
			{
				message: 'Incomplete Parameters. Please check siteId'
			},
			res
		);
	}
	const { siteId } = req.query;

	return verifyOwner(siteId, req.user.email)
		.then(() => getAmpAds(siteId))
		.then(queryResult => queryResult)
		.then(ads =>
			sendSuccessResponse(
				{
					ads: ads.map(val => val.doc) || []
				},
				res
			)
		)

		.catch(err =>
			err.code && err.code === 13 && err.message.includes('key does not exist')
				? sendSuccessResponse(
					{
						ads: []
					},
					res
				)
				: errorHandler(err, res)
		);
}

// for new AMP Ad format
function fetchNewAmpAds(req, res, docKey) {
	if (!req.query || !req.query.siteId) {
		return sendErrorResponse(
			{
				message: 'Incomplete Parameters. Please check siteId'
			},
			res
		);
	}
	const { siteId } = req.query;

	return verifyOwner(siteId, req.user.email)
		.then(() => getNewAmpAds(siteId))
		.then((ads = []) => {
			return sendSuccessResponse({ ads }, res);
		})
		.catch(err =>
			err.code && err.code === 13 && err.message.includes('key does not exist')
				? sendSuccessResponse({ ads: [] }, res)
				: errorHandler(err, res)
		);
}

function updateAmpTags(id, ads, updateThis) {
	if (!id) {
		return Promise.resolve();
	}

	return couchbase
		.connectToAppBucket()
		.then(appBucket =>
			appBucket.getAsync(`amtg::${id}`, {}).then(amtgDoc => ({ appBucket, amtgDoc }))
		)
		.then(({ appBucket, amtgDoc: { value } }) => {
			if (!ads) {
				value = { ...value, ...updateThis, updatedOn: +new Date() };
			} else {
				const updatedAd = ads.find(val => val.id === id);

				value = updatedAd;
				value.updatedOn = +new Date();
				if (value.ad.isRefreshEnabled) {
					!value.ad.refreshInterval && (value.ad.refreshInterval = AMP_REFRESH_INTERVAL);
				} else {
					delete value.ad.refreshInterval;
				}
			}

			return appBucket.replaceAsync(`amtg::${id}`, value) && value;
		})
		.catch(err => {
			if (err.code === 13) {
				return [];
			}

			throw err;
		});
}

function findAndUpdateAmpAd(value, id, update) {
	const index = value.ads.findIndex(adItem => adItem.id == id);
	let adItem = value.ads[index];
	value.ads[index] = { ...value.ads[index], ...update };

	value.updatedOn = +new Date();
	if (!adItem.networkData.refreshInterval) {
		adItem.isRefreshEnabled
			? (adItem.networkData.refreshInterval = AMP_REFRESH_INTERVAL)
			: delete adItem.refreshInterval;
	}
	return value;
}

// for new AMP Ad format
function updateAmpTagsNewFormat(id, ads, siteId, updateThis) {
	return couchbase
		.connectToAppBucket()
		.then(appBucket =>
			appBucket.getAsync(`${docKeys.ampScript}${siteId}`, {}).then(ampd => ({ appBucket, ampd }))
		)
		.then(({ appBucket, ampd: { value } }) => {
			if (id) {
				value = findAndUpdateAmpAd(value, id, updateThis);
			} else {
				ads.forEach(ad => {
					value = findAndUpdateAmpAd(value, ad.id, ad);
				});
			}
			return appBucket.replaceAsync(`${docKeys.ampScript}${siteId}`, value) && value;
		})
		.catch(err => {
			if (err.code === 13) {
				return [];
			}

			throw err;
		});
}
function checkAmpUnsyncedAds(doc) {
	const { ad } = doc;
	if (!ad.networkData.dfpAdunitCode) {
		const defaultAdData = {
			sectionName: doc.name,
			variations: [
				// hard coded! check apTag code
				{
					variationName: 'manual',
					variationId: 'manual',
					pageGroup: null,
					platform: 'mobile'
				}
			],
			adId: doc.id,
			isResponsive: false, // false in amp
			sizeWidth: ad.width,
			sizeHeight: ad.height,
			sectionId: doc.id,
			type: ad.type,
			isManual: false,
			isInnovativeAd: false,
			isNative: false,
			isAmp: true,
			network: 'adpTags',
			networkData: {
				headerBidding: true // always true
			},
			platform: 'mobile' // always mobile
		};
		return defaultAdData;
	}
	return false;
}

function getSiteDocValues(siteId) {
	const siteDocValues = {};
	return appBucket
		.getDoc(`site::${siteId}`)
		.then(siteDocWithCas => {
			const siteData = siteDocWithCas.value;
			siteDocValues.siteDomain = siteData.siteDomain;
			siteDocValues.ownerEmail = siteData.ownerEmail;
		})
		.then(() => siteDocValues);
}

function commonDataForUnsyncedAmpAds(siteId, allAmpAds) {
	let ampAdsCommonData = {
		siteId,

		publisher: {
			email: null,
			name: null,
			id: null
		},
		ads: []
	};

	allAmpAds.forEach(ad => {
		const adsData = checkAmpUnsyncedAds(ad);
		const { ads } = ampAdsCommonData;
		if (adsData) ads.push(adsData);
	});

	return getSiteDocValues(siteId)
		.then(site => {
			const { siteDomain, ownerEmail } = site;
			ampAdsCommonData.siteDomain = siteDomain;

			return appBucket.getDoc(`user::${ownerEmail}`).then(userDocWithCas => {
				const userData = userDocWithCas.value;
				const { adNetworkSettings = [], firstName, lastName, adServerSettings = {} } = userData;
				const hasAdNetworkSettings = !!adNetworkSettings.length;
				const {
					dfp: { activeDFPNetwork = false, activeDFPParentId = false, isThirdPartyAdx = false } = {}
				} = adServerSettings;

				let pubId = null;
				let refreshToken = null;

				if (activeDFPNetwork && activeDFPParentId) {
					ampAdsCommonData.currentDFP = {
						activeDFPNetwork,
						activeDFPParentId,
						isThirdPartyDFP: !!(activeDFPNetwork != config.ADPUSHUP_GAM.ACTIVE_DFP_NETWORK)
					};
				}

				if (hasAdNetworkSettings) {
					pubId = adNetworkSettings[0].pubId;
					_.some(adNetworkSettings, network => {
						if (network.networkName === 'DFP') {
							refreshToken = network.refreshToken;
							return true;
						}
						return false;
					});
				}

				ampAdsCommonData.publisher = {
					...ampAdsCommonData.publisher,
					...ampAdsCommonData.currentDFP,
					name: `${firstName} ${lastName}`,
					email: ownerEmail,
					id: pubId,
					refreshToken,
					isThirdPartyAdx
				};

				ampAdsCommonData = { ...ampAdsCommonData };
			});
		})
		.then(() => ampAdsCommonData);
}

function queuePublishingWrapper(siteId, ads) {
	return commonDataForUnsyncedAmpAds(siteId, ads).then(data => {
		// If no unsynced ad then skip dfp syncing
		if (!(data && Array.isArray(data.ads) && data.ads.length)) return Promise.resolve(ads);

		var options = {
			method: 'POST',
			uri: `${config.queuePublishingURL}/publish`,
			body: {
				queue: 'AD_TAG_SYNC', // queuePublishingService needs this key, specified in its config, not the actual queue name
				data
			},
			json: true // Automatically stringifies the body to JSON
		};

		return request(options)
			.then(() => ads)
			.catch(
				err => console.log(err)
				// POST failed...
			);
	});
}

function storedRequestWrapper(doc) {
	var options = {
		method: 'POST',
		uri: `${config.queuePublishingURL}/publish`,
		body: {
			queue: 'AMP_SR_SYNC',
			data: doc
		},
		json: true // Automatically stringifies the body to JSON
	};
	return request(options).catch(
		err => console.log(err)
		// POST failed...
	);
}

function publishAdPushupBuild(siteId) {
	adpushup.emit('siteSaved', siteId);
}
/*
  headerBidding //found networkData->headerBidding chnl,fmrt,tgmr,amp , aplt(located at root level)
  refreshSlot   //found networkData->refreshSlot   chnl,fmrt,tgmr,amp , aplt(located at root level)
  fluid         //found at root                    chnl,fmrt,tgmr,amp
  enableLazyLoading      //enableLazyLoading root level flag is used, found at root chnl->present at section level chnl::37780:MOBILE:POST PAGE , fmrt ,tgmr, amp (Make that layout change for generateAmpAdPushupConfig also)  (for channel doc handle enableLazyLoading condition)
  isActive (Archived/deleted)  //found at root                             fmrt , does channel doc have this flag? ,tgmr ,aplt
  disableReuseVacantAdSpace   //found root level of node                   chnl,fmrt ,tgmr
  collapseUnfilled            //found root level of node                   chnl,fmrt ,tgmr
  downwardSizesDisabled       //found root level of node                   chnl,fmrt ,tgmr
  */

function updateAd({ ad, updatedData, docId }) {
	const docType = docId.substr(0, 4);
	const { actionValue, enable } = updatedData;
	if (docType === 'aplt') {
		const allowedActions = [
			'headerBidding',
			'refreshSlot',
			'isActive',
			'enableLazyLoading',
			'collapseUnfilled',
			'downwardSizesDisabled'
		];
		if (allowedActions.includes(actionValue)) {
			ad = { ...ad, [actionValue]: enable };
		}
	} else {
		if (actionValue === 'headerBidding' || actionValue === 'refreshSlot') {
			const { networkData: oldNetworkData } = ad;
			ad = {
				...ad,
				networkData: {
					...oldNetworkData,
					[actionValue]: enable
				}
			};
		} else if (actionValue === 'downwardSizesDisabled') {
			const { sizeFilters } = updatedData;
			if (sizeFilters && !enable) {
				ad.sizeFilters = sizeFilters;
			}
			ad = { ...ad, [actionValue]: enable };
		} else {
			ad = { ...ad, [actionValue]: enable };
		}
	}

	return ad;
}

//for channel doc ads
async function updateChannelDocAds({ docId, adsToBeUpdatedMap }) {
	const { data: channel } = await channelModel.getChannelByDocId(docId);
	if (channel.variations && Object.keys(channel.variations).length) {
		for (const variationKey in channel.variations) {
			const variation = channel.variations[variationKey];
			if (variation.sections && Object.keys(variation.sections).length) {
				for (const sectionKey in variation.sections) {
					let section = variation.sections[sectionKey];
					if (section.ads && Object.keys(section.ads).length) {
						for (const adKey in section.ads) {
							let ad = section.ads[adKey];
							const adId = ad.id;
							if (adsToBeUpdatedMap[adId]) {
								const { actionValue, enable } = adsToBeUpdatedMap[adId];
								if (actionValue === 'enableLazyLoading') {
									section = { ...section, [actionValue]: enable };
								} else {
									ad = updateAd({ ad, updatedData: adsToBeUpdatedMap[adId], docId });
								}
								section.ads[adKey] = ad;
							}
						}
					} else {
						continue;
					}
					variation.sections[sectionKey] = section;
				}
			} else {
				continue;
			}
			channel.variations[variationKey] = variation;
		}
	}
	await channelModel.updateChannel(docId, channel);
}

//for ApTag , Innovative , Amp Ads ,ApLite Ads
function updateGeneralAds({ docId, adsToBeUpdatedMap }) {
	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(docId))
		.then(docWithCas => {
			const docType = docId.substr(0, 4);
			const { value } = docWithCas;
			let { ads = [] } = value;
			if (docType === 'aplt') {
				const { adUnits = [] } = value;
				ads = adUnits;
			}
			for (let index = 0; index < ads.length; index += 1) {
				const ad = ads[index];
				let adId = ad.id;
				if (docType === 'aplt') {
					const { dfpAdUnit } = ad;
					adId = dfpAdUnit;
				}
				if (adsToBeUpdatedMap[adId]) {
					ads[index] = updateAd({ ad, updatedData: adsToBeUpdatedMap[adId], docId });
				}
			}
			if (docType === 'aplt') {
				value.adUnits = ads;
			} else {
				value.ads = ads;
			}
			return value;
		})
		.then(value => appBucket.updateDoc(docId, value));
}

async function updateAds(docId, ads = []) {
	const docType = docId.substr(0, 4);
	const adsToBeUpdatedMap = ads.reduce((adsMap, ad) => {
		const { adId } = ad;
		adsMap[adId] = ad;
		return adsMap;
	}, {});
	switch (docType) {
		case 'chnl':
			return updateChannelDocAds({ docId, adsToBeUpdatedMap });
		default:
			return updateGeneralAds({ docId, adsToBeUpdatedMap });
	}
}

// get details of account from CB
function getSitesAssociatedWithAccount(email) {
	return userModel
		.getUserByEmail(email)
		.then(user => {
			const userData = user.cleanData();
			const sitesArray = [...userData.sites];
			const sitesArrayLength = sitesArray.length;
			userData.sites = {};

			for (let i = 0; i < sitesArrayLength; i += 1) {
				const site = sitesArray[i];
				userData.sites[site.siteId] = site;
			}
			return userData;
		}).catch(() => {
			return {
				sites: {}
			}
		})

}

// Check user switiching/impersonating based on allowed accounts only
// if there are some associated accounts then switch/impersonate only if account to be
// switched/impersonated is present in associated accounts list
function checkAllowedEmailForSwitchAndImpersonate(associatedAccounts, switchUserEmail) {
	if (associatedAccounts.length) {
		const allAccountsAllowedToSwitchForTheCurrentUser = associatedAccounts.find(account => {
			return account.email === switchUserEmail;
		});

		// is switch user allowed for this user
		return allAccountsAllowedToSwitchForTheCurrentUser;
	}
	// associatedAccounts length is zero then it means there is no resttriction
	return true;
}

/**
 * Get accounts associated with user - AdOps/AM from hubspot
 * and get account details from CB
 */
async function getAssociatedAccountsWithUser(userEmail) {
	// no need to check any access for development mode
	// else developers have to run a new service during development
	if (config.environment.HOST_ENV !== 'production') {
		return [];
	}

	// Ops Access Control list
	const { value: opsAcccessList } = await appBucket.getDoc('ops::acl');
	let emailOfAM = opsAcccessList.AM.includes(userEmail) ? userEmail : '';
	// for accessing extra accouts which are not associated with the AM
	let otherEmails = '';

	if (!emailOfAM) {
		const adOpsUserDetails = opsAcccessList.AdOps.find(adOpsUser => {
			return adOpsUser.email === userEmail
		})
		// if found then set email of AM
		if (adOpsUserDetails) {
			// No AM has been assigned to this AdOps person
			// set email of AdOps which is also equal to userEmail
			emailOfAM = adOpsUserDetails.AM || adOpsUserDetails.email;
			if (adOpsUserDetails.others) {
				otherEmails = adOpsUserDetails.others;
			}
		}
	}

	// if original user's email does not exist in access control doc - remove any restrictions
	if (emailOfAM) {
		// from hubspot
		return Promise.resolve(emailOfAM).then(() => {
			return hubSpotService.getSitesOfUserFromHubspot(emailOfAM)
		}).then(async (accounts) => {
			// Hack by Harpreet Singh for quick resolution to allow
			// AdOps person to access other accounts not associated to his/her AM
			if (otherEmails && otherEmails instanceof Array && otherEmails.length) {
				accounts.results = [...accounts.results, ...otherEmails];
			}

			if (!accounts.results.length) {
				// this is to manage the case where a particular user AM/AdOps
				// has restricted access but no site has been assigned to him/her
				// yet and instead of returning empty array - return non-empty array
				// as empty array means full access
				return [{
					email: '',
					siteIds: [],
					domains: []
				}]
			}
			// from CB
			return Promise.all(accounts && accounts.results && accounts.results.map(accountEmail => {
				return getSitesAssociatedWithAccount(accountEmail)
			})).then((associatedAccounts) => {
				// format data into `findUser` api format
				return associatedAccounts.map(account => {
					if (Object.keys(account).length) {
						return {
							email: account.email,
							siteIds: Object.keys(account.sites),
							domains: Object.keys(account.sites).map(siteId => account.sites[siteId].domain)
						}
					}
				}).filter(item => item.siteIds.length)
			}).catch(() => {
				// this is to manage the case where a particular user AM/AdOps
				// has restricted access but no site has been assigned to him/her
				// yet and instead of returning empty array - return non-empty array
				// as empty array means full access
				return [{
					email: '',
					siteIds: [],
					domains: []
				}]
			})
		}).catch(() => {
			// this is to manage the case where a particular user AM/AdOps
			// has restricted access but no site has been assigned to him/her
			// yet and instead of returning empty array - return non-empty array
			// as empty array means full access
			return [{
				email: '',
				siteIds: [],
				domains: []
			}]
		})
	}
	return [];
};

/**
 * 
 */
// for new AMP Ad format
function getApTags(siteId) {
	return couchbase
		.connectToAppBucket()
		.then(appBucket =>
			appBucket.getAsync(`${docKeys.apTag}${siteId}`, {}).then(apTags => {
				const {
					value: { ads = [] }
				} = apTags;
				return ads;
			})
		)
		.catch(err => {
			console.log(err);
			throw err;
		});
}

async function udpateApConfigIfFlyingCarpetAdEnabledInApTagOrLayoutEditorAd(siteId) {
	/**
	 * 
	 * 1. check ApTag
	 * 2. checkLayoutEditor
	 * 3. check if need to add or remove or ignore
	 * 4. check if Already exist
	 * 5. udpate as per case 4.
	 */
	try {
		const site = await siteModel.getSiteById(siteId);
		const apTags = await getApTags(siteId)
		const channels = site.get('channels') || [];
	
		// 1. check ApTag
		let isFlyinCarpetEnabled = !!apTags.find(ad => !!ad.flyingCarpetEnabled);
		if (!isFlyinCarpetEnabled) {
			// * 2. checkLayoutEditor
			const channelsQueue = [];
			channels.map(async (channel) => {
				const [platform, pageGroup] = channel.split(':')
				channelsQueue.push(channelModel
					.getChannel(siteId, platform, pageGroup));
			});
			const allChannelsConfig = await Promise.all(channelsQueue);
			allChannelsConfig.find(channelConfig => {
				const { variations } = channelConfig.data;
				Object.keys(variations).find(variation => {
					const { sections } = variations[variation];
					Object.keys(sections).find(sectionId => {
						Object.keys(sections[sectionId].ads).find(adId => {
							const ad = sections[sectionId].ads[adId];
							if (ad) {
								isFlyinCarpetEnabled = !!ad.flyingCarpetEnabled;
							}
							return isFlyinCarpetEnabled;
						});
						// if already found exit loop
						return isFlyinCarpetEnabled;
					});
					return isFlyinCarpetEnabled;
				});
				return isFlyinCarpetEnabled;
			})
		}
	
		const prevApConfig = site.get('apConfigs');
		let updatedConfig = {};
		// * 3. check if need to add or remove or ignore
		if (isFlyinCarpetEnabled) {
			// * 4. check if Already exist
			// flying carpet is enabled in the Ad and
			// add `flyingCarpetSettings` if does not exist in apConfig
			if (!prevApConfig.flyingCarpetSettings) {
				updatedConfig = {
					...prevApConfig,
					...{ flyingCarpetSettings: { CSS: { top: 30 } } }
				};
			}
		} else {
			// * 4. check if Already exist
			// flying carpet is not enabled but flag is present in apConfig
			// remove it from apConfig
			if (prevApConfig.flyingCarpetSettings) {
				// remove `flyingCarpetSettings` and save
				const { flyingCarpetSettings, ...restSiteApConfig } = prevApConfig
				updatedConfig = restSiteApConfig;
			}
		}
	
		// * 5. udpate as per case 4.
		if (JSON.stringify(updatedConfig) !== '{}') {
			// update if needed
			site.set('apConfigs', { ...updatedConfig });
			site.save();
		}
		return updatedConfig;
	} catch (err) {
		console.log(err)
		throw err;
	}
}

module.exports = {
	verifyOwner,
	errorHandler,
	appBucket,
	sendDataToZapier,
	emitEventAndSendResponse,
	fetchAds,
	fetchAmpAds,
	fetchNewAmpAds,
	updateAmpTags,
	updateAmpTagsNewFormat,
	createNewDocAndDoProcessing,
	createNewAmpDocAndDoProcessing,
	createNewAmpScriptDocAndDoProcessing,
	masterSave,
	modifyAd,
	fetchStatusesFromReporting,
	fetchCustomStatuses,
	checkParams,
	queuePublishingWrapper,
	storedRequestWrapper,
	getAmpAds,
	getNewAmpAds,
	publishAdPushupBuild,
	sendDataToAuditLogService,
	updateApLiteAd,
	updateInnovativeAd,
	updateApTagAd,
	updateAds,
	checkAllowedEmailForSwitchAndImpersonate,
	getAssociatedAccountsWithUser,
	udpateApConfigIfFlyingCarpetAdEnabledInApTagOrLayoutEditorAd
};
