var utils = require('../libs/utils'),
	// Below object will hold all Geniee partner specific functionality
	genieeObject = {
		// Get zone id and ecpm values for every successful zone impression
		registerZoneECPM: function(inputZoneId, inputZoneECPM) {
			if (!inputZoneId || !inputZoneECPM) {
				return false;
			}

			inputZoneId = parseInt(inputZoneId, 10);
			inputZoneECPM = parseFloat(inputZoneECPM);

			var globalConfig = window.adpushup.config,
				getMatchedAdData = function(adsArray, zoneId) {
					var adData = {
						id: null,
						size: '',
						containerId: ''
					};

					if (!adsArray.length || !zoneId) {
						return null;
					}

					adsArray.forEach(function(adObject) {
						var isGenieeObject = !!(
								adObject &&
								adObject.network &&
								adObject.network === 'geniee' &&
								adObject.networkData
							),
							isNetworkData = !!(isGenieeObject && adObject.networkData.zoneId),
							isZoneIdMatch = !!(isNetworkData && adObject.networkData.zoneId === zoneId);

						if (isZoneIdMatch) {
							adData.id = adObject.id;
							adData.size = adObject.width + 'x' + adObject.height;
							adData.containerId = adObject.containerId;
							return false;
						}
					});

					return adData;
				},
				matchedAdData = getMatchedAdData(globalConfig.ads, inputZoneId),
				resultObject;

			if (!matchedAdData.id || !matchedAdData.size) {
				return false;
			}

			resultObject = {
				variationId: globalConfig.selectedVariation,
				eventType: 11,
				adId: matchedAdData.id,
				adSize: matchedAdData.size,
				containerId: matchedAdData.containerId,
				revenue: inputZoneECPM,
				adZoneId: inputZoneId
			};

			utils.sendFeedback(resultObject);
		}
	};

module.exports = genieeObject;
