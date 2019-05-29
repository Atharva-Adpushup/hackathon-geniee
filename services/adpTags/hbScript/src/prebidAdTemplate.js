// Prebid ad code and bidding template

var prebidAdTemplate =
	'<html>' +
	'<head>' +
	'<script>' +
	"var head = document.getElementsByTagName('head')[0];" +
	'var pbjs = pbjs || {};' +
	'pbjs.que = pbjs.que || [];' +
	'var PREBID_TIMEOUT = __PB_TIMEOUT__;' +
	"var PAGE_URL = '__PAGE_URL__';" +
	'var ADP_BATCH_ID = __ADP_BATCH_ID__;' +
	'var pbjs = parent.pbjs;' +
	'function serverRenderCode( timeout ){' +
	'if( serverRenderCode.isExecuted === undefined ) {' +
	'serverRenderCode.isExecuted = true;' +
	'console.log(pbjs.getBidResponses());' +
	'if( Number.isInteger(timeout) ) {' +
	'parent.__prebidFinishCallback(ADP_BATCH_ID, timeout);' +
	'} else {' +
	'parent.__prebidFinishCallback(ADP_BATCH_ID);' +
	'}' +
	'}' +
	'}' +
	'setTimeout(function(){' +
	'serverRenderCode(PREBID_TIMEOUT);' +
	'}, PREBID_TIMEOUT);' +
	'pbjs.que.push(function(){' +
	'pbjs.setConfig({' +
	'rubicon: {singleRequest: true},' +
	'userSync: {' +
	'filterSettings: {' +
	'iframe: {' +
	'bidders: "*",' +
	'filter: "include"' +
	'}' +
	'}' +
	'},' +
	'publisherDomain: parent.adpushup.config.siteDomain,' +
	'bidderSequence: "random",' +
	'priceGranularity: "dense"' +
	'__SIZE_CONFIG__' +
	'__PREBID_CURRENCY_CONFIG__' +
	'});' +
	'pbjs.addAdUnits(__AD_UNIT_CODE__);' +
	'pbjs.bidderSettings = {' +
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
	'oftmedia: {' +
	'bidCpmAdjustment: function(bidCpm) {' +
	'return bidCpm - (bidCpm * (12/100));' +
	'}' +
	'},' +
	'rubicon: {' +
	'bidCpmAdjustment: function(bidCpm) {' +
	'return bidCpm - (bidCpm * (20/100));' +
	'}' +
	'}' +
	'};' +
	'pbjs.aliasBidder("appnexus", "springserve");' +
	'pbjs.aliasBidder("appnexus", "districtm");' +
	'pbjs.aliasBidder("appnexus", "brealtime");' +
	'pbjs.aliasBidder("appnexus", "oftmedia");' +
	'pbjs.onEvent("bidTimeout", function(timedOutBidders) {' +
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
	'</html>';

module.exports = prebidAdTemplate;
