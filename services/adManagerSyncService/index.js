const getLogger = require('./Logger');
const Database = require('./db');
const {db: dbConfig, dfp: {adpushup_network_code, user: dfpUserConfig, auth: dfpAuthConfig}} = require('./config');
const LineItemsService = require('./LineItemsService');

const db = new Database(dbConfig);
const logger = getLogger();

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
            FROM AppBucket 
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

async function main() {
    try {
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
        process.exit(0);
    } catch (ex) {
        logger.error({message: 'main::ERROR', debugData: {ex}});
        process.exit(1);
    }
}

main();