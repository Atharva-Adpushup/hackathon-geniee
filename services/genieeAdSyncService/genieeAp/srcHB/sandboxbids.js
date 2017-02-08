var config = require('./config/config'),
	logger = require('./libs/logger'),

	utils = require('./libs/utils'),
	adRenderingTemplate = require('./adRenderingTemplate'),

	waitUntil = require('wait-until');

var FRAME_PREFIX = "__adp_frame__";

function createPrebidContainer(hbConfigParams, slotId, size, containerId){

	var prebidHtml = adRenderingTemplate.replace('__AD_UNIT_CODE__', JSON.stringify({
		code : slotId,
		sizes : [ size ],
		bids : JSON.parse( JSON.stringify(hbConfigParams).replace('__AD_UNIT__', slotId) )
	}))
	.replace('__PB_TIMEOUT__', config.prebidTimeout)
	.replace('__PB_SLOT_ID__', JSON.stringify(slotId))
	.replace('__PB_CONTAINER_ID__', JSON.stringify(containerId));

	var iframeEl = document.createElement('iframe');
	iframeEl.style.display = "none";
	iframeEl.className = FRAME_PREFIX + slotId;

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

	waitUntil()
		.interval(50)
		.times(20)
		.condition(function(){
			return ( document.body !== null );
		})
		.done(function(){
			document.body.appendChild(iframeEl);
		});
}

// Remove HB frame since we only needed it to get bid values.
var removeHBIframe = function(slotId){
	var adpElements = [].slice.call(document.getElementsByClassName(FRAME_PREFIX + slotId));

	adpElements.map(function(element){
		setTimeout(function(){
			document.body.removeChild(element);
		}, 5000); // A small delay to avoid _possible_ reprucussions of premature removal
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



module.exports = {
	removeHBIframe        : removeHBIframe,
	createPrebidContainer : createPrebidContainer
};