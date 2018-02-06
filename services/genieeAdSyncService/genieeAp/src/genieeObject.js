var utils = require('../libs/utils'),
	// Below object will hold all Geniee partner specific functionality
	genieeObject = {
		ads: {},
		ecpmZones: {},
		sendRevenueFeedback: function(zoneId) {
			if (!zoneId) {
				utils.log('KeenIOImpressionRequest: Invalid zone id, execution will stop now.');
				return false;
			}

			var _ads = this.ads,
				_ecpmZones = this.ecpmZones,
				globalConfig = window.adpushup.config,
				_$ = window.adpushup.$,
				getMatchedAdData = function(adsObject) {
					var isAdsObject = !!(_$.isPlainObject(adsObject) && !_$.isEmptyObject(adsObject)),
						isMatchedAd,
						isGenieeAd,
						isValidAd,
						matchedAd,
						resultAdObject = {};

					if (!isAdsObject) {
						utils.log('KeenIOImpressionRequest: Geniee ads object is empty, execution will stop now');
						return false;
					}

					isMatchedAd = !!(adsObject.hasOwnProperty(zoneId) && adsObject[zoneId]);
					if (!isMatchedAd) {
						utils.log(
							'KeenIOImpressionRequest: No ad match in Geniee ads: ',
							adsObject,
							' for zoneId: ',
							zoneId
						);
						return false;
					}

					matchedAd = _$.extend(true, {}, adsObject[zoneId]);

					isGenieeAd = !!(
						matchedAd &&
						matchedAd.network &&
						matchedAd.network === 'geniee' &&
						matchedAd.networkData
					);
					if (!isGenieeAd) {
						utils.log(
							'KeenIOImpressionRequest: Matched Ad is not a valid Geniee ad: ',
							matchedAd,
							', execution will stop now'
						);
						return false;
					}

					// 'isValidAd' statement checks whether ad has been rendered successfully in DOM
					// and not yet sent for KeenIO impression feedback request
					isValidAd = !!(matchedAd && matchedAd.success && !matchedAd.isImpressionFeedback);
					if (!isValidAd) {
						utils.log(
							'KeenIOImpressionRequest: Invalid matched Ad: ',
							matchedAd,
							', execution will stop now'
						);
						return false;
					}

					resultAdObject = {
						id: matchedAd.id,
						size: matchedAd.width + 'x' + matchedAd.height,
						containerId: matchedAd.containerId,
						success: matchedAd.success,
						isImpressionFeedback: matchedAd.isImpressionFeedback
					};

					return resultAdObject;
				},
				getMatchedEcpmZoneData = function(ecpmZonesObject) {
					var isEcpmZonesObject = !!(_$.isPlainObject(ecpmZonesObject) && !_$.isEmptyObject(ecpmZonesObject)),
						isMatchedZone,
						matchedZone,
						resultZoneObject = {};

					if (!isEcpmZonesObject) {
						utils.log(
							'KeenIOImpressionRequest: Geniee ecpm zones object is empty, execution will stop now.'
						);
						return false;
					}

					isMatchedZone = !!(ecpmZonesObject.hasOwnProperty(zoneId) && ecpmZonesObject[zoneId]);
					if (!isMatchedZone) {
						utils.log(
							'KeenIOImpressionRequest: No zone id match in Geniee ecpm zones data: ',
							ecpmZonesObject,
							' for zoneId: ',
							zoneId
						);
						return false;
					}

					matchedZone = _$.extend(true, {}, ecpmZonesObject[zoneId]);
					resultZoneObject = {
						zoneId: matchedZone.id,
						revenue: matchedZone.revenue
					};

					return resultZoneObject;
				},
				matchedAdData,
				matchedEcpmZoneData,
				resultObject,
				revenueNumber;

			utils.log('KeenIOImpressionRequest: Ads data value: ', _ads);
			utils.log('KeenIOImpressionRequest: Ecpm zones value: ', _ecpmZones);
			matchedAdData = getMatchedAdData(_ads);
			matchedEcpmZoneData = getMatchedEcpmZoneData(_ecpmZones);

			if (!matchedAdData || !matchedEcpmZoneData) {
				utils.log('KeenIOImpressionRequest: Matched ad data: ', matchedAdData);
				utils.log('KeenIOImpressionRequest: Matched ecpm zone data: ', matchedEcpmZoneData);
				utils.log(
					'KeenIOImpressionRequest: Zone id is not matched with either ads or ecpm zones data. Execution will stop for this zoneId: ',
					zoneId
				);
				return false;
			}

			revenueNumber = Number((matchedEcpmZoneData.revenue / 1000).toFixed(2));

			resultObject = {
				variationId: globalConfig.selectedVariation,
				eventType: 11,
				adId: matchedAdData.id,
				adSize: matchedAdData.size,
				containerId: matchedAdData.containerId,
				revenue: revenueNumber,
				adZoneId: matchedEcpmZoneData.zoneId
			};
			utils.log('KeenIOImpressionRequest: Matched zone id data: ', resultObject);

			// Send KeenIO impression request for this zoneId and
			// set 'isImpressionFeedback' to true in matched Ads object
			utils.sendFeedback(resultObject);
			_ads[zoneId] ? (_ads[zoneId].isImpressionFeedback = true) : null;
		},
		// Get zone id and ecpm values for every successful zone impression
		registerZoneECPM: function(inputZoneId, inputZoneECPM) {
			var ecpmZoneObject = {},
				isEcpmZoneObject,
				_$ = window.adpushup.$,
				_ecpmZones = this.ecpmZones;

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

			ecpmZoneObject.id = inputZoneId;
			ecpmZoneObject.revenue = inputZoneECPM;
			isEcpmZoneObject = !!(_ecpmZones.hasOwnProperty(inputZoneId) && _ecpmZones[inputZoneId]);

			if (!isEcpmZoneObject) {
				_ecpmZones[inputZoneId] = _$.extend(true, {}, ecpmZoneObject);
				this.sendRevenueFeedback(inputZoneId);
			}
		},
		// Tell geniee whether AdPushup will run 'adpushup' or 'control' mode
		// 'selectedMode' parameter will contain variationId (uuid value) or 'CONTROL' string as values
		sendSelectedModeFeedback: function(selectedMode) {
			var isGnsModOneTag = !!(window.gnsmod && window.gnsmod.useOneTag);

			if (!isGnsModOneTag) {
				return false;
			}

			window.gnsmod.adpVariation(selectedMode);
		}
	};

module.exports = genieeObject;
