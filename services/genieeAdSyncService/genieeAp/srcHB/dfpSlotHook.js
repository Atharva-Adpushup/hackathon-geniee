var config = require('./config/config'),
	logger = require('./libs/logger'),
	adpTags = require('./adpTags');

window.googletag = window.googletag || {};
googletag.cmd = googletag.cmd || [];

function matchAdSize( adSize, targetingAdSizes ){

	var boolAdSizes = targetingAdSizes.map(function( compAdSize ){
		if( adSize[0] === compAdSize[0] && adSize[1] === compAdSize[1] ) {
			return true;
		} else {
			return false;
		}
	});

	return boolAdSizes.filter(Boolean).length;
}

function init(){
	var oDF;

	googletag.cmd.push(function() {
		googletag.pubads().disableInitialLoad();
	});

	googletag.cmd.push(function(){

		oDF = googletag.defineSlot;

		googletag.defineSlot = function( slotId, size, containerId ){

			var definedSlot = oDF.apply(window, [].slice.call(arguments));

			if( matchAdSize(size, config.getTargetingAdSizes()) ) {
				logger.info("size matched (%s) for slot (%s) ", size.toString(), slotId );

				adpTags.defineSlot( slotId, size, containerId );
				adpTags.setGPTSlot( slotId, definedSlot );

			} else {
				setTimeout( function(){
					googletag.pubads().refresh( [definedSlot] );
				}, 100 );
			}

			return definedSlot;
		};

	});
}

module.exports = {
	init : init
};