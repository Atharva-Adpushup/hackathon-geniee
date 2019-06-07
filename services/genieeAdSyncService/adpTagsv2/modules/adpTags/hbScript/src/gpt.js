// GPT interfacing module

var constants = require('./constants');
var feedback = require('./feedback');
var adp = require('./adp');
var gpt = {
    setSlotRenderListener: function (w) {
        w.googletag.cmd.push(function () {
            w.googletag.pubads().addEventListener(constants.EVENTS.GPT.SLOT_RENDER_ENDED, function (event) {
                var slot = null;
                var adUnitPath = event.slot.getAdUnitPath();
                var adUnitPathArray = adUnitPath.split('/');
                var adUnitCode = adUnitPathArray[adUnitPathArray.length - 1];
                var networkCode = constants.NETWORK_ID;

                Object.keys(adp.adpTags.adpSlots).forEach(function (adpSlot) {
                    var currentSlot = adp.adpTags.adpSlots[adpSlot];
                    var slotMatched = !!(currentSlot.optionalParam.dfpAdunitCode == adUnitCode && currentSlot.activeDFPNetwork);

                    if (slotMatched) {
                        networkCode = currentSlot.activeDFPNetwork;
                    }
                    if ('/' + networkCode + '/' + currentSlot.optionalParam.dfpAdunitCode === adUnitPath) {
                        slot = currentSlot;
                    }
                });

                if (slot) {
                    return feedback.send(slot);
                }
            });
        });
    },
    loadGpt: function (w, d) {
        var gptScript = d.createElement('script');
        gptScript.src = '//www.googletagservices.com/tag/js/gpt.js';
        gptScript.async = true;

        d.head.appendChild(gptScript);
        return this.setSlotRenderListener(w);
    },
    init: function (w, d) {
        w.googletag = w.googletag || {};
        googletag.cmd = googletag.cmd || [];

        return this.loadGpt(w, d);
    }
};

module.exports = gpt;