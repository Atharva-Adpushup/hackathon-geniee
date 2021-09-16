const getLogger = require('./Logger');
const Database = require('./db');
const ServiceStatus = require('./serviceStatus');
const Promise = require('bluebird');
const { sendEmail } = require('../../helpers/queueMailer');
const {
	serviceStatusPingDelayMs,
	serviceStatusDocExpiryDays,
	serviceStatusDb: serviceStatusDbConfig,
	appName,
	dfpApiVersion,
	db: dbConfig
} = require('./config');

const {
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
			const nonHbLineItems = lineItemsObjects.filter(({ isHb }) => !isHb).map(({ id }) => id);
			const hbLineItems = lineItemsObjects.filter(({ isHb }) => isHb).map(({ id }) => id);
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
		let doc = await db.getDoc(`ntwk::${dfpConfig.networkCode}`);
		// Update structure of the ntwk doc if its still old
		if (!doc || !LINE_ITEM_TYPES.every(type => type in doc.lineItems)) {
			doc = { networkCode: dfpConfig.networkCode, lastUpdated: +new Date() };
			doc.lineItems = LINE_ITEM_TYPES.reduce((accumulator, type) => {
				accumulator[type] = [];
				return accumulator;
			}, {});
		}
		// Replace each key with newly fetched lineitems array
		for (let result of results) {
            doc.lineItems[result.type] = result.nonHbResults;
            if (result.type === "PRICE_PRIORITY") {
                doc.lineItems["HEADER_BIDDING"] = result.hbResults;
            }
        }
		// Update last updated timestamp
		doc.lastUpdated = +new Date();
		let dbResult = await db.upsertDoc(`ntwk::${dfpConfig.networkCode}`, doc);
		if (dbResult instanceof Error) {
			throw dbResult;
		}

		// Get the total number of lineItems fetched across all types
		const updatedCount = results.reduce((accumulator, result) => {
			accumulator += result.updatedCount;
			return accumulator;
		}, 0);

		return updatedCount;
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
                const updatedCount = await updateLineItemsForNetwork(dfpConfig, hbOrderIds);
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
		return totalLineItemsUpdated;
	} catch (ex) {
		logger.error({ message: 'updateLineItemsForThirdPartyDfps::ERROR', debugData: { ex } });
		return ex;
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
		return ex;
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
	let serviceSuccess = false;
	try {
		// check if any service instance is already running
		const isSyncAlreadyRunning = await serviceStatus.isSyncRunning();
		if (isSyncAlreadyRunning) {
			logger.error({ message: 'Another sync process is running, exiting' });
			return new Error('Another Sync process is running');
		}
		await serviceStatus.startServiceStatusPing();
		logger.info({ message: 'Updating adPushup Dfp' });
		const adPushupUpdateResult = await updateLineItemsForAdPushupDfp();
		if (adPushupUpdateResult instanceof Error) {
			logger.error({
				message: 'Failed to update adpushup dfp line items',
				debugData: { ex: adPushupUpdateResult }
			});
		} else {
			logger.info({ message: `updated ${adPushupUpdateResult} line items for adPushup dfp` });
		}

		logger.info({ message: 'Updating thirdParty Dfps' });
		const thirdPartyUpdateResult = await updateLineItemsForThirdPartyDfps();
		if (thirdPartyUpdateResult instanceof Error) {
			logger.error({
				message: 'Failed to update 3rd party dfps line items',
				debugData: { ex: thirdPartyUpdateResult }
			});
		} else {
			logger.info({ message: `updated ${thirdPartyUpdateResult} line items for 3rd party dfps` });
		}
		return true;
	} catch (ex) {
		logger.error({ message: 'runService::ERROR', debugData: { ex } });
		return ex;
	} finally {
		await serviceStatus.stopServiceStatusPing();
		sendEmail
	}
}

module.exports = runService;
