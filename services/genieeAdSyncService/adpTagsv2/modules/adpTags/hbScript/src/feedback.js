// Slot feedback initiator

var constants = require('./constants');
var config = require('./config');
var adp = require('./adp');
var feedback = {
    getFeedbackData: function (slot, defaultWinner) {
        var winner = slot.feedback.winner || defaultWinner;
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
            services: slot.services,
            sectionId: slot.sectionId,
            sectionName: slot.sectionName,
            pageGroup: adp.config.pageGroup,
            pageVariationId: adp.config.selectedVariation,
            pageVariationName: adp.config.selectedVariationName,
            pageVariationType: adp.config.selectedVariationType,
            platform: adp.config.platform,
            packetId: adp.config.packetId
        };

        return feedbackData;
    },
    send: function (slot) {
        var defaultWinner = constants.FEEDBACK.DEFAULT_WINNER;

        if (slot.feedbackSent || slot.feedback.winner === defaultWinner) {
            return;
        }
        slot.feedbackSent = true;
        var feedbackData = this.getFeedbackData(slot, defaultWinner);

        // Old feedback
        adp.$.post(constants.FEEDBACK.URL_OLD, JSON.stringify(feedbackData));

        return adp.$.get(constants.FEEDBACK.URL + adp.utils.base64Encode(JSON.stringify(feedbackData)));
    }
};

module.exports = feedback;