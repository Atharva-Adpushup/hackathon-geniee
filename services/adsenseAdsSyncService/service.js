var adpushup = require('../../helpers/adpushupEvent'),
	adsenseAdSyncWorker = require('./adsenseAdSyncService'),
	promiseForEach = require('../../helpers/promiseForeach'),
	globalModel = require('../../models/globalModel'),
	userModel = require('../../models/userModel'),
	consts = require('../../configs/commonConsts'),
	later = require('later'),
	adsenseSyncInProgress = false,
	adsenseAdsSyncschedule = later.parse.text('every 1 min');

adpushup.on('siteSaved', function(site) {
	if (!site.hasUnsyncedAds()) {
		return;
	}

	userModel.getUserByEmail(site.get('ownerEmail')).then(function(user) {
		return user.getAgencyuser().then(function(agencyuser) {
			return adsenseModel.getAdsense(agencyuser);
		}).then(function(agencyAdsense) {
			var network = user.getNetworkDataObj('ADSENSE');
			if (!network) {
				return false;
			}
			return agencyAdsense.doesAccountExists(network.get('pubId'));
		}).then(function(status) {
			return status ? globalModel.addToQueue(consts.Queue.SITES_TO_SYNC_ADSENSE, site.get('siteId')) : false;
		});
	}).catch(function(err) {
		console.log(err);
	});
});

function syncAdsenseAds() {
	if (adsenseSyncInProgress) {
		return false;
	}


	adsenseSyncInProgress = true;

	globalModel.getQueue(consts.Queue.SITES_TO_SYNC_ADSENSE)
		.then(function(sites) {
			return promiseForEach(sites, adsenseAdSyncWorker, function(siteId, err) {
				console.log(siteId + ':' + err.name + ':' + err.message);
				if (err.message === 'No BA machine connected.') {
					return false;
				}
				return true;
			});
		})
		.then(function() {
			console.log('complete');
			adsenseSyncInProgress = false;
		})
		.catch(function(err) {
			adsenseSyncInProgress = false;
			console.log(err);
			console.log('end due to error');
		});
}

later.setInterval(syncAdsenseAds, adsenseAdsSyncschedule);
