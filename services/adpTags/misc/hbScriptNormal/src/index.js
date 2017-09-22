var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

var gptScriptEl = document.createElement('script');
gptScriptEl.src = '//www.googletagservices.com/tag/js/gpt.js';
gptScriptEl.async = true;
document.head.appendChild(gptScriptEl);

var PREBID_TIMEOUT = 2500;

if (!Object.keys) {
	Object.keys = (function() {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !{ toString: null }.propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function(obj) {
			if ((typeof obj !== 'object' && typeof obj !== 'function') || obj === null)
				throw new TypeError('Object.keys called on non-object');

			var result = [];

			for (var prop in obj) {
				if (hasOwnProperty.call(obj, prop)) result.push(prop);
			}

			if (hasDontEnumBug) {
				for (var i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
				}
			}
			return result;
		};
	})();
}

if (!window.btoa) {
	var object = window;

	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	function InvalidCharacterError(message) {
		this.message = message;
	}
	InvalidCharacterError.prototype = new Error();
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	// encoder
	// [https://gist.github.com/999166] by [https://github.com/nignag]
	object.btoa = function(input) {
		var str = String(input);
		for (
			// initialize result and counter
			var block, charCode, idx = 0, map = chars, output = '';
			// if the next str index does not exist:
			//   change the mapping table to "="
			//   check if d has no fractional digits
			str.charAt(idx | 0) || ((map = '='), idx % 1);
			// "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
			output += map.charAt(63 & (block >> (8 - (idx % 1) * 8)))
		) {
			charCode = str.charCodeAt((idx += 3 / 4));
			if (charCode > 0xff) {
				throw new InvalidCharacterError(
					"'btoa' failed: The string to be encoded contains characters outside of the Latin1 range."
				);
			}
			block = (block << 8) | charCode;
		}
		return output;
	};
}

var adpSlots = {
	hb_div_1: {
		placement: 'hb_div_1',
		containerId: 'hb_div_1',
		slotId: 'HB_25129_300x250_Test1',
		size: '300x250',
		feedback: {
			winner: 'adx'
		},
		gSlot: null
	},
	hb_div_2: {
		placement: 'hb_div_2',
		containerId: 'hb_div_2',
		slotId: 'HB_25129_300x250_Test2',
		size: '300x250',
		feedback: {
			winner: 'adx'
		},
		gSlot: null
	},
	hb_div_3: {
		placement: 'hb_div_3',
		containerId: 'hb_div_3',
		slotId: 'HB_25129_300x250_Test3',
		size: '300x250',
		feedback: {
			winner: 'adx'
		},
		gSlot: null
	}
};

var adUnits = [
	{
		code: 'hb_div_1',
		sizes: [[300, 250]],
		bids: [
			{
				bidder: 'pulsepoint',
				params: {
					cf: '300X250',
					cp: 560684,
					ct: 582525
				}
			},
			{
				bidder: 'wideorbit',
				params: {
					pbId: 577,
					pId: 107267321
				}
			},
			{
				bidder: 'adpushup',
				params: {
					siteId: 25129,
					section: 'AP_AD',
					blockAnimation: false,
					page: window.location.href
				}
			}
		]
	},
	{
		code: 'hb_div_2',
		sizes: [[300, 250]],
		bids: [
			{
				bidder: 'pulsepoint',
				params: {
					cf: '300X250',
					cp: 560684,
					ct: 582526
				}
			},
			{
				bidder: 'wideorbit',
				params: {
					pbId: 577,
					pId: 107267449
				}
			},
			{
				bidder: 'adpushup',
				params: {
					siteId: 25129,
					section: 'AP_AD',
					blockAnimation: false,
					page: window.location.href
				}
			}
		]
	},
	{
		code: 'hb_div_3',
		sizes: [[300, 250]],
		bids: [
			{
				bidder: 'pulsepoint',
				params: {
					cf: '300X250',
					cp: 560684,
					ct: 582527
				}
			},
			{
				bidder: 'wideorbit',
				params: {
					pbId: 577,
					pId: 107267514
				}
			},
			{
				bidder: 'adpushup',
				params: {
					siteId: 25129,
					section: 'AP_AD',
					blockAnimation: false,
					page: window.location.href
				}
			}
		]
	}
];

var pbjs = pbjs || {};
pbjs.que = pbjs.que || [];

googletag.cmd.push(function() {
	googletag.pubads().disableInitialLoad();
});

pbjs.que.push(function() {
	pbjs.setPriceGranularity('dense');
	pbjs.setBidderSequence('random');
	pbjs.addAdUnits(adUnits);
	pbjs.requestBids({
		bidsBackHandler: sendAdserverRequest
	});
});

pbjs.que.push(function() {
	pbjs.onEvent('bidWon', function(bidData) {
		console.log('Prebid winner decided');
		var slot = adpSlots[bidData.adUnitCode];
		slot.feedback.winner = bidData.bidder;
		slot.feedback.winningRevenue = bidData.cpm / 1000;
	});
});

function setGPTTargetingForPBSlot(containerId) {
	var gSlot = adpSlots[containerId].gSlot,
		targeting = pbjs.getAdserverTargeting()[containerId];

	if (targeting) {
		var keys = Object.keys(targeting);
		keys.forEach(function(key) {
			gSlot.setTargeting(key, targeting[key]);
		});
	}
}

function setGPTKeys(containerId, gptKeyGroup) {
	var gSlot = adpSlots[containerId].gSlot;

	for (var gptKey in gptKeyGroup) {
		gSlot.setTargeting(gptKey, String(gptKeyGroup[gptKey]));
	}
}

function setGPTTargeting() {
	for (var i in adpSlots) {
		var slot = adpSlots[i];

		var targeting = {
			hb_placement: slot.placement,
			hb_siteId: 25129,
			hb_ran: 1,
			hb_normal: 1
		};

		setGPTTargetingForPBSlot(slot.containerId);
		setGPTKeys(slot.containerId, targeting);
	}
}

function getBidDataForFeedback(containerId) {
	var bidData = [],
		// Not using getBidResponses() because context of all slot containers is not getting saved in it, instead using getBidResponsesForAdUnitCode(':adUnitCode')
		slotBids = pbjs.getBidResponsesForAdUnitCode(containerId);

	if (slotBids) {
		var bids = slotBids.bids;
		for (var i in bids) {
			bidData.push({
				revenue: bids[i].cpm / 1000, // Actual revenue for impression = cpm/1000
				bidder: bids[i].bidder,
				adId: bids[i].adId
			});
		}
		bidData.push({
			bidder: 'adx',
			adId: adpSlots[containerId].slotId
		});
		return bidData;
	}
	return bidData;
}

function sendFeedback(slot) {
	var feedback = {
		placement: slot.placement,
		containerId: slot.containerId,
		winner: slot.feedback.winner,
		winningRevenue: slot.feedback.winningRevenue || 0,
		bids: getBidDataForFeedback(slot.containerId) || [],
		siteId: 25129,
		timeout: PREBID_TIMEOUT,
		size: slot.size
	};
	console.log(feedback);
	sendDataToKeenIO(feedback);
}

function sendDataToKeenIO(data) {
	var encodedData = window.btoa(JSON.stringify(data)),
		imgEl = document.createElement('img');

	imgEl.src =
		'https://api.keen.io/3.0/projects/5922a50995cfc9addc2480dd/events/hb_normal?api_key=40C0401741E18AFC5F17B722BA6371984333FDD0C36101019C7C107C1E1334B4&data=' +
		encodedData;
	imgEl.style.display = 'none';
	document.body.appendChild(imgEl);
}

function sendAdserverRequest() {
	if (pbjs.adserverRequestSent) return;
	pbjs.adserverRequestSent = true;

	console.log(pbjs.getBidResponses());

	googletag.cmd.push(function() {
		pbjs.que.push(function() {
			setGPTTargeting();
			googletag.pubads().refresh();
		});
	});
}

setTimeout(function() {
	sendAdserverRequest();
}, PREBID_TIMEOUT);

googletag.cmd.push(function() {
	googletag.pubads().addEventListener('slotRenderEnded', function(event) {
		var slot;
		Object.keys(adpSlots).forEach(function(adpSlot) {
			if ('/103512698/' + adpSlots[adpSlot].slotId === event.slot.getName()) {
				slot = adpSlots[adpSlot];
			}
		});
		sendFeedback(slot);
	});
});

googletag.cmd.push(function() {
	adpSlots['hb_div_1'].gSlot = googletag
		.defineSlot('/103512698/HB_25129_300x250_Test1', [300, 250], 'hb_div_1')
		.addService(googletag.pubads());
	adpSlots['hb_div_2'].gSlot = googletag
		.defineSlot('/103512698/HB_25129_300x250_Test2', [300, 250], 'hb_div_2')
		.addService(googletag.pubads());
	adpSlots['hb_div_3'].gSlot = googletag
		.defineSlot('/103512698/HB_25129_300x250_Test3', [300, 250], 'hb_div_3')
		.addService(googletag.pubads());
	googletag.pubads().enableSingleRequest();
	googletag.enableServices();
});

/*
<div id='hb_div_1' style='height:250px; width:300px;'>
    <script>
    googletag.cmd.push(function() { googletag.display('hb_div_1'); });
    </script>
</div>
<div id='hb_div_2' style='height:250px; width:300px;'>
    <script>
    googletag.cmd.push(function() { googletag.display('hb_div_2'); });
    </script>
</div>
<div id='hb_div_3' style='height:250px; width:300px;'>
    <script>
    googletag.cmd.push(function() { googletag.display('hb_div_3'); });
    </script>
</div>
*/
