var adpushup = require('../../helpers/adpushupEvent'),
	syncGeneratedFileWithCdn = require('./service'),
	Promise = require('bluebird'),
	utils = require('../../helpers/utils'),
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
		console.log('All `autoOptimise` Sites are synced now!');
	})
	.catch(function(e) {
		console.log('Sync process failed: ', e.toString());
	});
}

adpushup.on('siteSaved', onSiteSaved);
cron.schedule('*/10 * * * *', function() {
	console.log('Running below task every 10 minutes');
	updateAllAutoOptimisedSites();
}, true);
