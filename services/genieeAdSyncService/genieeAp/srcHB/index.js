function main() {
	var adpQue;

	window.adpPrebid = require('./prebid');

	if( window.adpTags ) {
		adpQue = window.adpTags.que;
	} else {
		adpQue = [];
	}

	window.adpTags = require('./adpTags');
	window.adpTags.que = window.adpTags.que.concat(adpQue);

	window.googletag = window.googletag || {};
	googletag.cmd = googletag.cmd || [];

	window.adpTags.processQue();

	require('./libs/polyfills');

	var reporting = require('./reporting'),
		printBidTable = require('./printBidTable'),
		utils = require('./libs/utils'),
		config = require('./config/config'),
		logger = require('./libs/logger'),

		sandBoxbids = require('./sandBoxbids'),

		dfpSlotHook = require('./dfpSlotHook');

	adpPrebid();

	logger.initPrebidLog();
	adpTags.setGPTListeners();
	reporting.initReports();

	var setPbjsKeys = function( pbjsParams ){

		// Copy prebid params in current window's prebid context
		Object.keys(pbjsParams).forEach(function(pbjsKey) {
			if( pbjsKey === '_bidsReceived' ) {
				pbjs[pbjsKey] = pbjsParams[pbjsKey].concat(pbjs[pbjsKey]);
			} else {
		  	pbjs[pbjsKey] = pbjsParams[pbjsKey];
			}
		});

	};

	window.__renderPrebidAd = function(pbjsParams, slotId, containerId, timeout){

		// Push in _pbjs.que_ so that multiple calls are processed sequentially.
		pbjs.que.push(function(){

			setPbjsKeys( pbjsParams );
			printBidTable();

			if( ! adpTags.adpSlots[slotId].gSlot ) {
				logger.info("rendering postbid ad for %s", slotId);
				adpTags.renderPostbidAd(slotId, containerId);
			} else {
				logger.info("rendering GPT ad for %s", slotId);
				adpTags.renderGPTAd(slotId, timeout);
			}

			logger.info("recieved bid responses for %s", slotId);
			sandBoxbids.removeHBIframe(slotId);

		});
	};

	if( window.location.hostname && config.siteDomains.indexOf(window.location.hostname) !== -1 ) {
		if( config.targetAllDFP ) {
			logger.info("targeting all DFP slots with hooking");
			dfpSlotHook.init();
		}
	}
}

module.exports = main;