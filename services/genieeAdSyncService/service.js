var Promise = require('bluebird'),
	retry = require('bluebird-retry'),
	syncGenieeZones = require('./genieeZoneSyncService/index'),
	syncCdn = require('./cdnSyncService/index');

function getStatusObj(status, siteId) {
	var computedObj = {
		status: status,
		siteId: siteId
	};

	return computedObj;
}

function getSuccessStatusObj(siteId) {
	console.log('File with site id: ' + siteId + ' generated successfully');
	return getStatusObj(1, siteId);
}

function getFailureStatusObj(siteId, err) {
	console.log('Sync Process Failed: ', err);
	return getStatusObj(0, siteId);
}

module.exports = {
    init: function(site) {
        var siteId = site.get('siteId');

        // @TODO Syncing retry logic to be added 
        if (site.get('partner') === 'geniee') {
            return syncGenieeZones(site)
                .then(function() {
                    return syncCdn(site);
                })
                .then(getSuccessStatusObj.bind(null, siteId))
                .catch(getFailureStatusObj.bind(null, siteId, err));
        } else {
            return syncCdn(site)
                .then(getSuccessStatusObj.bind(null, siteId))
                .catch(getFailureStatusObj.bind(null, siteId));
        }
    }
};
