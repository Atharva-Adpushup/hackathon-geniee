const adpushup = require('../../helpers/adpushupEvent');
const syncGeneratedFileWithCdn = require('./service');
// const Promise = require('bluebird');
// const utils = require('../../helpers/utils');
// const moment = require('moment');
// const cron = require('node-cron');
// const { fileLogger } = require('../../helpers/logger/file/index');
// const getAutoOptimisedLiveSites = require('../../misc/scripts/adhoc/autoOptimisedLiveSites/service');

function onSiteSaved(siteId, siteOptions = {}) {
    const { forcePrebidBuild, options = {} } = siteOptions
    // save only after 3 second of siteSaved event as still channels are not saved as siteSaved called first and then channel data is saved.
    // so to roughly bypassing this situation run the generator only after 3 seconds, assuming all is saved in 3 seconds
    setTimeout(() => syncGeneratedFileWithCdn.init(siteId, forcePrebidBuild, options), 3000);
}

adpushup.on('siteSaved', onSiteSaved);

// function updateGeneratedScriptsForLiveSites() {
// 	var getAutoOptimisedSites = getAutoOptimisedLiveSites.init(),
// 		getValidLiveSites = Promise.join(getAutoOptimisedSites, function(autoOptimisedSites) {
// 			return [...autoOptimisedSites];
// 		}),
// 		uploadValidLiveSites = getValidLiveSites.then(function(sitesArr) {
// 			return utils.syncArrayPromise(sitesArr, syncGeneratedFileWithCdn.init);
// 		});

// 	return Promise.join(uploadValidLiveSites, function(uploadedLiveSites) {
// 		const dateTime = moment().format('LLL'),
// 			successInfo = `All valid live sites were synced at ${dateTime}`;

// 		fileLogger.info(successInfo);
// 		console.log(successInfo);
// 	}).catch(function(e) {
// 		const dateTime = moment().format('LLL'),
// 			errorInfo = `Sync process failed: ${e.toString()} at ${dateTime}`;

// 		fileLogger.info(errorInfo);
// 		fileLogger.err(e);
// 		console.log(errorInfo);
// 	});
// }

// cron.schedule(
// 	'0 0 */4 * * *',
// 	function() {
// 		const infoText = 'Running generated scripts for live sites task every 4 hours';

// 		fileLogger.info(infoText);
// 		console.log(infoText);
// 		updateGeneratedScriptsForLiveSites();
// 	},
// 	true
// );

// updateGeneratedScriptsForLiveSites();
