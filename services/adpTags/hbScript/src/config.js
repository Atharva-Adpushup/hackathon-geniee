module.exports = {
	PREBID_TIMEOUT: 1000,
	NETWORK_ID: 103512698,
	GENIEE_NETWORK_ID: 9116787,
	SITE_ID: __SITE_ID__,
	INVENTORY: __INVENTORY__,
	PAGE_KEY_VALUES: { da: 'adx' },
	TARGETING: {},
	PARTNERS: {
		GENIEE: 'geniee'
	},
	GPT_REFRESH_INTERVAL: 30000,
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
		priceFloorKeys: ['FP_S_A', 'FP_S', 'FP_B', 'FP_B_A', 'FP_A'],
		//Use this key to override floor
		cpm: 0.01,
		key: 'FP_S_A' // FP_B, FP_A, FP_S, FP_B_A, FP_S_A (key available, FP - floor price, B-Branded, S-Semi transparent, A-Anonymous)
	},
	C1X: {
		pixelId: 1236239
	},
	DEFAULT_WINNER: 'adx',
	FEEDBACK_URL: '//staging.adpushup.com/ApHbWebService/feedback',
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
		"var PAGE_URL = '__PAGE_URL__';" +
		'var ADP_BATCH_ID = __ADP_BATCH_ID__;' +
		"var prebidScript = document.createElement('script');" +
		'prebidScript.async = true;' +
		"prebidScript.text = 'var adpPrebid = ' + parent.adpushup.adpPrebid.toString() + ';';" +
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
		'pbjs.bidderSettings = {' +
		'c1x: {' +
		'pixelId: __C1X_PIXEL_ID__,' +
		'siteId: __C1X_SITE_ID__' +
		'},' +
		'openx: {' +
		'bidCpmAdjustment: function(bidCpm) {' +
		'return bidCpm - (bidCpm * (10/100));' +
		'}' +
		'},' +
		'districtm: {' +
		'bidCpmAdjustment: function(bidCpm) {' +
		'return bidCpm - (bidCpm * (10/100));' +
		'}' +
		'},' +
		'brainjuicemedia: {' +
		'bidCpmAdjustment: function(bidCpm) {' +
		'return bidCpm - (bidCpm * (18/100));' +
		'}' +
		'},' +
		'oftmedia: {' +
		'bidCpmAdjustment: function(bidCpm) {' +
		'return bidCpm - (bidCpm * (12/100));' +
		'}' +
		'},' +
		'districtmDMX: {' +
		'bidCpmAdjustment: function(bidCpm) {' +
		'return bidCpm - (bidCpm * (5/100));' +
		'}' +
		'}' +
		'};' +
		"pbjs.aliasBidder('appnexus', 'springserve');" +
		"pbjs.aliasBidder('appnexus', 'districtm');" +
		"pbjs.aliasBidder('appnexus', 'brealtime');" +
		"pbjs.aliasBidder('appnexus', 'brainjuicemedia');" +
		"pbjs.aliasBidder('appnexus', 'oftmedia');" +
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
		'</html>',

	// [w, h]: 'w' is width dimension & 'h' is height dimension in ad size
	IAB_SIZES: {
		ALL: [
			[120, 600],
			// Below size is removed as there can be a possible policy violation for this size on Desktop
			// [160, 600],
			[200, 200],
			[240, 400],
			[250, 250],
			[300, 50],
			[300, 100],
			[300, 250],
			// Below size is removed as there can be a possible policy violation for this size on Desktop
			// [300, 600],
			[320, 50],
			[320, 100],
			[320, 480],
			[336, 280],
			[468, 60],
			[480, 320],
			[720, 300],
			[728, 90],
			[728, 250],
			[728, 280],
			[900, 90],
			[970, 90],
			[970, 250],
			[1024, 768]
		],
		MULTIPLE_AD_SIZES_WIDTHS_MAPPING: {
			'300': [[300, 50], [300, 100], [300, 250]],
			'320': [[320, 50], [320, 100], [320, 480]],
			'728': [[728, 90], [728, 250], [728, 280]],
			'970': [[970, 90], [970, 250]]
		},
		// The backward compatible size array for every ad size contains itself as well
		BACKWARD_COMPATIBLE_MAPPING: {
			// MOBILE sizes
			'120,600': [[120, 600]],
			'160,600': [[120, 600], [160, 600]],
			'200,200': [[200, 200]],
			'240,400': [[200, 200], [240, 400]],
			'250,250': [[200, 200], [250, 250]],
			'300,50': [[300, 50]],
			'300,100': [[300, 50], [300, 100]],
			'300,250': [[300, 250]],
			'300,600': [[160, 600], [300, 250], [300, 600]],
			'320,50': [[320, 50]],
			'320,100': [[320, 50], [320, 100]],
			'320,480': [[300, 250], [320, 50], [320, 100], [320, 480]],
			'336,280': [[300, 250], [336, 280]],
			// TABLET sizes
			'468,60': [[468, 60]],
			'480,320': [[250, 250], [300, 250], [320, 50], [320, 100], [336, 280], [468, 60], [480, 320]],
			// DESKTOP sizes
			'720,300': [[300, 250], [336, 280], [720, 300]],
			'728,90': [[728, 90]],
			'728,250': [[300, 250], [728, 90], [728, 250]],
			'728,280': [[300, 250], [336, 280], [728, 90], [728, 250], [728, 280]],
			'900,90': [[728, 90], [900, 90]],
			'970,90': [[728, 90], [900, 90], [970, 90]],
			'970,250': [[300, 250], [728, 90], [728, 250], [900, 90], [970, 90], [970, 250]],
			'1024,768': [[720, 300], [728, 90], [728, 250], [728, 280], [900, 90], [970, 90], [970, 250], [1024, 768]]
		}
	}
};
