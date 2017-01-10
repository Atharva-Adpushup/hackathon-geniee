window.adpPrebid = require('./prebid');

var adRenderingTemplate = require('./adRenderingTemplate'),
	printBidTable = require('./printBidTable');

var config = {
	siteId : 17432,

	targetingAdSizes : [
		[300, 250],
		[728, 90],
		[300, 600],
		[970, 90]
	],

	biddingPartners : {
		 "300x250":[
			{
				bidder:"pulsepoint",
				params:{
					cf:"300X250",
					cp:560684,
					ct:544725
				}
			},{
				bidder:"sekindoUM",
				params:{
					spaceId:76690
				}
			},
			{
				bidder:"wideorbit",
				params:{
					pbId: 577,
					pId: 96826180
				}
			},
			{
				bidder:"aol",
				params:{
					placement:4416019,
					network:"10864.1",
					server:"adserver.adtechus.com"
				}
			},
			{
				bidder:"sonobi",
				params:{
					ad_unit: "__AD_UNIT__"
				}
			}
		 ],
		 "728x90":[
			{
				bidder: 'pulsepoint',
				params: {
					cf: '728X90',
					cp: 560684,
					ct: 544724
				}
			}, {
				bidder: 'wideorbit',
				params: {
					pbId: 577,
					pId: 96826182
				}
			}, {
				 bidder:"aol",
				 params:{
					placement:4416020,
					network:"10864.1",
					server:"adserver.adtechus.com"
				 }
			},{
				bidder:"sonobi",
				params:{
					ad_unit: "__AD_UNIT__"
				}
			}
		 ],
		 "300x600":[
			{
				bidder: 'pulsepoint',
				params: {
					cf: '300X600',
					cp: 560684,
					ct: 544733
				}
			},
			{
				bidder:"wideorbit",
				params:{
					pbId:577,
					pId:96826180
				}
			},
			{
				bidder:"aol",
				params:{
					placement:4416022,
					network:"10864.1",
					server:"adserver.adtechus.com"
				}
			},{
				bidder:"sonobi",
				params:{
					ad_unit: "__AD_UNIT__"
				}
			}
		 ],
		 "970x90":[
			{
				bidder: 'pulsepoint',
				params: {
					cf: '970X90',
					cp: 560684,
					ct: 544731
				}
			},
			{
			 bidder:"aol",
			 params:{
				placement:4416021,
				network:"10864.1",
				server:"adserver.adtechus.com"
			 }
		},{
			bidder:"sonobi",
			params:{
				ad_unit: "__AD_UNIT__"
			}
		}
	 ]
	},
	PREBID_TIMEOUT : 3000
};

var googletag = window.googletag || {};
googletag.cmd = googletag.cmd || [];

adpPrebid();

function __renderPrebidAd( _bidsReceived, _adUnitCodes, timeout){
	googletag.cmd.push(function(){
		pbjs._adUnitCodes = _adUnitCodes;
		pbjs._bidsReceived = _bidsReceived;

		printBidTable();

		var highestBids = pbjs.getHighestCpmBids(),
			adUnits = Object.keys(pbjs.getBidResponses());

		pbjs.setTargetingForGPTAsync();
		googletag.pubads().getSlots().forEach(function( gSlot ){

			if( highestBids[0] && gSlot.getAdUnitPath() === highestBids[0].adUnitCode ) {

				var hbPb = parseFloat(gSlot.getTargeting('hb_pb'));

				if( Number.isNaN(hbPb) && hbPb > 3 ){
					gSlot.setTargeting( 'hb_pb', (hbPb + 0.01).toFixed(2) );
				} else {
					gSlot.setTargeting( 'hb_pb', hbPb.toFixed(2) );
				}
			}

			if( adUnits.indexOf(gSlot.getAdUnitPath()) !== -1 ) {
				googletag.pubads().setTargeting('hb_ran', '1');

				if( timeout ) {
					googletag.pubads().setTargeting('is_timed_out', timeout);
				}

				googletag.pubads().refresh([ gSlot ]);
			}

		});
	});

}

function createPrebidContainer(adSlotBids, size, slotId){
	var prebidHtml = adRenderingTemplate.replace('__AD_UNIT_CODE__', JSON.stringify({
		code : slotId,
		size : size,
		bids : JSON.parse( JSON.stringify(adSlotBids).replace('__AD_UNIT__', slotId) )
	}))
	.replace('__PREBID_TIMEOUT__', config.PREBID_TIMEOUT);

	var iframeEl = document.createElement('iframe');
	iframeEl.style.display = "none";
	iframeEl.onload = function(){
		var iframeDoc = iframeEl.contentDocument;

		iframeDoc.open();
		iframeDoc.write(prebidHtml);
		iframeDoc.close();
	};
	document.body.appendChild(iframeEl);
}

if( (window.location.hostname && (window.location.hostname === "www.moneycontrol.com" || window.location.hostname === "moneycontrol.com")) ) {

	var matchAdSize = function( adSize, targetingAdSizes ){

		var boolAdSizes = targetingAdSizes.map(function( compAdSize ){
			if( adSize[0] === compAdSize[0] && adSize[1] === compAdSize[1] ) {
				return true;
			} else {
				return false;
			}
		});

		return boolAdSizes.filter(Boolean).length;
	};

	googletag.cmd.push(function() {
		googletag.pubads().disableInitialLoad();
		googletag.pubads().setTargeting('site_id', config.siteId);
		googletag.pubads().addEventListener('slotRenderEnded', function(event) {
			console.log(event.advertiserId, event.slot.getAdUnitPath());
		});
	});

	function refreshSlot( adSlotId ){
		setTimeout(function(){
			googletag.pubads().getSlots().forEach(function( slot ) {
				if( slot.getAdUnitPath() === adSlotId ) {
					googletag.pubads().refresh([ slot ]);
				}
			});
		}, 100);
	}

	googletag.cmd.push(function(){

		window.oDF = googletag.defineSlot;

		googletag.defineSlot = function(slotId, size, container ){
			var definedSlot = oDF.apply(this, [].slice.call(arguments));

			if( matchAdSize(size, config.targetingAdSizes) ) {
				var adUnitBids = biddingPartnersArr[ size[0] + 'x' + size[1] ];
				createPrebidContainer( adUnitBids, size, slotId );
			} else {
				refreshSlot( slotId );
			}

			return definedSlot;
		};

	});
}