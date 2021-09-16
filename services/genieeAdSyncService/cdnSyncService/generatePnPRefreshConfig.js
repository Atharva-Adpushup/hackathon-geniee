const { couchbaseService } = require('node-utils');
const CB_ERRORS = require('couchbase').errors;

const couchBase = require('../../../configs/config').couchBase;
const { docKeys } = require('../../../configs/commonConsts');

const dbHelper = couchbaseService(
    `couchbase://${couchBase.HOST}`,
    couchBase.DEFAULT_BUCKET,
    couchBase.DEFAULT_USER_NAME,
    couchBase.DEFAULT_USER_PASSWORD
);

const processAdUnits = (adUnits = []) => {
    return adUnits
        .filter(adUnit => adUnit.isActive)
        .reduce((units, adUnit) => {
            return {
                ...units,
                [adUnit.platform]: {
                    ...units[adUnit.platform],
                    [adUnit.code]: adUnit
                }
            }
        }, {});
}

const generatePnPRefreshConfig = (siteId, adNetworkConfig) => {
    const emptyResponse = {};

    const {
        lineItems = [],
        separatelyGroupedLineItems = {}
    } = adNetworkConfig || {};

    return dbHelper.getDoc(`${docKeys.pnpRefresh}${siteId}`)
        .catch(err => {
            if (err.code === CB_ERRORS.keyNotFound) {
                return emptyResponse;
            }
            throw new err;
        })
        .then(pnpDoc => {
            const pnpConfig = pnpDoc.value || {};

            const adUnits = pnpConfig.adUnits || [];
            const pnpLineItems = pnpConfig.lineItems || [];

            // remove inactive units
            if (Array.isArray(adUnits)) {
                pnpConfig.adUnits = processAdUnits(adUnits);
            }

            if (Array.isArray(pnpLineItems) && pnpLineItems.length) {
                pnpConfig.lineItems = pnpLineItems.map(lineItem => lineItem.id);
            } else {
                let allLineItems = Object.keys(separatelyGroupedLineItems).reduce((accumulator, currValue) => {
                    accumulator = [...accumulator, ...separatelyGroupedLineItems[currValue]];
                    return accumulator;
                }, []);
                allLineItems = [...allLineItems, ...separatelyGroupedLineItems];
                pnpConfig.lineItems = allLineItems;
            }

            return pnpConfig;
        })
};

module.exports = generatePnPRefreshConfig;