// AdpTags prebid control code module

var initControl = require('../../../genieeAdSyncService/genieeAp/src/control'),
	getBidDataForFeedback = require('./feedback').getBidDataForFeedback,
	timedOutBidders = null,
	adSlots = [],
	initControlFeedback = function(w) {
		w.pbjs.que.push(function() {
			w.pbjs.onEvent('bidWon', function(bidData) {
				var winData = {
					winner: bidData.bidder || bidData.bidderCode,
					winningRevenue: bidData.cpm ? (bidData.cpm / 1000).toFixed(2) : 0,
					containerId: bidData.adUnitCode || null,
					size: bidData.size || null
				};

				adSlots.push(winData);
			});
		});

		w.pbjs.que.push(function() {
			w.pbjs.onEvent('bidTimeout', function(timedOutBiddersList) {
				timedOutBidders = timedOutBiddersList;
			});
		});

		w.googletag.cmd.push(function() {
			w.googletag.pubads().addEventListener('slotRenderEnded', function(slotData) {
				if (slotData) {
					var containerId = slotData.slot && slotData.slot.o && slotData.slot.o.m ? slotData.slot.o.m : null;

					if (containerId) {
						var selectedAdSlot = null;
						adSlots.forEach(function(adSlot) {
							selectedAdSlot = adSlot.containerId === containerId ? adSlot : null;
						});

						if (selectedAdSlot) {
							selectedAdSlot.siteId = w.adpushup.config.siteId;
							selectedAdSlot.timedOutBidders = timedOutBidders || [];
							selectedAdSlot.bids = getBidDataForFeedback(containerId) || [];
						}

						console.log(adSlots);
					}
				}
			});
		});
	};

module.exports = {
	initControl: initControl,
	initControlFeedback: initControlFeedback
};
