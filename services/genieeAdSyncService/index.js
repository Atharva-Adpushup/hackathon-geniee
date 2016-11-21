var adpushup = require('../../helpers/adpushupEvent'),
	Promise = require('bluebird'),
	retry = require('bluebird-retry'),
	syncGenieeZones = require('./genieeZoneSyncService/index'),
	syncCdn = require('./cdnSyncService/index'),
	_ = require('lodash');

adpushup.on('siteSaved', function (site) {

	// save only after 5 second of siteSaved event as still channels are not saved as siteSaved called first and then channel data is saved.
	// so to roughly bypassing this situation run the generator only after 5 seconds, assuming all is saved in 5 seconds

	setTimeout(function () {
		syncGenieeZones(site)
			.then(syncCdn.bind(null, site))
			.catch(function (err) {
				debugger;
			})

		//syncGenieeZones(site);
		/*retry(doIt, { max_tries: 3, interval: 3000 }).then(function () {
			console.log('File generated successfully');
		}).catch(function (err) {
			console.log('File generation failed', err);
		});*/
	}, 3000);
});
