var adpushup = require('../../helpers/adpushupEvent'),
	syncGeneratedFileWithCdn = require('./service'),
	siteModeMailTriggerService = require('../siteModeMailTriggerService/index'),
	Promise = require('bluebird'),
	utils = require('../../helpers/utils'),
	moment = require('moment'),
	cron = require('node-cron'),
	{ fileLogger } = require('../../helpers/logger/file/index'),
	getAutoOptimisedLiveSites = require('../../misc/scripts/adhoc/autoOptimisedLiveSites/service');

function onSiteSaved(site) {
	// save only after 5 second of siteSaved event as still channels are not saved as siteSaved called first and then channel data is saved.
	// so to roughly bypassing this situation run the generator only after 5 seconds, assuming all is saved in 5 seconds
	setTimeout(() => {
		syncGeneratedFileWithCdn.init(site);
		// siteModeMailTriggerService.init(site)
		// .then(console.log)
		// .catch(console.log);
	}, 3000);
}

function updateGeneratedScriptsForLiveSites() {
	var getAutoOptimisedSites = getAutoOptimisedLiveSites.init(),
		getValidLiveSites = Promise.join(getAutoOptimisedSites, function(autoOptimisedSites) {
			return [...autoOptimisedSites];
		}),
		uploadValidLiveSites = getValidLiveSites.then(function(sitesArr) {
			return utils.syncArrayPromise(sitesArr, syncGeneratedFileWithCdn.init);
		});

	return Promise.join(uploadValidLiveSites, function(uploadedLiveSites) {
		const dateTime = moment().format('LLL'),
			successInfo = `All valid live sites were synced at ${dateTime}`;

		fileLogger.info(successInfo);
		console.log(successInfo);
	}).catch(function(e) {
		const dateTime = moment().format('LLL'),
			errorInfo = `Sync process failed: ${e.toString()} at ${dateTime}`;

		fileLogger.info(errorInfo);
		fileLogger.err(e);
		console.log(errorInfo);
	});
}

adpushup.on('siteSaved', onSiteSaved);
cron.schedule(
	'0 0 */4 * * *',
	function() {
		const infoText = 'Running generated scripts for live sites task every 4 hours';

		fileLogger.info(infoText);
		console.log(infoText);
		updateGeneratedScriptsForLiveSites();
	},
	true
);

updateGeneratedScriptsForLiveSites();
