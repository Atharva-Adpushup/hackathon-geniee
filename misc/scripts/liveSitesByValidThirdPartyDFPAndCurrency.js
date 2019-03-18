const _ = require('lodash');
const siteModel = require('../../models/siteModel');
const couchBaseService = require('../../helpers/couchBaseService');
const logger = require('../../helpers/globalBucketLogger');
const AdPushupError = require('../../helpers/AdPushupError');
const couchbasePromise = require('couchbase');
const viewParameterQuery = couchbasePromise.ViewQuery.from('app', 'liveSitesByValidThirdPartyDFPAndCurrency');
const Promise = require('bluebird');
const request = require('request-promise');
const { CURRENCY_EXCHANGE } = require('../../configs/commonConsts');

function getAllSiteModels(results) {
	return _.map(results, function(siteObj) {
		return siteModel.getSiteById(siteObj.value.siteId).then(model => {
			return {
				...siteObj.value,
				model
			};
		});
	});
}

function getValidResult(data) {
	const parsedData = data && typeof data === 'string' ? JSON.parse(data) : data,
		isValidRootObject = !!(parsedData && parsedData.conversions && Object.keys(parsedData.conversions).length),
		isValidUSOBject = !!(isValidRootObject && Object.keys(parsedData.conversions.USD).length);

	if (!isValidUSOBject) {
		logger({
			source: 'THIRD PARTY DFP CURRENCY LOGS',
			message: 'Invalid data received while fetching currency exchange rate from Prebid JSON url',
			debugData: '',
			details: `${JSON.stringify(data)}`
		});
		throw new AdPushupError(
			'THIRD PARTY DFP CURRENCY LOGS: Invalid data received while fetching currency exchange rate from Prebid JSON url'
		);
	}

	const computedObject = { USD: { ...parsedData.conversions.USD } };
	return computedObject;
}

function getCurrencyExchangeRateData() {
	const url = CURRENCY_EXCHANGE.PREBID_API_URL;

	return request({
		method: 'GET',
		url
	}).then(getValidResult);
}

function updateCurrencyExchangeData(sitesArray, currencyData) {
	return Promise.all(
		_.map(sitesArray, siteConfig => {
			const apConfigs = { ...siteConfig.model.get('apConfigs') },
				isSameCurrencyExchangeRate = !!(
					siteConfig.currencyCode &&
					apConfigs.activeDFPCurrencyCode &&
					apConfigs.activeDFPCurrencyCode === siteConfig.currencyCode
				);

			if (isSameCurrencyExchangeRate) {
				apConfigs.activeDFPCurrencyExchangeRate = currencyData;
				siteConfig.model.set('apConfigs', apConfigs);
				return siteConfig.model.save().then(() => siteConfig.model);
			}

			return false;
		})
	);
}

function successHandler(resultData) {
	resultData = _.compact(resultData);
	const isValidResult = !!(resultData && resultData.length);

	if (isValidResult) {
		const allSiteIds = _.map(resultData, modelInstance => modelInstance.get('siteId'));

		console.log(
			`Successfully updated currency exchange value for sites: ${allSiteIds.join(
				', '
			)} liveSitesByValidThirdPartyDFPAndCurrency`
		);
	} else {
		console.log('No valid sites to update during module execution, liveSitesByValidThirdPartyDFPAndCurrency');
	}

	return resultData;
}

function errorHandler(err) {
	console.log('Error in liveSitesByValidThirdPartyDFPAndCurrency module: ', err);

	logger({
		source: 'THIRD PARTY DFP CURRENCY LOGS',
		message: 'Error occurred while processing this module',
		debugData: '',
		details: `${JSON.stringify(err)}`
	});
	throw err;
}

module.exports = {
	init: function() {
		const query = viewParameterQuery;
		const validSitesPromise = Promise.all(couchBaseService.queryViewFromAppBucket(query).then(getAllSiteModels));

		return Promise.join(validSitesPromise, getCurrencyExchangeRateData(), function(validSitesData, currencyData) {
			return updateCurrencyExchangeData(validSitesData, currencyData).then(successHandler);
		}).catch(errorHandler);
	}
};
