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
        retry(syncGenieeZones(site), { max_tries: 3, interval: 15000 })
            .then(function() {
                return retry(syncCdn(site), { max_tries: 3, interval: 5000 })
            })
            .then(function() {
                console.log('File generated successfully');
            })
            .catch(function(err) {
                console.log('Sync Process Failed: ', err);
            });
    }, 3000);
});
