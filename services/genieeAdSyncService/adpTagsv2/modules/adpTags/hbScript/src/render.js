// Ad rendering module

var targeting = require('./targeting');
var config = require('./config');
var render = {
    init: function (adpSlots) {
        if (!Array.isArray(slots) || !slots.length) {
            return;
        }

        var googletag = window.googletag;
        googletag.cmd.push(function () {
            targeting.setPageLevel(googletag);

            if (config.SITE_ID === 39041) {
                targeting.setUTMLevel(googletag);
            }
        });
    }
};

module.exports = render;