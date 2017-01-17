function main() {

	window.adpPrebid = require('./prebid');

	window.googletag = window.googletag || {};
	googletag.cmd = googletag.cmd || [];

	require('./libs/polyfills');

	var reporting = require('./reporting'),
		printBidTable = require('./printBidTable'),
		config = require('./config/config'),
		logger = require('./libs/logger'),
		adRenderingTemplate = require('./adRenderingTemplate');

	var adpHbSlots = [];

	adpPrebid();
	logger.initPrebidLog();

	var adpRefresh = function (slot){
		var renderedSlots = reporting.getAllRenderedSlots();

		// Don't refresh slot if already rendered
		// emergency check
		if( renderedSlots.indexOf(slot.getAdUnitPath()) === -1) {
			googletag.pubads().refresh([ slot ]);
		}
	};

	// Prebid's GPTAsync iterates over all GPT slots and nullifies
	// hb params for others.
	//
	// Custom function to only set targeting params for one slot Id
	var setGPTTargetingForPBSlot = function(gSlot, pbSlotId){
		var slotIds = pbjs.getAdserverTargeting(pbSlotId),
			_hbVals = Object.values( slotIds )[0];

		if( _hbVals ) {
			_keys = Object.keys( _hbVals );
			_keys.forEach(function(_key){
				gSlot.setTargeting(_key, _hbVals[_key]);
			});

			logger.info("hb keys set for %s", pbSlotId);
		} else {
			logger.info("no keys set for %s. probably because of no bids", pbSlotId);
		}

	};

	// Remove HB frame since we only needed it to get bid values.
	var removeHBIframe = function(slotId){
		var adpElements = [].slice.call(document.getElementsByClassName("__adp_frame__" + slotId));

		adpElements.map(function(element){
			document.body.removeChild(element);
		});
	};

	window.__renderPrebidAd = function(pbjsParams, slotId, timeout){

		// Push in googletag.cmd so that multiple calls are processed sequentially.
		googletag.cmd.push(function(){

			// Copy prebid params in current window's prebid context
			Object.keys(pbjsParams).forEach(function(pbjsKey) {
				if( pbjsKey === '_bidsReceived' ) {
					pbjs[pbjsKey] = pbjsParams[pbjsKey].concat(pbjs[pbjsKey]);
				} else {
			  	pbjs[pbjsKey] = pbjsParams[pbjsKey];
				}
			});

			printBidTable();

			var adUnits = Object.keys(pbjs.getBidResponses());

			logger.info("recieved bid responses for %s", adUnits[0]);

			// Only work on header bidding slots
			adpHbSlots.forEach(function( gSlot ){

				if( gSlot.getAdUnitPath() === slotId) {

					setGPTTargetingForPBSlot(gSlot, slotId);

					gSlot.setTargeting('hb_ran', '1');

					if( timeout ) {
						logger.info("timeout occured for prebid for %s", slotId);
						gSlot.setTargeting('is_timed_out', timeout);
					}

					adpRefresh(gSlot);
				}
			});

			removeHBIframe(slotId);

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
		iframeEl.className = "__adp_frame__" + slotId;

		iframeEl.onload = function(){
			logger.info("frame loaded for  %s", slotId);

			if( iframeEl._adp_loaded === undefined ){
				logger.info("adding prebid html for %s", slotId);

				var iframeDoc = iframeEl.contentDocument;

				iframeDoc.open();
				iframeDoc.write(prebidHtml);
				iframeDoc.close();
			}

			iframeEl._adp_loaded = true; // sometimes onload is triggered twice.
		};

		document.body.appendChild(iframeEl);
	}

	function refreshSlot( adSlot ){
		setTimeout(function(){
			adpRefresh(adSlot);
		}, 100);
	}


	if( window.location.hostname && config.siteDomains.indexOf(window.location.hostname) !== -1 ) {

		// match the ad sizes for header bidding.
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
			googletag.pubads().setTargeting('site_id', config.siteId.toString());
		});

		googletag.cmd.push(function(){

			var oDF = googletag.defineSlot,
				oES = googletag.enableServices;

			googletag.defineSlot = function(slotId, size, container ){
				var definedSlot = oDF.apply(this, [].slice.call(arguments));

				if( matchAdSize(size, config.getTargetingAdSizes()) ) {
					logger.info("size matched (%s) for slot (%s) ", size.toString(), slotId );

					var sizeString =  size[0] + 'x' + size[1];

					var biddingPartners = config.biddingPartners[ sizeString ],
						pbBiddingPartners;

					adpHbSlots.push(definedSlot);

					// If the size is defined as having multiple configuration
					// use one by one.
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

			// Intialise reports only when all slots have been defined
			googletag.enableServices = function(){
				logger.info("initialising reports");

				reporting.initReports( adpHbSlots );
				oES();
			};

		});

		googletag.cmd.push(function(){
			googletag.defineSlot('/103512698/AP-14217--sidebar-1',
          [300, 250],
      'div-gpt-ad-1460505748561-2').addService(googletag.pubads());

      googletag.defineSlot('/103512698/AP-14217--sidebar-2',
          [300, 250],
      'div-gpt-ad-1460505748561-1').addService(googletag.pubads());

      googletag.defineSlot('/103512698/AP-14217--below-content',
          [728, 90], 'div-gpt-ad-1460505748561-0').addService(googletag.pubads());

      googletag.enableServices();
		});
	}
}

module.exports = main;