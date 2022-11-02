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
			};
		}, {});
};

const generatePnPRefreshConfig = (siteId, adNetworkConfig, blockListedlineItems = []) => {
	const emptyResponse = {};
	const { lineItems = [], separatelyGroupedLineItems = {} } = adNetworkConfig || {};

	return dbHelper
		.getDoc(`${docKeys.ampPnp}${siteId}`)
		.catch(err => {
			if (err.code === CB_ERRORS.keyNotFound) {
				return emptyResponse;
			}
			throw err;
		})
		.then(pnpDoc => {
			const pnpConfig = pnpDoc.value || {};

			const adUnits = pnpConfig.adUnits || [];
			const pnpLineItems = pnpConfig.lineItems || [];
			const pnpBlacklistedLineItems = pnpConfig.blacklistedLineItems || [];

			// remove inactive units
			if (Array.isArray(adUnits)) {
				pnpConfig.adUnits = processAdUnits(adUnits);
			}

			if (Array.isArray(pnpLineItems) && pnpLineItems.length) {
				pnpConfig.lineItems = pnpLineItems.map(lineItem => lineItem.id);
			} else {
				let allLineItems = Object.keys(separatelyGroupedLineItems).reduce(
					(accumulator, currValue) => {
						accumulator = [...accumulator, ...separatelyGroupedLineItems[currValue]];
						return accumulator;
					},
					[]
				);
				allLineItems = [...allLineItems, ...lineItems];
				pnpConfig.lineItems = allLineItems;
			}

			if (Array.isArray(pnpBlacklistedLineItems) && pnpBlacklistedLineItems.length) {
				pnpConfig.blacklistedLineItems = pnpBlacklistedLineItems.map(
					blacklistedLineItem => blacklistedLineItem.id
				);
			}

			pnpConfig.blacklistedLineItems = [
				...new Set([...pnpConfig.blacklistedLineItems, ...blockListedlineItems])
			];

			return pnpConfig;
		});
};

module.exports = generatePnPRefreshConfig;
