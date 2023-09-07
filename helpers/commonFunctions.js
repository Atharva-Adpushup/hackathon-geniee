const { v4: uuidV4 } = require('uuid');
const request = require('request-promise');
const Promise = require('bluebird');
const _ = require('lodash');
const md5 = require('md5');
const moment = require('moment');
const axios = require('axios');
const apLiteModel = require('../models/apLiteModel');
const HTTP_STATUS = require('../configs/httpStatusConsts');
const commonConsts = require('../configs/commonConsts');
const utils = require('./utils');
const couchbase = require('./couchBaseService');
const httpStatus = require('../configs/httpStatusConsts');
const config = require('../configs/config');

const createAggregateNonAggregateObjects = (dataset, key, container) => {
	const innerObj = {};
	_.forEach(dataset, (nonAggregateDataset, identifier) => {
		innerObj[identifier] = {
			aggregate: {
				total_xpath_miss: 0,
				total_impressions: 0,
				total_revenue: 0, // change this to -1
				total_cpm: 0 // change this to -1
			},
			nonAggregate: nonAggregateDataset
		};
		nonAggregateDataset.forEach(row => {
			innerObj[identifier].aggregate.total_xpath_miss += parseInt(row.total_xpath_miss);
			innerObj[identifier].aggregate.total_impressions += parseInt(row.total_impressions);
			innerObj[identifier].aggregate.total_revenue += parseFloat(row.total_revenue);
		});
		// Rounding off
		innerObj[identifier].aggregate.total_revenue = Number(
			innerObj[identifier].aggregate.total_revenue
		).toFixed(3);

		const isInvalidRevenue = !!(
			innerObj[identifier].aggregate.total_revenue === 0 ||
			innerObj[identifier].aggregate.total_revenue === NaN ||
			innerObj[identifier].aggregate.total_revenue === Infinity
		);

		innerObj[identifier].aggregate.total_revenue = isInvalidRevenue
			? 0
			: innerObj[identifier].aggregate.total_revenue;

		// CPM = Revenue * 1000 / Impressions --> rounding off to 2 decimal places
		innerObj[identifier].aggregate.total_cpm =
			isInvalidRevenue || innerObj[identifier].aggregate.total_impressions === 0
				? 0
				: Number(
						(innerObj[identifier].aggregate.total_revenue * 1000) /
							innerObj[identifier].aggregate.total_impressions
				  ).toFixed(3);
	});
	container[key] = innerObj;
};

const queryResultProcessing = resultset => {
	const pageGroupWiseResult = _.groupBy(resultset, 'name');
	const variationWiseResult = _.groupBy(resultset, 'variation_id');
	const sectionWiseResult = _.groupBy(resultset, 'section_md5');
	const reporting = {
		pagegroups: {},
		variations: {},
		sections: {}
	};
	createAggregateNonAggregateObjects(pageGroupWiseResult, 'pagegroups', reporting);
	createAggregateNonAggregateObjects(variationWiseResult, 'variations', reporting);
	createAggregateNonAggregateObjects(sectionWiseResult, 'sections', reporting);
	return Promise.resolve(reporting);
};

const sendSuccessResponse = (response, res, code = httpStatus.OK) =>
	res.status(code).json({
		error: false,
		data: response
	});
const sendErrorResponse = (response, res, code = httpStatus.BAD_REQUEST) =>
	res.status(code).json({
		error: true,
		data: response
	});
const checkForLog = ad => {
	/*
			Should return true only
				1. Network is not other than adpTags or geniee
				2. If Geniee
					dynamicAllocation should be false.
					if dynamicAllocation is true then adunit should be synced and other changes made
				3. If adpTags, then adunit should be synced and other changes made
				4. logWritten should be false
		*/
	const hasNetwork = !!ad.network;
	const isADPTags = !!(hasNetwork && ad.network === 'adpTags');
	const isGeniee = !!(hasNetwork && ad.network === 'geniee');
	const hasNetworkData = !!(hasNetwork && ad.networkData && Object.keys(ad.networkData).length);
	const isLogWrittenFalse = !!(
		hasNetworkData &&
		ad.networkData.hasOwnProperty('logWritten') &&
		ad.networkData.logWritten === false
	);
	const isADPSynced = !!(
		isADPTags &&
		hasNetworkData &&
		ad.networkData.dfpAdunit &&
		ad.networkData.dfpAdunitCode
	);
	const genieeNonSyncing = !!(
		isGeniee &&
		hasNetworkData &&
		!ad.networkData.dynamicAllocation &&
		ad.networkData.zoneId
	);
	const isGenieeSynced = !!(
		isGeniee &&
		hasNetworkData &&
		ad.networkData.dynamicAllocation &&
		ad.networkData.dfpAdunit &&
		ad.networkData.dfpAdunitCode
	);
	const isDemandChanged = !!(
		hasNetwork &&
		isADPTags === false &&
		(isGeniee === false || genieeNonSyncing) &&
		isLogWrittenFalse
	);
	const isADPChanged = !!(hasNetwork && isADPTags && isADPSynced && isLogWrittenFalse);
	const isGenieeChanged = !!(hasNetwork && isGeniee && isGenieeSynced && isLogWrittenFalse);

	return isDemandChanged || isADPChanged || isGenieeChanged;
};
const isValidThirdPartyDFPAndCurrency = config => {
	const isActiveDFPNetwork = !!(config.activeDFPNetwork && config.activeDFPNetwork.length);
	const isActiveDFPCurrencyCode = !!(
		config.activeDFPCurrencyCode &&
		config.activeDFPCurrencyCode.length &&
		config.activeDFPCurrencyCode.length === 3
	);
	const isValidResult = !!(isActiveDFPNetwork && isActiveDFPCurrencyCode);

	return isValidResult;
};
const getNetworkConfig = () =>
	couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(commonConsts.docKeys.networkConfig))
		.then(json => json.value);
const getNetworkWideHBRules = () =>
	couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(commonConsts.docKeys.networkWideHBRules))
		.then(json => {
			const {
				value: { rules = [] }
			} = json;
			return rules;
		})
		.catch(() => Promise.resolve([]));
const verifyKeysInCollection = (target, source) => {
	let recursionLevel = 0;

	function verifyKeys(target, source) {
		recursionLevel++;

		const isTargetObj = typeof target === 'object' && target !== null;
		const isSourceObj = typeof source === 'object' && source !== null;

		if (isTargetObj && isSourceObj) {
			for (const key in source) {
				if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
					return false;
				}
				if (verifyKeys(target[key], source[key]) === false) {
					return false;
				}
			}
		}

		if ((!isSourceObj || !isTargetObj) && recursionLevel === 1) return false;

		if (isSourceObj && !isTargetObj) return false;
	}

	return verifyKeys(target, source) !== false;
};
const deleteKeysInCollection = (target, source) => {
	const targetCopy = { ...target };
	for (const key in source) {
		if (source.hasOwnProperty(key) && target.hasOwnProperty(key)) {
			delete targetCopy[key];
		}
	}

	return targetCopy;
};
const getMandatoryAdsTxtEntrySnippet = (domainNameSellersJson, sites, sellerId) => {
	const {
		mandatoryAdsTxtSnippet: { domain, relationship, certificationAuthorityId, MANAGERDOMAIN }
	} = commonConsts;
	const ownerDomain = domainNameSellersJson || utils.domanize(sites[0].domain);

	const mandatoryAdsTxtEntryLine = `${domain}, ${sellerId}, ${relationship}, ${certificationAuthorityId}`;

	const mandatoryAdsTxtManagerDomain = `MANAGERDOMAIN=${MANAGERDOMAIN}`;
	const mandatoryAdsTxtOwnerDomain = `OWNERDOMAIN=${ownerDomain}`;

	return [mandatoryAdsTxtEntryLine, mandatoryAdsTxtManagerDomain, mandatoryAdsTxtOwnerDomain].join(
		'\n'
	);
};
const removeFormatWisePrefix = (accumulator, key, config) => {
	const matchedKey = key.match(commonConsts.FORMAT_WISE_PARAMS_REGEX);
	// Only allow banner params in AMP
	if (matchedKey && matchedKey[1] === commonConsts.FORMAT_WISE_PARAMS_PREFIX.BANNER) {
		const newKey = matchedKey[2];
		accumulator[newKey] = config[key];
	}
	if (matchedKey && matchedKey[1] !== commonConsts.FORMAT_WISE_PARAMS_PREFIX.BANNER) {
		return accumulator;
	}
	if (!matchedKey) {
		accumulator[key] = config[key];
	}
	return accumulator;
};
const removeFormatWiseParamsForAMP = bidderConfig => {
	const { config, sizeLess } = bidderConfig;
	let newConfig;
	if (sizeLess) {
		newConfig = Object.keys(config).reduce(
			(accumulator, key) => removeFormatWisePrefix(accumulator, key, config),
			{}
		);
	} else {
		newConfig = {};
		for (size in config) {
			newConfig[size] = Object.keys(config[size]).reduce(
				(accumulator, key) => removeFormatWisePrefix(accumulator, key, config[size]),
				{}
			);
		}
	}
	return newConfig;
};
const getPageGroupNameAndPlatformFromChannelDoc = docId => {
	let docIdPartValue = docId.substr(6, docId.length - 1);
	let colonIndex = docIdPartValue.indexOf(':');
	docIdPartValue = docIdPartValue.substr(colonIndex + 1, docIdPartValue.length - 1);

	colonIndex = docIdPartValue.indexOf(':');
	const platform = docIdPartValue.substr(0, colonIndex);
	docIdPartValue = docIdPartValue.substr(colonIndex + 1, docIdPartValue.length - 1);
	const pageGroup = docIdPartValue;

	return { pageGroup, platform };
};
const getFloorEngineConfigFromCB = () =>
	couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(commonConsts.docKeys.floorEngine))
		.then(({ value }) => value || {})
		.catch(() => Promise.resolve({}));
const getMonthStartDate = date =>
	moment(date)
		.startOf('month')
		.format('YYYY-MM-DD');
const getMonthEndDate = date =>
	moment(date)
		.endOf('month')
		.format('YYYY-MM-DD');
const createSellerId = email => md5(email.toLowerCase());
const getDefaultIfNotPresent = (value, defaultValue) =>
	value === undefined ? defaultValue : value;
const isDuplicateAdUnitsHandled = (adUnitsToBeCreated, curAdunits, res) => {
	const duplicateAdUnits = _.intersection(
		adUnitsToBeCreated.map(adUnit => adUnit.dfpAdunitCode),
		curAdunits.map(adUnit => adUnit.dfpAdunitCode)
	);

	if (duplicateAdUnits.length) {
		sendErrorResponse(
			{
				message: commonConsts.HTTP_RESPONSE_MESSAGES.UPDATE_FAILED_DUPLICATE_UNITS,
				duplicateAdUnits
			},
			res,
			HTTP_STATUS.BAD_REQUEST
		);
		return true;
	}

	return false;
};
const isMissingAdUnitsHandled = (adUnitsToBeCreated, curAdunits, res) => {
	const missingAdUnits = _.difference(
		adUnitsToBeCreated.map(adUnit => adUnit.dfpAdunitCode),
		curAdunits.map(adUnit => adUnit.dfpAdunitCode)
	);
	if (missingAdUnits.length) {
		sendErrorResponse(
			{ message: commonConsts.HTTP_RESPONSE_MESSAGES.UPDATE_FAILED_NO_UNITS, missingAdUnits },
			res,
			HTTP_STATUS.BAD_REQUEST
		);
		return true;
	}
	return false;
};
const initializeAdUnits = adUnits => {
	const defaultValues = commonConsts.AP_LITE_AD_UNIT_DEFAULT_VALUES;

	return adUnits.map(adUnit => ({
		...adUnit,
		headerBidding: getDefaultIfNotPresent(adUnit.headerBidding, defaultValues.HEADER_BIDDING),
		refreshSlot: getDefaultIfNotPresent(adUnit.refreshSlot, defaultValues.REFRESH),
		formats: getDefaultIfNotPresent(adUnit.formats, defaultValues.FORMATS),
		refreshInterval: getDefaultIfNotPresent(adUnit.refreshInterval, defaultValues.REFRESH_INTERVAL),
		isActive: getDefaultIfNotPresent(adUnit.isActive, defaultValues.ACTIVE),
		sectionId: uuidV4()
	}));
};
const updateApLiteAdUnits = (apLiteDoc, adUnits) => {
	const adUnitsToBeUpdated = new Set(adUnits.map(adUnit => adUnit.dfpAdunitCode));

	apLiteDoc.adUnits = apLiteDoc.adUnits.map(adUnitToUpdate => {
		if (!adUnitsToBeUpdated.has(adUnitToUpdate.dfpAdunitCode)) {
			return adUnitToUpdate;
		}

		return {
			...adUnitToUpdate,
			...adUnits.find(adUnit => adUnit.dfpAdunitCode === adUnitToUpdate.dfpAdunitCode)
		};
	});
	return apLiteModel.saveAdUnits(apLiteDoc).then(() => apLiteDoc);
};
const isEmptyApLiteDocHandled = (apLiteDoc, res) => {
	if (!Object.keys(apLiteDoc).length) {
		sendErrorResponse(
			{ message: commonConsts.HTTP_RESPONSE_MESSAGES.NO_AD_UNITS_FOUND },
			res,
			HTTP_STATUS.BAD_REQUEST
		);
		return true;
	}

	return false;
};
const handleUpdateApLiteUnitsError = (err, res) => {
	if (err && err.code === 13) {
		return sendErrorResponse(
			{ message: commonConsts.HTTP_RESPONSE_MESSAGES.SITE_NOT_FOUND },
			res,
			HTTP_STATUS.NOT_FOUND
		);
	}

	return sendErrorResponse(
		{ message: commonConsts.HTTP_RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR },
		res,
		HTTP_STATUS.INTERNAL_SERVER_ERROR
	);
};
const handleApLiteUnitsCreateError = (err, res) => {
	sendErrorResponse(
		{ message: commonConsts.HTTP_RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR },
		res,
		HTTP_STATUS.INTERNAL_SERVER_ERROR
	);
};
const getCommonAuditLog = req => {
	const { siteId } = req.params;
	const { email, originalEmail } = req.user;
	const { siteDomain, appName } = req.body.dataForAuditLogs || {};

	return {
		siteId,
		siteDomain,
		appName,
		type: commonConsts.AUDIT_LOG_TYPES.SITE,
		impersonateId: email,
		userId: originalEmail,
		action: {
			name: commonConsts.AUDIT_LOGS_ACTIONS.OPS_PANEL.SITES_SETTING,
			data: !siteDomain
				? commonConsts.AUDIT_LOG_MESSAGES.ACTION.SITE_API_CALL
				: commonConsts.AUDIT_LOG_MESSAGES.ACTION.SITE_SETTINGS_AP_LITE
		}
	};
};

const getSelectiveRolloutFeatureConfigFromCB = async feature => {
	const appBucket = await couchbase.connectToAppBucket();
	const { value: selectiveRolloutConfig } = await appBucket.getAsync(
		`${commonConsts.docKeys.selectiveRollout}${feature}`
	);
	return selectiveRolloutConfig;
};

const getSelectiveRolloutFeatureConfig = feature => {
	if (config.deployment === commonConsts.MASTER_DEPLOYMENT_FLAG) {
		return getSelectiveRolloutFeatureConfigFromCB(feature);
	}

	const endPoint = `${commonConsts.MASTER_CONSOLE_URL}/api/utils/selectiveRolloutConfig?feature=${feature}`;
	return axios.get(endPoint).then(res => res.data);
};

const filterFalsyObjectKeys = queryParams => {
	const validQueryParams = {};

	Object.keys(queryParams).forEach(key => {
		if (queryParams[key]) {
			validQueryParams[key] = queryParams[key];
		}
	});

	return validQueryParams;
};

const isCouchBaseDocDoesNotExistError = err =>
	err.code === commonConsts.CB_ERRORS.DOC_DOES_NOT_EXIST.code &&
	err.message.includes(commonConsts.CB_ERRORS.DOC_DOES_NOT_EXIST.msg);

const isMasterDeployment = () => config.deployment === commonConsts.MASTER_DEPLOYMENT_FLAG;

const getAuthorizationHeaderObjectForReporting = (
	serviceName = commonConsts.SERVICE_NAMES.GENIEE_CONSOLE
) => {
	const authToken = config.reportingAuthToken[serviceName];
	const authorizationHeaderObject = {
		Authorization: `Basic ${authToken}`
	};
	return authorizationHeaderObject;
};

const makeReportingRequest = options => {
	const { serviceName = commonConsts.SERVICE_NAMES.GENIEE_CONSOLE, ...restOptions } = options;
	const headers = Object.assign(
		getAuthorizationHeaderObjectForReporting(serviceName),
		options.headers
	);
	return request({
		...restOptions,
		json: true,
		headers
	});
};

const makeAxiosReportingRequest = options => {
	const {
		serviceName = commonConsts.SERVICE_NAMES.GENIEE_CONSOLE,
		method = 'GET',
		...restOptions
	} = options;

	const headers = Object.assign(
		getAuthorizationHeaderObjectForReporting(serviceName),
		options.headers
	);

	const axiosConfig = {
		...restOptions,
		method,
		headers
	};

	return axios(axiosConfig);
};

module.exports = {
	queryResultProcessing,
	sendSuccessResponse,
	sendErrorResponse,
	checkForLog,
	isValidThirdPartyDFPAndCurrency,
	getNetworkConfig,
	verifyKeysInCollection,
	deleteKeysInCollection,
	getMandatoryAdsTxtEntrySnippet,
	getNetworkWideHBRules,
	removeFormatWiseParamsForAMP,
	getPageGroupNameAndPlatformFromChannelDoc,
	getFloorEngineConfigFromCB,
	getMonthEndDate,
	getMonthStartDate,
	createSellerId,
	getDefaultIfNotPresent,
	isDuplicateAdUnitsHandled,
	isMissingAdUnitsHandled,
	initializeAdUnits,
	updateApLiteAdUnits,
	isEmptyApLiteDocHandled,
	handleUpdateApLiteUnitsError,
	handleApLiteUnitsCreateError,
	getCommonAuditLog,
	getSelectiveRolloutFeatureConfig,
	getSelectiveRolloutFeatureConfigFromCB,
	filterFalsyObjectKeys,
	isCouchBaseDocDoesNotExistError,
	isMasterDeployment,
	getAuthorizationHeaderObjectForReporting,
	makeReportingRequest,
	makeAxiosReportingRequest
};
