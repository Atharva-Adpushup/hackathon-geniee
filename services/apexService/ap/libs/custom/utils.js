var browserConfig = require('./browserConfig.js'),
	// eslint-disable-next-line no-undef
	$ = require('../third-party/jquery');

module.exports = {
	base64Decode: function(data) {
		if (window.atob) {
			return window.atob(data);
		}

		var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
			o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
			ac = 0,
			dec = '',
			tmpArr = [];

		if (!data) {
			return data;
		}

		data += '';

		do {
			h1 = b64.indexOf(data.charAt(i++));
			h2 = b64.indexOf(data.charAt(i++));
			h3 = b64.indexOf(data.charAt(i++));
			h4 = b64.indexOf(data.charAt(i++));

			bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

			o1 = bits >> 16 & 0xff;
			o2 = bits >> 8 & 0xff;
			o3 = bits & 0xff;

			if (h3 === 64) {
				tmpArr[ac++] = String.fromCharCode(o1);
			} else if (h4 === 64) {
				tmpArr[ac++] = String.fromCharCode(o1, o2);
			} else {
				tmpArr[ac++] = String.fromCharCode(o1, o2, o3);
			}
		} while (i < data.length);

		dec = tmpArr.join('');

		return decodeURIComponent(escape(dec.replace(/\0+$/, '')));
	},
	// All feedback packets are generated from this function except event 2, 3 and 4.
	sendFeedback: function(options) {
		var adp = window.adpushup;

		return this.sendBeacon(adp.config.feedbackUrl, options, {
			'method': 'image'
		});
	},

	uniqueId: function(appendNum) {
		var d = +new Date(),
			r, appendMe = ((!appendNum || (typeof appendNum === 'number' && appendNum < 0)) ? Number(1).toString(16) : Number(appendNum).toString(16));
		appendMe = ('0000000'.substr(0, 8 - appendMe.length) + appendMe).toUpperCase();
		return appendMe + '-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			r = ((d = Math.floor(d / 16)) + Math.random() * 16) % 16 | 0;
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	},
	loadScript: function(src, sC, fC) {
		var d = document,
			s = d.createElement('script');
		s.src = src;
		s.type = 'text/javascript';
		s.async = true;
		s.onerror = function() {
			if (typeof fC === 'function') {
				fC.call();
			}
		};
		if (typeof d.attachEvent === 'object') {
			s.onreadystatechange = function() {
				(s.readyState === 'loaded' || s.readyState === 'complete') ? (s.onreadystatechange = null && (typeof sC === 'function' ? sC.call() : null)) : null;
			};
		} else {
			s.onload = function() {
				(typeof sC === 'function' ? sC.call() : null);
			};
		}
		(d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s);
	},

	requestServer: function(url, data, timeout, method, beforeSendCallback) {
		$.support.cors = true;
		return $.ajax({
			url: url,
			data: data,
			timeout: timeout,
			type: method || 'GET',
			beforeSend: beforeSendCallback,
			dataType: 'jsonp',
			jsonpCallback: 'apCallback',
			crossDomain: true
		});
	},
	sendBeacon: function(url, data, options) {
		if (typeof url !== 'string' || typeof data !== 'object') {
			return false;
		}

		var toFeedback, request, evt,
			adpConfig = window.adpushup.config;

		data.packetId = adpConfig.packetId;
		data.siteId = adpConfig.siteId;
		data.pageGroup = adpConfig.pageGroup;
		data.platform = adpConfig.platform;
		data.url = adpConfig.pageUrl;

		if (!data.packetId || !data.siteId) {
			if (console && console.log()) {
				console.log('Required params for feedback missing');
			}
			return false;
		}

		options = options || {};

		data = this.objToUrl(data);

		toFeedback = url + '?ts=' + (+new Date()) + data;

		if (options.method === 'image') {
			new Image().src = toFeedback;
			return true;
		}

		switch (browserConfig.dataSendingMethod) {
			case 'sendBeacon':
				request = navigator.sendBeacon(toFeedback);
				!request && (new Image().src = toFeedback);
				break;
			case 'ping':
				if (document.createEvent !== 'undefined') {
					try {
						evt = document.createEvent('MouseEvent');
						evt.initMouseEvent('click', true, true, window, 0,
							0, 0, 0, 0,
							false, false, false, false,
							0, null);
						browserConfig.$pingEl.attr('ping', toFeedback).get(0).dispatchEvent(evt);
					} catch (e) { } // eslint-disable-line no-empty
				} else {
					new Image().src = toFeedback;
				}
				break;
			default:
				new Image().src = toFeedback;
		}
		return true;
	},
	objToUrl: function(obj) {
		if (typeof obj !== 'object') {
			return false;
		}
		var data = '', i;
		for (i in obj) {
			if (obj.hasOwnProperty(i)) {
				data += '&' + i + '=' + obj[i];
			}
		}
		return data;
	},
	queryParams: (function() {
		var str = window.location.search, objURL = {};
		str.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), function($0, $1, $2, $3) {
			objURL[$1] = $3;
		});
		return objURL;
	})()
};

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
				Noop = function() { },
				fBound = function() {
					return fToBind.apply(this instanceof Noop ? this : oThis,
						aArgs.concat(Array.prototype.slice.call(arguments)));
				};

			Noop.prototype = this.prototype;
			fBound.prototype = new Noop();

			return fBound;
		};
	}
})();

if (!Object.keys) {
	Object.keys = (function() {
		'use strict';
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

		return function(obj) {
			if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [], prop, i;

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
	}());
}
