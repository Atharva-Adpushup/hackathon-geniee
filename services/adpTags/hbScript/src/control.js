// AdpTags prebid control code module

var initControl = require('../../../genieeAdSyncService/genieeAp/src/control'),
	getBidDataForFeedback = require('./feedback').getBidDataForFeedback,
	utils = require('../helpers/utils'),
	adp = require('./adp').adp,
	timedOutBidders = null,
	adSlots = [],
	initControlFeedback = function(w) {
		w.pbjs.que.push(function() {
			w.pbjs.onEvent('bidWon', function(bidData) {
				var winData = {
					winner: bidData.bidder || bidData.bidderCode,
					winningRevenue: bidData.cpm / 1000,
					containerId: bidData.adUnitCode,
					size: bidData.size
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
						var selectedAdSlot = null,
							siteId = null,
							platform = null;
						adSlots.forEach(function(adSlot) {
							selectedAdSlot = adSlot.containerId === containerId ? adSlot : null;
						});

						if (adp && adp.config) {
							siteId = adp.config.siteId;
							platform = adp.config.platform;
						}

						if (selectedAdSlot) {
							selectedAdSlot.siteId = siteId;
							selectedAdSlot.platform = platform;
							selectedAdSlot.timedOutBidders = timedOutBidders || [];
							selectedAdSlot.bids = getBidDataForFeedback(containerId) || [];
							selectedAdSlot.type = 9; // Prebid control code
							selectedAdSlot.status = 'Type 9: Prebid contol code rendered!';
							selectedAdSlot.url = window.location.href;
						}

						var feedback = {
							success: true,
							data: selectedAdSlot
						};

						if (feedback.data) {
							return utils.sendFeedback(feedback);
						}
					}
				}
			});
		});
	};

module.exports = {
	initControl: initControl,
	initControlFeedback: initControlFeedback
};
