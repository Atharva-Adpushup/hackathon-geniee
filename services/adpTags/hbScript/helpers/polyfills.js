if (!Object.keys) {
	Object.keys = (function() {
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
			if ((typeof obj !== 'object' && typeof obj !== 'function') || obj === null)
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

if (!window.btoa) {
	var object = window;

	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	function InvalidCharacterError(message) {
		this.message = message;
	}
	InvalidCharacterError.prototype = new Error();
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	// encoder
	// [https://gist.github.com/999166] by [https://github.com/nignag]
	object.btoa = function(input) {
		var str = String(input);
		for (
			// initialize result and counter
			var block, charCode, idx = 0, map = chars, output = '';
			// if the next str index does not exist:
			//   change the mapping table to "="
			//   check if d has no fractional digits
			str.charAt(idx | 0) || ((map = '='), idx % 1);
			// "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
			output += map.charAt(63 & (block >> (8 - (idx % 1) * 8)))
		) {
			charCode = str.charCodeAt((idx += 3 / 4));
			if (charCode > 0xff) {
				throw new InvalidCharacterError(
					"'btoa' failed: The string to be encoded contains characters outside of the Latin1 range."
				);
			}
			block = (block << 8) | charCode;
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
	NodeList.prototype.forEach = function(callback, argument) {
		argument = argument || window;
		for (var i = 0; i < this.length; i++) {
			callback.call(argument, this[i], i, this);
		}
	};
}
