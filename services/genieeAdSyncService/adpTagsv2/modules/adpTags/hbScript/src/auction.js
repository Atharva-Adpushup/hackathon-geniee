// Auction handler

var utils = require('./utils');
var adp = require('./adp');
var constants = require('./constants');
var auction = {
	//     var head = document.getElementsByTagName('head')[0];
	//     var pbjs = pbjs || {};
	//     pbjs.que = pbjs.que || [];
	//     var PREBID_TIMEOUT = __PB_TIMEOUT__;
	//     var PAGE_URL = '__PAGE_URL__';
	//     var ADP_BATCH_ID = __ADP_BATCH_ID__;
	//     var pbjs = parent.pbjs;

	//     function serverRenderCode(timeout) {
	//         if (serverRenderCode.isExecuted === undefined) {
	//     serverRenderCode.isExecuted = true;
	//     console.log(pbjs.getBidResponses());
	//     if (Number.isInteger(timeout)) {
	//         parent.__prebidFinishCallback(ADP_BATCH_ID, timeout);
	//     } else {
	//         parent.__prebidFinishCallback(ADP_BATCH_ID);
	//     }
	// }
	// }
	// setTimeout(function () {
	//     serverRenderCode(PREBID_TIMEOUT);
	// }, PREBID_TIMEOUT);

	// serverRenderCode: function () {
	//     pbjs.que.push(function () {
	//         pbjs.addAdUnits(__AD_UNIT_CODE__);
	//         pbjs.bidderSettings = {
	//             openx: {
	//                 bidCpmAdjustment: function (bidCpm) {
	//                     return bidCpm - (bidCpm * (10 / 100));
	//                 }
	//             },
	//             districtm: {
	//                 bidCpmAdjustment: function (bidCpm) {
	//                     return bidCpm - (bidCpm * (10 / 100));
	//                 }
	//             },
	//             oftmedia: {
	//                 bidCpmAdjustment: function (bidCpm) {
	//                     return bidCpm - (bidCpm * (12 / 100));
	//                 }
	//             },
	//             rubicon: {
	//                 bidCpmAdjustment: function (bidCpm) {
	//                     return bidCpm - (bidCpm * (20 / 100));
	//                 }
	//             }
	//         };
	//         pbjs.aliasBidder("appnexus", "springserve");
	//         pbjs.aliasBidder("appnexus", "districtm");
	//         pbjs.aliasBidder("appnexus", "brealtime");
	//         pbjs.aliasBidder("appnexus", "oftmedia");
	//         pbjs.onEvent("bidTimeout", function (timedOutBidders) {
	//             parent.__prebidTimeoutCallback(ADP_BATCH_ID, timedOutBidders, PREBID_TIMEOUT);
	//         });
	//         pbjs.requestBids({
	//             timeout: PREBID_TIMEOUT,
	//             bidsBackHandler: serverRenderCode
	//         });
	//     });
	// },
	start: function(adpBatchId) {
		setTimeout(
			function() {
				this.serverRenderCode();
			}.bind(this),
			constants.PREBID_TIMEOUT
		);
	},
	end: function(adpBatchId) {
		var adpSlots = utils.getCurrentAdpSlotBatch(adp.adpTags.adpBatches, adpBatchId);

		adp.adpTags.batchPrebiddingComplete = true;
		if (Object.keys(adpSlots).length) {
			// render()
			// adpRender.afterBiddingProcessor(adpSlots);
		}

		return;
	}
};

module.exports = auction;
