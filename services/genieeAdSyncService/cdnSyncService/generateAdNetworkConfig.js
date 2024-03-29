const { couchbaseService } = require('node-utils');
const _ = require('lodash');
const CB_ERRORS = require('couchbase').errors;

const couchBase = require('../../../configs/config').couchBase;
const { docKeys, ADPUSHUP_NETWORK_ID } = require('../../../configs/commonConsts');
const { LINE_ITEM_TYPES } = require('../../../configs/lineItemsConstants');

const dbHelper = couchbaseService(
	`couchbase://${couchBase.HOST}`,
	couchBase.DEFAULT_BUCKET,
	couchBase.DEFAULT_USER_NAME,
	couchBase.DEFAULT_USER_PASSWORD
);

const generateAdNetworkConfig = (
	activeDFPNetwork,
	lineItemTypes = [],
	blockListedLineItems = [],
	useLineItemsFile = false,
	fromScript = false
) => {
	const emptyResponse = { lineItems: [] };

	return dbHelper
		.getDoc(`${docKeys.network}${activeDFPNetwork}`)
		.then(adNetworkConfigDoc => adNetworkConfigDoc.value)
		.then(adNetworkConfig => {
			const useLineItemFile =
				fromScript &&
				useLineItemsFile &&
				adNetworkConfig.useLineItemFile &&
				adNetworkConfig.lineItemsFileName;
			if (!useLineItemFile) {
				var { lineItems = [], separatelyGroupedLineItems = [], houseLineItems = [] } = getLineItemCollectionsForScript(
					adNetworkConfig,
					blockListedLineItems,
					lineItemTypes
				);
				adNetworkConfig.lineItems = lineItems;
				adNetworkConfig.separatelyGroupedLineItems = separatelyGroupedLineItems;
				if (houseLineItems && Array.isArray(houseLineItems) && houseLineItems.length && activeDFPNetwork !== ADPUSHUP_NETWORK_ID.toString()) {
					 adNetworkConfig.houseLineItems = houseLineItems; 
				}
				return adNetworkConfig;
			}
			let refreshByTypeLineItems = [];
			for (let type of lineItemTypes) {
				if (adNetworkConfig.lineItems && adNetworkConfig.lineItems[type]) {
					refreshByTypeLineItems = refreshByTypeLineItems.concat(adNetworkConfig.lineItems[type]);
				}
			}
			adNetworkConfig.refreshByTypeLineItems = refreshByTypeLineItems;
			return adNetworkConfig;
		})
		.catch(err => {
			if (err.code == CB_ERRORS.keyNotFound) {
				return emptyResponse;
			}
			throw err;
		});
};

const getLineItemCollectionsForScript = (
	adNetworkConfig,
	blockListedLineItems = [],
	lineItemTypes
) => {
	const mandatoryLineItemTypes = LINE_ITEM_TYPES.filter(
		type => type.isMandatory && !type.groupedSeparately
	).map(type => type.value); // HB lineitems are to be kept separately
	const lineItemTypesToProcess = _.uniq([...mandatoryLineItemTypes, ...lineItemTypes]);

	const separatelyGroupedLineItemTypes = LINE_ITEM_TYPES.filter(type => type.groupedSeparately).map(
		type => type.value
	);
	let lineItems = [];

	lineItemTypesToProcess.forEach(type => {
		if (
			adNetworkConfig.lineItems &&
			Array.isArray(adNetworkConfig.lineItems[type]) &&
			adNetworkConfig.lineItems[type].length
		) {
			lineItems = lineItems.concat(adNetworkConfig.lineItems[type]);
		}
	});
	let separatelyGroupedLineItems = separatelyGroupedLineItemTypes.reduce((accumulator, currVal) => {
		if (adNetworkConfig.lineItems && Array.isArray(adNetworkConfig.lineItems[currVal])) {
			const lineItems = adNetworkConfig.lineItems[currVal];
			const lineItemsAfterRemovingBlocklisted = _.pullAll(lineItems, blockListedLineItems);
			accumulator[currVal] = lineItemsAfterRemovingBlocklisted.length
				? lineItemsAfterRemovingBlocklisted
				: [];
		}
		return accumulator;
	}, {});
	let houseLineItems = [];
	if (adNetworkConfig.lineItems &&
		Array.isArray(adNetworkConfig.lineItems.HOUSE) &&
		adNetworkConfig.lineItems.HOUSE.length) {
		houseLineItems = adNetworkConfig.lineItems.HOUSE;
		houseLineItems = _.pullAll(houseLineItems, blockListedLineItems);
	}
	const lineItemsAfterRemovingBlocklisted = _.pullAll(lineItems, blockListedLineItems);
	return { lineItems: lineItemsAfterRemovingBlocklisted, separatelyGroupedLineItems, houseLineItems };
};

module.exports = generateAdNetworkConfig;
