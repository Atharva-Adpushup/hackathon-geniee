// AdpTags module

var adp = require('./adp');
var adpTags = {
    init: function (w) {
        w.adpTags = w.adpTags || {};

        var adpQue;
        w.adpTags.que = w.adpTags.que || [];
        if (adp.adpTags) {
            adpQue = adp.adpTags.que;
        } else {
            adpQue = [];
        }
    }
};

module.exports = adpTags;