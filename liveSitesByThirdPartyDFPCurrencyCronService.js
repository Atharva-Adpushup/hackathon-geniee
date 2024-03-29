var syncGeneratedFileWithCdn = require('./services/genieeAdSyncService/service'),
	Promise = require('bluebird'),
	utils = require('./helpers/utils'),
	moment = require('moment'),
	cron = require('node-cron'),
	_ = require('lodash'),
	{ fileLogger } = require('./helpers/logger/file/index'),
	liveSitesByValidThirdPartyDFPAndCurrencyModule = require('./misc/scripts/liveSitesByValidThirdPartyDFPAndCurrency');

function updateGeneratedScriptsForLiveSites() {
	var getThirdPartyDFPAndCurrencyLiveSites = liveSitesByValidThirdPartyDFPAndCurrencyModule.init(),
		uploadValidLiveSites = getThirdPartyDFPAndCurrencyLiveSites.then(function(userConfigsArr) {
			return _.map(userConfigsArr, userConfig =>
				utils.syncArrayPromise(userConfig.siteModels, siteModel =>
					syncGeneratedFileWithCdn.init(siteModel)
				)
			);
		});

	return Promise.resolve(uploadValidLiveSites)
		.then(function() {
			const dateTime = moment().format('LLL'),
				successInfo = `All valid DFP currency live sites were synced at ${dateTime}`;

			fileLogger.info(successInfo);
			console.log(successInfo);
		})
		.catch(function(e) {
			const dateTime = moment().format('LLL'),
				errorInfo = `DFP currency live sites sync process failed: ${e.toString()} at ${dateTime}`;

			fileLogger.info(errorInfo);
			fileLogger.err(e);
			console.log(errorInfo);
		});
}

cron.schedule(
	'0 0 */12 * * *',
	function() {
		const infoText = 'Running generated scripts for third party DFP currency live sites task every 4 hours';

		fileLogger.info(infoText);
		console.log(infoText);
		updateGeneratedScriptsForLiveSites();
	},
	true
);

updateGeneratedScriptsForLiveSites();
