// Auction handling module

var utils = require('./utils');
var adp = require('./adp');
var auction = {
    start: function () {

    },
    end: function (adpBatchId) {
        var adpSlots = utils.getCurrentAdpSlotBatch(adp.adpTags.adpBatches, adpBatchId);

        adp.adpTags.batchPrebiddingComplete = true;
        if (Object.keys(adpSlots).length) {
            adpRender.afterBiddingProcessor(adpSlots);
        }
    }
};

module.exports = auction;