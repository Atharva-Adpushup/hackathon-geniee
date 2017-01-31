var adpushup = require('../../helpers/adpushupEvent'),
    hbGeoSync = require('./hbGeoSync');

adpushup.on('hbSiteSaved', function(siteId) {
    // save only after 5 second of siteSaved event as still channels are not saved as siteSaved called first and then channel data is saved.
    // so to roughly bypassing this situation run the generator only after 5 seconds, assuming all is saved in 5 seconds
    setTimeout(function() {
        // @TODO Syncing retry logic to be added
        hbGeoSync(siteId)
            .then(function () {
                console.log('File generated successfully');
            })
            .catch(function (err) {
                console.log('Sync Promisecess Failed: ', err);
            });

    }, 3000);
});
