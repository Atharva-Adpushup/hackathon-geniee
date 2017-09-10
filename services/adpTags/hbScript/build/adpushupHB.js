/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = {
    PREBID_TIMEOUT: 700,
    NETWORK_ID: 103512698,
    SITE_ID: __SITE_ID__,
    INVENTORY: __INVENTORY__,
    SLOT_INTERVAL: 50,
    MEDIATION_API_URL: '//s2s.adpushup.com/MediationWebService/',
    HB_STATUS: {
        API_URL: 'http://apdc1-adblock.eastus2.cloudapp.azure.com/api/',
        EVENTS: {
            HB_START: 'HB_START',
            HB_END: 'HB_END',
            HB_RENDER: 'HB_RENDER',
            HB_DFP_RENDER: 'HB_DFP_RENDER'
        }
    },
    ADSENSE_RENDER_EVENT: 'adsenseRenderEvent',
    ADSENSE_FALLBACK_ADCODE: '<script>parent.postMessage(__AD_CODE__, parent.location.href);</script>',
    ADSENSE: {
        cpm: 0.01,
        bidderName: 'adsensefallback'
    },
    ADX: {
        adCode: '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script><ins class="adsbygoogle" style="display:inline-block;width:__SIZE_W__px;height:__SIZE_H__px" data-ad-client="ca-pub-8933329999391104" data-ad-slot="HB_FALLBACK"></ins><script>(adsbygoogle=window.adsbygoogle || []).push({});</script>',
        cpm: 0.01,
        bidderName: 'adxbackfill'
    },
    ADX_FLOOR: { //Use this key to override floor
        cpm: 0.01,
        key: 'FP_S_A' // FP_B, FP_A, FP_S, FP_B_A, FP_S_A (key available, FP - floor price, B-Branded, S-Semi transparent, A-Anonymous)
    },
    DEFAULT_WINNER: 'adx',
    FEEDBACK_URL: "http://apdc1-webapp-creativeqa.azurewebsites.net/feedback2",
    POSTBID_PASSBACKS: {
        '*': 'PGgxPkJPTyBZQUghPC9oMT4='
    },
    KEEN_IO: {
        PROJECT_ID: '5922a50995cfc9addc2480dd',
        WRITE_KEY: '40C0401741E18AFC5F17B722BA6371984333FDD0C36101019C7C107C1E1334B4',
        EVENTS: {
            IMPRESSION: 'impression'
        }
    },
    PREBID_AD_TEMPLATE: "<html>" +
    "<head>" +
    "<script>" +
    "var head = document.getElementsByTagName('head')[0];" +

    "var pbjs = pbjs || {};" +
    "pbjs.que = pbjs.que || [];" +

    "var PREBID_TIMEOUT = __PB_TIMEOUT__;" +
    //"var SLOT_ID = __PB_SLOT_ID__;" +
    //"var CONTAINER_ID = __PB_CONTAINER_ID__;" +
    "var PAGE_URL = '__PAGE_URL__';" +
    "var ADP_BATCH_ID = __ADP_BATCH_ID__;" +

    "var prebidScript = document.createElement('script');" +
    "prebidScript.async = true;" +
    "prebidScript.text = 'var adpPrebid = ' + parent.adpPrebid.toString() + ';';" +
    "head.appendChild(prebidScript);" +

    "adpPrebid();" +

    "function serverRenderCode( timeout ){" +
    "if( serverRenderCode.isExecuted === undefined ) {" +
    "serverRenderCode.isExecuted = true;" +

    "console.log(pbjs.getBidResponses());" +

    "var pbjsParams = {" +
    "'_bidsReceived'  : pbjs._bidsReceived," +
    "'_bidsRequested' : pbjs._bidsRequested," +
    "'_adUnitCodes'   : pbjs._adUnitCodes," +
    "'_winningBids'   : pbjs._winningBids," +
    "'_adsReceived'   : pbjs._adsReceived" +
    "};" +

    "if( Number.isInteger(timeout) ) {" +
    "parent.__prebidFinishCallback(pbjsParams, ADP_BATCH_ID, timeout);" +
    "} else {" +
    "parent.__prebidFinishCallback(pbjsParams, ADP_BATCH_ID);" +
    "}" +

    "}" +
    "}" +

    "setTimeout(function(){" +
    "serverRenderCode(PREBID_TIMEOUT);" +
    "}, PREBID_TIMEOUT);" +

    "pbjs.que.push(function(){" +
    "pbjs.setPriceGranularity('dense');" +
    "pbjs.setBidderSequence('random');" +
    "pbjs.addAdUnits(__AD_UNIT_CODE__);" +
    "pbjs.aliasBidder('appnexus', 'springserve');" + // SpringServe specific bidder aliasing
    "pbjs.aliasBidder('appnexus', 'brealtime');" + // bRealTime specific bidder aliasing

    "pbjs.onEvent('bidTimeout', function(timedOutBidders) {" +
    "parent.__prebidTimeoutCallback(ADP_BATCH_ID, timedOutBidders, PREBID_TIMEOUT);" +
    "});" +

    "pbjs.requestBids({" +
    "timeout : PREBID_TIMEOUT," +
    "bidsBackHandler: serverRenderCode" +
    "});" +
    "})" +

    "</script>" +
    "</head>" +
    "<body></body>" +
    "</html>"
};

/***/ }),
/* 1 */
/***/ (function(module, exports) {

var beginTime, lastTime;
beginTime = lastTime = (+new Date());

function shouldLog() {
	if (window.location.hash && window.location.hash === "#adpdebug") {
		return true;
	}
}

function info() {
	if (shouldLog()) {
		try {
			console.info.apply(this, arguments);
		} catch (error) {

		}
	}
}

function table(object) {
	if (shouldLog()) {
		try {
			console.table(object);
		} catch (error) {

		}
	}
}


function log() {
	if (shouldLog()) {
		var arrArgs = [].slice.call(arguments);
		arrArgs[0] = "adpTags: " + arrArgs[0];
		try {
			console.info.apply(this, arguments);
		} catch (error) {

		}

	}
}

function warn() {
	if (shouldLog()) {
		var arrArgs = [].slice.call(arguments);
		arrArgs[0] = "adphb: " + arrArgs[0];
		try {
			console.warn.apply(this, arrArgs);
		} catch (error) {

		}
	}
}

function group(groupName) {
	if (console.group && shouldLog()) {
		console.group(groupName);
	}
}

function groupEnd() {
	if (console.groupEnd && shouldLog()) {
		console.groupEnd();
	}
}

function warn() {
	if (shouldLog()) {
		var arrArgs = [].slice.call(arguments);
		arrArgs[0] = "adphb: " + arrArgs[0];
		try {
			console.warn.apply(this, arrArgs);
		} catch (error) {

		}
	}
}

function initPrebidLog() {
	if (shouldLog()) {
		pbjs.logging = true;
	}
}
module.exports = {
	info: info,
	log: log,
	table: table,
	warn: warn,
	shouldLog: shouldLog,

	group: group,
	groupEnd: groupEnd,

	initPrebidLog: initPrebidLog
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var KEEN_IO = __webpack_require__(0).KEEN_IO,
    logger = __webpack_require__(1),
    find = __webpack_require__(5);

module.exports = {
    hashCode: function (str) {
        var hash = 0;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    },
    createEmptyIframe: function () {
        var f = document.createElement('iframe');

        f.id = "_adp_frame_" + ((Math.random() * 1000) | 0);
        f.height = 0;
        f.width = 0;
        f.border = '0px';
        f.hspace = '0';
        f.vspace = '0';
        f.marginWidth = '0';
        f.marginHeight = '0';
        f.style.border = '0';
        f.scrolling = 'no';
        f.frameBorder = '0';
        f.src = 'about:blank';

        return f;
    },
    getCurrentAdpSlotBatch: function (adpBatches, batchId) {
        return find(adpBatches, function (batch) {
            return batch.batchId === batchId;
        }).adpSlots;
    },
    isSupportedBrowser: function () {
        var ua = navigator.userAgent;

        // Check for MSIE v7-10 in UA string
        if (ua.indexOf('MSIE') !== -1) {
            var re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})'),
                ieVersion = Number(re.exec(ua)[1]);

            return ieVersion >= 9 ? true : false;
        }
        return true;
    },
    getBrowser: function () {
        if (window.navigator) {
            var ua = navigator.userAgent, tem,
                M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE ' + (tem[1] || '');
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
            return M.join(' ');
        } else {
            return 'unknown';
        }
    },
    getUaString: function() {
         if (window.navigator) {
             if(window.navigator.userAgent) {
                return window.navigator.userAgent;
             } else if (window.navigator.appVersion) {
                 return window.navigator.appVersion;
             }
         }
         return null;
    },
    sendDataToKeenIO: function (data) {
        logger.info('keenIO data', data);
        var encodedData = window.btoa(JSON.stringify(data)),
            imgEl = document.createElement('img');

        imgEl.src = 'https://api.keen.io/3.0/projects/' + KEEN_IO.PROJECT_ID + '/events/' + KEEN_IO.EVENTS.IMPRESSION + '?api_key=' + KEEN_IO.WRITE_KEY + '&data=' + encodedData;
        imgEl.style.display = 'none';
        document.body.appendChild(imgEl);
    },
    getBatchAdUnits: function(adpSlots) {
        var adUnits = [];
        adpSlots.forEach(function(adpSlot) {
            adUnits.push(adpSlot.containerId);
        }); 
        return adUnits;
    },
    stringifyJSON: function (json) {
        var dataString = '?',
            keys = Object.keys(json);

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];

            if (keys.length > 1 && i !== keys.length - 1) {
                dataString += key + '=' + json[key] + '&';
            } else {
                dataString += key + '=' + json[key];
            }
        }

        return dataString;
    },
    generateUUID: function (placeholder) {
        return placeholder ?
            (placeholder ^ Math.random() * 16 >> placeholder / 4).toString(16) :
            ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, this.generateUUID);
    },
    getRandomNumber: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// Hb status module

var config = __webpack_require__(0),
    utils = __webpack_require__(2),
    xhr = __webpack_require__(6),
    logger = __webpack_require__(1),
    responseHandler = function (err, data) {
        if (!err) {
            logger.log(data);
        } else {
            logger.log(err);
        }
    },
    packetId = (window.adpushup && window.adpushup.config && window.adpushup.config.packetId) ? window.adpushup.config.packetId : utils.generateUUID(),
    platform = (window.adpushup && window.adpushup.config && window.adpushup.config.platform) ? window.adpushup.config.platform : utils.generateUUID(),
    hbStart = function (adUnits) {
        xhr("POST", config.HB_STATUS.API_URL + config.HB_STATUS.EVENTS.HB_START + "?packetId=" + packetId + "&UA=" + utils.getBrowser() + "&ua_string=" + utils.getUaString() + "&siteId=" + config.SITE_ID + "&platform=" + platform + "&adUnit=" + adUnits, {}, function (err, data) {
            responseHandler(err, data);
        }, { "PostQuery": true });
    },
    hbEnd = function (adUnits) {
        xhr("POST", config.HB_STATUS.API_URL + config.HB_STATUS.EVENTS.HB_END + "?packetId=" + packetId + "&adUnit=" + adUnits, {}, function (err, data) {
            responseHandler(err, data);
        }, { "PostQuery": true });
    },
    hbRender = function (adUnits) {
        xhr("POST", config.HB_STATUS.API_URL + config.HB_STATUS.EVENTS.HB_RENDER + "?packetId=" + packetId + "&adUnit=" + adUnits, {}, function (err, data) {
            responseHandler(err, data);
        }, { "PostQuery": true });
    },
    hbDfpRender = function (adUnit) {
        xhr("POST", config.HB_STATUS.API_URL + config.HB_STATUS.EVENTS.HB_DFP_RENDER + "?packetId=" + packetId + "&adUnit=" + adUnit, {}, function (err, data) {
            responseHandler(err, data);
        }, { "PostQuery": true });
    };

module.exports = {
    hbStart: hbStart,
    hbEnd: hbEnd,
    hbRender: hbRender,
    hbDfpRender: hbDfpRender
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// Header bidding feedback module

var logger = __webpack_require__(1),
    config = __webpack_require__(0),
    utils = __webpack_require__(2),
    getBidDataForFeedback = function (containerId) {
        var bidData = [],
            // Not using getBidResponses() because context of all slot containers is not getting saved in it, instead using getBidResponsesForAdUnitCode(':adUnitCode')
            slotBids = pbjs.getBidResponsesForAdUnitCode(containerId); 

        if (slotBids) {
            var bids = slotBids.bids;
            for (var i in bids) {
                bidData.push({
                    revenue: bids[i].cpm / 1000, // Actual revenue for impression = cpm/1000
                    bidder: bids[i].bidder,
                    adId: bids[i].adId
                });
            }
            return bidData;
        }
        return bidData;
    },
    feedback = function (slot) {
        if(!slot.type || slot.feedbackSent) {
            return;
        }
        slot.feedbackSent = true;

        var type = slot.type,
            feedback = {
                success: true,
                data: {
                    size: slot.size[0] + 'x' + slot.size[1],
                    siteId: config.SITE_ID,
                    placement: slot.placement,
                    containerId: slot.containerId,
                    type: slot.type,
                    bids: getBidDataForFeedback(slot.containerId) || [],
                    winner: slot.feedback.winner || null,
                    winningRevenue: slot.feedback.winningRevenue || 0,
                    timedOutBidders: slot.feedback.timedOutBidders || [],
                    timeout: slot.feedback.timeout || slot.timeout,
                    status: null
                }
            };
        
        switch (type) {
            case 1:
                Object.assign(feedback.data, {
                    status: 'Type 1: Prebid rendered!'
                });
                feedback.data.bids.push({
                    adId: slot.slotId,
                    bidder: 'adx'
                });
                break;
            case 2:
                Object.assign(feedback.data, {
                    status: 'Type 2: Postbid rendered!'
                });
                break;
            case 3:
                Object.assign(feedback.data, {
                    status: 'Type 3: No bid or $0 bid from postbid, collapsing div!',
                    winner: null
                });
                break;
            case 4:
                Object.assign(feedback.data, {
                    status: 'Type 4: No bidder config present but dfp slot present, rendering adx tag!',
                    winner: null
                });
                break;
            case 5:
                Object.assign(feedback.data, {
                    status: 'Type 5: No bidder config or dfp slot present, collapsing div!',
                    winner: null
                });
                break;
             case 6: 
                Object.assign(feedback.data, {
                    status: 'Type 6: Browser not supported but dfp slot present, rendering adx tag!',
                    winner: null
                });
                break;
            case 7:
                Object.assign(feedback.data, {
                    status: 'Type 7: Browser not supported and no dfp slot present, collapsing div!',
                    winner: null
                });
                break;
            case 8:
                Object.assign(feedback.data, {
                    status: 'Type 8: Adsense fallback won!',
                    winner: config.ADSENSE.bidderName
                });
        }
        utils.sendDataToKeenIO(feedback);
        logger.log('Winner for div '+feedback.data.containerId+': '+feedback.data.winner, feedback.data.winningRevenue*1000)    
    };

module.exports = feedback;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module) {/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for comparison styles. */
var UNORDERED_COMPARE_FLAG = 1,
    PARTIAL_COMPARE_FLAG = 2;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991,
    MAX_INTEGER = 1.7976931348623157e+308,
    NAN = 0 / 0;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    reLeadingDot = /^\./,
    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object),
    nativeMax = Math.max;

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {boolean} [bitmask] The bitmask of comparison flags.
 *  The bitmask may be composed of the following flags:
 *     1 - Unordered comparison
 *     2 - Partial comparison
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, customizer, bitmask, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = getTag(object);
    objTag = objTag == argsTag ? objectTag : objTag;
  }
  if (!othIsArr) {
    othTag = getTag(other);
    othTag = othTag == argsTag ? objectTag : othTag;
  }
  var objIsObj = objTag == objectTag && !isHostObject(object),
      othIsObj = othTag == objectTag && !isHostObject(other),
      isSameTag = objTag == othTag;

  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
  }
  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
}

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
  };
}

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}

/**
 * Creates a `_.find` or `_.findLast` function.
 *
 * @private
 * @param {Function} findIndexFunc The function to find the collection index.
 * @returns {Function} Returns the new find function.
 */
function createFind(findIndexFunc) {
  return function(collection, predicate, fromIndex) {
    var iterable = Object(collection);
    if (!isArrayLike(collection)) {
      var iteratee = baseIteratee(predicate, 3);
      collection = keys(collection);
      predicate = function(key) { return iteratee(iterable[key], key, iterable); };
    }
    var index = findIndexFunc(collection, predicate, fromIndex);
    return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
  };
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!seen.has(othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
              return seen.add(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, customizer, bitmask, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= UNORDERED_COMPARE_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = isKey(path, object) ? [path] : castPath(path);

  var result,
      index = -1,
      length = path.length;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result) {
    return result;
  }
  var length = object ? object.length : 0;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isArguments(object));
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoize(function(string) {
  string = toString(string);

  var result = [];
  if (reLeadingDot.test(string)) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * This method is like `_.find` except that it returns the index of the first
 * element `predicate` returns truthy for instead of the element itself.
 *
 * @static
 * @memberOf _
 * @since 1.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [predicate=_.identity]
 *  The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the found element, else `-1`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'active': false },
 *   { 'user': 'fred',    'active': false },
 *   { 'user': 'pebbles', 'active': true }
 * ];
 *
 * _.findIndex(users, function(o) { return o.user == 'barney'; });
 * // => 0
 *
 * // The `_.matches` iteratee shorthand.
 * _.findIndex(users, { 'user': 'fred', 'active': false });
 * // => 1
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.findIndex(users, ['active', false]);
 * // => 0
 *
 * // The `_.property` iteratee shorthand.
 * _.findIndex(users, 'active');
 * // => 2
 */
function findIndex(array, predicate, fromIndex) {
  var length = array ? array.length : 0;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : toInteger(fromIndex);
  if (index < 0) {
    index = nativeMax(length + index, 0);
  }
  return baseFindIndex(array, baseIteratee(predicate, 3), index);
}

/**
 * Iterates over elements of `collection`, returning the first element
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index|key, collection).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to inspect.
 * @param {Function} [predicate=_.identity]
 *  The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {*} Returns the matched element, else `undefined`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'age': 36, 'active': true },
 *   { 'user': 'fred',    'age': 40, 'active': false },
 *   { 'user': 'pebbles', 'age': 1,  'active': true }
 * ];
 *
 * _.find(users, function(o) { return o.age < 40; });
 * // => object for 'barney'
 *
 * // The `_.matches` iteratee shorthand.
 * _.find(users, { 'age': 1, 'active': true });
 * // => object for 'pebbles'
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.find(users, ['active', false]);
 * // => object for 'fred'
 *
 * // The `_.property` iteratee shorthand.
 * _.find(users, 'active');
 * // => object for 'barney'
 */
var find = createFind(findIndex);

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = find;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(15), __webpack_require__(16)(module)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// XHR module

var utils = __webpack_require__(2),
    xhr = function (method, url, payload, callback, option) {
        if (!method || !url) {
            console.log('AdpTags: Please provide valid HTTP method and url in xhr module');
            return;
        }

        var http = new XMLHttpRequest();

        switch (method) {
            case 'GET':
            case 'get':
                payload = utils.stringifyJSON(payload);
                url += payload;
                
                http.open(method, url, true);
                http.send();
                break;
            case 'POST':
            case 'post':
                http.open(method, url, true);

                if(!option) {
                    http.setRequestHeader("Content-type", "application/json");
                    http.send(JSON.stringify(payload));
                } else {
                    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    http.send();
                }
                break;
        }

        http.onload = function () {
            callback(null, http.response);
        };

        http.onerror = function () {
            callback(http.response);
        };
    };

module.exports = xhr;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// Adp tags rendering module

var logger = __webpack_require__(1),
    utils = __webpack_require__(2),
    config = __webpack_require__(0),
    feedback = __webpack_require__(4),
    hbStatus = __webpack_require__(3),
    getFloorWithGranularity = function (floor) {
        var val = floor;
        //var val = parseFloat((Math.abs(floor)).toFixed(1));
        if (val > 20) {
            return 20;
        } 
        else if (val == 0) {
            val = 0.01;
        }
        console.log('Sent floor : ' + val);
        return val;
    },
    setGPTTargetingForPBSlot = function (containerId) {
        var gSlot = window.adpTags.adpSlots[containerId].gSlot,
            targeting = pbjs.getAdserverTargeting()[containerId],
            floor = parseFloat(config.ADX_FLOOR.cpm);

        // targeting = {
        //     hb_adid: 'abc',
        //     hb_bidder: 'test',
        //     hb_pb: '3.00',
        //     hb_size: '300x250'
        // }

        if (!targeting) {
            var floor = getFloorWithGranularity(floor);
            floor > 0 ? gSlot.setTargeting(config.ADX_FLOOR.key, floor) : null;
            return false;
        }

        var keys = Object.keys(targeting),
            hb_pb = parseFloat(targeting['hb_pb']);

        keys.forEach(function (key) {
            gSlot.setTargeting(key, targeting[key]);
        });

        if (floor && (floor < hb_pb)) {
            floor = hb_pb.toFixed(1);
        }

        console.log('Setting floor to : ' + floor);

        gSlot.setTargeting(config.ADX_FLOOR.key, getFloorWithGranularity(floor));
    },
    setGPTKeys = function (containerId, gptKeyGroup) {
        var gSlot = window.adpTags.adpSlots[containerId].gSlot;

        for (var gptKey in gptKeyGroup) {
            gSlot.setTargeting(gptKey, String(gptKeyGroup[gptKey]));
        }
    },
    renderGPT = function (slot) {
        if (!slot.containerPresent || !slot.biddingComplete || slot.hasRendered) {
            return false;
        }
        slot.hasRendered = true;
        googletag.cmd.push(function () {
            googletag.display(slot.containerId);
        });
    },
    renderPostbid = function (slot) {
        logger.log('Rendering postbid');

        var params = pbjs.getAdserverTargetingForAdUnitCode(slot.containerId),
            adIframe = utils.createEmptyIframe();

        document.getElementById(slot.containerId).appendChild(adIframe);

        var iframeDoc = adIframe.contentWindow.document;

        if (params && params.hb_adid) {
            logger.log('Bid present from postbid');

            pbjs.renderAd(iframeDoc, params.hb_adid);
            adIframe.contentWindow.onload = function () {
                slot.hasRendered = true;
                feedback(slot);
            };
        } else {
            logger.log('No bid or $0 cpm bid for slot, collapsing div');
            slot.type = 3;
            feedback(slot);
        }
    },
    setGPTargeting = function (slot) {
        var targeting = {
            'hb_placement': slot.placement,
            'hb_siteId': config.SITE_ID,
            'hb_ran': 0
        };

        if (utils.isSupportedBrowser() && slot.bidders.length) {
            setGPTTargetingForPBSlot(slot.containerId);
            setGPTKeys(slot.containerId, Object.assign(targeting, {
                'hb_ran': 1
            }));
        } else {
            setGPTKeys(slot.containerId, targeting);
        }
    },
    enableGoogServicesForSlot = function (slot) {
        slot.gSlot = googletag.defineSlot("/" + config.NETWORK_ID + "/" + slot.slotId, slot.size, slot.containerId);
        setGPTargeting(slot);
        slot.gSlot.addService(googletag.pubads());
    },
    nonDFPSlotRenderSwitch = function (slot) {
        var type = slot.type;

        switch (type) {
            // case 1:
            //     renderGPT(slot);
            //     // Type 1 feedback sent in slotRenderEnded event call
            //     break;
            case 2:
                renderPostbid(slot);
                break;
            // case 3: is handled from within case 2
            // case 4:
            //     renderGPT(slot);
            //     // Type 4 feedback sent in slotRenderEnded event call
            //     break;
            case 5:
                feedback(slot);
                break;
            // case 6:
            //     renderGPT(slot);
            //     // Type 6 feedback sent in slotRenderEnded event call
            //     break;
            case 7:
                feedback(slot);
                break;
        }
    },
    ifAdsenseWinner = function (containerId) {
        return pbjs.getHighestCpmBids(containerId)[0].bidder === config.ADSENSE.bidderName ? true : false;
    },
    renderAdsenseBackfill = function (slot) {
        var bid = pbjs.getHighestCpmBids(slot.containerId)[0],
            adData = JSON.stringify({
                containerId: slot.containerId,
                ad: btoa(bid.ad),
                type: config.ADSENSE_RENDER_EVENT
            });
        
        bid.ad = config.ADSENSE_FALLBACK_ADCODE.replace('__AD_CODE__', adData); 
    },
    afterBiddingProcessor = function (slots) {
        if (!Array.isArray(slots) || !slots.length) {
            return false;
        }
        var adpSlotsWithDFPSlots = [];

        slots.forEach(function (slot) {
            slot.biddingComplete = true;
            slot.slotId ? adpSlotsWithDFPSlots.push(slot) : nonDFPSlotRenderSwitch(slot);
        });

        if (!adpSlotsWithDFPSlots.length) {
            return true;
        }

        //This code must be inside googletag.cmd.push as it depends upon gpt availability 
        googletag.cmd.push(function () {
            // Attach gpt slot for each adpSlot in batch
            adpSlotsWithDFPSlots.forEach(function (slot) {
                enableGoogServicesForSlot(slot);
            });
            //when defineslot is done for whole batch enable gpt SRA
            googletag.pubads().enableSingleRequest();
            googletag.enableServices();

            var adUnits = utils.getBatchAdUnits(adpSlotsWithDFPSlots).join(',');
            hbStatus.hbRender(adUnits);

            //In last try rendering all slots. 
            adpSlotsWithDFPSlots.forEach(function (slot) {
                // if (ifAdsenseWinner(slot.containerId)) {
                //     renderAdsenseBackfill(slot);
                // } 
                renderGPT(slot);
            });

        });
    };

module.exports = {
    afterBiddingProcessor: afterBiddingProcessor,
    renderGPT: renderGPT
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// Header bidding initialisation module

function init(w, d) {
    __webpack_require__(11).init(w);
    
    w.adpPrebid = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../../Prebid.js/build/dist/prebid\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
    w.adpPrebid();

    __webpack_require__(9);

    var logger = __webpack_require__(1),
        gpt = __webpack_require__(13),
        config = __webpack_require__(0),
        feedback = __webpack_require__(4),
        hbStatus = __webpack_require__(3);

    // Initialise GPT and set listeners
    gpt.init(w, d);
    gpt.setListeners(w, function (d) {
        logger.log('Feedback sent'); // Feedback for DFP slot render sent here
    });

    var adpQue;
    if (w.adpTags) {
        adpQue = w.adpTags.que;
    } else {
        adpQue = [];
    }

    var existingAdpTags = Object.assign({}, w.adpTags),
        adpTagsModule = __webpack_require__(12);

    // Set adpTags if already present else initialise module
    w.adpTags = existingAdpTags.adpSlots ? existingAdpTags : adpTagsModule;

    // Merge adpQue with any existing que items if present
    w.adpTags.que = w.adpTags.que.concat(adpQue);

    adpTags.processQue();
    w.adpTags.que.push = function (queFunc) {
        [].push.call(w.adpTags.que, queFunc);
        adpTags.processQue();
    };

    w.pbjs = w.pbjs || {};
    w.pbjs.que = w.pbjs.que || [];

    function messageListener(e) {
        var data = e.data;

        // Check for adsense fallback render event
        if((data && data.type) && data.type === config.ADSENSE_RENDER_EVENT) {
            var containerId = '#'+data.containerId,
                adCode = atob(data.ad);

            adpushup.$("div[id*=google_ads]").hide();
            adpushup.$("iframe[id*=google_ads]").hide();
            adpushup.$(containerId).prepend(adCode);
        }
    };

    w.addEventListener('message', messageListener, false);

    // Declaring prebid winner, if anyone
    w.pbjs.que.push(function () {
        w.pbjs.onEvent('bidWon', function (bidData) {
            logger.log('Bid winner decided from prebid auction');
            var slot = w.adpTags.adpSlots[bidData.adUnitCode];
            slot.feedback.winner = bidData.bidder;
            slot.feedback.winningRevenue = bidData.cpm / 1000;

            // if(slot.feedback.winner === config.ADSENSE.bidderName) {
            //     hbStatus.hbDfpRender(slot.containerId);

            //     slot.type = 8;
            //     feedback(slot);
            // }
        });
    });
};

module.exports = init;


/***/ }),
/* 9 */
/***/ (function(module, exports) {

if (!Object.keys) {
  Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null)
        throw new TypeError('Object.keys called on non-object');

      var result = [];

      for (var prop in obj) {
        if (hasOwnProperty.call(obj, prop)) result.push(prop);
      }

      if (hasDontEnumBug) {
        for (var i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
        }
      }
      return result;
    };
  })();
}

if (!Object.values) {
  Object.values = function (obj) {
    var vals = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        vals.push(obj[key]);
      }
    }
    return vals;
  };
}

if (!window.btoa) {
  var object = window;

  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa = function (input) {
    var str = String(input);
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next str index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      str.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt(idx += 3 / 4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  };

}
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, argument) {
        argument = argument || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(argument, this[i], i, this);
        }
    };
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

// AdPushup header bidding entry module

; (function (w, d) {
    var init = __webpack_require__(8);
    init(w, d);
})(window, document);


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

// Network optimisation module

var xhr = __webpack_require__(6),
    config = __webpack_require__(0),
    logger = __webpack_require__(1),
    utils = __webpack_require__(2),
    init = function (w) {
        xhr('GET', config.MEDIATION_API_URL, { siteId: config.SITE_ID }, function (err, res) {
            try {
                res = JSON.parse(res);
            } catch (e) {
                logger.log(e);
                return;
            }

            if (err || !res.data) {
                logger.log('Error response from mediation API');
                return;
            }

            if(!w.adpTags.batchPrebiddingComplete) {
                // var priceFloor = res.data.priceFloor.ecpm;
                // console.log('Received price floor : ' + priceFloor);
                // w.adpTags.extendConfig({ ADX_FLOOR: { cpm: priceFloor, key: 'FP_S_A' } });

                // var adsenseCpm = res.data.adsense ? res.data.adsense.ecpm : config.ADSENSE.cpm;
                // console.log('Received adsense ecpm : ' + adsenseCpm);
                // w.adpTags.extendConfig({ ADSENSE: { cpm: adsenseCpm, bidderName: config.ADSENSE.bidderName } });

                // var adxCpm = res.data.adX ? res.data.adX.ecpm : config.ADX.cpm;
                // console.log('Received adx ecpm : ' + adxCpm);
                // w.adpTags.extendConfig({ ADX: { cpm: adxCpm, bidderName: config.ADX.bidderName, adCode: config.ADX.adCode } });

                var champion = res.data.priceFloor.champion;
                console.log('Recieved champion : ' + champion);

                var challenger = res.data.priceFloor.challenger;
                console.log('Recieved challenger : ' + challenger);

                var num = utils.getRandomNumber(1, 100),
                    cpm = num <= 50 ? champion : challenger;
            
                console.log('Selected : ' + cpm);

                w.adpTags.extendConfig({ ADX_FLOOR: { key: 'FP_S_A', cpm: cpm, championChallengerFetched: true } });
            }
        });
    };

module.exports = { init: init };


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

// Adp tags library

var prebidSandbox = __webpack_require__(14),
    utils = __webpack_require__(2),
    logger = __webpack_require__(1),
    config = __webpack_require__(0),
    inventory = config.INVENTORY,
    find = __webpack_require__(5),
    adpRender = __webpack_require__(7),

    // Maps a particular adp slot to a dfp ad unit and a prebid bidder config
    inventoryMapper = function (size) {
        var width = size[0],
            height = size[1],
            size = width + 'x' + height;

        return {
            dfpAdUnit: inventory.dfpAdUnits[size] ? inventory.dfpAdUnits[size].pop() : null,
            bidders: inventory.bidderAdUnits[size] ? inventory.bidderAdUnits[size].pop() : null
        };
    },

    // Adds batch Id to all the adp slots in a batch
    addBatchIdToAdpSlots = function (adpSlots, batchId) {
        Object.keys(adpSlots).forEach(function (slot) {
            adpSlots[slot].batchId = batchId;
        });
    },

    // Initiate prebidding for an adpSlots batch
    prebidBatching = function (adpSlotsBatch) {
        prebidSandbox.createPrebidContainer(adpSlotsBatch);
    },

    createSlot = function (containerId, size, placement, optionalParam) {
        var adUnits = inventoryMapper(size),
            slotId = adUnits.dfpAdUnit,
            bidders = adUnits.bidders,
            adsenseAdCode = (optionalParam && optionalParam.adsenseAdCode) ? optionalParam.adsenseAdCode : null;

        adpTags.adpSlots[containerId] = {
            slotId: slotId,
            bidders: bidders || [],
            placement: placement,
            size: size,
            containerId: containerId,
            timeout: config.PREBID_TIMEOUT,
            adsenseAdCode: adsenseAdCode, // Recieved in base64 format from the user
            gSlot: null,
            hasRendered: false,
            biddingComplete: false,
            containerPresent: false,
            feedbackSent: false,
            hasTimedOut: false,
            feedback: {
                winner: config.DEFAULT_WINNER
            }
        };
        return adpTags.adpSlots[containerId];
    },

    processBatchForBidding = function () {
        var batchId = adpTags.currentBatchId,
            adpSlots = adpTags.currentBatchAdpSlots;

        adpTags.adpBatches.push({
            batchId: batchId,
            adpSlots: adpSlots
        });

        // Add batch id to all batched adpSlots
        addBatchIdToAdpSlots(adpSlots, batchId);

        // Initiate prebidding for current adpSlots batch
        prebidBatching(utils.getCurrentAdpSlotBatch(adpTags.adpBatches, batchId));

        // Reset the adpSlots batch
        adpTags.currentBatchId = null;
        adpTags.currentBatchAdpSlots = [];
        adpTags.slotInterval = null;

        logger.log('Timeout interval ended');
    },

    queSlotForBidding = function (slot) {
        if (!adpTags.slotInterval) {
            adpTags.currentBatchId = !adpTags.currentBatchId ? Math.abs(utils.hashCode(+new Date() + '')) : adpTags.currentBatchId;
        } else {
            logger.log('Timeout interval already defined, resetting it');
            clearTimeout(adpTags.slotInterval);
        }
        adpTags.currentBatchAdpSlots.push(slot);
        adpTags.slotInterval = setTimeout(processBatchForBidding, config.SLOT_INTERVAL);
    },

    // Adp tags main object instance - instantiates adpslots
    adpTags = {
        adpSlots: {},
        que: [],
        slotInterval: null,
        adpBatches: [],
        currentBatchAdpSlots: [],
        currentBatchId: null,
        batchPrebiddingComplete: false,
        // Function to define new adp slot
        defineSlot: function (containerId, size, placement, optionalParam) {
            var slot = createSlot(containerId, size, placement, optionalParam);
            logger.log('Slot defined for container : ' + containerId);

            if (utils.isSupportedBrowser()) {
                if (slot.bidders.length) {
                    if (slot.slotId) {
                        logger.log('Type 1: Attaching gSlot and running prebid sandboxing');
                        slot.type = 1;
                    } else {
                        logger.log('Type 2: Running prebid sandboxing and then postbid as dfp slot is not present');
                        slot.type = 2;
                    }
                }
                // Type 3 handled from within case 2
                else {
                    slot.biddingComplete = true;
                    if (slot.slotId) {
                        logger.log('Type 4: No prebid bidder config, rendering adx tag');
                        slot.type = 4;
                    } else {
                        logger.log('Type 5: No prebid bidder config or dfp slot, collapsing div');
                        slot.type = 5;
                    }
                }
            } else {
                logger.log('Browser not supported by AdPushup.');
                slot.biddingComplete = true;

                slot.type = slot.slotId ? 6 : 7;
            }
            queSlotForBidding(this.adpSlots[containerId])
            return this.adpSlots[containerId];
        },
        processQue: function () {
            while (this.que.length) {
                this.que.shift().call(this);
            }
        },
        extendConfig: function (newConfig) {
            Object.assign(config, newConfig);
        },
        // Function to display adp slot for given container id
        display: function (containerId) {
            var slot = this.adpSlots[containerId];
            if (slot && !slot.containerPresent) {
                slot.containerPresent = true;
                //logger.log('Rendering adp tag for container : ' + containerId);
                adpRender.renderGPT(slot);
            }
        }
    };

module.exports = adpTags;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// GPT library module

var config = __webpack_require__(0),
    logger = __webpack_require__(1),
    feedback = __webpack_require__(4),
    hbStatus = __webpack_require__(3),
    init = function (w, d) {
        var scripts = d.querySelectorAll('script'),
            gptLoaded = false;

        scripts.forEach(function(script) {
            if(script.src.indexOf('gpt') !== -1) {
                gptLoaded = true;
            }
        });

        if(!gptLoaded) {
            w.googletag = w.googletag || {};
            googletag.cmd = googletag.cmd || [];

            var gptScriptEl = d.createElement('script');
            gptScriptEl.src = "//www.googletagservices.com/tag/js/gpt.js";
            gptScriptEl.async = true;

            return d.head.appendChild(gptScriptEl);
        }
    },
    setListeners = function (w, cb) {
        w.googletag.cmd.push(function () {
            w.googletag.pubads().addEventListener('slotRenderEnded', function (event) {
                var slot;
                Object.keys(w.adpTags.adpSlots).forEach(function (adpSlot) {
                    if ('/' + config.NETWORK_ID + '/' + w.adpTags.adpSlots[adpSlot].slotId === event.slot.getName()) {
                        slot = w.adpTags.adpSlots[adpSlot]
                    }
                });

                if(slot && slot.feedback.winner !== config.ADSENSE.bidderName) {
                    hbStatus.hbDfpRender(slot.containerId);

                    logger.log('DFP ad slot rendered');
                    return cb(feedback(slot));
                }
            });
        });
    };

module.exports = {
    init: init,
    setListeners: setListeners
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

// Prebid sandboxing module

var adRenderingTemplate = __webpack_require__(0).PREBID_AD_TEMPLATE,
    adpRender = __webpack_require__(7),
    config = __webpack_require__(0),
    find = __webpack_require__(5),
    __FRAME_PREFIX__ = '__adp_frame__',
    logger = __webpack_require__(1),
    utils = __webpack_require__(2),
    //prebidHooking = require('./prebidHooking'),
    hbStatus = __webpack_require__(3),
    createPrebidContainer = function (adpSlotsBatch) {
        var adUnitCodeForPrebid = [],
            adpBatchId = adpSlotsBatch[0].batchId;

        adpSlotsBatch.forEach(function (adpSlot) {
            adUnitCodeForPrebid.push({
                code: adpSlot.containerId,
                sizes: adpSlot.size,
                bids: adpSlot.bidders
            });
        });

        var prebidHtml = adRenderingTemplate.replace('__AD_UNIT_CODE__', JSON.stringify(adUnitCodeForPrebid))
            .replace('__ADP_BATCH_ID__', adpBatchId)
            .replace('__PB_TIMEOUT__', config.PREBID_TIMEOUT)
            .replace('__PAGE_URL__', window.location.href);

        var iframeEl = document.createElement('iframe');
        iframeEl.style.display = 'none';
        iframeEl.id = __FRAME_PREFIX__ + adpBatchId;

        iframeEl.onload = function () {
            //window['__adp_frame_context_' + Math.abs(utils.hashCode(containerId))] = iframeEl.contentWindow;

            if (iframeEl._adp_loaded === undefined) {
                var iframeDoc = iframeEl.contentDocument;
                iframeDoc.open();
                iframeDoc.write(prebidHtml);
                iframeDoc.close();
            }

            iframeEl._adp_loaded = true;
        };

        var waitUntil = setInterval(function () {
            if (document.body) {
                clearInterval(waitUntil);
                logger.log('Running bid auction...');
            
                var adUnits = utils.getBatchAdUnits(adpSlotsBatch).join(',');
                hbStatus.hbStart(adUnits);

                document.body.appendChild(iframeEl);
            }
        }, 50);
    },
    removeHBIframe = function (adpBatchId) {
        var iframe = document.getElementById(__FRAME_PREFIX__ + adpBatchId);
        document.body.removeChild(iframe);
    },
    setPbjsKeys = function (pbjsParams) {
        Object.keys(pbjsParams).forEach(function (pbjsKey) {
            pbjs[pbjsKey] = pbjsParams[pbjsKey].concat(pbjs[pbjsKey]);
        });
    },
    // Callback function to set pbjs keys on parent - fired when prebid sandboxing completes
    prebidFinishCallback = function (pbjsParams, adpBatchId, timeout) {
        var adpSlots = utils.getCurrentAdpSlotBatch(adpTags.adpBatches, adpBatchId),
            adUnits = utils.getBatchAdUnits(adpSlots).join(',');
        hbStatus.hbEnd(adUnits);

        adpTags.batchPrebiddingComplete = true;
        if (Object.keys(adpSlots).length) {
            // Apply adsense/adx hooking in prebid
            //prebidHooking(adpSlots, pbjsParams);

            logger.log('Bidding complete');
            pbjs.que.push(function () {
                setPbjsKeys(pbjsParams);
                //removeHBIframe(adpBatchId);
            });
            //function sets google targeting and render the slot, also handle if google slot not available
            adpRender.afterBiddingProcessor(adpSlots);
        }
        return;
    },
    // Callback function to set timeout feedback of bidders - fired when prebid auction times out
    prebidTimeoutCallback = function (adpBatchId, timedOutBidders, timeout) {
        logger.log('Bid request timed out');
        logger.log(timedOutBidders);

        var adpSlots = utils.getCurrentAdpSlotBatch(adpTags.adpBatches, adpBatchId);

        adpSlots.forEach(function (adpSlot) {
            adpSlot.feedback.timedOutBidders = timedOutBidders
            adpSlot.feedback.timeout = timeout;
            adpSlot.hasTimedOut = true;
        });
    };


window.__prebidFinishCallback = prebidFinishCallback;
window.__prebidTimeoutCallback = prebidTimeoutCallback;

module.exports = {
    createPrebidContainer: createPrebidContainer,
    removeHBIframe: removeHBIframe
};

/***/ }),
/* 15 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ })
/******/ ]);