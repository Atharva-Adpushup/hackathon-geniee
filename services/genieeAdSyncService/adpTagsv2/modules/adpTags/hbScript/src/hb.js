// Prebid interfacing module

var constants = require('./constants');
var adp = require('./adp');
var utils = require('./utils');
var hb = {
    setBidWonListener: function (w) {
        w.pbjs.que.push(function () {
            w.pbjs.onEvent(constants.EVENTS.PREBID.BID_WON, function (bidData) {
                console.log('===BidWon====', bidData);

                var slot = adp.adpTags.adpSlots[bidData.adUnitCode];
                var computedCPMValue = utils.isValidThirdPartyDFPAndCurrencyConfig(adp.config) ? 'originalCpm' : 'cpm';

                slot.feedback.winner = bidData.bidder;
                slot.feedback.winningRevenue = bidData[computedCPMValue] / 1000;
                slot.feedback.winnerAdUnitId = bidData.adId;
            });
        });
    },
    loadPrebid: function () {
        /* 
            HB flag passed as a global constant to the webpack config using DefinePlugin 
            (https://webpack.js.org/plugins/define-plugin/#root) 
        */
        if (HB_ACTIVE) {
            (function () {
                require('../../Prebid.js/build/dist/prebid');
            })();
        }

        return this.setBidWonListener(w);
    },
    init: function (w) {
        w.pbjs = w.pbjs || {};
        w.pbjs.que = w.pbjs.que || [];

        return this.loadPrebid();
    }
};

module.exports = hb;