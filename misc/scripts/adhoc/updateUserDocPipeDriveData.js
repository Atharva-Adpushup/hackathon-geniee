const Promise = require('bluebird'),
	_ = require('lodash'),
	extend = require('extend'),
	{ promiseForeach } = require('node-utils'),
	moment = require('moment'),
	utils = require('../../../helpers/utils'),
	AdPushupError = require('../../../helpers/AdPushupError'),
	couchBaseService = require('../../../helpers/couchBaseService'),
	couchbasePromise = require('couchbase'),
	usersByNonEmptySitesQuery = couchbasePromise.ViewQuery.from('app', 'usersByNonEmptySites'),
	userModel = require('../../../models/userModel');

function formatQueryResult(resultData) {
	return _.map(resultData, resultObj => extend(true, {}, resultObj.value));
}

function getAllValidUsers() {
	const performQuery = couchBaseService.queryViewFromAppBucket(usersByNonEmptySitesQuery);

	return Promise.resolve(performQuery).then(formatQueryResult);
}

function updatePipeDriveKeys(inputData) {
	const isInputData = !!inputData,
		isSitesArray = !!(isInputData && inputData.sites && inputData.sites.length),
		isDealId = !!(isInputData && inputData.crmDealId),
		isValidData = isSitesArray && isDealId,
		statusObject = {
			email: inputData.email,
			status: 0,
			message: '',
			data: ''
		};

	if (!isValidData) {
		statusObject.message = 'Invalid user data, execution will stop now';
		console.log(`Fail to update user document for ${statusObject.email}: ${JSON.stringify(statusObject)}`);
		return statusObject;
	}

	const sitesArray = inputData.sites.concat([]),
		crmDealId = inputData.crmDealId,
		crmDealTitle = inputData.crmDealTitle,
		email = inputData.email;

	return userModel
		.getUserByEmail(email)
		.then(user => {
			sitesArray[0].pipeDrive = {
				dealId: crmDealId,
				dealTitle: crmDealTitle ? crmDealTitle : `[CO] ${utils.domanize(sitesArray[0].domain)}`
			};
			user.set('sites', sitesArray);
			return user.save().then(() => {
				statusObject.status = 1;
				statusObject.message = `${statusObject.email} - Successfully updated user document for user ${statusObject.email}`;
				statusObject.data = sitesArray.concat([]);
				console.log(`${statusObject.message}, data: ${JSON.stringify(statusObject.data)} \n`);
				return statusObject;
			});
		})
		.catch(error => {
			const isObjectMessage = _.isObject(error.message),
				message = isObjectMessage ? JSON.stringify(error.message) : error.message;

			statusObject.status = 0;
			statusObject.message = `${statusObject.email} - Some error occurred, ${message}`;
			statusObject.data = [];
			console.log(`${statusObject.message}, data: ${JSON.stringify(statusObject.data)} \n`);
			return statusObject;
		});
}

function mainSuccessHandler() {
	console.log('Init:: Successfully processed all users site data \n');
}

function mainErrorHandler(error) {
	var errorMessage = `Init:: Catch: Failed to process users site data: Error occurred, ${error.message} \n`;
	console.log(errorMessage);
}

function rootPromiseEachErrorHandler(userObject, err) {
	console.log(
		`Init:: Promise ForEach Catch: Unable to get sites for user: ${JSON.stringify(userObject)}, ${err.message} \n`
	);
	return true;
}

function processEachUser(allUsers) {
	return promiseForeach(allUsers, updatePipeDriveKeys, rootPromiseEachErrorHandler);
}

function init() {
	return getAllValidUsers()
		.then(processEachUser)
		.then(mainSuccessHandler)
		.catch(mainErrorHandler);
}

init();
