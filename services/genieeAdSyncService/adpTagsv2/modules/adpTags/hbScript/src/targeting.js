// DFP targeting module

var constants = require('./constants');
var targeting = {
    setPageLevel: function (googletag) {
        var pageLevelTargeting = constants.TARGETING.PAGE_LEVEL;

        for (var key in pageLevelTargeting) {
            googletag.pubads().setTargeting(key, String(pageLevelTargeting[key]));
        }
    }
};

module.exports = targeting;