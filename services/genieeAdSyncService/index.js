var adpushup = require('../../helpers/adpushupEvent'),
	syncGeneratedFileWithCdn = require('./service'),
	Promise = require('bluebird'),
	utils = require('../../helpers/utils'),
	moment = require('moment'),
	cron = require('node-cron'),
	getAutoOptimisedLiveSites = require('../../reports/default/apex/MAB/getAutoOptimisedLiveSites/service');

function onSiteSaved(site) {
	// save only after 5 second of siteSaved event as still channels are not saved as siteSaved called first and then channel data is saved.
	// so to roughly bypassing this situation run the generator only after 5 seconds, assuming all is saved in 5 seconds
	setTimeout(syncGeneratedFileWithCdn.init.bind(null, site), 3000);
}

function updateAllAutoOptimisedSites() {
	var getSites = getAutoOptimisedLiveSites.init(),
		uploadSites = getSites.then(function(sitesArr) {
			return utils.syncArrayPromise(sitesArr, syncGeneratedFileWithCdn.init);
		});

	return Promise.join(getSites, uploadSites, function(sitesArr, uploadedSites) {
		var dateTime = moment().format('LLL');

		console.log('All `autoOptimise` Sites were synced at ' + dateTime);
	})
	.catch(function(e) {
		console.log('Sync process failed: ', e.toString() + ' at ' + dateTime);
	});
}

adpushup.on('siteSaved', onSiteSaved);
cron.schedule('0 0 */4 * * *', function() {
	console.log('Running below task every 4 hours');
	updateAllAutoOptimisedSites();
}, true);
// NOTE: Even with boolean `true` as third argument,
// cron doesn't immediately start the job.
// Hence, a manual invokation for this method is done below
// TODO: Test this issue out and if persists,
// do a pull request to 'node-cron' npm package to fix this :)
updateAllAutoOptimisedSites();
