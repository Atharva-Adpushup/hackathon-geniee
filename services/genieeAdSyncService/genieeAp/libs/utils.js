var browserConfig = require('./browserConfig.js'),
	// eslint-disable-next-line no-undef
	$ = require('jquery'),
	Base64 = require('Base64');

module.exports = {
	base64Encode: function(data) {
		return Base64.btoa(data);
	},
	base64Decode: function(data) {
		return Base64.atob(data);
	},
	// All feedback packets are generated from this function except event 2, 3 and 4.
	sendFeedback: function(options) {
		var adp = window.adpushup;

		return this.sendBeacon(adp.config.feedbackUrl, options, {
			method: 'image'
		});
	},

	uniqueId: function(appendNum) {
		var d = +new Date(),
			r,
			appendMe =
				!appendNum || (typeof appendNum === 'number' && appendNum < 0)
					? Number(1).toString(16)
					: Number(appendNum).toString(16);
		appendMe = ('0000000'.substr(0, 8 - appendMe.length) + appendMe).toUpperCase();
		return (
			appendMe +
			'-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				r = (((d = Math.floor(d / 16)) + Math.random() * 16) % 16) | 0;
				return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
			})
		);
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
				s.readyState === 'loaded' || s.readyState === 'complete'
					? (s.onreadystatechange = null && (typeof sC === 'function' ? sC.call() : null))
					: null;
			};
		} else {
			s.onload = function() {
				typeof sC === 'function' ? sC.call() : null;
			};
		}
		(d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s);
	},
	runScript: function(str) {
		var d = document,
			script = d.createElement('script');
		script.type = 'text/javascript';
		script.text = str;
		script.html = str;
		(d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(script);
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

		var toFeedback,
			request,
			evt,
			adpConfig = window.adpushup.config,
			keenIOConfig = {
				baseUrl: 'https://api.keen.io/3.0/projects/',
				projectId: '592298b0be8c3e260bcadfbc',
				apiKey: '49857281FFEEDDB5784689357D4B429D682B7FE67D6D94631494D1DD1B5E5B24'
			},
			keenIoFeedbackData,
			keenIoFeedbackUrl;

		data.packetId = adpConfig.packetId;
		data.siteId = adpConfig.siteId;
		data.pageGroup = adpConfig.pageGroup;
		data.platform = adpConfig.platform;
		data.url = adpConfig.pageUrl;
		data.isGeniee = adpConfig.isGeniee || false;

		if (!data.packetId || !data.siteId) {
			if (console && console.log()) {
				console.log('Required params for feedback missing');
			}
			return false;
		}

		// Keen IO integration start
		if (data.eventType && (data.eventType === 1 || data.eventType === 3 || data.eventType === 11)) {
			keenIoFeedbackData = $.extend(true, {}, data);
			keenIoFeedbackData.ts = +new Date();

			if (keenIoFeedbackData.eventType === 1 && keenIoFeedbackData.ads && keenIoFeedbackData.xpathMiss) {
				keenIoFeedbackData.impressionCount = keenIoFeedbackData.ads.length;
				keenIoFeedbackData.xpathMissCount = keenIoFeedbackData.xpathMiss.length;

				if (keenIoFeedbackData.hasOwnProperty('pageGroup')) {
					keenIoFeedbackData.pageGroup = encodeURIComponent(keenIoFeedbackData.pageGroup);
				}
			}

			try {
				keenIoFeedbackData = this.base64Encode(JSON.stringify(keenIoFeedbackData));
				keenIoFeedbackUrl =
					keenIOConfig.baseUrl +
					keenIOConfig.projectId +
					'/events/pageviews?api_key=' +
					keenIOConfig.apiKey +
					'&data=' +
					keenIoFeedbackData;
				new Image().src = keenIoFeedbackUrl;
			} catch (e) {}
		}

		options = options || {};

		data = this.objToUrl(data);

		toFeedback = url + '?ts=' + +new Date() + data;

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
						evt.initMouseEvent(
							'click',
							true,
							true,
							window,
							0,
							0,
							0,
							0,
							0,
							false,
							false,
							false,
							false,
							0,
							null
						);
						browserConfig.$pingEl
							.attr('ping', toFeedback)
							.get(0)
							.dispatchEvent(evt);
					} catch (e) {} // eslint-disable-line no-empty
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
		var data = '',
			i;
		for (i in obj) {
			if (obj.hasOwnProperty(i)) {
				data += '&' + i + '=' + obj[i];
			}
		}
		return data;
	},
	getObjectByName: function(collection, name) {
		var isInCollection = false,
			objectConfig = { index: -1, name: name };

		if (collection && collection.length && name) {
			$.each(collection, function(idx, obj) {
				if (name === obj.name) {
					isInCollection = true;
					objectConfig.index = idx;
					objectConfig.obj = $.extend(true, {}, obj);
				}
			});

			return isInCollection ? objectConfig : isInCollection;
		}

		return isInCollection;
	},
	queryParams: (function() {
		var str = window.location.search,
			objURL = {};

		str.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), function($0, $1, $2, $3) {
			var queryStringKey = $1 || '',
				queryStringValue = $3 || '';

			objURL[queryStringKey] = window.decodeURIComponent(queryStringValue.replace(/\+/g, ' '));
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
