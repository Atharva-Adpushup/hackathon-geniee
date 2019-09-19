const _ = require('lodash');
const siteModel = require('../../models/siteModel');
const userModel = require('../../models/userModel');
const couchBaseService = require('../../helpers/couchBaseService');
const logger = require('../../helpers/globalBucketLogger');
const AdPushupError = require('../../helpers/AdPushupError');
const couchbasePromise = require('couchbase');
const viewParameterQuery = couchbasePromise.ViewQuery.from('app', 'liveUsersByValidThirdPartyDFPAndCurrency');
const Promise = require('bluebird');
const request = require('request-promise');
const { CURRENCY_EXCHANGE } = require('../../configs/commonConsts');
const { promiseForeach } = require('node-utils');

function getAllUserConfigs(results) {
	return _.map(results, userObj =>
		userModel
			.getUserByEmail(userObj.value.email)
			.then(user => [user, user.get('sites')])
			.then(([user, sites]) => Promise.join(user, getAvailableSiteModels(sites)))
			.then(([user, siteModels]) => ({
				...userObj.value,
				userModel: user,
				siteModels
			}))
	);
}

function getAvailableSiteModels(sites) {
	const allSiteModels = _.map(sites, siteObj => siteModel.getSiteById(siteObj.siteId));
	const siteModels = [];

	return promiseForeach(
		allSiteModels,
		((siteModels, siteModel) => siteModel.then(model => {
			const apConfigs = model.get('apConfigs');
			if (apConfigs && apConfigs.mode === 1) {
				return siteModels.push(model);
			}
		})).bind(
			null,
			siteModels
		),
		(data, error) => true
	).then(() => siteModels);
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

function updateCurrencyExchangeData(userConfigArray, currencyData) {
	return Promise.all(
		_.map(userConfigArray, userConfig => {
			const adServerSettings = { ...userConfig.userModel.get('adServerSettings') },
				isSameCurrencyExchangeRate = !!(
					userConfig.currencyCode &&
					adServerSettings.dfp.activeDFPCurrencyCode &&
					adServerSettings.dfp.activeDFPCurrencyCode === userConfig.currencyCode
				);

			if (isSameCurrencyExchangeRate) {
				adServerSettings.dfp.activeDFPCurrencyExchangeRate = currencyData;
				adServerSettings.dfp.prebidGranularityMultiplier = currencyData.USD[userConfig.currencyCode];
				userConfig.userModel.set('adServerSettings', adServerSettings);
				return userConfig.userModel.save().then(() => userConfig);
			}

			return false;
		})
	);
}

function successHandler(resultData) {
	resultData = _.compact(resultData);
	const isValidResult = !!(resultData && resultData.length);

	if (isValidResult) {
		const allUserEmails = _.map(resultData, userConfig => userConfig.email);

		console.log(
			`Successfully updated currency exchange value for users: ${allUserEmails.join(
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
		const validSitesPromise = Promise.all(couchBaseService.queryViewFromAppBucket(query).then(getAllUserConfigs));

		return Promise.join(validSitesPromise, getCurrencyExchangeRateData(), function(validSitesData, currencyData) {
			return updateCurrencyExchangeData(validSitesData, currencyData).then(successHandler);
		}).catch(errorHandler);
	}
};
