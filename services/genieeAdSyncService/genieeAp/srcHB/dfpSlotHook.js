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

	googletag.cmd.push(function() {
		googletag.pubads().disableInitialLoad();
	});

	googletag.cmd.push(function(){

		var oDF = googletag.defineSlot;

		googletag.defineSlot = function( slotId, size, containerId ){

			var definedSlot = oDF.apply(window, [].slice.call(arguments));

			if( matchAdSize(size, config.getTargetingAdSizes()) ) {
				// when setting up adpTags slotIds we eliminate networkId
				var adUnitParams = slotId.match('/[0-9]+/(.*)$');

				logger.info("size matched (%s) for slot (%s) ", size.toString(), slotId );
				adpTags.defineSlot( adUnitParams[1], size, containerId, definedSlot );

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