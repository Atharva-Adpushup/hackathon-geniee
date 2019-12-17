// Ad rendering module

var targeting = require('./targeting');
var config = require('./config');
var gpt = require('./gpt');
var render = {
    renderGPTSlots: function (googletag, adpSlots) {
        googletag.pubads().enableSingleRequest();
        googletag.enableServices();

        adpSlots.forEach(function (adpSlot) {
            gpt.renderSlot(googletag, adpSlot);
        });
    },
    createGPTSlots: function (googletag, adpSlots) {
        adpSlots.forEach(function (adpSlot) {
            adpSlot.biddingComplete = true;

            gpt.defineSlot(googletag, adpSlot);
        });

        return this.renderGPTSlots(googletag, adpSlots);
    },
    setTargeting: function (googletag) {
        targeting.setPageLevel(googletag);

        if (config.SITE_ID === 39041) {
            targeting.setUTMLevel(googletag);
        }
    },
    init: function (adpSlots) {
        if (!Array.isArray(adpSlots) || !adpSlots.length) {
            return;
        }

        var googletag = window.googletag;
        googletag.cmd.push(function () {
            this.setTargeting(googletag);
            this.createGPTSlots(googletag, adpSlots);
        }.bind(this));
    }
};

module.exports = render;