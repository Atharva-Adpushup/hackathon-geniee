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
			const mandatoryLineItemTypes = LINE_ITEM_TYPES.filter(type => type.isMandatory).map(type => type.value);
			const lineItemTypesToProcess = _.uniq([...mandatoryLineItemTypes, ...lineItemTypes]);

			let lineItems = [];

			lineItemTypesToProcess.forEach(type => {
				if (adNetworkConfig.lineItems && Array.isArray(adNetworkConfig.lineItems[type]) && adNetworkConfig.lineItems[type].length) {
					lineItems = lineItems.concat(adNetworkConfig.lineItems[type]);
				}
			})

			adNetworkConfig.lineItems = lineItems;

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
