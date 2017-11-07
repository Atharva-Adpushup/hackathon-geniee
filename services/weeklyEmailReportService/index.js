const Promise = require('bluebird'),
	_ = require('lodash'),
	extend = require('extend'),
	{ promiseForeach } = require('node-utils'),
	moment = require('moment'),
	AdPushupError = require('../../helpers/AdPushupError'),
	sqlReportingModule = require('../../reports/default/adpTags/index'),
	couchBaseService = require('../../helpers/couchBaseService'),
	couchbasePromise = require('couchbase-promises'),
	usersByNonEmptyChannelsQuery = couchbasePromise.ViewQuery.from('app', 'usersByNonEmptyChannels'),
	userModel = require('../../models/userModel'),
	siteModel = require('../../models/siteModel'),
	channelModel = require('../../models/channelModel');

function formatQueryResult(resultData) {
	return _.map(resultData, resultObj => extend(true, {}, resultObj.value));
}

function getAllValidUsers() {
	const performQuery = couchBaseService.queryViewFromAppBucket(usersByNonEmptyChannelsQuery);

	return Promise.resolve(performQuery).then(formatQueryResult);
}

function validateSiteData(siteModelInstance) {
	const isSiteModel = !!siteModelInstance,
		isApConfigs = !!(
			isSiteModel &&
			siteModelInstance.get('apConfigs') &&
			_.isObject(siteModelInstance.get('apConfigs')) &&
			_.keys(siteModelInstance.get('apConfigs')).length
		),
		isMode = !!(isApConfigs && _.has(siteModelInstance.get('apConfigs'), 'mode')),
		isStep = !!(isApConfigs && siteModelInstance.get('step')),
		dataObject = {};

	if (!isMode || !isStep) {
		throw new AdPushupError('validateSiteData:: Invalid site data');
	}

	return siteModelInstance;
}

function getSiteData(siteModelInstance) {
	const dataObject = {
			domain: siteModelInstance.get('siteDomain'),
			id: siteModelInstance.get('siteId'),
			email: siteModelInstance.get('ownerEmail'),
			step: siteModelInstance.get('step'),
			mode: siteModelInstance.get('apConfigs').mode,
			dateCreated: moment(siteModelInstance.get('dateCreated'), 'x').format('YYYY-MM-DD'),
			pageViews: 0,
			impressions: 0,
			revenue: 0,
			ecpm: 0
		},
		reportDataParams = {
			select: ['total_revenue', 'total_impressions', 'total_requests', 'report_date', 'siteid'],
			where: {
				siteid: dataObject.id
			},
			needAggregated: true
		};

	//TODO: Remove below dummny statement after testing
	reportDataParams.where.siteid = 31000;

	return sqlReportingModule
		.generate(reportDataParams)
		.then(queryResult => {
			return dataObject;
		})
		.catch(error => {
			console.log(`${dataObject.email} - Error occurred while fetching site report data: ${error.message} \n`);
			return dataObject;
		});
}

function processSiteItem(sitesDataArray, siteObject) {
	return siteModel
		.getSiteById(siteObject.siteId)
		.then(validateSiteData)
		.then(getSiteData)
		.then(siteData => {
			sitesDataArray.push(siteData);
			return sitesDataArray;
		})
		.catch(error => {
			throw new AdPushupError(`${error.message}`);
		});
}

function errorHandler(siteObject, err) {
	console.log(
		`getAllSitesData:: catch: Error occurred with site object: ${JSON.stringify(siteObject)}, ${err.message}`
	);
	return true;
}

function getAllSitesData(modelInstance) {
	const isUserModel = !!modelInstance,
		isSitesArray = !!(isUserModel && modelInstance.get('sites') && modelInstance.get('sites').length),
		statusObject = {
			email: modelInstance.get('email'),
			status: 0,
			message: '',
			data: ''
		};

	if (!isSitesArray) {
		statusObject.message = 'Invalid user model or empty sites array';
		return statusObject;
	}

	const sitesArray = modelInstance.get('sites'),
		sitesDataArray = [];

	return promiseForeach(sitesArray, processSiteItem.bind(null, sitesDataArray), errorHandler)
		.then(() => {
			const sitesData = _.compact(sitesDataArray),
				isSiteData = !!(sitesData && sitesData.length);

			if (!isSiteData) {
				throw new AdPushupError('Empty sites data');
			}

			statusObject.status = 1;
			statusObject.message = `${statusObject.email} - Successfully received sites data for user ${statusObject.email}`;
			statusObject.data = sitesData.concat([]);
			console.log(`${statusObject.message}, data: ${JSON.stringify(statusObject.data)} \n`);
			return statusObject;
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

function getAllSites(userObject) {
	return userModel.getUserByEmail(userObject.email).then(getAllSitesData);
}

function rootPromiseEachErrorHandler(userObject, err) {
	console.log(
		`Init:: Promise ForEach Catch: Unable to get sites for user: ${JSON.stringify(userObject)}, ${err.message} \n`
	);
	return true;
}

function processEachUser(allUsers) {
	return promiseForeach(allUsers, getAllSites, rootPromiseEachErrorHandler);
}

function init() {
	return getAllValidUsers()
		.then(processEachUser)
		.then(mainSuccessHandler)
		.catch(mainErrorHandler);
}

init();
