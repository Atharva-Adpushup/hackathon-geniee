// Ad rendering module

var targeting = require('./targeting');
var config = require('./config');
var gpt = require('./gpt');
var render = {
    createGPTSlots: function (googletag, adpSlots) {
        adpSlots.forEach(function (adpSlot) {
            gpt.defineSlot(googletag, adpSlot);
        });

        googletag.pubads().enableSingleRequest();
        googletag.enableServices();
    },
    setTargeting: function (googletag) {
        targeting.setPageLevel(googletag);

        if (config.SITE_ID === 39041) {
            targeting.setUTMLevel(googletag);
        }
    },
    init: function (adpSlots) {
        if (!Array.isArray(slots) || !slots.length) {
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