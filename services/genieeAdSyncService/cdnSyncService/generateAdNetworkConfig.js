const { couchbaseService } = require('node-utils');
const _ = require('lodash');
const CB_ERRORS = require('couchbase').errors;

const couchBase = require('../../../configs/config').couchBase;
const { docKeys } = require("../../../configs/commonConsts");
const { LINE_ITEM_TYPES } = require('../../../configs/lineItemsConstants');

const dbHelper = couchbaseService(
	`couchbase://${couchBase.HOST}`,
	couchBase.DEFAULT_BUCKET,
	couchBase.DEFAULT_USER_NAME,
	couchBase.DEFAULT_USER_PASSWORD
);

const generateAdNetworkConfig = (activeDFPNetwork, lineItemTypes = []) => {
	const emptyResponse = { lineItems: [] };

	return dbHelper
		.getDoc(`${docKeys.network}${activeDFPNetwork}`)
		.then(adNetworkConfigDoc => {
			var adNetworkConfig = adNetworkConfigDoc.value;
			const mandatoryLineItemTypes = LINE_ITEM_TYPES.filter(type => type.isMandatory && !type.groupedSeparately).map(type => type.value); // HB lineitems are to be kept separately
			const lineItemTypesToProcess = _.uniq([...mandatoryLineItemTypes, ...lineItemTypes]);

			const separatelyGroupedLineItemTypes = LINE_ITEM_TYPES.filter(type => type.groupedSeparately).map(type => type.value);
			let lineItems = [];
			
			lineItemTypesToProcess.forEach(type => {
				if (adNetworkConfig.lineItems && Array.isArray(adNetworkConfig.lineItems[type]) && adNetworkConfig.lineItems[type].length) {
					lineItems = lineItems.concat(adNetworkConfig.lineItems[type]);
				}
			});
			let separatelyGroupedLineItems = separatelyGroupedLineItemTypes.reduce((accumulator, currVal) => {
				if (adNetworkConfig.lineItems && Array.isArray(adNetworkConfig.lineItems[currVal])) {
					accumulator[currVal] = adNetworkConfig.lineItems[currVal].length ? adNetworkConfig.lineItems[currVal] : [];
				}
				return accumulator;
			}, {});			

			adNetworkConfig.lineItems = lineItems;
			adNetworkConfig.separatelyGroupedLineItems = separatelyGroupedLineItems;

			return adNetworkConfig;
		})
		.catch(err => {
			if (err.code == CB_ERRORS.keyNotFound) {
				return emptyResponse;
			}
			throw err;
		});
};

module.exports = generateAdNetworkConfig;
