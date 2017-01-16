var config = require('./config'),
	ajax = require('@fdaciuk/ajax'),
	utils = require('./libs/utils'),
	logger = require('./libs/logger');

require('./libs/object.assign');

window.googletag = window.googletag || {};
googletag.cmd = googletag.cmd || [];

window.pbjs = window.pbjs || {};
pbjs.que = pbjs.que || [];

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

    bidObj.cpm           = bidObjData.cpm;
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

		console.group(slot.getAdUnitPath());

		targetingsKeys.forEach(function(tkey) {
			logger.log(tkey, slot.getTargeting(tkey)[0]);
		});

		console.groupEnd();
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

				if( dfpWinners[ slotPath ] === (void 0) ) {
					dfpWinners[ slotPath ] =  {
						advertiserId : event.advertiserId,
						lineItemId : event.lineItemId,
						creativeId : event.creativeId,
						adUnitPath : slotPath
					};
				}

				if( hbSlotsIds.length === renderedSlots.length ) {
					sendBidData();
					if( logger.shouldLog() ) { renderTargetingKeys(); }
				}
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