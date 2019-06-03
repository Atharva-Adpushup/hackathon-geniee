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
            pageGroup: adp.config.pageGroup,
            pageVariationId: adp.config.selectedVariation,
            pageVariationName: adp.config.selectedVariationName,
            pageVariationType: adp.config.selectedVariationType,
            platform: adp.config.platform,
            packetId: adp.config.packetId
        };

        return utils.ajax('get', constants.FEEDBACK_URL, feedbackData);
    }
};

module.exports = feedback;