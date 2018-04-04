var browserConfig = require('./browserConfig.js'),
	// eslint-disable-next-line no-undef
	$ = require('jquery'),
	dockify = require('./dockify'),
	//promise polyfill
	Base64 = require('Base64');
require('promise-polyfill/src/polyfill');

module.exports = {
	log: function() {
		var isQueryParams = !!(
				this.queryParams &&
				$.isPlainObject(this.queryParams) &&
				!$.isEmptyObject(this.queryParams)
			),
			isapDebugParam = !!(isQueryParams && this.queryParams.apDebug);

		if (typeof console !== 'undefined' && console.log && isapDebugParam) console.log.apply(console, arguments);
	},
	base64Encode: function(data) {
		return Base64.btoa(data);
	},
	base64Decode: function(data) {
		//Using this not polyfills because native and polyfills of decode don't provide unicode support
		return Base64.atob(data);
	},
	getCountry: function() {
		return new Promise(function(resolve, reject) {
			$.get('//e3.adpushup.com/IpLocationPublicWebService/GetLocationInfo', function(response) {
				if (response && response.data && response.data.country) {
					resolve(response.data.country);
					return;
				} else {
					resolve(null);
					return;
				}
			}).fail(function(err) {
				utils.log('Error in Geoapi', err);
				resolve(null);
			});
		});
	},
	// All feedback packets are generated from this function except event 2, 3 and 4.
	sendFeedback: function(options) {
		var adp = window.adpushup;

		return this.sendBeacon(adp.config.feedbackUrl, options, {
			method: 'image'
		});
	},
	getRandomNumberBetween: function(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
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
			keenIOImpressionConfig = {
				projectId: '5922a50995cfc9addc2480dd',
				apiKey: '40C0401741E18AFC5F17B722BA6371984333FDD0C36101019C7C107C1E1334B4'
			},
			keenIoFeedbackData,
			isEventTypeGenieeRevenue,
			keenIoImpressionFeedbackData,
			keenIoFeedbackUrl,
			keenIoImpressionFeedbackUrl;

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
			this.log('KeenIOImpressionRequest: Raw Feedback data: ', keenIoFeedbackData);

			if (keenIoFeedbackData.eventType === 1 && keenIoFeedbackData.ads && keenIoFeedbackData.xpathMiss) {
				keenIoFeedbackData.impressionCount = keenIoFeedbackData.ads.length;
				keenIoFeedbackData.xpathMissCount = keenIoFeedbackData.xpathMiss.length;

				if (keenIoFeedbackData.hasOwnProperty('pageGroup')) {
					keenIoFeedbackData.pageGroup = encodeURIComponent(keenIoFeedbackData.pageGroup);
				}
			}

			isEventTypeGenieeRevenue = !!(
				keenIoFeedbackData.eventType === 11 &&
				keenIoFeedbackData.variationId &&
				keenIoFeedbackData.adId &&
				keenIoFeedbackData.adSize &&
				keenIoFeedbackData.hasOwnProperty('revenue')
			);
			this.log('KeenIOImpressionRequest: Should impression request be sent? ', isEventTypeGenieeRevenue);

			// Keen IO 'Impression' collection integration
			if (isEventTypeGenieeRevenue) {
				keenIoImpressionFeedbackData = {
					success: true,
					data: {
						status: null,
						variationId: keenIoFeedbackData.variationId,
						placement: keenIoFeedbackData.containerId,
						containerId: keenIoFeedbackData.containerId,
						winningRevenue: keenIoFeedbackData.revenue,
						sectionId: keenIoFeedbackData.adId,
						winner: 'geniee',
						bids: [],
						pageGroup: encodeURIComponent(keenIoFeedbackData.pageGroup),
						platform: keenIoFeedbackData.platform,
						siteId: keenIoFeedbackData.siteId,
						timeout: null,
						timedOutBidders: [],
						type: null,
						size: keenIoFeedbackData.adSize
					}
				};

				try {
					keenIoImpressionFeedbackData = this.base64Encode(JSON.stringify(keenIoImpressionFeedbackData));
					keenIoImpressionFeedbackUrl =
						keenIOConfig.baseUrl +
						keenIOImpressionConfig.projectId +
						'/events/impression?api_key=' +
						keenIOImpressionConfig.apiKey +
						'&data=' +
						keenIoImpressionFeedbackData;
					this.log('KeenIOImpressionRequest: keenIoImpressionFeedbackUrl', keenIoImpressionFeedbackUrl);
					// TODO: Below KeenIO code is disabled temporarily, uncomment it and integration should work fine
					// new Image().src = keenIoImpressionFeedbackUrl;
					this.log('KeenIOImpressionRequest: Successfully sent impression request!');
				} catch (e) {}
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
				// TODO: Below KeenIO code is disabled temporarily, uncomment it and integration should work fine
				// new Image().src = keenIoFeedbackUrl;
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
	throttle: function(fn, threshhold, scope) {
		var last, deferTimer;
		return function() {
			var context = scope || this;

			var now = +new Date(),
				args = arguments;
			if (last && now < last + threshhold) {
				// hold on to it
				clearTimeout(deferTimer);
				deferTimer = setTimeout(function() {
					last = now;
					fn.apply(context, args);
				}, threshhold);
			} else {
				last = now;
				fn.apply(context, args);
			}
		};
	},
	removeUrlParameter: function(url, parameter) {
		// Snippet from https://stackoverflow.com/a/4893927
		var urlParts = url.split('?');

		if (urlParts.length >= 2) {
			// Get first part, and remove from array
			var urlBase = urlParts.shift();

			// Join it back up
			var queryString = urlParts.join('?');

			var prefix = encodeURIComponent(parameter) + '=';
			var parts = queryString.split(/[&;]/g);

			// Reverse iteration as may be destructive
			for (var i = parts.length; i-- > 0; ) {
				// Idiom for string.startsWith
				if (parts[i].lastIndexOf(prefix, 0) !== -1) {
					parts.splice(i, 1);
				}
			}

			if (Object.keys(this.queryParams).length >= 1) {
				url = urlBase + '?' + parts.join('&');
			} else {
				url = urlBase;
			}
		}

		if (url.charAt(url.length - 1) === '?') {
			return url.substr(0, url.length - 1);
		}

		return url;
	},
	getInteractiveAds: function(config) {
		var ads = null;

		if (config && config.experiment && config.platform && config.pageGroup && config.selectedVariation) {
			var variations = config.experiment[config.platform][config.pageGroup].variations,
				selectedVariation = config.selectedVariation;
			variations.forEach(function(variation) {
				if (variation.id === selectedVariation) {
					ads = variation.ads;
				}
			});
		}

		if (config.hasManualAds && window.adpushup.config.manualAds.length) {
			ads = window.adpushup.config.manualAds;
		}

		if (ads.length) {
			var interactiveAds = ads.filter(function(ad) {
				return ad && ad.formatData && ad.formatData.event;
			});

			return interactiveAds.length ? interactiveAds : null;
		}
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
	})(),
	dockify: dockify
};
