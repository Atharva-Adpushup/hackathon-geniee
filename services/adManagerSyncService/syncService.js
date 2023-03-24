const getLogger = require('./Logger');
const Database = require('./db');
const ServiceStatus = require('./serviceStatus');
const Promise = require('bluebird');
const axios = require('axios');
const utils = require('./utils');
const _ = require('lodash');
const fs = require('fs');
const { uploadToCDN } = require('node-utils');
const { sendEmail } = require('../../helpers/queueMailer');
const {
	serviceStatusPingDelayMs,
	serviceStatusDocExpiryDays,
	serviceStatusDb: serviceStatusDbConfig,
	appName,
	dfpApiVersion,
	db: dbConfig,
	azureBlobStorage,
	rabbitMQ
} = require('./config');

const {
	lineItemServiceAlerts,
	ADPUSHUP_GAM: {
		ACTIVE_DFP_NETWORK: ADPUSHUP_DFP_NETWORK_CODE,
		REFRESH_TOKEN: ADPUSHUP_REFRSH_TOKEN,
		OAUTH_CALLBACK: ADPUSHUP_OAUTH_CALLBACK,
		HB_ORDER_IDS: ADPUSHUP_HB_ORDER_IDS
	},
	googleOauth: { OAUTH_CLIENT_ID: ADPUSHUP_CLIENT_ID, OAUTH_CLIENT_SECRET: ADPUSHUP_CLIENT_SECRET }
} = require('../../configs/config');

const { LINE_ITEM_TYPES: LINE_ITEM_TYPES_OBJ } = require('../../configs/lineItemsConstants');
let LINE_ITEM_TYPES = LINE_ITEM_TYPES_OBJ.map(type => type.value);
let LINE_ITEM_TYPES_TO_BE_FETCHED = LINE_ITEM_TYPES_OBJ.filter(type => type.toBeFetchedFromGAM).map(
	type => type.value
);

const dfpUserConfig = {
	networkCode: '',
	appName,
	dfpApiVersion
};

const dfpAuthConfig = {
	client_id: ADPUSHUP_CLIENT_ID,
	client_secret: ADPUSHUP_CLIENT_SECRET,
	refresh_token: ADPUSHUP_REFRSH_TOKEN,
	redirect_url: ADPUSHUP_OAUTH_CALLBACK
};

const LINE_ITEM_SERVICE_EMAIL_SUBJECT = 'Line Item Service Notification';

const LineItemsService = require('./LineItemsService');

const db = new Database(dbConfig);
const logger = getLogger();

const getLineItems = async (lineItemsService, type, hbOrderIds) => {
	try {
		const count = 500;
		let offset = 0;
		let updatedCount = 0;
		let hasMore = true;
		let nonHbResults = [];
		let hbResults = [];
		// make paginated requests and collect all data
		while (hasMore) {
			// @TODO: retry on failure
			const { results: lineItemsObjects, total } = await lineItemsService.getLineItemsByType(
				offset,
				count,
				type,
				hbOrderIds
			);
			let nonHbLineItems = [];
			let hbLineItems = [];
			lineItemsObjects.forEach(lineItem => {
				if (lineItem.isHb) {
					hbLineItems.push({ id: lineItem.id, totalImpressions: lineItem.totalImpressions });
				} else {
					nonHbLineItems.push({ id: lineItem.id, totalImpressions: lineItem.totalImpressions });
				}
			});
			nonHbResults = [...nonHbResults, ...nonHbLineItems];
			hbResults = [...hbResults, ...hbLineItems];
			offset += count;
			updatedCount += nonHbLineItems.length + hbLineItems.length;
			hasMore = total > 0 && updatedCount < total;
		}
		return { type, nonHbResults, hbResults, updatedCount };
	} catch (e) {
		throw e;
	}
};

const getMandatoryandSeperatelyGroupedLineItems = allLineItems => {
	let lineItems = [],
		seperatelyGroupedLineItems = {};
	//Line Item types used in script(adpushup.js)
	const mandatoryLineItemTypes = LINE_ITEM_TYPES_OBJ.filter(
		type => type.isMandatory && !type.groupedSeparately
	).map(type => type.value); // HB lineitems are to be kept separately

	const separatelyGroupedLineItemTypes = LINE_ITEM_TYPES_OBJ.filter(
		type => type.groupedSeparately
	).map(type => type.value);

	mandatoryLineItemTypes.forEach(type => {
		if (allLineItems && Array.isArray(allLineItems[type]) && allLineItems[type].length) {
			lineItems = lineItems.concat(allLineItems[type]);
		}
	});

	separatelyGroupedLineItemTypes.forEach(type => {
		if (allLineItems && Array.isArray(allLineItems[type]) && allLineItems[type].length) {
			seperatelyGroupedLineItems[type] = allLineItems[type];
		}
	});

	return { lineItems, seperatelyGroupedLineItems };
};

const processLineItems = lineItems => {
	let fetchedLineItems = {},
		fallbackLineItems = [];
	for (let result of lineItems) {
		if (result.type === 'PRICE_PRIORITY') {
			fallbackLineItems.push(...result.hbResults, ...result.nonHbResults);
			result.hbResults = result.hbResults.map(lineItem => lineItem.id);
			fetchedLineItems['HEADER_BIDDING'] = result.hbResults;
		} else if (
			result.type === 'AD_EXCHANGE' &&
			result.nonHbResults &&
			result.nonHbResults.length > 0
		) {
			fallbackLineItems.push(...result.nonHbResults);
		}
		result.nonHbResults = result.nonHbResults.map(lineItem => lineItem.id);
		fetchedLineItems[result.type] = result.nonHbResults;
	}
	fallbackLineItems = fallbackLineItems.sort(lineItemsSortFunc); //sort as per total impressions in last seven days
	fallbackLineItems = fallbackLineItems
		.slice(0, 20)
		.map(lineItem => parseInt(lineItem.id))
		.sort()
		.map(lineItem => lineItem.toString());
	return { fetchedLineItems, fallbackLineItems };
};

const uploadLineItemsFileToCDN = async (fileName, data) => {
	const config = {
		containerName: azureBlobStorage.containerName,
		fileName: fileName,
		data: data,
		queuePublishEndpoint: rabbitMQ.PUBLISHER_API,
		queue: rabbitMQ.CDN_ORIGIN.NAME_IN_QUEUE_PUBLISHER_SERVICE
	};

	return await uploadToCDN(azureBlobStorage.connectionString, config);
};

function checkIfAnyTypeUpdated(previousHash, lineItems) {
	let updatedTypes = [];
	let updatedHash = { ...previousHash };
	for (let type of Object.keys(lineItems)) {
		let typeLineItems = lineItems[type].map(lineItem => parseInt(lineItem)).sort();
		let calculatedTypeHash = utils.getHash(JSON.stringify(typeLineItems));
		if (calculatedTypeHash !== previousHash[type]) {
			updatedTypes.push(type);
			updatedHash[type] = calculatedTypeHash;
			logger.info({ message: `${type} lineITems Updated, previousValue: ${previousHash[type]}, newValue: ${calculatedTypeHash}` });
			logger.info({ message: `updated LineItems for ${type}: ${typeLineItems}` });
		}
	}

	if (updatedTypes.length) {
		return { updated: true, updatedTypes, updatedHash };
	}
	return { updated: false };
}

const processfetchedLineItems = async (lineItems, networkCode = '103512698') => {
	try {
		let allGAMSiteSyncRequired = false;
		let doc = await db.getDoc(`ntwk::${networkCode}`);

		// Update structure of the ntwk doc if it is still old
		if (!doc || !LINE_ITEM_TYPES.every(type => type in doc.lineItems)) {
			doc = { networkCode: networkCode, lastUpdated: +new Date() };
			doc.lineItems = LINE_ITEM_TYPES.reduce((accumulator, type) => {
				accumulator[type] = [];
				return accumulator;
			}, {});
		}

		const { fetchedLineItems, fallbackLineItems } = processLineItems(lineItems),
			fallbackLineItemsHash = utils.getHash(JSON.stringify(fallbackLineItems)),
			fallbackLineItemsUpdated = doc.fallbackLineItemsHash
				? fallbackLineItemsHash !== doc.fallbackLineItemsHash
				: true;

		if (fallbackLineItemsUpdated) {
			doc.fallbackLineItems = fallbackLineItems;
			doc.fallbackLineItemsHash = fallbackLineItemsHash;
			logger.info({ message: `fallback LineItems Updated, ${fallbackLineItems}, hash: ${fallbackLineItemsHash}` });
			allGAMSiteSyncRequired = true;
		}

		if (!doc.typeHash) {
			doc.typeHash = {};
		}

		const anyTypeUpdated = checkIfAnyTypeUpdated(doc.typeHash, fetchedLineItems);

		if (anyTypeUpdated.updated) {
			let { updatedTypes, updatedHash } = anyTypeUpdated;
			const mandatoryLineItemTypes = LINE_ITEM_TYPES_OBJ.filter(
				type => type.isMandatory && !type.groupedSeparately
			).map(type => type.value);

			let mandatoryTypesUpdated = updatedTypes.filter(type =>
				mandatoryLineItemTypes.includes(type)
			);
			let siteLevelTypesUpdated = updatedTypes.filter(
				type => !mandatoryLineItemTypes.includes(type)
			);

			for (let type of updatedTypes) {
				doc.lineItems[type] = fetchedLineItems[type];
			}

			if (mandatoryTypesUpdated.length) {
				allGAMSiteSyncRequired = true;
				logger.info({ message: `Mandatory type LineItems Updated, ${anyTypeUpdated}` });
				handleMandatoryTypeUpdates(doc);
			} else if (siteLevelTypesUpdated.length) {
				logger.info({ message: `site level type LineItems Updated, ${anyTypeUpdated}` });
				await utils.handleUpdatedTypes(updatedTypes, networkCode, db);
			}

			doc.typeHash = updatedHash;
		}

		if (fallbackLineItemsUpdated || anyTypeUpdated.updated){
			doc.lastUpdated = +new Date();
			let dbResult = await db.upsertDoc(`ntwk::${networkCode}`, doc);
			if (dbResult instanceof Error) {
				throw dbResult;
			}
		}

		return { lineItems, allGAMSiteSyncRequired };
	} catch (e) {
		console.error(e);
	}

	async function handleMandatoryTypeUpdates(doc) {
		let lineItems = doc.lineItems;
		const lineItemsFileName = `lineItems/li.${networkCode}.${new Date().getTime()}.json`;

		await uploadLineItemsFileToCDN(
			lineItemsFileName,
			getMandatoryandSeperatelyGroupedLineItems(lineItems)
		);

		doc.lineItemsFileName = lineItemsFileName;
	}
};
const updateLineItemsForNetwork = async (dfpConfig, hbOrderIds) => {
	try {
		const lineItemsService = new LineItemsService(dfpConfig, logger);
		await lineItemsService.initService();
		const promises = await Promise.allSettled(
			LINE_ITEM_TYPES_TO_BE_FETCHED.map(type => getLineItems(lineItemsService, type, hbOrderIds))
		);
		// Get only fulfilled promises
		let results = promises.reduce((accumulator, promise) => {
			if (promise.isFulfilled()) {
				accumulator.push(promise.value());
			}
			return accumulator;
		}, []);
		// Get Failed promises
		let failedTypes = promises.reduce((accumulator, promise) => {
			if (promise.isRejected()) {
				const { type, error } = promise.error();
				accumulator[type] = error;
			}
			return accumulator;
		}, {});

		let { lineItems, allGAMSiteSyncRequired } = await processfetchedLineItems(
			results,
			dfpConfig.networkCode
		);

		if (allGAMSiteSyncRequired) {
			utils.syncAllGAMSites(dfpConfig.networkCode);
		}

		// Get the total number of lineItems fetched across all types
		const updatedCount = lineItems.reduce((accumulator, result) => {
			accumulator += result.updatedCount;
			return accumulator;
		}, 0);
		return { updatedCount, failedTypes };
	} catch (ex) {
		logger.error({ message: 'Error updating adpushup network lineitems', debugData: { ex } });
		throw ex;
	}
};

const updateLineItemsForThirdPartyDfps = async () => {
	try {
		const dfpConfig = {
			...dfpUserConfig,
			...dfpAuthConfig
		};
		// fetch network ids where activeDfpNetwork is not adpushupNetworkId, from couchbase
		const queryString = `SELECT 
            adServerSettings.dfp.activeDFPNetwork as networkId,
            adServerSettings.dfp.hbOrderIds as hbOrderIds,
            ARRAY adNetworkSetting FOR adNetworkSetting IN adNetworkSettings WHEN adNetworkSetting.networkName = 'DFP' END AS dfpNetworkSettings 
            FROM ${dbConfig.bucketName} 
            WHERE meta().id LIKE 'user::%' 
            AND adServerSettings.dfp.activeDFPNetwork != $adPushupNetworkId`;
		const { results, status, resultCount } = await db.query(queryString, {
			adPushupNetworkId: ADPUSHUP_DFP_NETWORK_CODE
		});
		logger.info({ message: `Found ${resultCount} 3rd Party dfps` });
		// run for each network
		let totalLineItemsUpdated = 0;
		let errors = {};
		for (const { networkId, dfpNetworkSettings, hbOrderIds } of results) {
			try {
				logger.info({ message: `Processing network id ${networkId}` });
				const refreshToken =
					dfpNetworkSettings && dfpNetworkSettings.length && dfpNetworkSettings[0].refreshToken;
				if (!refreshToken) {
					// skip the network if refresh token is missing
					// errors[networkId] = new Error(`missing Refresh Token`);
					continue;
				}
				dfpConfig.refresh_token = refreshToken;
				dfpConfig.networkCode = networkId;
				const { updatedCount, failedTypes } = await updateLineItemsForNetwork(
					dfpConfig,
					hbOrderIds
				);
				if (Object.keys(failedTypes).length > 0) {
					errors[networkId] = failedTypes;
				}
				logger.info({
					message: `updated ${updatedCount} lineItems for ntwk::${dfpConfig.networkCode}`
				});
				totalLineItemsUpdated += updatedCount;
			} catch (ex) {
				errors[networkId] = ex;
			}
		}
		if (Object.keys(errors).length) {
			for (networkId in errors) {
				logger.error({ message: errors[networkId].message, debugData: { ex: errors[networkId] } });
			}
		}
		return { totalLineItemsUpdated, errors };
	} catch (ex) {
		logger.error({ message: 'updateLineItemsForThirdPartyDfps::ERROR', debugData: { ex } });
		throw ex;
	}
};

const updateLineItemsForAdPushupDfp = async () => {
	try {
		const dfpConfig = {
			...dfpUserConfig,
			networkCode: ADPUSHUP_DFP_NETWORK_CODE,
			...dfpAuthConfig
		};
		return await updateLineItemsForNetwork(dfpConfig, ADPUSHUP_HB_ORDER_IDS);
	} catch (ex) {
		logger.error({ message: 'updateLineItemsForAdPushupDfp::ERROR', debugData: { ex } });
		throw ex;
	}
};

async function runService() {
	logger.info({ message: `Sync service invoked at ${+new Date()}` });
	const serviceStatus = new ServiceStatus(
		serviceStatusDbConfig,
		serviceStatusPingDelayMs,
		serviceStatusDocExpiryDays,
		logger
	);
	let totalErrors = {};
	try {
		// check if any service instance is already running
		const isSyncAlreadyRunning = await serviceStatus.isSyncRunning();
		if (isSyncAlreadyRunning) {
			logger.error({ message: 'Another sync process is running, exiting' });
			return new Error('Another Sync process is running');
		}
		await serviceStatus.startServiceStatusPing();
		logger.info({ message: 'Updating adPushup Dfp' });
		const {
			updatedCount: adpushupLineItemsUpdated,
			failedTypes: adpushupFailedTypes
		} = await updateLineItemsForAdPushupDfp();

		logger.info({ message: `updated ${adpushupLineItemsUpdated} line items for adPushup dfp` });

		logger.info({ message: 'Updating thirdParty Dfps' });
		const {
			totalLineItemsUpdated: totalThirdPartyLineItemsUpdated,
			errors: thirdPartyErrors
		} = await updateLineItemsForThirdPartyDfps();
		totalErrors = { ...thirdPartyErrors };
		if (Object.keys(adpushupFailedTypes).length) {
			totalErrors[ADPUSHUP_DFP_NETWORK_CODE] = adpushupFailedTypes;
		}
		logger.info({
			message: `updated ${totalThirdPartyLineItemsUpdated} line items for 3rd party dfps`
		});
		// Send Email on completion
		sendEmail({
			queue: 'MAILER',
			data: {
				to: lineItemServiceAlerts,
				body: `LineItemService finished. <br />AdPushup LineItems updated: ${adpushupLineItemsUpdated} <br />ThirdParty LineItems Updated: ${totalThirdPartyLineItemsUpdated} <br/> Network Codes with errors: ${Object.keys(
					totalErrors
				)}`,
				subject: LINE_ITEM_SERVICE_EMAIL_SUBJECT
			}
		});
		return true;
	} catch (ex) {
		logger.error({ message: 'runService::ERROR', debugData: { ex } });
		totalErrors = ex.stack;
		// Send Email on failure
		sendEmail({
			queue: 'MAILER',
			data: {
				to: lineItemServiceAlerts,
				body: `LineItemService Errored. <br/>Error: ${ex.stack}`,
				subject: LINE_ITEM_SERVICE_EMAIL_SUBJECT
			}
		});
		return ex;
	} finally {
		await serviceStatus.stopServiceStatusPing(totalErrors);
	}
}

function lineItemsSortFunc(a, b) {
	return a.totalImpressions > b.totalImpressions ? -1 : 1;
}

module.exports = runService;
