var config = require('./config/config'),
	ajax = require('@fdaciuk/ajax'),
	utils = require('./libs/utils'),
	logger = require('./libs/logger');

window.googletag = window.googletag || {};
window.googletag.cmd = window.googletag.cmd || [];

window.pbjs = window.pbjs || {};
window.pbjs.que = window.pbjs.que || [];

var dfpEvents = {},
	pbjsWinners = {},
	dfpWinners = {};

var packetId = utils.uniqueId(+config.siteId);

function sendBidData(){

		logger.info("sending data for %s ", Object.keys(pbjsWinners).join('\n') );

    var builtUrl = utils.buildUrl(config.e3FeedbackUrl, {
      "packetId" : packetId,
      "siteId" : config.siteId,
      "eventType" : 10,
      "ts" : +(new Date()),
    });

    ajax().post(builtUrl, {
     		partners : JSON.stringify(Object.values(pbjsWinners) || []),
     		dfp      : JSON.stringify(Object.values(dfpWinners)  || [])
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

var renderedSlots = [],
	allRenderedSlots = [];

function getAllRenderedSlots(){
	return allRenderedSlots;
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

function initReports( hbSlots ) {

	var hbSlotsIds = hbSlots.map(function(hbSlot){
		return hbSlot.getAdUnitPath();
	});

	googletag.cmd.push(function(){
		googletag.pubads().addEventListener('slotRenderEnded', function(event) {

			var slotPath = event.slot.getAdUnitPath();
			allRenderedSlots.push(slotPath);

			if( hbSlotsIds.indexOf(slotPath) !== -1 ) {

				renderedSlots.push(slotPath);

				if( ! config.postbid ) {
					dfpWinners[ slotPath ] = dfpWinners[ slotPath ]  || {
						// mantain consistency with having only strings for various IDs
						advertiserId : (event.advertiserId ? event.advertiserId.toString() : "0".repeat(10)),
						lineItemId   : (event.lineItemId   ? event.lineItemId.toString() : "0".repeat(10)),
						creativeId   : (event.creativeId   ? event.creativeId.toString() : "0".repeat(10)),
						adUnitPath   : slotPath
					};
				}
			}

			// If all header bidding slots have been rendered
			// send bid data.
			if( hbSlotsIds.length === renderedSlots.length ) {
				sendBidData();
				renderTargetingKeys();
			}

		});
	});

	window.pbjs.que.push(function() {
		window.pbjs.onEvent('bidWon', function(bidData){
			logger.info('header bidding ran for %s', bidData.adUnitCode);
			pbjsWinners[ bidData.adUnitCode ] = constructBidData(bidData);
		});
	});
}

module.exports = {
	initReports: initReports,
	getAllRenderedSlots: getAllRenderedSlots
};