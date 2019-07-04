var browserConfig = require('./browserConfig.js'),
	// eslint-disable-next-line no-undef
	$ = require('./jquery'),
	dockify = require('./dockify'),
	commonConsts = require('../config/commonConsts'),
	Base64 = require('Base64');

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
				}
				resolve(null);
				return;
			}).fail(function(err) {
				utils.log('Error in Geoapi', err);
				resolve(null);
			});
		});
	},
	// All feedback packets are generated from this function except event 2, 3 and 4.
	sendFeedback: function(options) {
		var adp = window.adpushup;

		return this.sendBeacon(
			adp.config.feedbackUrl,
			options,
			{
				method: 'image'
			},
			commonConsts.BEACON_TYPE.AD_FEEDBACK
		);
	},
	sendFeedbackOld: function(options) {
		var adp = window.adpushup;

		return this.sendBeaconOld(adp.config.feedbackUrlOld, options, {
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
				r = ((d = Math.floor(d / 16)) + Math.random() * 16) % 16 | 0;
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
	requestServer: function(url, data, timeout, method, dataType, contentType) {
		$.support.cors = true;
		return $.ajax({
			url: url,
			data: data,
			timeout: timeout,
			type: method || 'GET',
			dataType: dataType || 'jsonp',
			contentType: contentType || 'application/json; charset=utf-8',
			jsonpCallback: 'apCallback',
			crossDomain: true
		});
	},
	getNetworkAdUnitIdForAd: function(ad) {
		switch (ad.network) {
			case commonConsts.NETWORKS.ADPTAGS:
				return ad.networkData.dfpAdunit;
			case commonConsts.NETWORKS.ADSENSE:
			case commonConsts.NETWORKS.ADX:
			case commonConsts.NETWORKS.MEDIANET:
				return ad.networkData.adunitId;
			default:
				return null;
		}
	},
	isHBActiveForAd: function(ad) {
		if (ad.network && ad.network === commonConsts.NETWORKS.ADPTAGS) {
			if (ad.networkData && ad.networkData.headerBidding) {
				return ad.networkData.headerBidding;
			}
			return false;
		}
		return false;
	},
	fireImagePixel: function(src) {
		var imgEl = document.createElement('img');
		imgEl.src = src;
	},
	sendBeaconOld: function(url, data, options) {
		if (typeof url !== 'string' || typeof data !== 'object') {
			return false;
		}

		var toFeedback,
			request,
			evt,
			adpConfig = window.adpushup.config,
			newFeedback = {};

		if (data.newFeedbackAdObj) {
			newFeedback = {
				packetId: adpConfig.packetId,
				siteId: adpConfig.siteId,
				siteDomain: adpConfig.siteDomain,
				url: adpConfig.pageUrl,
				mode: data.mode, // Denotes which mode is running (adpushup or fallback)
				errorCode: data.eventType, // Denotes the error code (no error, pagegroup not found etc.)
				pageGroup: adpConfig.pageGroup,
				pageVariationId: adpConfig.selectedVariation,
				pageVariationName: adpConfig.selectedVariationName,
				pageVariationType: adpConfig.selectedVariationType,
				platform: adpConfig.platform,
				isGeniee: adpConfig.isGeniee || false,
				sections:
					data.newFeedbackAdObj.ads && data.newFeedbackAdObj.ads.length
						? data.newFeedbackAdObj.ads.map(
								function(ad) {
									if (this.isHBActiveForAd(ad)) {
										ad.services.push(commonConsts.SERVICES.HB);
									}

									return {
										sectionId: ad.isManual ? ad.originalId : ad.id,
										sectionName: ad.sectionName,
										status: ad.status,
										network: ad.network,
										networkAdUnitId: this.getNetworkAdUnitIdForAd(ad),
										services: ad.services
									};
								}.bind(this)
						  )
						: null
			};
			data.newFeedback = this.base64Encode(JSON.stringify(newFeedback));
		}

		delete data.newFeedbackAdObj;
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

		options = options || {};

		data = this.objToUrl(data);

		toFeedback = url + '?ts=' + +new Date() + data;

		if (options.method === 'image') {
			this.fireImagePixel(toFeedback);
			return true;
		}

		switch (browserConfig.dataSendingMethod) {
			case 'sendBeacon':
				request = navigator.sendBeacon(toFeedback);
				!request && this.fireImagePixel(toFeedback);
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
					this.fireImagePixel(toFeedback);
				}
				break;
			default:
				this.fireImagePixel(toFeedback);
		}
		return true;
	},
	sendBeacon: function(url, data, options, beaconType) {
		var toFeedback,
			request,
			evt,
			adpConfig = window.adpushup.config;

		if (beaconType === commonConsts.BEACON_TYPE.AD_FEEDBACK) {
			if (typeof url !== 'string' || typeof data !== 'object') {
				return false;
			}

			var feedbackObj = {
				createdTS: +new Date(),
				packetId: adpConfig.packetId,
				siteId: adpConfig.siteId,
				siteDomain: adpConfig.siteDomain,
				url: adpConfig.pageUrl,
				mode: data.mode, // Denotes which mode is running (adpushup or fallback)
				errorCode: data.eventType, // Denotes the error code (no error, pagegroup not found etc.)
				pageGroup: adpConfig.pageGroup,
				pageVariationId: adpConfig.selectedVariation,
				pageVariationName: adpConfig.selectedVariationName,
				pageVariationType: adpConfig.selectedVariationType,
				platform: adpConfig.platform,
				isGeniee: adpConfig.isGeniee || false,
				sections:
					data.ads && data.ads.length
						? data.ads.map(
								function(ad) {
									if (this.isHBActiveForAd(ad)) {
										ad.services.push(commonConsts.SERVICES.HB);
									}

									return {
										sectionId: ad.isManual ? ad.originalId : ad.id,
										sectionName: ad.sectionName,
										status: ad.status,
										network: ad.network,
										networkAdUnitId: this.getNetworkAdUnitIdForAd(ad),
										services: ad.services
									};
								}.bind(this)
						  )
						: null
			};

			if (!feedbackObj.packetId || !feedbackObj.siteId) {
				if (console && console.log()) {
					console.log('Required params for feedback missing');
				}
				return false;
			}

			data = this.base64Encode(JSON.stringify(feedbackObj));
			toFeedback = url + data;

			options = options || {};
			if (options.method === 'image') {
				this.fireImagePixel(toFeedback);
				return true;
			}
		} else {
			toFeedback = url;
		}

		switch (browserConfig.dataSendingMethod) {
			case 'sendBeacon':
				request = navigator.sendBeacon(toFeedback);
				!request && this.fireImagePixel(toFeedback);
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
					this.fireImagePixel(toFeedback);
				}
				break;
			default:
				this.fireImagePixel(toFeedback);
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
	rightTrim: function(string, s) {
		return string ? string.replace(new RegExp(s + '*$'), '') : '';
	},
	domanize: function(domain) {
		return domain
			? this.rightTrim(
					domain
						.replace('http://', '')
						.replace('https://', '')
						.replace('www.', ''),
					'/'
			  )
			: '';
	},
	isUrlMatching: function() {
		var config = window.adpushup.config,
			url = this.domanize(config.siteDomain);
		return window.location.href.indexOf(url) !== -1 ? true : false;
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
	getUrlObject: function(url) {
		var link = document.createElement('a'),
			computedObject = {};

		link.href = url;
		computedObject.href = link.href;
		computedObject.protocol = link.protocol;
		computedObject.host = link.host;
		computedObject.hostname = link.hostname;
		computedObject.port = link.port;
		computedObject.pathname = link.pathname;
		computedObject.search = link.search;
		computedObject.hash = link.hash;
		computedObject.origin = link.origin;

		return computedObject;
	},
	removeUrlParameter: function(url, parameter) {
		// Code Snippet from https://stackoverflow.com/a/4893927
		// Added custom url hash functionality
		var urlParts = url.split('?'),
			originalUrlObject = this.getUrlObject(url),
			hasOriginalUrlHash = !!(originalUrlObject && originalUrlObject.hash),
			computedUrlObject,
			hasComputedUrlHash,
			isNoUrlHashAfterComputation;

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
			url = url.substr(0, url.length - 1);
		}

		computedUrlObject = this.getUrlObject(url);
		hasComputedUrlHash = !!(computedUrlObject && computedUrlObject.hash);
		isNoUrlHashAfterComputation = !!(hasOriginalUrlHash && !hasComputedUrlHash);

		if (isNoUrlHashAfterComputation) {
			url += originalUrlObject.hash;
		}

		return url;
	},
	getInteractiveAds: function(config) {
		var ads = [];

		if (config && config.experiment && config.platform && config.pageGroup && config.selectedVariation) {
			var variations = config.experiment[config.platform][config.pageGroup].variations,
				selectedVariation = config.selectedVariation;
			variations.forEach(function(variation) {
				if (variation.id === selectedVariation) {
					ads = variation.ads;
				}
			});
		}

		if (config.manualModeActive && window.adpushup.config.manualAds.length) {
			ads = ads.concat(window.adpushup.config.manualAds);
		}

		return this.filterInteractiveAds(ads);
	},
	filterInteractiveAds: function(ads, isInnovative, channel) {
		return ads && ads.length
			? ads.filter(function(ad) {
					var channelValid = isInnovative && ad.pagegroups ? ad.pagegroups.indexOf(channel) !== -1 : true;
					return channelValid && ad.formatData && ad.formatData.event;
			  })
			: [];
	},
	getViewport: function() {
		var $w = $(window);
		return {
			left: $w.scrollLeft(),
			top: $w.scrollTop(),
			right: $w.scrollLeft() + (window.innerWidth || $w.width()),
			bottom: $w.scrollTop() + (window.innerHeight || $w.height())
		};
	},
	isElementInViewport: function(el, threshhold) {
		var $el = $(el),
			adTop = $el.offset().top,
			viewPort = this.getViewport(),
			adBottom = adTop + $el.height(),
			finalTop,
			finalBottom;

		finalTop = adTop - viewPort.top;
		finalBottom = viewPort.bottom - adBottom;
		if (finalTop > 0 && finalBottom > 0) {
			return { inViewHeight: $el.height() };
		} else if (finalTop <= 0 && adBottom > viewPort.top && adBottom < viewPort.bottom) {
			return { inViewHeight: $el.height() + finalTop };
		} else if (finalTop > 0 && adTop > viewPort.top && adTop < viewPort.bottom) {
			return { inViewHeight: $el.height() + finalBottom };
		} else if (threshhold) {
			return Math.abs(adTop - viewPort.bottom) <= threshhold || Math.abs(adBottom - viewPort.top) <= threshhold;
		}
		return false;
	},
	checkElementInViewPercent: function(el) {
		if (document.hasFocus()) {
			var $el = $(el),
				elHeight = $el.height(),
				elWidth = $el.width(),
				elTop = $el.offset().top,
				viewPort = this.getViewport(),
				elPixel = elWidth * elHeight,
				inViewHeight = this.isElementInViewport(el) && this.isElementInViewport(el).inViewHeight,
				inViewPixel = elWidth * inViewHeight,
				percentageInView = (inViewPixel * 100) / elPixel;
			if (elHeight == 0 && elTop >= viewPort.top && elTop <= viewPort.bottom) {
				return true;
			}
			if (elPixel < 242000) return percentageInView >= 50;
			return percentageInView >= 30;
		}
		return false;
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
