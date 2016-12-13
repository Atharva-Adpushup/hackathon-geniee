var adpushup = require('../../helpers/adpushupEvent'),
    Promise = require('bluebird'),
    retry = require('bluebird-retry'),
    syncGenieeZones = require('./genieeZoneSyncService/index'),
    syncCdn = require('./cdnSyncService/index'),
    _ = require('lodash');

adpushup.on('siteSaved', function(site) {
    // save only after 5 second of siteSaved event as still channels are not saved as siteSaved called first and then channel data is saved.
    // so to roughly bypassing this situation run the generator only after 5 seconds, assuming all is saved in 5 seconds
    setTimeout(function() {
        /*syncGenieeZones(site).then(function () {
            return syncCdn(site);
        })*/

        // Syncing retry logic to be added 
        if (site.get('partner') === 'geniee') {
            syncGenieeZones(site)
                .then(function(){
                    return syncCdn(site);
                })
                .then(function () {
                    console.log('File generated successfully');
                })
                .catch(function (err) {
                    console.log('Sync Process Failed: ', err);
                });
        } else {
            syncCdn(site)
                .then(function () {
                    console.log('File generated successfully');
                })
                .catch(function (err) {
                    console.log('Sync Process Failed: ', err);
                });
        }
    }, 3000);
});
