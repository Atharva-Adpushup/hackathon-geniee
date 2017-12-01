const Promise = require('bluebird'),
	_ = require('lodash'),
	extend = require('extend'),
	{ promiseForeach } = require('node-utils'),
	moment = require('moment'),
	AdPushupError = require('../../helpers/AdPushupError'),
	{ getWeeklyEmailReport } = require('../../helpers/commonFunctions'),
	highChartsModule = require('./modules/highCharts/index'),
	base64ToImageModule = require('./modules/base64ToImg/index'),
	mailerModule = require('./modules/mailer/index'),
	utils = require('../../helpers/utils'),
	couchBaseService = require('../../helpers/couchBaseService'),
	couchbasePromise = require('couchbase-promises'),
	usersByNonEmptySitesQuery = couchbasePromise.ViewQuery.from('app', 'usersByNonEmptySites'),
	userModel = require('../../models/userModel'),
	siteModel = require('../../models/siteModel'),
	cron = require('node-cron'),
	woodlot = require('woodlot').customLogger,
	fileLogger = new woodlot({
		streams: ['./logs/weeklyEmailReport.log'],
		stdout: true
	});

function formatQueryResult(resultData) {
	return _.map(resultData, resultObj => extend(true, {}, resultObj.value));
}

function getAllValidUsers() {
	const performQuery = couchBaseService.queryViewFromAppBucket(usersByNonEmptySitesQuery);

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
		isModePublish = !!(isMode && Number(siteModelInstance.get('apConfigs').mode) === 1),
		isStep = !!(isApConfigs && siteModelInstance.get('step')),
		dataObject = {};
	let siteMode;

	if (!isMode || !isStep) {
		throw new AdPushupError('validateSiteData:: Invalid site data');
	}
	siteMode = siteModelInstance.get('apConfigs').mode;

	if (!isModePublish) {
		throw new AdPushupError(`validateSiteData:: Site is not live. It has mode ${siteMode}.`);
	}

	return siteModelInstance;
}

function getSiteData(siteModelInstance) {
	const dataObject = {
			domain: siteModelInstance.get('siteDomain'),
			siteName: utils.domanize(siteModelInstance.get('siteDomain')),
			id: siteModelInstance.get('siteId'),
			email: siteModelInstance.get('ownerEmail'),
			step: siteModelInstance.get('step'),
			mode: siteModelInstance.get('apConfigs').mode,
			dateCreated: moment(siteModelInstance.get('dateCreated'), 'x').format('YYYY-MM-DD'),
			report: {}
		},
		reportDataParams = {
			siteid: dataObject.id
		};

	return getWeeklyEmailReport(reportDataParams.siteid)
		.then(reportData => {
			fileLogger.info(
				`getWeeklyEmailReport - Successfully fetched report data for siteId ${dataObject.id}: ${JSON.stringify(
					reportData
				)}`
			);

			dataObject.report = extend(true, {}, reportData);
			return dataObject;
		})
		.catch(error => {
			fileLogger.info(`${dataObject.email} - Error occurred while fetching site report data: ${error.message}`);
			return dataObject;
		});
}

function getValidErrorMessage(error) {
	const isMessageCompositeType = _.isObject(error.message) || _.isArray(error.message),
		message = isMessageCompositeType ? JSON.stringify(error.message) : error.message;

	return message;
}

function processSiteItem(sitesDataArray, siteObject) {
	return siteModel
		.getSiteById(siteObject.siteId)
		.then(validateSiteData)
		.then(getSiteData)
		.then(highChartsModule.generateImageBase64)
		.then(base64ToImageModule.generateImages)
		.then(mailerModule.processEmail)
		.then(siteData => {
			sitesDataArray.push(siteData);
			return sitesDataArray;
		})
		.catch(error => {
			const message = getValidErrorMessage(error);

			throw new AdPushupError(`${message}`);
		});
}

function errorHandler(siteObject, error) {
	const message = getValidErrorMessage(error);

	fileLogger.info(
		`getAllSitesData:: catch: Error occurred with site object: ${JSON.stringify(siteObject)}, ${message}`
	);
	return true;
}

function getAllSitesData(modelInstance) {
	const isUserModel = !!modelInstance,
		isSitesArray = !!(isUserModel && modelInstance.get('sites') && modelInstance.get('sites').length),
		emailBlockListArray = ['geniee@adpushup.com'],
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
		sitesDataArray = [],
		userEmail = modelInstance.get('email'),
		isEmailInBlockedList = !!(emailBlockListArray.indexOf(userEmail) > -1);

	if (isEmailInBlockedList) {
		statusObject.message = `User email ${
			userEmail
		} is in blocked list. Module execution for this user will stop now.`;
		return statusObject;
	}

	return promiseForeach(sitesArray, processSiteItem.bind(null, sitesDataArray), errorHandler)
		.then(() => {
			const sitesData = _.compact(sitesDataArray),
				isSiteData = !!(sitesData && sitesData.length);

			if (!isSiteData) {
				throw new AdPushupError('Empty sites data');
			}

			statusObject.status = 1;
			statusObject.message = `${statusObject.email} - Successfully received sites data for user ${
				statusObject.email
			}`;
			statusObject.data = sitesData.concat([]);
			fileLogger.info(`${statusObject.message}, data: ${JSON.stringify(statusObject.data)}`);
			return statusObject;
		})
		.catch(error => {
			const message = getValidErrorMessage(error);

			statusObject.status = 0;
			statusObject.message = `${statusObject.email} - Some error occurred, ${message}`;
			statusObject.data = [];
			fileLogger.info(`${statusObject.message}, data: ${JSON.stringify(statusObject.data)}`);
			return statusObject;
		});
}

function mainSuccessHandler() {
	fileLogger.info('Init:: Successfully processed all users site data');
}

function mainErrorHandler(error) {
	var errorMessage = `Init:: Catch: Failed to process users site data: Error occurred, ${error.message}`;
	fileLogger.info(errorMessage);
}

function getAllSites(userObject) {
	return userModel.getUserByEmail(userObject.email).then(getAllSitesData);
}

function rootPromiseEachErrorHandler(userObject, err) {
	fileLogger.info(
		`Init:: Promise ForEach Catch: Unable to get sites for user: ${JSON.stringify(userObject)}, ${err.message}`
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

cron.schedule(
	'*/10 * * * *',
	function() {
		const infoText = 'WeeklyEmailReport:: Running below task every 4 hours';

		fileLogger.info(infoText);
		init();
	},
	true
);

init();
