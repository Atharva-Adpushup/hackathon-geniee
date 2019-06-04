// AdpTags module

var adp = require('./adp');
var config = require('./config');
var adpTags = {
    module: {
        adpSlots: {},
        que: [],
        processQue: function () {
            while (this.que.length) {
                this.que.shift().call(this);
            }
        }
    },
    init: function (w) {
        w.adpTags = w.adpTags || {};

        var adpQue;
        w.adpTags.que = w.adpTags.que || [];
        if (adp.adpTags) {
            adpQue = adp.adpTags.que;
        } else {
            adpQue = [];
        }

        var existingAdpTags = Object.assign({}, adp.adpTags);
        var adpTagsModule = this.module;

        // Set adpTags if already present else initialise module
        adp.adpTags = existingAdpTags.adpSlots ? existingAdpTags : adpTagsModule;

        // Keep deep copy of inventory in adpTags module
        adp.adpTags.defaultInventory = adp.$.extend(true, {}, config.INVENTORY);

        // Merge adpQue with any existing que items if present
        adp.adpTags.que = adp.adpTags.que.concat(adpQue).concat(w.adpTags.que);
        w.adpTags = adp.adpTags;

        adp.adpTags.processQue();
        adp.adpTags.que.push = function (queFunc) {
            [].push.call(adp.adpTags.que, queFunc);
            adp.adpTags.processQue();
        };
    }
};

module.exports = adpTags;