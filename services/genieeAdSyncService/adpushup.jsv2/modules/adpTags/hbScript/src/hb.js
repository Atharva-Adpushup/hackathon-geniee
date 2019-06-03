// Prebid interfacing module

var hb = {
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
    },
    init: function (w) {
        w.pbjs = w.pbjs || {};
        w.pbjs.que = w.pbjs.que || [];

        return this.loadPrebid();
    }
};

module.exports = hb;