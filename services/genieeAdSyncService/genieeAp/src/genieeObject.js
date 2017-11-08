var utils = require('../libs/utils'),
	nodewatcher = require('../libs/nodeWatcher'),
	// Below object will hold all Geniee partner specific functionality
	genieeObject = {
		// Get zone id and ecpm values for every successful zone impression
		registerZoneECPM: function(inputZoneId, inputZoneECPM) {
			var zoneDOMSelector,
				nodeWatchTimeout = 3000;

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

			zoneDOMSelector = '#_ap_apexGeniee_ad_' + inputZoneId;

			nodewatcher
				.watch(zoneDOMSelector, nodeWatchTimeout)
				.done(function($element) {
					utils.log('KeenIOImpressionRequest: Got zone element: ', $element);

					var globalConfig = window.adpushup.config,
						adsArray = globalConfig.ads.concat([]),
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

					utils.log(
						'KeenIOImpressionRequest: Global ads data: ',
						adsArray,
						', its length: ',
						adsArray.length
					);
					matchedAdData = getMatchedAdData(adsArray, inputZoneId);

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
				})
				.fail(function(err) {
					utils.log('KeenIOImpressionRequest: Unable to find zone element after 2 seconds: ', err);
					return false;
				});
		}
	};

module.exports = genieeObject;
