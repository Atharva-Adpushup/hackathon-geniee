// Tests done with Quokka.JS extension for Visual Studio code
// Url: https://quokkajs.com/
// NOTE: This abstracted implementation does not require any file
// as file include feature is only supported in pro version
const utils = {
		log: data => {
			console && console.log ? console.log(data) : null;
		},
		isPlainObject: object => {
			const isTypeOfObject = !!(typeof object === 'object'),
				isConstructorObject = !!(object.constructor === Object),
				isValid = isTypeOfObject && isConstructorObject;

			return isValid;
		},
		isEmptyObject: function(object) {
			const isObject = this.isPlainObject(object),
				isEmpty = !!(isObject && Object.keys(object).length === 0);

			return isEmpty;
		},
		extend: (source, target) => Object.assign(target, source),
		sendFeedback: data => {
			console.log(`AdPushup feedback request will go now: ${JSON.stringify(data)}`);
		}
	},
	config = {
		selectedVariation: ''
	},
	adp = {
		geniee: {
			pushAdToGenieeConfig: (adp, obj, containerId) => {
				var isGenieeAdsObject = !!(adp.geniee && adp.geniee.ads),
					isGenieeAd = !!(obj && obj.network && obj.network === 'geniee' && obj.networkData),
					isZoneId = !!(isGenieeAd && obj.networkData.zoneId),
					adObject = Object.assign({}, obj),
					zoneId;

				if (!isGenieeAd) {
					throw new Error('PushToGenieeAdsObject: Non Geniee ad found, will not be added to its ads object.');
				}

				if (!isZoneId) {
					throw new Error(
						'PushToGenieeAdsObject: Invalid zoneId found for Geniee ad, will not be added to its ads object.'
					);
				}

				zoneId = obj.networkData.zoneId;
				adObject.containerId = containerId || '';
				// Below 'success' property means that Geniee ad has been successfully inserted into DOM
				adObject.success = true;

				// Below 'isImpressionFeedback' property means that Geniee revenue keenIO impression request has not been sent yet
				// for this ad
				adObject.isImpressionFeedback = false;

				if (!isGenieeAdsObject) {
					adp.geniee = {
						ads: {}
					};
				}

				adp.geniee.ads[zoneId] = adObject;
				adp.geniee.sendRevenueFeedback ? adp.geniee.sendRevenueFeedback(zoneId) : null;
				return adp;
			},
			ads: {},
			ecpmZones: {},
			sendRevenueFeedback: function(zoneId) {
				if (!zoneId) {
					utils.log('KeenIOImpressionRequest: Invalid zone id, execution will stop now.');
					return false;
				}

				var _ads = this.ads,
					_ecpmZones = this.ecpmZones,
					globalConfig = config,
					getMatchedAdData = function(adsObject) {
						var isAdsObject = !!(utils.isPlainObject(adsObject) && !utils.isEmptyObject(adsObject)),
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
								`KeenIOImpressionRequest: No ad match in Geniee ads: ${JSON.stringify(
									adsObject
								)} for zoneId: ${zoneId}`
							);
							return false;
						}

						matchedAd = utils.extend({}, adsObject[zoneId]);

						isGenieeAd = !!(
							matchedAd &&
							matchedAd.network &&
							matchedAd.network === 'geniee' &&
							matchedAd.networkData
						);
						if (!isGenieeAd) {
							utils.log(
								`KeenIOImpressionRequest: Matched Ad is not a valid Geniee ad: ${JSON.stringify(
									matchedAd
								)}, execution will stop now`
							);
							return false;
						}

						// 'isValidAd' statement checks whether ad has been rendered successfully in DOM
						// and not yet sent for KeenIO impression feedback request
						isValidAd = !!(matchedAd && matchedAd.success && !matchedAd.isImpressionFeedback);
						if (!isValidAd) {
							utils.log(
								`KeenIOImpressionRequest: Invalid matched Ad: ${JSON.stringify(
									matchedAd
								)}, execution will stop now`
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
						var isEcpmZonesObject = !!(
								utils.isPlainObject(ecpmZonesObject) && !utils.isEmptyObject(ecpmZonesObject)
							),
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
								`KeenIOImpressionRequest: No zone id match in Geniee ecpm zones data: ${ecpmZonesObject} for zoneId: ${zoneId}`
							);
							return false;
						}

						matchedZone = utils.extend({}, ecpmZonesObject[zoneId]);
						resultZoneObject = {
							zoneId: matchedZone.id,
							revenue: matchedZone.revenue
						};

						return resultZoneObject;
					},
					matchedAdData,
					matchedEcpmZoneData,
					resultObject;

				utils.log(`KeenIOImpressionRequest: Ads data value: ${JSON.stringify(_ads)}`);
				utils.log(`KeenIOImpressionRequest: Ecpm zones value: ${JSON.stringify(_ecpmZones)}`);
				matchedAdData = getMatchedAdData(_ads);
				matchedEcpmZoneData = getMatchedEcpmZoneData(_ecpmZones);

				if (!matchedAdData || !matchedEcpmZoneData) {
					utils.log(`KeenIOImpressionRequest: Matched ad data: ${JSON.stringify(matchedAdData)}`);
					utils.log(
						`KeenIOImpressionRequest: Matched ecpm zone data: ${JSON.stringify(matchedEcpmZoneData)}`
					);
					utils.log(
						`KeenIOImpressionRequest: Zone id is not matched with either ads or ecpm zones data. Execution will stop for this zoneId: ${zoneId}`
					);
					return false;
				}

				resultObject = {
					variationId: globalConfig.selectedVariation,
					eventType: 11,
					adId: matchedAdData.id,
					adSize: matchedAdData.size,
					containerId: matchedAdData.containerId,
					revenue: matchedEcpmZoneData.revenue,
					adZoneId: matchedEcpmZoneData.id
				};
				utils.log(`KeenIOImpressionRequest: Matched zone id data: ${JSON.stringify(resultObject)}`);

				// Send KeenIO impression request for this zoneId and
				// set 'isImpressionFeedback' to true in matched Ads object
				utils.sendFeedback(resultObject);
				_ads[zoneId] ? (_ads[zoneId].isImpressionFeedback = true) : null;
			},
			// Get zone id and ecpm values for every successful zone impression
			registerZoneECPM: function(inputZoneId, inputZoneECPM) {
				var ecpmZoneObject = {},
					isEcpmZoneObject,
					_ecpmZones = this.ecpmZones;

				inputZoneId = parseInt(inputZoneId, 10);
				inputZoneECPM = parseFloat(inputZoneECPM);

				utils.log(
					`KeenIOImpressionRequest: Value of inputZoneId: ${inputZoneId}, inputZoneECPM: ${inputZoneECPM}`
				);

				if (!inputZoneId || isNaN(inputZoneECPM)) {
					utils.log(
						`KeenIOImpressionRequest: Invalid zoneId or zone ecpm: Execution will stop for this zoneId: ${inputZoneId}`
					);
					return false;
				}

				ecpmZoneObject.id = inputZoneId;
				ecpmZoneObject.revenue = inputZoneECPM;
				isEcpmZoneObject = !!(_ecpmZones.hasOwnProperty(inputZoneId) && _ecpmZones[inputZoneId]);

				if (!isEcpmZoneObject) {
					_ecpmZones[inputZoneId] = utils.extend({}, ecpmZoneObject);
					this.sendRevenueFeedback(inputZoneId);
				}
			}
		}
	};

/************************* TESTS START *************************/
{
	console.log(`/********************TEST #1 Start*********************`);

	//Test 1: Push a valid Geniee Ad with correct data to root level data collection (adp.geniee.ads)
	// EXPECTATION: Successful feedback request invokation but a validation failure in that function due to
	// empty 'ecpmZones' object
	const adCode = {
			id: 'ae566125-d3e7-48fc-8b9d-966a8c990bdd',
			adCode: '',
			css: {
				'margin-left': '-100px',
				'margin-right': 'auto',
				'margin-top': '0px',
				'margin-bottom': '0px'
			},
			height: 90,
			width: 900,
			network: 'geniee',
			networkData: {
				zoneId: 12345
			}
		},
		containerId = '';

	try {
		adp.geniee.ads = {};
		adp.geniee.ecpmZones = {};
		config.selectedVariation = '12345-343efefef-3434eefdf-06585-5454';
		const result = adp.geniee.pushAdToGenieeConfig(adp, adCode, containerId);

		if (result) {
			console.log(`TEST #1: Success: Result is, ${JSON.stringify(result)}`);
		}
	} catch (err) {
		console.log(`TEST #1: ${err}`);
	}
	console.log(`/********************TEST #1 Done********************`);

	// RESULT
	// KeenIOImpressionRequest: Geniee ecpm zones object is empty, execution will stop now.​​​​​
	// KeenIOImpressionRequest: Zone id is not matched with either ads or ecpm zones data. Execution will stop for this zoneId: 12345​​​​​
	// TEST #1: Success: Result is, {"geniee":{"ads":{"12345":{"id":"ae566125-d3e7-48fc-8b9d-966a8c990bdd","adCode":"","css":{"margin-left":"-100px","margin-right":"auto","margin-top":"0px","margin-bottom":"0px"},"height":90,"width":900,"network":"geniee","networkData":{"zoneId":12345},"containerId":"","success":true,"isImpressionFeedback":false}},"ecpmZones":{}}}​​​​​
}

{
	console.log(`/********************TEST #2 Start*********************`);

	//Test 2: Push a valid zone id and its ecpm data to root level data collection (adp.geniee.ecpmZones)
	// EXPECTATION: Successful feedback request invokation but a validation failure in that function due to
	// empty 'ads' object
	const zoneId = 12345,
		zoneECPM = 2.22;

	try {
		adp.geniee.ads = {};
		adp.geniee.ecpmZones = {};
		config.selectedVariation = '12345-343efefef-3434eefdf-06585-5454';
		const result = adp.geniee.registerZoneECPM(zoneId, zoneECPM);

		if (result) {
			console.log(`TEST #2: Success: Result is, ${JSON.stringify(result)}`);
		}
	} catch (err) {
		console.log(`TEST #2: ${err}`);
	}
	console.log(`/********************TEST #2 Done********************`);

	// RESULT
	// KeenIOImpressionRequest: Ecpm zones value: {"12345":{"id":12345,"revenue":2.22}}​​​​​
	// KeenIOImpressionRequest: Geniee ads object is empty, execution will stop now​​​​​
	// KeenIOImpressionRequest: Zone id is not matched with either ads or ecpm zones data. Execution will stop for this zoneId: 12345​​​​​
}

{
	console.log(`/********************TEST #3 Start*********************`);

	//Test 3: Push a valid geniee ad and zoneECPM data to their respective data collections (adp.geniee.ads and adp.geniee.ecpmZones)
	// EXPECTATION: Feedback request should fail when invoked in registerZoneECPM,
	// and succeed when invoked in pushAdToGenieeConfig function
	const adCode = {
			id: 'ae566125-d3e7-48fc-8b9d-966a8c990bdd',
			adCode: '',
			css: {
				'margin-left': '-100px',
				'margin-right': 'auto',
				'margin-top': '0px',
				'margin-bottom': '0px'
			},
			height: 90,
			width: 900,
			network: 'geniee',
			networkData: {
				zoneId: 12345
			}
		},
		containerId = 'ADP_GENIEE_DIV',
		zoneId = 12345,
		zoneECPM = 2.22;

	try {
		adp.geniee.ads = {};
		adp.geniee.ecpmZones = {};
		config.selectedVariation = '12345-343efefef-3434eefdf-06585-5454';
		const registerECPMResult = adp.geniee.registerZoneECPM(zoneId, zoneECPM),
			pushAdToConfigResult = adp.geniee.pushAdToGenieeConfig(adp, adCode, containerId);

		if (registerECPMResult) {
			console.log(`TEST #3: Got registerECPM data: ${JSON.stringify(registerECPMResult)}`);
		}

		if (pushAdToConfigResult) {
			console.log(`TEST #3: Got pushAdToConfig data: ${JSON.stringify(pushAdToConfigResult)}`);
		}
	} catch (err) {
		console.log(`TEST #3: ${err}`);
	}
	console.log(`/********************TEST #3 Done********************`);

	// RESULT
	// KeenIOImpressionRequest: Ecpm zones value: {"12345":{"id":12345,"revenue":2.22}}​​​​​
	// KeenIOImpressionRequest: Geniee ads object is empty, execution will stop now​​​​​
	// KeenIOImpressionRequest: Zone id is not matched with either ads or ecpm zones data. Execution will stop for this zoneId: 12345​​​​​
	// KeenIOImpressionRequest: Matched zone id data: {"variationId":"12345-343efefef-3434eefdf-06585-5454","eventType":11,"adId":"ae566125-d3e7-48fc-8b9d-966a8c990bdd","adSize":"900x90","containerId":"ADP_GENIEE_DIV","revenue":2.22}​​​​​
	// ​​​​​AdPushup feedback request will go now: {"variationId":"12345-343efefef-3434eefdf-06585-5454","eventType":11,"adId":"ae566125-d3e7-48fc-8b9d-966a8c990bdd","adSize":"900x90","containerId":"ADP_GENIEE_DIV","revenue":2.22}​​​​​
}

{
	console.log(`/********************TEST #4 Start*********************`);

	//Test #4: Push multiple valid geniee ads and zoneECPM data to their respective data collections (adp.geniee.ads and adp.geniee.ecpmZones)
	// EXPECTATION: Feedback request should fail when invoked in registerZoneECPM,
	// and succeed when invoked in pushAdToGenieeConfig function
	const dummyData = {
		first: {
			adObject: {
				id: 'ae566125-d3e7-48fc-8b9d-966a8c990bdd',
				adCode: '',
				css: {
					'margin-left': '-100px',
					'margin-right': 'auto',
					'margin-top': '0px',
					'margin-bottom': '0px'
				},
				height: 90,
				width: 900,
				network: 'geniee',
				networkData: {
					zoneId: 12345
				}
			},
			containerId: 'ADP_GENIEE_DIV',
			zoneId: 12345,
			zoneECPM: 2.22
		},
		second: {
			adObject: {
				id: 'dc6f38fd-9f6b-43b7-91cc-861757ccf848',
				adCode: '',
				css: {
					'margin-left': 'auto',
					'margin-right': 'auto',
					'margin-top': '0px',
					'margin-bottom': '0px',
					clear: 'both'
				},
				height: 250,
				width: 300,
				network: 'geniee',
				networkData: {
					zoneId: 98765
				}
			},
			containerId: 'ADP_GENIEE_PARA',
			zoneId: 98765,
			zoneECPM: 0.11
		}
	};

	try {
		adp.geniee.ads = {};
		adp.geniee.ecpmZones = {};
		config.selectedVariation = '12345-343efefef-3434eefdf-06585-5454';

		adp.geniee.registerZoneECPM(dummyData.first.zoneId, dummyData.first.zoneECPM);
		adp.geniee.registerZoneECPM(dummyData.second.zoneId, dummyData.second.zoneECPM);
		adp.geniee.pushAdToGenieeConfig(adp, dummyData.first.adObject, dummyData.first.containerId);

		config.selectedVariation = '2f8e771a-ad6b-4721-9c5c-a73b357639d6';
		adp.geniee.pushAdToGenieeConfig(adp, dummyData.second.adObject, dummyData.second.containerId);
	} catch (err) {
		console.log(`TEST #4: ${err}`);
	}
	console.log(`/********************TEST #4 Done********************`);

	// RESULT
	// First 'registerZoneECPM' execution
	// KeenIOImpressionRequest: Ecpm zones value: {"12345":{"id":12345,"revenue":2.22}}​​​​​
	// KeenIOImpressionRequest: Geniee ads object is empty, execution will stop now​​​​​

	// Second 'registerZoneECPM' execution
	// KeenIOImpressionRequest: Ecpm zones value: {"12345":{"id":12345,"revenue":2.22},"98765":{"id":98765,"revenue":0.11}}​​​​​
	// ​​​​​KeenIOImpressionRequest: Geniee ads object is empty, execution will stop now​​​​​

	// First 'pushAdToGenieeConfig' execution
	// AdPushup feedback request will go now: {"variationId":"12345-343efefef-3434eefdf-06585-5454","eventType":11,"adId":"ae566125-d3e7-48fc-8b9d-966a8c990bdd","adSize":"900x90","containerId":"ADP_GENIEE_DIV","revenue":2.22}​​​​​
	// Second 'pushAdToGenieeConfig' execution
	// AdPushup feedback request will go now: {"variationId":"2f8e771a-ad6b-4721-9c5c-a73b357639d6","eventType":11,"adId":"dc6f38fd-9f6b-43b7-91cc-861757ccf848","adSize":"300x250","containerId":"ADP_GENIEE_PARA","revenue":0.11}​​​​​
}

{
	console.log(`/********************TEST #5 Start*********************`);

	//Test #5: Push multiple valid geniee ads and zoneECPM data to their respective data collections (adp.geniee.ads and adp.geniee.ecpmZones)
	// EXPECTATION: Feedback request should fail when invoked in pushAdToGenieeConfig,
	// and succeed when invoked in registerZoneECPM function
	const dummyData = {
		first: {
			adObject: {
				id: 'ae566125-d3e7-48fc-8b9d-966a8c990bdd',
				adCode: '',
				css: {
					'margin-left': '-100px',
					'margin-right': 'auto',
					'margin-top': '0px',
					'margin-bottom': '0px'
				},
				height: 90,
				width: 900,
				network: 'geniee',
				networkData: {
					zoneId: 12345
				}
			},
			containerId: 'ADP_GENIEE_DIV',
			zoneId: 12345,
			zoneECPM: 2.22
		},
		second: {
			adObject: {
				id: 'dc6f38fd-9f6b-43b7-91cc-861757ccf848',
				adCode: '',
				css: {
					'margin-left': 'auto',
					'margin-right': 'auto',
					'margin-top': '0px',
					'margin-bottom': '0px',
					clear: 'both'
				},
				height: 250,
				width: 300,
				network: 'geniee',
				networkData: {
					zoneId: 98765
				}
			},
			containerId: 'ADP_GENIEE_PARA',
			zoneId: 98765,
			zoneECPM: 0.11
		}
	};

	try {
		adp.geniee.ads = {};
		adp.geniee.ecpmZones = {};

		config.selectedVariation = '12345-343efefef-3434eefdf-06585-5454';
		adp.geniee.pushAdToGenieeConfig(adp, dummyData.first.adObject, dummyData.first.containerId);
		adp.geniee.pushAdToGenieeConfig(adp, dummyData.second.adObject, dummyData.second.containerId);
		adp.geniee.registerZoneECPM(dummyData.first.zoneId, dummyData.first.zoneECPM);

		config.selectedVariation = '2f8e771a-ad6b-4721-9c5c-a73b357639d6';
		adp.geniee.registerZoneECPM(dummyData.second.zoneId, dummyData.second.zoneECPM);
	} catch (err) {
		console.log(`TEST #5: ${err}`);
	}
	console.log(`/********************TEST #5 Done********************`);

	// RESULT
	// First 'registerZoneECPM' execution
	// KeenIOImpressionRequest: Ecpm zones value: {"12345":{"id":12345,"revenue":2.22}}​​​​​
	// KeenIOImpressionRequest: Geniee ads object is empty, execution will stop now​​​​​

	// Second 'registerZoneECPM' execution
	// KeenIOImpressionRequest: Ecpm zones value: {"12345":{"id":12345,"revenue":2.22},"98765":{"id":98765,"revenue":0.11}}​​​​​
	// ​​​​​KeenIOImpressionRequest: Geniee ads object is empty, execution will stop now​​​​​

	// First 'pushAdToGenieeConfig' execution
	// AdPushup feedback request will go now: {"variationId":"12345-343efefef-3434eefdf-06585-5454","eventType":11,"adId":"ae566125-d3e7-48fc-8b9d-966a8c990bdd","adSize":"900x90","containerId":"ADP_GENIEE_DIV","revenue":2.22}​​​​​
	// Second 'pushAdToGenieeConfig' execution
	// AdPushup feedback request will go now: {"variationId":"2f8e771a-ad6b-4721-9c5c-a73b357639d6","eventType":11,"adId":"dc6f38fd-9f6b-43b7-91cc-861757ccf848","adSize":"300x250","containerId":"ADP_GENIEE_PARA","revenue":0.11}​​​​​
}
