var Promise = require('bluebird'),
	retry = require('bluebird-retry'),
	{ fileLogger } = require('../../helpers/logger/file/index'),
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
    const infoText = `File with site id: ${siteId} generated successfully`;

	fileLogger.info(infoText);
    console.log(infoText);
	return getStatusObj(1, siteId);
}

function getFailureStatusObj(siteId, err) {
    const errorText = `Sync Process Failed: ${err.toString()} for siteId ${siteId}`;

	fileLogger.info(errorText);
    fileLogger.error(err);
    console.log(errorText);
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
                .catch(getFailureStatusObj.bind(null, siteId));
        } else {
            return syncCdn(site)
                .then(getSuccessStatusObj.bind(null, siteId))
                .catch(getFailureStatusObj.bind(null, siteId));
        }
    }
};
