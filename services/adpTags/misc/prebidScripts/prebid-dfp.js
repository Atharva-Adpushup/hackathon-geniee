// Prebid with DFP setup for tripbuzz.com

var PREBID_TIMEOUT = 7000;

var adUnits = [
	{
		code: 'div-gpt-ad-1493368459153-0',
		sizes: [[300, 250]],
		bids: [
			{
				bidder: 'pulsepoint',
				params: { cp: 560684, cf: '300X250', ct: 574151 }
			},
			{
				bidder: 'wideorbit',
				params: { pbId: 577, pId: 95524375 }
			},
			{
				bidder: 'adpushup',
				params: { siteId: 14217, section: 'LISTING_ADRECOVER' }
			},
			{
				bidder: 'aol',
				params: { placement: 4391141, network: 10864.1 }
			}
		]
	}
];

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

(function() {
	var gads = document.createElement('script');
	gads.async = true;
	gads.type = 'text/javascript';
	var useSSL = 'https:' == document.location.protocol;
	gads.src = (useSSL ? 'https:' : 'http:') + '//www.googletagservices.com/tag/js/gpt.js';
	var node = document.getElementsByTagName('script')[0];
	node.parentNode.insertBefore(gads, node);
})();

googletag.cmd.push(function() {
	googletag.defineSlot('/103512698/hb-test', [300, 250], 'div-gpt-ad-1493386561840-0').addService(googletag.pubads());
	googletag.pubads().enableSingleRequest();
	googletag.enableServices();
});

/*
<div id='div-gpt-ad-1493386561840-0' style='height:250px; width:300px;'>
    <script>
    googletag.cmd.push(function() { googletag.display('div-gpt-ad-1493386561840-0'); });
    </script>
</div>
*/
