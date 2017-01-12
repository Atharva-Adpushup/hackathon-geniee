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
	pbjsWinners = {};

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
			hbJsonData: JSON.stringify({
     		winners : Object.values(pbjsWinners)
      })
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

var renderedSlots = [];

function getRenderedSlots(){
	return renderedSlots;
}

function initReports( hbSlots ) {

	var hbSlotsIds = hbSlots.map(function(hbSlot){
		return hbSlot.getAdUnitPath();
	});

	googletag.cmd.push(function(){
		googletag.pubads().addEventListener('slotRenderEnded', function(event) {

			var slotPath = event.slot.getAdUnitPath();
			if( hbSlotsIds.indexOf(slotPath) !== -1 ) {

				renderedSlots.push(slotPath);

				if( pbjsWinners[ slotPath ] === (void 0) ) {
					pbjsWinners[ slotPath ] =  {
						advertiserId : event.advertiserId,
						lineItemId : event.lineItemId,
						creativeId : event.creativeId,
						adUnitPath : slotPath
					};
				}

				if( hbSlotsIds.length === renderedSlots.length ) {
					sendBidData();
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
	getRenderedSlots: getRenderedSlots
};