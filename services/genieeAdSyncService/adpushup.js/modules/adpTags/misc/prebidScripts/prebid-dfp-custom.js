// Prebid with custom DFP setup for tripbuzz.com

var PREBID_TIMEOUT = 7000;

// Prebid ad units setup with bidders
var adUnits = [
	{
		code: 'div-gpt-ad-1493632623857-0',
		sizes: [[300, 250]],
		bids: [
			{
				bidder: 'adpushup',
				params: { siteId: 14217, section: 'LISTING_ADRECOVER' }
			},
			{
				bidder: 'aol',
				params: { placement: 4391141, network: 10864.1 }
			}
		]
	},
	{
		code: 'div-gpt-ad-1493632713803-0',
		sizes: [[300, 250]],
		bids: [
			{
				bidder: 'adpushup',
				params: { siteId: 14217, section: 'LISTING_ADRECOVER' }
			},
			{
				bidder: 'aol',
				params: { placement: 4391141, network: 10864.1 }
			}
		]
	},
	{
		code: 'div-gpt-ad-1493634430131-0',
		sizes: [[728, 90]],
		bids: [
			{
				bidder: 'adpushup',
				params: { siteId: 14217, section: 'LISTING_ADRECOVER' }
			},
			{
				bidder: 'aol',
				params: { placement: 4391142, network: 10864.1 }
			}
		]
	}
];

// Prebid + GPT boilerplate setup
var pbjs = pbjs || {};
pbjs.que = pbjs.que || [];

var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

googletag.cmd.push(function() {
	googletag.pubads().disableInitialLoad();
});

pbjs.que.push(function() {
	pbjs.addAdUnits(adUnits);
	pbjs.requestBids({
		bidsBackHandler: sendAdserverRequest
	});
});

// Callback to call when all bids have been fetched
function sendAdserverRequest() {
	if (pbjs.adserverRequestSent) return;
	pbjs.adserverRequestSent = true;

	googletag.cmd.push(function() {
		pbjs.que.push(function() {
			pbjs.setTargetingForGPTAsync();
			googletag.pubads().refresh();
		});
	});
}

setTimeout(function() {
	sendAdserverRequest();
}, PREBID_TIMEOUT);

// Load GPT
(function() {
	var gads = document.createElement('script');
	gads.async = true;
	gads.type = 'text/javascript';
	var useSSL = 'https:' == document.location.protocol;
	gads.src = (useSSL ? 'https:' : 'http:') + '//www.googletagservices.com/tag/js/gpt.js';
	var node = document.getElementsByTagName('script')[0];
	node.parentNode.insertBefore(gads, node);
})();

// Custom adunit mapping logic
var adUnitMap = {
	'300x250': ['tripbuzz_hb_300x250_1', 'tripbuzz_hb_300x250_2'],
	'728x90': ['tripbuzz_hb_728x90_1', 'tripbuzz_hb_728x90_2']
};

var networkId = 103512698;

function defineAdSlot(width, height, container) {
	var adSize = width + 'x' + height,
		adUnit = adUnitMap[adSize].shift(),
		adSlotId = '/' + networkId + '/' + adUnit;

	return googletag.defineSlot(adSlotId, [width, height], container).addService(googletag.pubads());
}

// Generate defineSlot calls using custom mapping and push to GPT
googletag.cmd.push(function() {
	defineAdSlot(300, 250, 'div-gpt-ad-1493632623857-0');
	defineAdSlot(300, 250, 'div-gpt-ad-1493632713803-0');

	defineAdSlot(728, 90, 'div-gpt-ad-1493634430131-0');
	//defineAdSlot(728, 90, 'div-gpt-ad-1493635048427-0');

	googletag.pubads().enableSingleRequest();
	googletag.enableServices();
});

/*
<div id='div-gpt-ad-1493632623857-0' style='height:250px; width:300px;'>
    <script>
        googletag.cmd.push(function() { googletag.display('div-gpt-ad-1493632623857-0'); });
    </script>
</div>
<div id='div-gpt-ad-1493632713803-0' style='height:250px; width:300px;'>
    <script>
        googletag.cmd.push(function() { googletag.display('div-gpt-ad-1493632713803-0'); });
    </script>
</div>

<div id='div-gpt-ad-1493634430131-0' style='height:90px; width:728px;'>
    <script>
        googletag.cmd.push(function() { googletag.display('div-gpt-ad-1493634430131-0'); });
    </script>
</div>
<div id='div-gpt-ad-1493635048427-0' style='height:90px; width:728px;'>
    <script>
        googletag.cmd.push(function() { googletag.display('div-gpt-ad-1493635048427-0'); });
    </script>
</div>
*/
