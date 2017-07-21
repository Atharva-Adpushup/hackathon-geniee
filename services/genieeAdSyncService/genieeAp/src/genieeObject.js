// Below object will hold all Geniee partner specific functionality
var genieeObject = {
	// Get zone id and ecpm values for every successful zone impression
	registerZoneECPM: function (inputZoneId, inputZoneECPM) {
		if (!inputZoneId || !inputZoneECPM) { return false; }

		inputZoneId = parseInt(inputZoneId, 10);
		inputZoneECPM = parseFloat(inputZoneECPM);

		var globalConfig = window.adpushup.config,
			getMatchedAdId = function (adsArray, zoneId) {
				var adId = null;

				if (!adsArray.length || !zoneId) { return null; }

				adsArray.forEach(function (adObject) {
					var isGenieeObject = !!(adObject && adObject.network && (adObject.network === 'geniee') && adObject.networkData),
						isNetworkData = !!(isGenieeObject && adObject.networkData.zoneId),
						isZoneIdMatch = !!(isNetworkData && (adObject.networkData.zoneId === zoneId));

					if (isZoneIdMatch) {
						adId = adObject.id;
						return false;
					}
				});

				return adId;
			},
			matchedAdId = getMatchedAdId(globalConfig.ads, inputZoneId),
			resultObject;

		if (!matchedAdId) { return false; }

		resultObject = {
			eventType: 11,
			adId: matchedAdId,
			revenue: inputZoneECPM,
			adZoneId: inputZoneId
		};

		console.log('Result object is: ', resultObject);
	}
};

module.exports = genieeObject;
