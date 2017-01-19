function main() {

	window.adpPrebid = require('./prebid');
	window.googletag = window.googletag || {};
	googletag.cmd = googletag.cmd || [];

	require('./libs/polyfills');

	var reporting = require('./reporting'),
		printBidTable = require('./printBidTable'),
		utils = require('./libs/utils'),
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
			setTimeout(function(){
				document.body.removeChild(element);
			}, 5000); // A smalls delay to remove iframe to avoid _possible_ reprucussions of premature removal
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

			logger.info("recieved bid responses for %s", slotId);

			// Only work on header bidding slots
			adpHbSlots.forEach(function( gSlot ){

				if( gSlot.getAdUnitPath() === slotId) {

					logger.info("GPT slot found. setting targeting for %s", slotId);

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

	// Safari doesn't send referrer from non-src iframes, which is what
	// WideOrbit explicitly relies on.
	//
	// This function processes all script elements and executes them in either
	// parent window or the container iFrames.
	window.__createScriptInParent = function(scriptEls, slotId){
		scriptEls.forEach(function(scriptEl){
			if( scriptEl.isExecuted === undefined ) {

				var script = document.createElement('script');
				script.type = "text/javascript";
				script.src = scriptEl.src.replace('window.pbjs', '__adp_frame_context_'  + Math.abs(utils.hashCode(slotId)) + '.pbjs' );
				script.onload = scriptEl.onload;
				script.onreadystatechange = scriptEl.onreadystatechange;

				if( scriptEl.src.match(/atemda/) ) { // Wideorbit's bid request URL.
					logger.info("Executing script (%s) in parent window context", scriptEl.src);
					document.body.appendChild(script);
				} else {
					logger.info("Executing script (%s) in frame window context", scriptEl.src);
					window['__adp_frame_context_'  + Math.abs(utils.hashCode(slotId)) ].document.head.appendChild(script);
				}

				scriptEl.isExecuted = true;
			}
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

			window['__adp_frame_context_' + Math.abs(utils.hashCode(slotId)) ] = iframeEl.contentWindow;

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
	}
}

module.exports = main;