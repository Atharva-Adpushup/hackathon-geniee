function main() {
	window.adpPrebid = require('./prebid');

	window.googletag = window.googletag || {};
	googletag.cmd = googletag.cmd || [];

	var reporting = require('./reporting'),
		printBidTable = require('./printBidTable'),
		config = require('./config'),
		adRenderingTemplate = require('./adRenderingTemplate');

	var adpHbSlots = [];

	adpPrebid();

	window.__renderPrebidAd = function(pbjsParams, timeout){
		googletag.cmd.push(function(){

			Object.keys(pbjsParams).forEach(function(pbjsKey) {
			  pbjs[pbjsKey] = pbjsParams[pbjsKey];
			});

			printBidTable();

			var adUnits = Object.keys(pbjs.getBidResponses());
			pbjs.setTargetingForGPTAsync();

			googletag.pubads().getSlots().forEach(function( gSlot ){

				if( adUnits.indexOf(gSlot.getAdUnitPath()) !== -1 ) {
					gSlot.setTargeting('hb_ran', '1');

					if( timeout ) {
						gSlot.setTargeting('is_timed_out', timeout);
					}

					googletag.pubads().refresh([ gSlot ]);
				}

			});
		});
	}

	function createPrebidContainer(adSlotBids, size, slotId){
		adpHbSlots.push(slotId);

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
		});

		googletag.cmd.push(function(){

			var oDF = googletag.defineSlot,
				eS = googletag.enableServices;

			googletag.defineSlot = function(slotId, size, container ){
				var definedSlot = oDF.apply(this, [].slice.call(arguments));

				if( matchAdSize(size, config.targetingAdSizes) ) {
					var adUnitBids = config.biddingPartners[ size[0] + 'x' + size[1] ];
					createPrebidContainer( adUnitBids, size, slotId );
				} else {
					refreshSlot( slotId );
				}

				return definedSlot;
			};

			googletag.enableServices = function(){
				console.log("adpHbSlots", adpHbSlots);
				reporting.initReports( adpHbSlots );
				eS();
			};

		});
	}
}

module.exports = main;