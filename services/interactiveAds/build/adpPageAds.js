webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(5);

__webpack_require__(6);

var _commonConsts = __webpack_require__(3);

var _commonConsts2 = _interopRequireDefault(_commonConsts);

var _emitter = __webpack_require__(4);

var _emitter2 = _interopRequireDefault(_emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Interactive ads main module

console.log('script loaded');

// import renderer from './src/renderer';

var processInteractiveAds = function processInteractiveAds(interactiveAds) {
	console.log(interactiveAds);
	// formats.forEach(format => {
	// 	switch (format.event) {
	// 		case commconConsts.EVENTS.DOM_LOAD:
	// 			console.log(`subscribed to ${format.event} event`);

	// 			console.log(emitter);
	// 			const pageLoadEvent = emitter.subscribe(commconConsts.EVENTS.DOM_LOAD, data => {
	// 				console.log(data);
	// 				//renderer(config);
	// 			});
	// 	}
	// });
};

module.exports = processInteractiveAds;

/***/ }),
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Common constants

var commonConsts = {
	EVENTS: {
		PAGE_LOAD: 'load',
		DOM_LOAD: 'DOMContentLoaded',
		SCROLL: 'scroll'
	},
	DEFAULT_FORMAT_CLASSNAME: 'adp_ad_format',
	FORMATS: {
		STICKY_FOOTER: {
			SIZE: [728, 90],
			NAME: 'Sticky Footer',
			STYLES: {
				position: 'fixed',
				bottom: 0
			}
		}
	}
};

module.exports = commonConsts;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Pub-Sub module

var emitter = {
	events: {},
	publish: function publish(event, data) {
		if (this.events.hasOwnProperty(event)) {
			this.events[event].forEach(function (listener) {
				listener(data);
			});
		}
	},
	subscribe: function subscribe(event, listener) {
		if (!this.events.hasOwnProperty(event)) {
			this.events[event] = [];
		}
		this.events[event].push(listener);

		return {
			unsubscribe: function () {
				this.events[event].splice(this.events[event].indexOf(listener), 1);
			}.bind(this)
		};
	}
};

module.exports = emitter;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _commonConsts = __webpack_require__(3);

var _commonConsts2 = _interopRequireDefault(_commonConsts);

var _emitter = __webpack_require__(4);

var _emitter2 = _interopRequireDefault(_emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Events module

(function (w, ap) {
	ap.$(document).ready(function () {
		_emitter2.default.publish(_commonConsts2.default.EVENTS.DOM_LOAD, w);
	});

	ap.$(w).scroll(function (data) {
		_emitter2.default.publish(_commonConsts2.default.EVENTS.SCROLL, data);
	});

	// w.addEventListener(commonConsts.EVENTS.PAGE_LOAD, function(data) {
	// 	emitter.publish(commonConsts.EVENTS.PAGE_LOAD, data);
	// });
})(window, adpushup);

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (typeof Object.assign != 'function') {
	// Must be writable: true, enumerable: false, configurable: true
	Object.defineProperty(Object, 'assign', {
		value: function assign(target, varArgs) {
			// .length of function is 2
			'use strict';

			if (target == null) {
				// TypeError if undefined or null
				throw new TypeError('Cannot convert undefined or null to object');
			}

			var to = Object(target);

			for (var index = 1; index < arguments.length; index++) {
				var nextSource = arguments[index];

				if (nextSource != null) {
					// Skip over if undefined or null
					for (var nextKey in nextSource) {
						// Avoid bugs when hasOwnProperty is shadowed
						if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
			}
			return to;
		},
		writable: true,
		configurable: true
	});
}

/***/ })
]);