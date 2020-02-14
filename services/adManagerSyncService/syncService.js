const getLogger = require('./Logger');
const Database = require('./db');
const ServiceStatus = require('./serviceStatus');

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
        OAUTH_CALLBACK: ADPUSHUP_OAUTH_CALLBACK
    },
    googleOauth: {
        OAUTH_CLIENT_ID: ADPUSHUP_CLIENT_ID,
        OAUTH_CLIENT_SECRET: ADPUSHUP_CLIENT_SECRET
    }
} = require('../../configs/config');

const dfpUserConfig = {
    networkCode: '', 
    appName, 
    dfpApiVersion
};

const dfpAuthConfig = {
    client_id : ADPUSHUP_CLIENT_ID,
    client_secret : ADPUSHUP_CLIENT_SECRET,
    refresh_token : ADPUSHUP_REFRSH_TOKEN,
    redirect_url : ADPUSHUP_OAUTH_CALLBACK
};

const LineItemsService = require('./LineItemsService');

const db = new Database(dbConfig);
const logger = getLogger();

const updateLineItemsForNetwork = async (dfpConfig) => {
    try {
        const count = 500;
        let offset = 0;
        let updatedCount = 0;
        let hasMore = true;
        const lineItemsService = new LineItemsService(dfpConfig, logger);
        // make paginated requests and collect all data
        while(hasMore) {
            // @TODO: retry on failure
            const {results: lineItems, total} = await lineItemsService.getPricePriorityLineItems(offset, count);
            let dbResult = null;
            if(offset === 0) {
                dbResult = await db.upsertDoc(`ntwk::${dfpConfig.networkCode}`, {networkCode: dfpConfig.networkCode, lineItems, lastUpdated: +new Date()});
            } else {
                dbResult = await db.arrayConcat(`ntwk::${dfpConfig.networkCode}`, 'lineItems', lineItems);
            }
            if(dbResult instanceof Error) return dbResult;
            offset += count;
            updatedCount += lineItems.length;
            hasMore = total > 0 && updatedCount < total;
        }
        return updatedCount;
    } catch(ex) {
        logger.error({message: 'Error updating adpushup network lineitems', debugData: {ex}});
        return ex;
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
            ARRAY adNetworkSetting FOR adNetworkSetting IN adNetworkSettings WHEN adNetworkSetting.networkName = 'DFP' END AS dfpNetworkSettings 
            FROM ${dbConfig.bucketName} 
            WHERE meta().id LIKE 'user::%' 
            AND adServerSettings.dfp.activeDFPNetwork != $adPushupNetworkId`;
        const {results, status, resultCount} = await db.query(queryString, {adPushupNetworkId: ADPUSHUP_DFP_NETWORK_CODE});
        logger.info({message: `Found ${resultCount} 3rd Party dfps`});
        // run for each network
        let totalLineItemsUpdated = 0;
        let errors = {};
        for(const {networkId, dfpNetworkSettings} of results) {
            try {
                logger.info({message: `Processing network id ${networkId}`});
                const refreshToken = dfpNetworkSettings && dfpNetworkSettings.length && dfpNetworkSettings[0].refreshToken;
                if(!refreshToken) {
                    // skip the network if refresh token is missing
                    // errors[networkId] = new Error(`missing Refresh Token`);
                    continue;
                }
                dfpConfig.refresh_token = refreshToken;
                dfpConfig.networkCode = networkId;
                const updatedCount = await updateLineItemsForNetwork(dfpConfig);
                logger.info({message: `updated ${updatedCount} lineItems for ntwk::${dfpConfig.networkCode}`});
                totalLineItemsUpdated += updatedCount;
            } catch(ex) {
                errors[networkId] = ex;
            }
        }
        if(Object.keys(errors).length) {
            for(networkId in errors) {
                logger.error({message: errors[networkId].message, debugData: {ex: errors[networkId]}});
            }
        }
        return totalLineItemsUpdated;
    } catch(ex) {
        logger.error({message: 'updateLineItemsForThirdPartyDfps::ERROR', debugData: {ex}});
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
        return await updateLineItemsForNetwork(dfpConfig);
    } catch(ex) {
        logger.error({message: 'updateLineItemsForAdPushupDfp::ERROR', debugData: {ex}});
        return ex;
    }
};

async function runService() {
    logger.info({message: `Sync service invoked at ${+new Date()}`});
    const serviceStatus = new ServiceStatus(serviceStatusDbConfig, serviceStatusPingDelayMs, serviceStatusDocExpiryDays, logger);
    try {
        // check if any service instance is already running
        const isSyncAlreadyRunning = await serviceStatus.isSyncRunning();
        if(isSyncAlreadyRunning) {
            logger.error({message: 'Another sync process is running, exiting'});
            return new Error('Another Sync process is running');
        }
        await serviceStatus.startServiceStatusPing();
        logger.info({message: 'Updating adPushup Dfp'});
        const adPushupUpdateResult = await updateLineItemsForAdPushupDfp();
        if(adPushupUpdateResult instanceof Error) {
            logger.error({message: 'Failed to update adpushup dfp line items', debugData: {ex: adPushupUpdateResult}});
        } else {
            logger.info({message: `updated ${adPushupUpdateResult} line items for adPushup dfp`});
        }

        logger.info({message: 'Updating thirdParty Dfps'});
        const thirdPartyUpdateResult = await updateLineItemsForThirdPartyDfps();
        if(thirdPartyUpdateResult instanceof Error) {
            logger.error({message: 'Failed to update 3rd party dfps line items', debugData: {ex: thirdPartyUpdateResult}});
        } else {
            logger.info({message: `updated ${thirdPartyUpdateResult} line items for 3rd party dfps`});
        }
        return true;
    } catch (ex) {
        logger.error({message: 'runService::ERROR', debugData: {ex}});
        return ex;
    } finally {
        await serviceStatus.stopServiceStatusPing();
    }
}

module.exports = runService;