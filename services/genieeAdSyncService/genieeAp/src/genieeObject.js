var utils = require('../libs/utils'),
	// Below object will hold all Geniee partner specific functionality
	genieeObject = {
		// Get zone id and ecpm values for every successful zone impression
		registerZoneECPM: function(inputZoneId, inputZoneECPM) {
			function executeLogic() {
				inputZoneId = parseInt(inputZoneId, 10);
				inputZoneECPM = parseFloat(inputZoneECPM);

				utils.log(
					'KeenIOImpressionRequest: Value of inputZoneId: ',
					inputZoneId,
					', inputZoneECPM: ',
					inputZoneECPM
				);

				if (!inputZoneId || isNaN(inputZoneECPM)) {
					utils.log(
						'KeenIOImpressionRequest: Invalid zoneId or zone ecpm: Execution will stop for this zoneId: ',
						inputZoneId
					);
					return false;
				}

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
					matchedAdData,
					resultObject;

				matchedAdData = getMatchedAdData(globalConfig.ads, inputZoneId);

				if (!matchedAdData.id || !matchedAdData.size) {
					utils.log('KeenIOImpressionRequest: Matched zone id data: ', matchedAdData);
					utils.log(
						'KeenIOImpressionRequest: Zone id does not match with any ad object. Execution will stop for this zoneId: ',
						inputZoneId
					);
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
				utils.log('KeenIOImpressionRequest: Matched zone id data: ', resultObject);

				utils.sendFeedback(resultObject);
			}

			setTimeout(executeLogic, 500);
		}
	};

module.exports = genieeObject;
