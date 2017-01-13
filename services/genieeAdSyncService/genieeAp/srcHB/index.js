function main() {

	window.adpPrebid = require('./prebid');

	window.googletag = window.googletag || {};
	googletag.cmd = googletag.cmd || [];

	var reporting = require('./reporting'),
		printBidTable = require('./printBidTable'),
		config = require('./config'),
		logger = require('./libs/logger'),
		adRenderingTemplate = require('./adRenderingTemplate');

	var adpHbSlots = [];

	adpPrebid();

	var adpRefresh = function (slot){
		var renderedSlots = reporting.getRenderedSlots();

		if( renderedSlots.indexOf(slot.getAdUnitPath()) === -1) {
			console.info("refreshing slot: %s", slot.getAdUnitPath());
			googletag.pubads().refresh([ slot ]);
		}
	};

	window.__renderPrebidAd = function(pbjsParams, slotId, timeout){

		// Push in googletag.cmd so that multiple calls are processed sequentially.
		googletag.cmd.push(function(){

			// Copy prebid params in current window's prebid context
			Object.keys(pbjsParams).forEach(function(pbjsKey) {
			  pbjs[pbjsKey] = pbjsParams[pbjsKey];
			});

			printBidTable();

			var adUnits = Object.keys(pbjs.getBidResponses());
			pbjs.setTargetingForGPTAsync();

			logger.info("recieved bid responses for %s", adUnits[0]);

			adpHbSlots.forEach(function( gSlot ){

				if( gSlot.getAdUnitPath() === slotId) {

					gSlot.setTargeting('hb_ran', '1');

					if( timeout ) {
						logger.info("timeout occured for prebid for %s", slotId);
						gSlot.setTargeting('is_timed_out', timeout);
					}

					adpRefresh(gSlot);
				}

			});
		});
	};

	function createPrebidContainer(hbConfigParams, size, slotId){

		var prebidHtml = adRenderingTemplate.replace('__AD_UNIT_CODE__', JSON.stringify({
			code : slotId,
			size : size,
			bids : JSON.parse( JSON.stringify(hbConfigParams).replace('__AD_UNIT__', slotId) )
		}))
		.replace('__PB_TIMEOUT__', config.prebidTimeout)
		.replace('__PB_SLOT_ID__', "'" + slotId + "'");

		var iframeEl = document.createElement('iframe');
		iframeEl.style.display = "none";

		iframeEl.onload = function(){
			logger.info("frame loaded. adding prebid html for %s", slotId);

			var iframeDoc = iframeEl.contentDocument;

			iframeDoc.open();
			iframeDoc.write(prebidHtml);
			iframeDoc.close();
		};

		document.body.appendChild(iframeEl);
	}

	function refreshSlot( adSlot ){
		setTimeout(function(){
			googletag.pubads().refresh([ adSlot ]);
		}, 100);
	}

	if( window.location.hostname && config.siteDomains.indexOf(window.location.hostname) !== -1 ) {

		var matchAdSize = function( adSize, targetingAdSizes ){

			var boolAdSizes = config.getTargetingAdSizes().map(function( compAdSize ){
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
					logger.info("size matched (%s) for slot (%s) ", size.toString(), slotId );

					var sizeString =  size[0] + 'x' + size[1];

					var biddingPartners = config.biddingPartners[ sizeString ],
						pbBiddingPartners;

					adpHbSlots.push(definedSlot);

					if( Array.isArray(biddingPartners[0]) ) {
						pbBiddingPartners = biddingPartners[0];
						config.biddingPartners[sizeString] = config.biddingPartners[sizeString].slice(1);
					} else {
						pbBiddingPartners = biddingPartners;
					}

					createPrebidContainer( pbBiddingPartners, size, slotId );
				} else {
					refreshSlot( definedSlot );
				}

				return definedSlot;
			};

			googletag.enableServices = function(){
				logger.info("initialising reports");

				reporting.initReports( adpHbSlots );
				eS();
			};

		});
	}
}

module.exports = main;