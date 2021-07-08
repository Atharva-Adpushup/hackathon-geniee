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
		.then(appBucket => appBucket.getAsync(`${docKeys.ampScript}${siteId}`, {}).then(ampdDoc => {
			const { value: { ads } } = ampdDoc;
			return ads;
		}))
		.catch(err => console.log(err));
}

function getAllAds() {
	const designName = 'AdunitMapping',
		viewName = 'Adunits';
	var query = ViewQuery.from(designName, viewName).reduce(false);

	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.queryAsync(query))
		.then(ads => {
			return ads;
		})
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
				? sendSuccessResponse({ ads: []}, res)
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
					!value.ad.refreshInterval &&
						(value.ad.refreshInterval = AMP_REFRESH_INTERVAL);
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
	value.ads[index] = {...value.ads[index], ...update}

	value.updatedOn = +new Date();
	if(!adItem.networkData.refreshInterval) {
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
				})
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
	getAllAds,
	updateApLiteAd,
	updateInnovativeAd,
	updateApTagAd
};