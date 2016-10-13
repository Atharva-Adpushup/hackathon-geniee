var $ = require('../third-party/jquery'),
	_ = require('../third-party/underscore');

module.exports = (function($, _) {
	$.ajaxSetup({ cache: false });
	var randomStore = [], Utils = {
		// taken from google clousre base class
		typeOf: function(value) {
			var s = typeof value;
			if (s == 'object') {
				if (value) {
					// Check these first, so we can avoid calling Object.prototype.toString if
					// possible.
					//
					// IE improperly marshals tyepof across execution contexts, but a
					// cross-context object will still return false for "instanceof Object".
					if (value instanceof Array) {
						return 'array';
					} else if (value instanceof Object) {
						return s;
					}

					// HACK: In order to use an Object prototype method on the arbitrary
					//   value, the compiler requires the value be cast to type Object,
					//   even though the ECMA spec explicitly allows it.
					var className = Object.prototype.toString.call(/** @type {Object} */(value));
					// In Firefox 3.6, attempting to access iframe window objects' length
					// property throws an NS_ERROR_FAILURE, so we need to special-case it
					// here.
					if (className == '[object Window]') {
						return 'object';
					}

					// We cannot always use constructor == Array or instanceof Array because
					// different frames have different Array objects. In IE6, if the iframe
					// where the array was created is destroyed, the array loses its
					// prototype. Then dereferencing val.splice here throws an exception, so
					// we can't use goog.isFunction. Calling typeof directly returns 'unknown'
					// so that will work. In this case, this function will return false and
					// most array functions will still work because the array is still
					// array-like (supports length and []) even though it has lost its
					// prototype.
					// Mark Miller noticed that Object.prototype.toString
					// allows access to the unforgeable [[Class]] property.
					//  15.2.4.2 Object.prototype.toString ( )
					//  When the toString method is called, the following steps are taken:
					//      1. Get the [[Class]] property of this object.
					//      2. Compute a string value by concatenating the three strings
					//         "[object ", Result(1), and "]".
					//      3. Return Result(2).
					// and this behavior survives the destruction of the execution context.
					if ((className == '[object Array]' ||
						// In IE all non value types are wrapped as objects across window
						// boundaries (not iframe though) so we have to do object detection
						// for this edge case.
						typeof value.length == 'number' &&
						typeof value.splice != 'undefined' &&
						typeof value.propertyIsEnumerable != 'undefined' && !value.propertyIsEnumerable('splice')

					)) {
						return 'array';
					}
					// HACK: There is still an array case that fails.
					//     function ArrayImpostor() {}
					//     ArrayImpostor.prototype = [];
					//     var impostor = new ArrayImpostor;
					// this can be fixed by getting rid of the fast path
					// (value instanceof Array) and solely relying on
					// (value && Object.prototype.toString.vall(value) === '[object Array]')
					// but that would require many more function calls and is not warranted
					// unless closure code is receiving objects from untrusted sources.

					// IE in cross-window calls does not correctly marshal the function type
					// (it appears just as an object) so we cannot use just typeof val ==
					// 'function'. However, if the object has a call property, it is a
					// function.
					if ((className == '[object Function]' ||
						typeof value.call != 'undefined' &&
						typeof value.propertyIsEnumerable != 'undefined' && !value.propertyIsEnumerable('call'))) {
						return 'function';
					}
				} else {
					return 'null';
				}
			} else if (s == 'function' && typeof value.call == 'undefined') {
				// In Safari typeof nodeList returns 'function', and on Firefox typeof
				// behaves similarly for HTML{Applet,Embed,Object}, Elements and RegExps. We
				// would like to return object for those and we can detect an invalid
				// function by making sure that the function object has a call method.
				return 'object';
			}
			return s;
		},
		isArray: function(val) {
			return this.typeOf(val) == 'array';
		},
		isString: function(val) {
			return typeof val == 'string';
		},
		isBoolean: function(val) {
			return typeof val == 'boolean';
		},
		isNumber: function(val) {
			return typeof val == 'number';
		},
		isFunction: function(val) {
			return this.typeOf(val) == 'function';
		},
		isObject: function(val) {
			var type = typeof val;
			return type == 'object' && val != null || type == 'function';
		},
		isNull: function(val) {
			return val === null;
		},
		isDefAndNotNull: function(val) {
			// Note that undefined == null.
			return val != null;
		},
		isDef: function(val) {
			return val !== undefined;
		},
		isValue: function(obj) {
			return !this.isObject(obj) && !this.isArray(obj);
		},
		existsInArray: function(arr, toTest) {
			if (this.isValue(toTest) && arr.indexOf(toTest) !== -1) {
				return arr.indexOf(toTest);
			}
			var existsAt = -1;
			$(arr).each(function(index, elem) {
				if (Utils.deepDiffMapper.test(elem, toTest).isChanged == false) {
					existsAt = index;
					return false;
				}
			});
			return existsAt;
		},
		deepDiffMapper: {
			VALUE_CREATED: 'created',
			VALUE_UPDATED: 'updated',
			VALUE_DELETED: 'deleted',
			VALUE_UNCHANGED: 'unchanged',
			OVERALL_CHANGED: false,
			CHANGES: { EDITED: [], DELETED: [], ADDED: [] },
			test: function(obj1, obj2) {
				this.OVERALL_CHANGED = false;
				this.CHANGES = { EDITED: [], DELETED: [], ADDED: [] };
				return { details: this.map(obj1, obj2, 'root'), isChanged: this.OVERALL_CHANGED, changes: this.CHANGES };
			},
			map: function(obj1, obj2, name) {
				if (Utils.isFunction(obj1) || Utils.isFunction(obj2)) {
					throw 'Invalid argument. Function given, object expected.';
				}
				if (Utils.isValue(obj1) || Utils.isValue(obj2)) {
					var a = this.compareValues(obj1, obj2, name);
					if (a !== this.VALUE_UNCHANGED && !this.OVERALL_CHANGED) {
						this.OVERALL_CHANGED = true;
					}
					return { type: a, data: obj1 || obj2 };
				}

				var diff = {};
				for (var key in obj1) {
					if (Utils.isFunction(obj1[key])) {
						continue;
					}
					var value2 = undefined;

					if (Utils.isDef(obj2[key]))
						value2 = obj2[key];

					diff[key] = this.map(obj1[key], value2, key);
				}
				for (var key in obj2) {
					if (Utils.isFunction(obj2[key]) || ('undefined' != typeof (diff[key]))) {
						continue;
					}
					diff[key] = this.map(undefined, obj2[key], key);
				}
				return diff;
			},
			compareValues: function(value1, value2, name) {
				if (value1 === value2) {
					return this.VALUE_UNCHANGED;
				}
				if (Utils.isDef(value1)) {
					this.CHANGES.ADDED.push({ name: value1 });
					return this.VALUE_CREATED;
				}
				if (Utils.isDef(value2)) {
					this.CHANGES.DELETED.push({ name: value2 });
					return this.VALUE_DELETED;
				}
				this.CHANGES.EDITED.push({ name: value2 });
				return this.VALUE_UPDATED;
			}
		},
		getRandomNumber: function() {
			var number = Math.floor(Math.random() * (100000 - 100 + 1)) + 100;
			var isThere = randomStore[number];
			if (isThere)
				this.getRandomNumber();
			else {
				randomStore[number] = 1;
				return number;
			}
		},
		bind: function(fn, self, args) {
			return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
		},
		pluckMany: function() {
			// get the property names to pluck
			var source = arguments[0];
			var propertiesToPluck = _.rest(arguments, 1);
			return _.map(source, function(item) {
				var obj = {};
				_.each(propertiesToPluck, function(property) {
					obj[property] = item[property];
				});
				return obj;
			});
		},
		removeDuplicate: function(oldArr) {
			return _.filter(oldArr, function(element, index) {
				// tests if the element has a duplicate in the rest of the array
				for (index += 1; index < oldArr.length; index += 1) {
					if (_.isEqual(element, oldArr[index])) {
						return false;
					}
				}
				return true;
			});
		},
		ValidUrl: function(str) {
			var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
				'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
				'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
				'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
				'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
				'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
			if (!pattern.test(str)) {
				return false;
			} else {
				return true;
			}
		},
		appendProtocolToUrl: function(url) {
			if (!/^https?:\/\//i.test(url)) {
				url = 'http://' + url;
			}
			return url;
		},
		parseUrl: function(url) {
			var parser = document.createElement('a');
			parser.href = this.appendProtocolToUrl(url);
			return parser;
			/*
			 "http://example.com:3000/pathname/?search=test#hash"
			 parser.protocol; // => "http:"
			 parser.hostname; // => "example.com"
			 parser.port;     // => "3000"
			 parser.pathname; // => "/pathname/"
			 parser.search;   // => "?search=test"
			 parser.hash;     // => "#hash"
			 parser.host;     // => "example.com:3000"*/
		},
		urlInfo: function(url) {
			var a = document.createElement('a');
			a.href = url;
			return {
				source: url,
				protocol: a.protocol.replace(':', ''),
				host: a.hostname,
				port: a.port,
				query: a.search,
				params: (function() {
					var ret = {},
						seg = a.search.replace(/^\?/, '').split('&'),
						len = seg.length, i = 0, s;
					for (; i < len; i++) {
						if (!seg[i]) { continue; }
						s = seg[i].split('=');
						ret[s[0]] = s[1];
					}
					return ret;
				})(),
				domain: (function() {
					url = url.replace(/(https?:\/\/)?(www.)?/i, '');
					url = url.split('.');
					url = url.slice(url.length - 2).join('.');
					if (url.indexOf('/') !== -1) {
						return url.split('/')[0];
					}
					return url;
				})(),
				hash: a.hash.replace('#', ''),
				path: a.pathname.replace(/^([^/])/, '/$1')
			};
		},
		sanitiseString: function(str) {
			return str.trim().toLowerCase();
		},
		trimString: function(str) {
			return str.trim();
		}
	};

	return Utils;
})($, _);
