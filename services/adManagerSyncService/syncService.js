const uuid = require('uuid');
const getLogger = require('./Logger');
const Database = require('./db');
const {
    serviceStatusPingDelayMs,
    serviceStatusDb: serviceStatusDbConfig, 
    db: dbConfig, 
    dfp: {adpushup_network_code, user: dfpUserConfig, auth: dfpAuthConfig}
} = require('./config');
const LineItemsService = require('./LineItemsService');

const db = new Database(dbConfig);
const statusDb = new Database(serviceStatusDbConfig);
const logger = getLogger();
let pingTimer = null;

const updateLineItemsForNetwork = async (dfpConfig) => {
    try {
        const count = 500;
        let offset = 0;
        let updatedCount = 0;
        let hasMore = true;
        const lineItemsService = new LineItemsService(dfpConfig);
        // make paginated requests and collect all data
        while(hasMore) {
            // @TODO: retry on failure
            const {results: lineItems, total} = await lineItemsService.getPricePriorityLineItems(offset, count);
            let dbResult = null;
            if(offset === 0) {
                dbResult = await db.upsertDoc(`ntwk::${dfpConfig.network_code}`, {networkCode: dfpConfig.network_code, lineItems, lastUpdated: +new Date()});
            } else {
                dbResult = await db.arrayConcat(`ntwk::${dfpConfig.network_code}`, 'lineItems', lineItems);
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
        const {results, status, resultCount} = await db.query(queryString, {adPushupNetworkId: adpushup_network_code});
        console.log('3rd party dfps results=', results, "\n\ntotal=", resultCount, "\n\nstatus=", status);
        // run for each network
        let totalLineItemsUpdated = 0;
        let errors = {};
        for(const {networkId, dfpNetworkSettings} of results) {
            try {
                console.info(`Processing network id ${networkId}`, "\n");
                const refreshToken = dfpNetworkSettings && dfpNetworkSettings.length && dfpNetworkSettings[0].refreshToken;
                if(!refreshToken) {
                    errors[networkId] = new Error(`missing Refresh Token`);
                    continue;
                }
                dfpConfig.refresh_token = refreshToken;
                dfpConfig.network_code = networkId;
                const updatedCount = await updateLineItemsForNetwork(dfpConfig);
                logger.info({message: `updated ${updatedCount} lineItems for ntwk::${dfpConfig.network_code}`});
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
        logger.error({message: 'updateLineItemsForThirdPartyDfps::Error', debugData: {ex}});
        return ex;
    }
};

const updateLineItemsForAdPushupDfp = async () => {
    try {
        const dfpConfig = {
            ...dfpUserConfig,
            network_code: adpushup_network_code,
            ...dfpAuthConfig
        };
        return await updateLineItemsForNetwork(dfpConfig);
    } catch(ex) {
        logger.error({message: 'updateLineItemsForAdPushupDfp::Error', debugData: {ex}});
        return ex;
    }
};

const isSyncRunning = async () => {
    try {
        const bucketName = serviceStatusDbConfig.bucketName;
        const qs = `SELECT meta().id, lastUpdated 
            FROM ${bucketName} 
            WHERE meta().id LIKE 'adms::%' 
            AND status = 'RUNNING'
            AND lastUpdated >= CLOCK_MILLIS() - $serviceStatusPingDelayMs
        `;
        const {resultCount = 0} = await statusDb.query(qs, {serviceStatusPingDelayMs});
        return !!resultCount;
    } catch(ex) {
        console.error('isSyncRunning::ERROR', ex);
        throw ex;
    }
};

const setServiceStatusStarted = async () => {
    try {
        const docId = `adms::${uuid.v4()}`;
        await statusDb
        .insertDoc(docId, {
            docType: 'AdManagerSyncServiceStatus', 
            status: 'RUNNING', 
            startedOn: +new Date(), 
            lastUpdated: +new Date()
        });
        return docId;
    } catch(ex) {
        logger.error({message: 'startServiceStatusPing', debugData: {ex}});
        throw ex;
    }
};

const updateServiceStatusStopped = async (statusDocId) => {
    try {
        await statusDb
        .updatePartial(statusDocId, {
            status: 'FINISHED', 
            completedOn: +new Date(), 
            lastUpdated: +new Date()
        });
        return true;
    } catch(ex) {
        logger.error({message: 'updateServiceStatusStopped', debugData: {ex}});
        throw ex;
    }
};

const updateServiceStatusRunning = async (statusDocId) => {
    try {
        await statusDb
        .updatePartial(statusDocId, { lastUpdated: +new Date() });
        return true;
    } catch(ex) {
        logger.error({message: 'startServiceStatusPing', debugData: {ex}});
        throw ex;
    }
}

const startServiceStatusPing = async () => {
    if(pingTimer) {
        clearInterval(pingTimer);
    }
    const statusDocId = await setServiceStatusStarted();
    pingTimer = setInterval(() => updateServiceStatusRunning(statusDocId), serviceStatusPingDelayMs);
    return statusDocId;
};

const stopServiceStatusPing = async (statusDocId) => {
    if(pingTimer) {
        clearInterval(pingTimer);
    }
    if(statusDocId) {
        return await updateServiceStatusStopped(statusDocId);
    }
    return true;
};

async function runService() {
    let statusDocId = null;
    try {
        // check if any service instance is already running
        if(await isSyncRunning()) {
            return new Error('Another Sync process is running');
        }
        statusDocId = await startServiceStatusPing();
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
        await stopServiceStatusPing(statusDocId);
    }
}

module.exports = runService;