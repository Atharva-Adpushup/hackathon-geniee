// Feedback module

var constants = require('./constants');
var config = require('./config');
var adp = require('./adp');
var feedback = {
    send: function (slot) {
        if (slot.feedbackSent || slot.feedback.winner === constants.DEFAULT_WINNER) {
            return;
        }

        slot.feedbackSent = true;
        var feedbackData = {
            siteId: config.SITE_ID,
            siteDomain: adp.config.siteDomain,
            bids: [
                {
                    bidder: slot.feedback.winner || constants.DEFAULT_WINNER,
                    revenue: slot.feedback.winningRevenue || 0
                }
            ],
            mode: adp.config.mode,
            errorCode: constants.ERROR_CODES.NO_ERROR,
            winner: slot.feedback.winner || config.DEFAULT_WINNER,
            winningRevenue: slot.feedback.winningRevenue || 0,
            winnerAdUnitId: slot.feedback.winnerAdUnitId || null,
            timedOutBidders: [],
            sectionId: slot.sectionId,
            sectionName: slot.sectionName,
            pageGroup: slot.pageGroup,
            pageVariationId: slot.variationId,
            pageVariationName: slot.variationName,
            pageVariationType: slot.pageVariationType,
            platform: slot.platform,
            packetId: adp.config.packetId
        };

        return utils.ajax(feedbackData, 'get');
    }
};

module.exports = feedback;