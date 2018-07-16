require('promise-polyfill/src/polyfill');

if (!Object.keys) {
	Object.keys = (function() {
		'use strict';
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !{ toString: null }.propertyIsEnumerable('toString'),
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

		return function(obj) {
			if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [],
				prop,
				i;

			for (prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	})();
}

if (!Object.values) {
	Object.values = function(obj) {
		var vals = [];
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				vals.push(obj[key]);
			}
		}
		return vals;
	};
}

if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

if (window.NodeList && !NodeList.prototype.forEach) {
	NodeList.prototype.forEach = function(callback, argument) {
		argument = argument || window;
		for (var i = 0; i < this.length; i++) {
			callback.call(argument, this[i], i, this);
		}
	};
}

(function() {
	if (!Function.prototype.bind) {
		// eslint-disable-next-line no-extend-native
		Function.prototype.bind = function(oThis) {
			if (typeof this !== 'function') {
				// closest thing possible to the ECMAScript 5
				// internal IsCallable function
				throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
			}

			var aArgs = Array.prototype.slice.call(arguments, 1),
				fToBind = this,
				Noop = function() {},
				fBound = function() {
					return fToBind.apply(
						this instanceof Noop ? this : oThis,
						aArgs.concat(Array.prototype.slice.call(arguments))
					);
				};

			Noop.prototype = this.prototype;
			fBound.prototype = new Noop();

			return fBound;
		};
	}
})();
