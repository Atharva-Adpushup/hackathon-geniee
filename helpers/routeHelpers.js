const Promise = require('bluebird');
const _ = require('lodash');
const { couchbaseService } = require('node-utils');
const request = require('request-promise');

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
	ADS_TXT_REDIRECT_PATTERN
} = require('../configs/commonConsts');

const appBucket = couchbaseService(
	`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
	config.couchBase.DEFAULT_BUCKET,
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);

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

function errorHander(err, res, code = HTTP_STATUS.BAD_REQUEST) {
	const customMessage = err.message || err;
	const errorCode = customMessage.code || code;
	console.log(err);
	return sendErrorResponse({ message: 'Opertion Failed' }, res, errorCode);
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
				: errorHander(err, res)
		);
}

function createNewDocAndDoProcessing(payload, initialDoc, docKey, processing) {
	const innovativeAdDefault = _.cloneDeep(initialDoc);
	return appBucket
		.createDoc(`${docKey}${payload.siteId}`, innovativeAdDefault, {})
		.then(() => appBucket.getDoc(`site::${payload.siteId}`))
		.then(docWithCas => {
			payload.siteDomain = docWithCas.value.siteDomain;
			return processing(innovativeAdDefault, payload);
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
		qs: { siteId: site.get('siteId') },
		json: true
	};

	return request(options)
		.then(response => {
			const { data } = response;
			const { products = [] } = data;
			const output = {};

			_.forEach(products, product => {
				const { key } = product;
				key ? (output[key] = APP_KEYS[key]) : null;
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

			isRedirecting ? (output['8'] = APP_KEYS['8']) : null;
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

module.exports = {
	verifyOwner,
	errorHander,
	appBucket,
	sendDataToZapier,
	emitEventAndSendResponse,
	fetchAds,
	createNewDocAndDoProcessing,
	masterSave,
	modifyAd,
	fetchStatusesFromReporting,
	fetchCustomStatuses
};
