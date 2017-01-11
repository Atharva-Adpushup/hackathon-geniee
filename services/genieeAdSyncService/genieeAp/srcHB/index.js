function main() {
	window.adpPrebid = require('./prebid');

	var adRenderingTemplate = require('./adRenderingTemplate'),
		printBidTable = require('./printBidTable');

	var config = {
		siteId           : "__SITE_ID__",
		siteDomains      : "__SITE_DOMAINS__",
		targetingAdSizes : "__TARGETING_AD_SIZES__",
		biddingPartners  : "__BIDDING_CONFIG__",
		PREBID_TIMEOUT   : "__PREBID_TIMEOUT__"
	};

	window.googletag = window.googletag || {};
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
		.replace('__PB_TIMEOUT__', config.PREBID_TIMEOUT);

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

	function refreshSlot( adSlotId ){
		setTimeout(function(){
			googletag.pubads().getSlots().forEach(function( slot ) {
				if( slot.getAdUnitPath() === adSlotId ) {
					googletag.pubads().refresh([ slot ]);
				}
			});
		}, 100);
	}

	if( window.location.hostname && config.siteDomains.indexOf(window.location.hostname) !== -1 ) {

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
}

module.exports = main;