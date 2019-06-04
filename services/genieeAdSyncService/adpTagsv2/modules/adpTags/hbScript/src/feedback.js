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
        var winner = slot.feedback.winner || constants.DEFAULT_WINNER;
        var winningRevenue = slot.feedback.winningRevenue || 0;
        var feedbackData = {
            siteId: config.SITE_ID,
            siteDomain: adp.config.siteDomain,
            bids: [
                {
                    bidder: winner,
                    revenue: winningRevenue
                }
            ],
            mode: adp.config.mode,
            errorCode: constants.ERROR_CODES.NO_ERROR,
            winner: winner,
            winningRevenue: winningRevenue,
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