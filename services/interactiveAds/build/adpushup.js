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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// Common constants

var commonConsts = {
	EVENTS: {
		PAGE_LOAD: 'load',
		DOM_LOAD: 'DOMContentLoaded'
	},
	DEFAULT_NODE_TYPE: 'div',
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

// Interactive ads main module

var commconConsts = __webpack_require__(0),
	emitter = __webpack_require__(2),
	events = __webpack_require__(3),
	adFormats = __webpack_require__(4);

events.onPageLoad(function(data) {
	emitter.publish(commconConsts.EVENTS.PAGE_LOAD, data);
});

var pageLoadEvent = emitter.subscribe(commconConsts.EVENTS.PAGE_LOAD, function(data) {
	//console.log(data);
	adFormats.createSitckyFooter([728, 90], '728x90');
});

//pageLoadEvent.unsubscribe();


/***/ }),
/* 2 */
/***/ (function(module, exports) {

// Pub-Sub module

var emitter = {
	events: {},
	publish: function(event, data) {
		if (this.events.hasOwnProperty(event)) {
			this.events[event].forEach(function(listener) {
				listener(data);
			});
		}
	},
	subscribe: function(event, listener) {
		if (!this.events.hasOwnProperty(event)) {
			this.events[event] = [];
		}
		this.events[event].push(listener);

		return {
			unsubscribe: function() {
				this.events[event].splice(this.events[event].indexOf(listener), 1);
			}.bind(this)
		};
	}
};

module.exports = emitter;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// Events module

var commonConsts = __webpack_require__(0),
	events = {
		onPageLoad: function(callback) {
			window.addEventListener(commonConsts.EVENTS.PAGE_LOAD, function(event) {
				return callback(event);
			});
		}
	};

module.exports = events;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// Ad formats module

var commonConsts = __webpack_require__(0),
	utils = __webpack_require__(5),
	checkAdFormat = function(format, size, adCode) {
		if (!adCode) {
			console.warn('No ad code provided in ' + format.NAME + ' format. Ad could not be created.');
			return false;
		}

		if (!size || size.length !== 2) {
			console.warn('Size format is incorrect in ' + format.NAME + ' format, applying default size.');
			size = format.SIZE;
		}

		return size;
	},
	adFormats = {
		createSitckyFooter: function(size, adCode) {
			var format = commonConsts.FORMATS.STICKY_FOOTER,
				formatSize = checkAdFormat(format, size, adCode);

			if (formatSize) {
				var styles = Object.assign(commonConsts.FORMATS.STICKY_FOOTER.STYLES, {
						width: formatSize[0],
						height: formatSize[1]
					}),
					attrs = {
						className: commonConsts.DEFAULT_FORMAT_CLASSNAME
					},
					stickyFooter = utils.createDOMNode('div', styles, attrs, adCode);

				document.body.appendChild(stickyFooter);
			}
		}
	};

module.exports = adFormats;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// Common utilities

var commonConsts = __webpack_require__(0),
	utils = {
		createDOMNode: function(type, styles, attrs, innerHTML) {
			var node = document.createElement(type || commonConsts.DEFAULT_NODE_TYPE);

			for (var property in styles) {
				node.style[property] = styles[property];
			}

			for (var attr in attrs) {
				node[attr] = attrs[attr];
			}

			node.innerHTML = innerHTML;
			return node;
		}
	};

module.exports = utils;


/***/ })
/******/ ]);