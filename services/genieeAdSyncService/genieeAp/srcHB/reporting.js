var config = require('./config/config'),
	ajax = require('@fdaciuk/ajax'),
	utils = require('./libs/utils'),
	logger = require('./libs/logger'),

	adpTags = require('./adpTags');

var pbjsWinners = {},
	dfpWinners = {};

var packetId = utils.uniqueId(+config.siteId);

window.pbjs = window.pbjs || {};
window.pbjs.que = window.pbjs.que || [];

function sendBidData(){

		logger.info("sending data for %s ", Object.keys(pbjsWinners).join(' ') );

    var builtUrl = utils.buildUrl(config.e3FeedbackUrl, {
      "packetId" : packetId,
      "siteId" : config.siteId,
      "eventType" : 10,
      "ts" : +(new Date()),
    });

    ajax().post(builtUrl,{
	    	hbJsonData: JSON.stringify({
	     		partners : Object.values(pbjsWinners) || [],
	     		dfp      : Object.values(dfpWinners)  || []
	    })
	  });
}

function constructBidData(bidObjData) {
    var bidObj = {};

    // Elasticsearch gets knocked out if it recieves _0_ because it treats it
    // as an integer.
    bidObj.cpm           = (bidObjData.cpm === 0 ? 0.00001 : bidObjData.cpm);
    bidObj.bidder        = bidObjData.bidder;
    bidObj.timeToRespond = bidObjData.timeToRespond;
    bidObj.adUnitPath    = bidObjData.adUnitCode;

   return bidObj;
}

function renderTargetingKeys(){
	googletag.pubads().getSlots().forEach(function( slot ){
		var targetingsKeys = slot.getTargetingKeys();

		logger.group(slot.getAdUnitPath());

		targetingsKeys.forEach(function(tkey) {
			logger.log(tkey, slot.getTargeting(tkey)[0]);
		});

		logger.groupEnd();
	});
}

function initReports() {

	adpTags.on('dfpSlotRender', function(event) {

		var slotPath = event.slotPath;
		dfpWinners[ slotPath ] = dfpWinners[ slotPath ]  || {
			// mantain consistency with having only strings for various IDs
			advertiserId : (event.advertiserId ? event.advertiserId.toString() : "0".repeat(10)),
			lineItemId   : (event.lineItemId   ? event.lineItemId.toString() : "0".repeat(10)),
			creativeId   : (event.creativeId   ? event.creativeId.toString() : "0".repeat(10)),
			adUnitPath   : slotPath
		};

		if( adpTags.haveAllSlotsRendered() ) {
			renderTargetingKeys();
			sendBidData();
		}

	});

	adpTags.on('postBidSlotRender', function(event) {
		if( event.passback ) {
			pbjsWinners[ event.slotId ] = {
				"adUnitPath" : event.slotId,
				"bidder" : "PASSBACK",
				"cpm" : 0.00001,
				"timeToRespond" : 1001
			};
		}

		if( adpTags.haveAllSlotsRendered() ) {
			sendBidData();
		}
	});
}

window.pbjs.que.push(function() {
	window.pbjs.onEvent('bidWon', function(bidData){
		logger.info('header bidding ran for %s', bidData.adUnitCode);

		pbjsWinners[ bidData.adUnitCode ] = constructBidData(bidData);
	});
});

module.exports = {
	initReports: initReports
};