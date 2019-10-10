import _ from 'lodash';
import $ from 'jquery';
import uuid from 'uuid';

$.ajaxSetup({ cache: false });
const randomStore = [],
	Utils = {
		// taken from google clousre base class
		typeOf(value) {
			const s = typeof value;
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
					const className = Object.prototype.toString.call(/** @type {Object} */ (value));
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
					if (
						className == '[object Array]' ||
						// In IE all non value types are wrapped as objects across window
						// boundaries (not iframe though) so we have to do object detection
						// for this edge case.
						(typeof value.length == 'number' &&
							typeof value.splice != 'undefined' &&
							typeof value.propertyIsEnumerable != 'undefined' &&
							!value.propertyIsEnumerable('splice'))
					) {
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
					if (
						className == '[object Function]' ||
						(typeof value.call != 'undefined' &&
							typeof value.propertyIsEnumerable != 'undefined' &&
							!value.propertyIsEnumerable('call'))
					) {
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
		isArray(val) {
			return this.typeOf(val) == 'array';
		},
		isString(val) {
			return typeof val == 'string';
		},
		isBoolean(val) {
			return typeof val == 'boolean';
		},
		isNumber(val) {
			return typeof val == 'number';
		},
		isFunction(val) {
			return this.typeOf(val) == 'function';
		},
		isObject(val) {
			const type = typeof val;
			return (type == 'object' && val != null) || type == 'function';
		},
		isNull(val) {
			return val === null;
		},
		isDefAndNotNull(val) {
			// Note that undefined == null.
			return val != null;
		},
		isDef(val) {
			return val !== undefined;
		},
		isValue(obj) {
			return !this.isObject(obj) && !this.isArray(obj);
		},
		existsInArray(arr, toTest) {
			if (this.isValue(toTest) && arr.indexOf(toTest) !== -1) {
				return arr.indexOf(toTest);
			}
			let existsAt = -1;
			$(arr).each((index, elem) => {
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
			test(obj1, obj2) {
				this.OVERALL_CHANGED = false;
				this.CHANGES = { EDITED: [], DELETED: [], ADDED: [] };
				return {
					details: this.map(obj1, obj2, 'root'),
					isChanged: this.OVERALL_CHANGED,
					changes: this.CHANGES
				};
			},
			map(obj1, obj2, name) {
				if (Utils.isFunction(obj1) || Utils.isFunction(obj2)) {
					throw 'Invalid argument. Function given, object expected.';
				}
				if (Utils.isValue(obj1) || Utils.isValue(obj2)) {
					const a = this.compareValues(obj1, obj2, name);
					if (a !== this.VALUE_UNCHANGED && !this.OVERALL_CHANGED) {
						this.OVERALL_CHANGED = true;
					}
					return { type: a, data: obj1 || obj2 };
				}

				const diff = {};
				for (var key in obj1) {
					if (Utils.isFunction(obj1[key])) {
						continue;
					}
					let value2;

					if (Utils.isDef(obj2[key])) {
						value2 = obj2[key];
					}

					diff[key] = this.map(obj1[key], value2, key);
				}
				for (var key in obj2) {
					if (Utils.isFunction(obj2[key]) || typeof diff[key] != 'undefined') {
						continue;
					}
					diff[key] = this.map(undefined, obj2[key], key);
				}
				return diff;
			},
			compareValues(value1, value2, name) {
				if (value1 === value2) {
					return this.VALUE_UNCHANGED;
				}
				if (Utils.isDef(value1)) {
					this.CHANGES.ADDED.push({ name: value1, info: { key: name, value: value1 } });
					return this.VALUE_CREATED;
				}
				if (Utils.isDef(value2)) {
					this.CHANGES.DELETED.push({ name: value2, info: { key: name, value: value2 } });
					return this.VALUE_DELETED;
				}
				this.CHANGES.EDITED.push({ name: value2, info: { key: name, value: value2 } });
				return this.VALUE_UPDATED;
			}
		},
		getRandomNumber() {
			return uuid.v4();
		},
		bind(fn, self, args) {
			return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
		},
		stringReverse(s) {
			return s
				.split('')
				.reverse()
				.join('');
		},
		pluckMany() {
			// get the property names to pluck
			const source = arguments[0];
			const propertiesToPluck = _.rest(arguments, 1);
			return _.map(source, item => {
				const obj = {};
				_.each(propertiesToPluck, property => {
					obj[property] = item[property];
				});
				return obj;
			});
		},
		removeDuplicate(oldArr) {
			return _.filter(oldArr, (element, index) => {
				// tests if the element has a duplicate in the rest of the array
				for (index += 1; index < oldArr.length; index += 1) {
					if (_.isEqual(element, oldArr[index])) {
						return false;
					}
				}
				return true;
			});
		},
		ValidUrl(str) {
			const pattern = new RegExp(
				'^(https?:\\/\\/)?' + // protocol
				'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
				'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
				'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
				'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
					'(\\#[-a-z\\d_]*)?$',
				'i'
			); // fragment locator
			if (!pattern.test(str)) {
				return false;
			} else {
				return true;
			}
		},
		appendProtocolToUrl(url) {
			if (!/^https?:\/\//i.test(url)) {
				url = `http://${url}`;
			}
			return url;
		},
		parseUrl(url) {
			const parser = document.createElement('a');
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
		urlInfo(url) {
			const a = document.createElement('a');
			a.href = url;
			return {
				source: url,
				protocol: a.protocol.replace(':', ''),
				host: a.hostname,
				port: a.port,
				query: a.search,
				params: (function() {
					let ret = {},
						seg = a.search.replace(/^\?/, '').split('&'),
						len = seg.length,
						i = 0,
						s;
					for (; i < len; i++) {
						if (!seg[i]) {
							continue;
						}
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
		sanitiseString(str) {
			return str.trim().toLowerCase();
		},
		trimString(str) {
			return str.trim();
		},
		dom: {
			isElementInFirstFold($el) {
				const windowHeight = $(window).height(),
					elTop = $el.offset().top;

				return !!(windowHeight > elTop);
			},
			getElementBounds(w) {
				const rect = w.get(0).getBoundingClientRect();
				return {
					bottom: rect.bottom,
					left: rect.left,
					right: rect.right,
					top: rect.top < 0 ? 0 : rect.top,
					width: rect.width,
					height: rect.width
				};
			},
			getElementRelativeBounds(w) {
				const q = w.offset(),
					p = q.left,
					y = q.top,
					x = w.outerWidth(!1),
					v = w.outerHeight(!1),
					u = {
						bottom: y + v,
						left: p,
						right: p + x,
						top: y,
						width: x,
						height: v
					};
				return u;
			},
			getViewPort() {
				const o = Math.max($(window).height(), $(document).height()),
					n = $(window).width();
				return {
					height: o,
					width: n
				};
			}
		},
		ui: {
			getElementSelectorCords($el) {
				const w = $el.offset().top,
					p = $el.offset().left,
					y = $el.outerHeight(),
					o = $el.outerWidth(),
					v = Utils.dom.getViewPort(),
					x = p + o;
				return {
					BOTTOM: {
						top: w + y,
						left: 0,
						height: v.height - (y + w),
						width: '100%'
					},
					TOP: {
						top: 0,
						left: 0,
						height: w,
						width: '100%'
					},
					LEFT: {
						top: w,
						left: 0,
						width: p,
						height: y
					},
					RIGHT: {
						top: w,
						left: x,
						width: v.width - x,
						height: y
					}
				};
			},
			outerMenuRenderPosition($el) {
				return Utils.dom.getElementRelativeBounds($el);
			},
			menuRenderPosition($target, context) {
				const contextTop = context.top,
					contextLeft = context.left,
					contextRight = context.right,
					vP = Utils.dom.getViewPort(),
					targetWidth = $target.width(),
					targetHeight = $target.find('.MenuBarComponentWrap > div:visible').height(),
					windowHeight = $(window).height(),
					rightSpace = vP.width - contextRight,
					variationBarHeight = $('#variationManager').height(),
					$menuBarList = $('.js-menuBar > .js-menuBar-wrapper'),
					isArrowMenu = $menuBarList.hasClass('js-arrow'),
					arrowMenuLeft = contextLeft + (context.width / 2 - $menuBarList.width() / 2),
					arrowMenuTop = contextTop + context.height + 7;

				let top, left;

				if (rightSpace >= targetWidth) {
					// If menu has an arrow, then menu left offset will be
					// the addition of context element (left and half of width) and subtraction of menu bar list(half of width)
					// Else, left offset will be the context element right
					left = isArrowMenu ? arrowMenuLeft : contextRight;
				} else if (contextLeft >= targetWidth) {
					left = contextLeft - targetWidth - 30;
				} else {
					//some wierd issue creating 30 px wrong calulation so manually substracting
					left = contextRight - (targetWidth - rightSpace) - 30;
				}

				if (windowHeight - contextTop >= targetHeight) {
					// If menu has an arrow, then menu top offset will be
					// the addition of context element (top, half of height) and menu bar list (arrow height)
					// Else, top offset will be the context element top
					top = isArrowMenu ? arrowMenuTop : contextTop;
				} else {
					//substraction 20px as agai some calculation bug creating 20px difference in position
					top = windowHeight - targetHeight - variationBarHeight - 20;
				}

				return { top, left };
			}
		},
		queryParams: function() {
			const str = window.location.search,
				objURL = {};

			str.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), ($0, $1, $2, $3) => {
				objURL[$1] = window.decodeURIComponent($3.replace(/\+/g, ' '));
			});
			return objURL;
		},
		ajax: params => {
			const { method, url, data } = params;

			return new Promise((resolve, reject) => {
				$.ajax({
					method,
					url,
					headers: { 'Content-Type': 'application/json' },
					data,
					contentType: 'json',
					dataType: 'json',
					success: res => {
						return resolve(res);
					},
					fail: res => {
						return reject(res);
					}
				});
			});
		},
		isMultipleAdSizeWithNonSupportedNetwork: (ad, adNetwork, iabSizes) => {
			const { multipleAdSizes } = ad;
			const { MULTIPLE_AD_SIZES_SUPPORTED_NETWORKS: supportedNetworks } = iabSizes;
			const isMultipleAdSizes = !!(multipleAdSizes && multipleAdSizes.length);
			const isNonSupportedNetwork = !!(supportedNetworks.indexOf(adNetwork) === -1);
			const isValid = !!(ad && adNetwork && isMultipleAdSizes && isNonSupportedNetwork);

			return isValid;
		},
		updateMultipleAdSizes: (ad, inputData, iabSizes, ref) => {
			const {
				networkData: { multipleAdSizes }
			} = inputData;
			const isMultipleAdSizesInInputData = Array.isArray(multipleAdSizes);
			// Below 'isMultipleAdSizeWithNonSupportedNetwork' check is added to ensure that ad 'multipleAdSizes' property
			// value gets null if ad network gets changed to a non-supported (like adsense, medianet, custom etc) one.
			const isMultipleAdSizeWithNonSupportedNetwork = Utils.isMultipleAdSizeWithNonSupportedNetwork(
				ad,
				inputData.network,
				iabSizes
			);

			if (isMultipleAdSizeWithNonSupportedNetwork) {
				return ref.props.updateMultipleAdSizes(ad.id, null);
			} else if (isMultipleAdSizesInInputData) {
				return ref.props.updateMultipleAdSizes(ad.id, multipleAdSizes);
			}
		}
	};

// Initialise query params closure
Utils.queryParams();

export default Utils;
