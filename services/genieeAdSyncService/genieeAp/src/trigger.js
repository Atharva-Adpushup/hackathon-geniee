var adp = window.adpushup,
	$ = adp.$,
	trigger = function(adId) {
		if (adp && Array.isArray(adp.manualAds) && adp.manualAds.length) {
			var manualAds = adp.manualAds,
				ad = manualAds.filter(function(ad) {
					return ad.id == adId;
				})[0],
				$adEl = $('#' + ad.id);
			$adEl.css({ width: ad.width, height: ad.height, background: 'red' });
			$adEl.append(ad.networkData.adCode);
		}
	};

module.exports = trigger;
