// Tests done with Quokka.JS extension for Visual Studio code
// Url: https://quokkajs.com/
// NOTE: This abstracted version does not include jQuery or Utils node require
// and throws an error rather than silent logging and return statement
function pushAdToGenieeConfig(adp, obj, containerId) {
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
}

/************************* TESTS START******************************/
{
	//Test 1: Non Geniee Ad
	// EXPECTATION: 'Non Geniee Ad' error thrown
	const adp = {},
		adCode = {
			id: 'ae566125-d3e7-48fc-8b9d-966a8c990bdd',
			adCode: 'Some Adx Code',
			css: {
				'margin-left': '-100px',
				'margin-right': 'auto',
				'margin-top': '0px',
				'margin-bottom': '0px'
			},
			height: 90,
			width: 900,
			network: 'adx',
			networkData: {
				priceFloor: 0
			}
		},
		containerId = '';

	try {
		pushAdToGenieeConfig(adp, adCode, containerId);
	} catch (err) {
		console.log(`TEST #1: ${err}`);
	}
	//RESULT: Error: PushToGenieeAdsObject: Non Geniee ad found, will not be added to its ads object​
}

{
	//Test 2: Geniee Ad with empty zone id
	// EXPECTATION: 'Invalid zoneId found for Geniee Ad' error thrown
	const adp = {},
		adCode = {
			id: 'ae566125-d3e7-48fc-8b9d-966a8c990bdd',
			adCode: 'Some Adx Code',
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
				zoneId: ''
			}
		},
		containerId = '';

	try {
		pushAdToGenieeConfig(adp, adCode, containerId);
	} catch (err) {
		console.log(`TEST #2: ${err}`);
	}
	//RESULT: Error: PushToGenieeAdsObject: Invalid zoneId found for Geniee ad, will not be added to its ads object
}

{
	//Test 3: Geniee Ad with valid zone id
	// EXPECTATION: Successful feedback request and adpushup object return
	const adp = {
			geniee: {
				ads: {},
				sendRevenueFeedback: data => {
					console.log(`GenieeSendRevenueFeedback: Got data for feedback, ${JSON.stringify(data)}`);
				}
			}
		},
		adCode = {
			id: 'ae566125-d3e7-48fc-8b9d-966a8c990bdd',
			adCode: 'Some Adx Code',
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
		const result = pushAdToGenieeConfig(adp, adCode, containerId);

		if (result) {
			console.log(`TEST #3: Success: Result is, ${JSON.stringify(result)}`);
		}
	} catch (err) {
		console.log(`TEST #3: ${err}`);
	}
	// RESULT
	// GenieeSendRevenueFeedback: Got data for feedback, 12345
	// TEST #3: Success: Result is, {"geniee":{"ads":{"12345":{"id":"ae566125-d3e7-48fc-8b9d-966a8c990bdd","adCode":"Some Adx Code","css":{"margin-left":"-100px","margin-right":"auto","margin-top":"0px","margin-bottom":"0px"},"height":90,"width":900,"network":"geniee","networkData":{"zoneId":12345},"containerId":"","success":true,"isImpressionFeedback":false}}}}
}

{
	//Test 4: Valid Geniee Ad with invalid geniee root object
	// EXPECTATION: No feedback request and adpushup object return
	const adp = {},
		adCode = {
			id: 'ae566125-d3e7-48fc-8b9d-966a8c990bdd',
			adCode: 'Some Adx Code',
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
		const result = pushAdToGenieeConfig(adp, adCode, containerId);

		if (result) {
			console.log(`TEST #4: Success: Result is, ${JSON.stringify(result)}`);
		}
	} catch (err) {
		console.log(err);
	}
	// RESULT
	//TEST #4: Success: Result is, {"geniee":{"ads":{"12345":{"id":"ae566125-d3e7-48fc-8b9d-966a8c990bdd","adCode":"Some Adx Code","css":{"margin-left":"-100px","margin-right":"auto","margin-top":"0px","margin-bottom":"0px"},"height":90,"width":900,"network":"geniee","networkData":{"zoneId":12345},"containerId":"","success":true,"isImpressionFeedback":false}}}}
}

module.exports = {
	push: pushAdToGenieeConfig
};
