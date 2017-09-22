module.exports = {
	PREBID_TIMEOUT: 700,
	NETWORK_ID: 103512698,
	SITE_ID: __SITE_ID__,
	INVENTORY: __INVENTORY__,
	SLOT_INTERVAL: 50,
	MEDIATION_API_URL: '//s2s.adpushup.com/MediationWebService/',
	HB_STATUS: {
		API_URL: 'http://apdc1-adblock.eastus2.cloudapp.azure.com/api/',
		EVENTS: {
			HB_START: 'HB_START',
			HB_END: 'HB_END',
			HB_RENDER: 'HB_RENDER',
			HB_DFP_RENDER: 'HB_DFP_RENDER'
		}
	},
	ADSENSE_RENDER_EVENT: 'adsenseRenderEvent',
	ADSENSE_FALLBACK_ADCODE: '<script>parent.postMessage(__AD_CODE__, parent.location.href);</script>',
	ADSENSE: {
		cpm: 0.01,
		bidderName: 'adsensefallback'
	},
	ADX: {
		adCode:
			'<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script><ins class="adsbygoogle" style="display:inline-block;width:__SIZE_W__px;height:__SIZE_H__px" data-ad-client="ca-pub-8933329999391104" data-ad-slot="HB_FALLBACK"></ins><script>(adsbygoogle=window.adsbygoogle || []).push({});</script>',
		cpm: 0.01,
		bidderName: 'adxbackfill'
	},
	ADX_FLOOR: {
		//Use this key to override floor
		cpm: 0.01,
		key: 'FP_S_A' // FP_B, FP_A, FP_S, FP_B_A, FP_S_A (key available, FP - floor price, B-Branded, S-Semi transparent, A-Anonymous)
	},
	DEFAULT_WINNER: 'adx',
	FEEDBACK_URL: 'http://apdc1-webapp-creativeqa.azurewebsites.net/feedback2',
	POSTBID_PASSBACKS: {
		'*': 'PGgxPkJPTyBZQUghPC9oMT4='
	},
	KEEN_IO: {
		PROJECT_ID: '5922a50995cfc9addc2480dd',
		WRITE_KEY: '40C0401741E18AFC5F17B722BA6371984333FDD0C36101019C7C107C1E1334B4',
		EVENTS: {
			IMPRESSION: 'impression'
		}
	},
	PREBID_AD_TEMPLATE:
		'<html>' +
		'<head>' +
		'<script>' +
		"var head = document.getElementsByTagName('head')[0];" +
		'var pbjs = pbjs || {};' +
		'pbjs.que = pbjs.que || [];' +
		'var PREBID_TIMEOUT = __PB_TIMEOUT__;' +
		//"var SLOT_ID = __PB_SLOT_ID__;" +
		//"var CONTAINER_ID = __PB_CONTAINER_ID__;" +
		"var PAGE_URL = '__PAGE_URL__';" +
		'var ADP_BATCH_ID = __ADP_BATCH_ID__;' +
		"var prebidScript = document.createElement('script');" +
		'prebidScript.async = true;' +
		"prebidScript.text = 'var adpPrebid = ' + parent.adpPrebid.toString() + ';';" +
		'head.appendChild(prebidScript);' +
		'adpPrebid();' +
		'function serverRenderCode( timeout ){' +
		'if( serverRenderCode.isExecuted === undefined ) {' +
		'serverRenderCode.isExecuted = true;' +
		'console.log(pbjs.getBidResponses());' +
		'var pbjsParams = {' +
		"'_bidsReceived'  : pbjs._bidsReceived," +
		"'_bidsRequested' : pbjs._bidsRequested," +
		"'_adUnitCodes'   : pbjs._adUnitCodes," +
		"'_winningBids'   : pbjs._winningBids," +
		"'_adsReceived'   : pbjs._adsReceived" +
		'};' +
		'if( Number.isInteger(timeout) ) {' +
		'parent.__prebidFinishCallback(pbjsParams, ADP_BATCH_ID, timeout);' +
		'} else {' +
		'parent.__prebidFinishCallback(pbjsParams, ADP_BATCH_ID);' +
		'}' +
		'}' +
		'}' +
		'setTimeout(function(){' +
		'serverRenderCode(PREBID_TIMEOUT);' +
		'}, PREBID_TIMEOUT);' +
		'pbjs.que.push(function(){' +
		"pbjs.setPriceGranularity('dense');" +
		"pbjs.setBidderSequence('random');" +
		'pbjs.addAdUnits(__AD_UNIT_CODE__);' +
		"pbjs.aliasBidder('appnexus', 'springserve');" + // SpringServe specific bidder aliasing
		"pbjs.aliasBidder('appnexus', 'brealtime');" + // bRealTime specific bidder aliasing
		"pbjs.onEvent('bidTimeout', function(timedOutBidders) {" +
		'parent.__prebidTimeoutCallback(ADP_BATCH_ID, timedOutBidders, PREBID_TIMEOUT);' +
		'});' +
		'pbjs.requestBids({' +
		'timeout : PREBID_TIMEOUT,' +
		'bidsBackHandler: serverRenderCode' +
		'});' +
		'})' +
		'</script>' +
		'</head>' +
		'<body></body>' +
		'</html>'
};