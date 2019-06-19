// DFP targeting module

var constants = require('./constants');
var adp = require('./adp');
var targeting = {
    setPageLevel: function (googletag) {
        var pageLevelTargeting = constants.TARGETING.PAGE_LEVEL;

        for (var key in pageLevelTargeting) {
            googletag.pubads().setTargeting(key, String(pageLevelTargeting[key]));
        }
    },
    setUTMLevel: function (googletag) {
        var urlParams = adp.utils.queryParams;
        var separator = ':';

        if (!Object.keys(urlParams).length) {
            var utmSessionCookie = adp.session.getCookie(constants.UTM_SESSION_COOKIE);

            if (utmSessionCookie) {
                var utmSessionCookieValues = adp.utils.base64Decode(utmSessionCookie.split('_=')[1]);
                urlParams = utmSessionCookieValues ? JSON.parse(utmSessionCookieValues) : {};
            }
        }

        // Set standard UTM targeting
        var standardTargeting = constants.TARGETING.UTM_LEVEL.STANDARD;
        Object.keys(standardTargeting).forEach(function (key) {
            var keyVal = standardTargeting[key],
                utmParam = urlParams[keyVal];

            googletag
                .pubads()
                .setTargeting(keyVal.trim().toLowerCase(), String(utmParam ? utmParam.trim().substr(0, 40) : null));
        });

        // Set custom UTM targeting
        var customTargeting = constants.TARGETING.UTM_LEVEL.CUSTOM;
        Object.keys(customTargeting).forEach(function (key) {
            var keyName = key,
                keyTargets = customTargeting[key].TARGET,
                keyCombination = '';

            Object.keys(keyTargets).forEach(function (keyTarget) {
                var keyVal = keyTargets[keyTarget],
                    utmParam = urlParams[keyVal];

                keyCombination += (utmParam ? utmParam : null) + separator;
            });

            keyCombination = keyCombination.substr(0, keyCombination.length - 1);
            googletag
                .pubads()
                .setTargeting(
                    keyName.trim().toLowerCase(),
                    String(keyCombination ? keyCombination.trim().substr(0, 40) : null)
                );
        });
    }
};

module.exports = targeting;