// Ad rendering module

var targeting = require('./targeting');
var render = {
    init: function (adpSlots) {
        if (!Array.isArray(slots) || !slots.length) {
            return;
        }

        var googletag = window.googletag;
        googletag.cmd.push(function () {
            targeting.setPageLevel(googletag);
        });
    }
};

module.exports = render;