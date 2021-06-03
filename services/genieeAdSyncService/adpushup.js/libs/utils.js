var browserConfig = require('./browserConfig.js'),
	// eslint-disable-next-line no-undef
	$ = require('./jquery'),
	dockify = require('./dockify'),
	commonConsts = require('../config/commonConsts'),
	Base64 = require('Base64'),
	UM_LOG_ENDPOINT = '//app-log.adpushup.com/umlogv5?data=',
	UTM_LOG_ENDPOINT = 'https://aplogger.adpushup.com/log',
	// UM_LOG_KEEN_ENDPOINT =
	// 	'//api.keen.io/3.0/projects/5f6455365cf9803b3732965b/events/umlogv1?api_key=a871c7c98adc1b99fbf72820e0704d22bdcae4b9a1d0e2af20b46fe3cf2087d5def88f1e829db5715b4db29f18110d61c5896928ea0fde2e46a2116e91eb24aeb1656ed4a7a58db13f54ae1f8825ea690a34cfaa8001912d88266b9349140537&data=',
	FETCH_URL_KEY_VALUE_RETRY_LIMIT = 3,
	FETCH_URL_KEY_RETRY_TIMEOUT = 50;

module.exports = {
	log: function() {
		var queryParams = this.getQueryParams();
		var isQueryParams = !!(
				queryParams &&
				$.isPlainObject(queryParams) &&
				!$.isEmptyObject(queryParams)
			),
			isapDebugParam = !!(isQueryParams && queryParams.apDebug);

		if (typeof console !== 'undefined' && console.log && isapDebugParam)
			console.log.call(console, 'AP:', ...arguments);
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
		var sectionSuccessStatus =
			options.ads &&
			options.ads.length &&
			options.ads.filter(function(ad) {
				return ad.status === 1;
			});
		if (
			!adp.gaPageViewLogSent &&
			(adp.config.mode === 1 || (sectionSuccessStatus && sectionSuccessStatus.length > 0))
		) {
			this.emitGaEvent(commonConsts.GA_EVENTS.PAGE_VIEW);
			const gaEventSampling1 = window.adpushup.config.gaEventSampling1;
			const gaEventSampling2 = window.adpushup.config.gaEventSampling2;
			const currentFallBack = Math.random() * 100;
			if (gaEventSampling1 && currentFallBack <= gaEventSampling1) {
				this.emitGa3Event(commonConsts.GA_EVENTS.PAGE_VIEW);
			}
			if (gaEventSampling2 && currentFallBack <= gaEventSampling2) {
				this.emitGa3Event(commonConsts.GA_EVENTS.PAGE_VIEW_SECOND);
			}
			window.adpushup.gaPageViewLogSent = true;
		}
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
				return ad.networkData.dfpAdunit || ad.networkData.adunitId;
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

	customUTMParamsHandling: function(customUTMObjectField, pageUrl) {
		Object.keys(window[customUTMObjectField]).map(key => {
			// if no params exist
			if(pageUrl.indexOf("?") === -1) {
				// don't append same value again
				if(pageUrl.indexOf(key + "=" + window[customUTMObjectField][key]) === -1) {
					pageUrl += "?" + key + "=" + window[customUTMObjectField][key]
				}
			} else {
				// dont append same value again
				if(pageUrl.indexOf(key + "=" + window[customUTMObjectField][key]) === -1) {
					pageUrl += "&" + key + "=" + window[customUTMObjectField][key]
				}
			}
		});
		return pageUrl;
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

			if (commonConsts.CUSTOM_UTM_PARAMS_AND_SITE_MAPPING[adpConfig.siteId]) {
				adpConfig.pageUrl = this.customUTMParamsHandling(
					commonConsts.CUSTOM_UTM_PARAMS_AND_SITE_MAPPING[adpConfig.siteId],
					adpConfig.pageUrl
				);
			}

			var feedbackObj = {
				createdTS: +new Date(),
				packetId: adpConfig.packetId,
				siteId: adpConfig.siteId,
				siteDomain: adpConfig.siteDomain,
				url: adpConfig.pageUrl,
				mode: data.mode, // Denotes which mode is running (adpushup or fallback)
				//errorCode: data.eventType, // Denotes the error code (no error, pagegroup not found etc.)
				errorCode: data.errorCode, // Denotes the error code (no error, pagegroup not found etc.)
				referrer: adpConfig.referrer,
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
										services: ad.services,
										adUnitType: ad.adUnitType || commonConsts.AD_UNIT_TYPE_MAPPING.DISPLAY
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

			if (window.adpushup.config.isUrlReportingEnabled) {
				this.sendURMPageFeedbackEventLogs({ ...feedbackObj });
				// this.sendURMPageFeedbackEventLogsKeen();
			}

			data = this.base64Encode(JSON.stringify(feedbackObj));
			toFeedback = url + data;

			options = options || {};
			if (options.method === 'image') {
				this.fireImagePixel(toFeedback);
				// for UTM Logging
				if (commonConsts.CUSTOM_UTM_PARAMS_AND_SITE_MAPPING[adpConfig.siteId]) {
					this.createAndFireImagePixelForUTMLog(toFeedback);
				}	
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

	isInCrossDomainIframe: function() {
		try {
			window.top.location.toString();
		} catch (err) {
			return true;
		}

		return false;
	},
	getTopWindowHref: function() {
		if (this.isInCrossDomainIframe()) {
			return document.referrer;
		}
		return window.location.href;
	},
	domanize: function(domain) {
		if (domain) {
			var hostname = this.rightTrim(
				domain
					.replace('http://', '')
					.replace('https://', '')
					.replace('www.', ''),
				'/'
			);
			var indexOfFirstSlash = hostname.indexOf('/');
			indexOfFirstSlash = indexOfFirstSlash !== -1 ? indexOfFirstSlash : hostname.length;
			hostname = hostname.substring(0, indexOfFirstSlash);
			return hostname;
		} else {
			return '';
		}
	},
	isUrlMatching: function(siteDomain) {
		var url = siteDomain || window.adpushup.config.siteDomain,
			href = '';
		url = this.domanize(url);

		if (window.location.href.indexOf(url) !== -1) {
			return true;
		}
		if (window !== window.top) {
			try {
				href = window.top.location.toString();
			} catch (err) {
				href = this.getTopWindowHref();
			}
		}
		return href.indexOf(url) !== -1 ? true : false;
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

			url = urlBase + (parts.length > 0 ? '?' + parts.join('&') : '');
			/*if (Object.keys(this.getQueryParams()).length >= 1) {
				url = urlBase + '?' + parts.join('&');
			} else {
				url = urlBase;
			}*/
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

		if (
			config &&
			config.experiment &&
			config.platform &&
			config.pageGroup &&
			config.selectedVariation
		) {
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
					var channelValid =
						isInnovative && ad.pagegroups ? ad.pagegroups.indexOf(channel) !== -1 : true;
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
			return (
				Math.abs(adTop - viewPort.bottom) <= threshhold ||
				Math.abs(adBottom - viewPort.top) <= threshhold
			);
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
				inViewElement = this.isElementInViewport(el),
				inViewHeight = inViewElement && inViewElement.inViewHeight,
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
	getQueryParams: function() {
		var str = window.location.search,
			objURL = {};

		str.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), function($0, $1, $2, $3) {
			var queryStringKey = $1 || '',
				queryStringValue = $3 || '';

			objURL[queryStringKey] = window.decodeURIComponent(queryStringValue.replace(/\+/g, ' '));
		});

		return objURL;
	},
	dockify: dockify,
	isSiteHttps: function() {
		return window.location.protocol === 'https:';
	},
	getMetaKeyword: function() {
		return (document.querySelector("meta[name='keywords']") || {}).content || '';
	},
	getScreenOrientation: function() {
		return (
			window.screen &&
			((window.screen.orientation || {}).type ||
				window.screen.mozOrientation ||
				window.screen.msOrientation)
		);
	},
	getScreenSize: function() {
		return [$(window).width(), $(window).height()];
	},
	getPageFeedbackMetaData: function() {
		try {
			var orientations = commonConsts.SCREEN_ORIENTATIONS_FEEDBACK_VALUE;
			var currentOrientation = this.getScreenOrientation();

			return {
				screenSize: this.getScreenSize().join('x'),
				isSecureContent: this.isSiteHttps(),
				metaKeywordString: this.getMetaKeyword(),
				screenOrientation: (currentOrientation && orientations[currentOrientation]) || 0
			};
		} catch (error) {
			return {};
		}
	},
	createAndFireImagePixelForUmLog: function(json) {
		var data = this.base64Encode(JSON.stringify(json));
		var imgSrc = UM_LOG_ENDPOINT + data;

		this.fireImagePixel(imgSrc);
		return true;
	},
	createAndFireImagePixelForUTMLog: function(json) {
		var data = this.base64Encode(JSON.stringify(json));
		var imgSrc = UTM_LOG_ENDPOINT+"?data="+data+"&event=UTM_data";

		this.fireImagePixel(imgSrc);
	},
	// createAndFireImagePixelForUmLogUsingKeen: function(json) {
	// 	var data = this.base64Encode(JSON.stringify(json));
	// 	var imgSrc = UM_LOG_KEEN_ENDPOINT + data;

	// 	this.fireImagePixel(imgSrc);
	// 	return true;
	// },
	fetchAndSetKeyValueForUrlReporting: function(adp) {
		const { utils } = adp;
		utils.logURMEvent(commonConsts.EVENT_LOGGER.EVENTS.URM_START);
		// utils.logURMEventKeen(commonConsts.EVENT_LOGGER.EVENTS.URM_START, {
		// 	[commonConsts.EVENT_LOGGER.EVENTS.URM_START]: new Date().getTime()
		// });

		if (!adp.config.pageUrlMappingServiceEndpoint || !adp.config.pageUrl) {
			utils.logURMEvent(commonConsts.EVENT_LOGGER.EVENTS.URM_CONFIG_NOT_FOUND);
			// utils.logURMEventKeen(commonConsts.EVENT_LOGGER.EVENTS.URM_CONFIG_NOT_FOUND, {
			// 	[commonConsts.EVENT_LOGGER.EVENTS.URM_CONFIG_NOT_FOUND]: new Date().getTime()
			// });
			return false;
		}

		var pageUrlMappingServiceEndpoint = adp.config.pageUrlMappingServiceEndpoint
			.replace('__PAGE_URL__', this.base64Encode(adp.config.pageUrl))
			.replace('__SITE_ID__', adp.config.siteId);

		utils.logURMEvent(commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_STARTED);
		// utils.logURMEventKeen(commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_STARTED, {
		// 	[commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_STARTED]: new Date().getTime()
		// });

		let retryCount = adp.pageUrlMappingRetries || 0;
		let hasSuceeded = false;
		let hasFailed = false;

		this.requestServer(
			pageUrlMappingServiceEndpoint,
			{},
			commonConsts.URM_REPORTING.GET_URM_TARGETTING_REQUEST_TIMEOUT,
			'GET',
			'json'
		)
			.done(function(response) {
				const { data } = response || {};
				const { urlKeys, utmKeys = {} } = data || {};

				const { urlTargetingKey, urlTargetingValue } = urlKeys || {};

				utils.logURMEvent(commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_SUCCESS);
				// utils.logURMEventKeen(commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_SUCCESS, {
				// 	[commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_SUCCESS]: new Date().getTime()
				// });

				let logObject = {
					urlTargetingKey,
					urlTargetingValue
				};

				Object.keys(utmKeys).map(type => {
					adp.config.pageUTMKeyValue.push(utmKeys[type]);
					logObject[utmKeys[type].utmTargetingKey] = utmKeys[type].utmTargetingValue;
				});

				if (urlTargetingKey && urlTargetingValue) {
					adp.config.pageUrlKeyValue.urlTargetingKey = urlTargetingKey;
					adp.config.pageUrlKeyValue.urlTargetingValue = urlTargetingValue;

					utils.logURMEvent(commonConsts.EVENT_LOGGER.EVENTS.URM_CONFIG_KEY_VALUE_SET, logObject);
					// utils.logURMEventKeen(commonConsts.EVENT_LOGGER.EVENTS.URM_CONFIG_KEY_VALUE_SET, {
					// 	[commonConsts.EVENT_LOGGER.EVENTS.URM_CONFIG_KEY_VALUE_SET]: new Date().getTime()
					// });
				} else {
					utils.logURMEvent(commonConsts.EVENT_LOGGER.EVENTS.URM_CONFIG_KEY_VALUE_EMPTY, logObject);
					// utils.logURMEventKeen(commonConsts.EVENT_LOGGER.EVENTS.URM_CONFIG_KEY_VALUE_EMPTY, {
					// 	[commonConsts.EVENT_LOGGER.EVENTS.URM_CONFIG_KEY_VALUE_EMPTY]: new Date().getTime()
					// });
				}

				hasSuceeded = true;
				adp.urmRequestStatus = commonConsts.URM_REPORTING.EVENTS.SUCCESS;
			})
			.fail(function(xhr) {
				const { responseText, getAllResponseHeaders } = xhr;

				retryCount += 1;
				if (retryCount < FETCH_URL_KEY_VALUE_RETRY_LIMIT) {
					let retryTimeout = FETCH_URL_KEY_RETRY_TIMEOUT * retryCount;
					adp.utils.log(`Retrying ${retryCount}, timeout: ${retryTimeout}`);
					setTimeout(() => {
						adp.pageUrlMappingRetries = retryCount;
						utils.fetchAndSetKeyValueForUrlReporting(adp);
					}, retryTimeout);
					// dont log failure until retries are completed
					return;
				}

				hasFailed = true;
				adp.urmRequestStatus = commonConsts.URM_REPORTING.EVENTS.FAILED;

				utils.logURMEvent(commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_FAILED_TIME, {
					[commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_FAILED_TIME]: new Date().getTime()
				});
				utils.logURMEvent(commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_FAILED, {
					[commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_FAILED]: {
						responseText,
						responseHeaders: getAllResponseHeaders(),
						statusText: xhr.statusText,
						statusCode: xhr.status
					}
				});

				// utils.logURMEventKeen(commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_FAILED_TIME, {
				// 	[commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_FAILED_TIME]: new Date().getTime()
				// });
				// utils.logURMEventKeen(commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_FAILED, {
				// 	[commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_FAILED]: {
				// 		responseText,
				// 		responseHeaders: getAllResponseHeaders(),
				// 		statusText: xhr.statusText,
				// 		statusCode: xhr.status
				// 	}
				// });
			})
			.always(function() {
				if (hasFailed || hasSuceeded) {
					utils.sendURMKeyValueEventLogs();
					// utils.sendURMKeyValueEventLogsKeen();
				}
			});

		return true;
	},
	logPerformanceEvent: function(name, data = {}) {
		// eventLogger ideally should be injected
		const eventLogger = window.adpushup.eventLogger;
		try {
			if (
				window.adpushup.config.isPerformanceLoggingEnabled &&
				!window.adpushup.config.isInitialPerformanceLogSent &&
				window.performance &&
				window.performance.timing &&
				window.performance.timing.navigationStart
			) {
				eventLogger.log({
					name,
					type: commonConsts.EVENT_LOGGER.TYPES.ADP_PERF,
					data: $.extend(data, {
						time: new Date().getTime() - window.performance.timing.navigationStart
					})
				});
			}
		} catch (error) {
			window.adpushup.err.push({
				msg: 'Failed to log Performance Event',
				error
			});
		}
	},
	sendPerformanceEventLogs: function() {
		try {
			if (
				window.adpushup.config.isPerformanceLoggingEnabled &&
				!window.adpushup.config.isInitialPerformanceLogSent
			) {
				const eventLogger = window.adpushup.eventLogger;
				const eventType = commonConsts.EVENT_LOGGER.TYPES.ADP_PERF;
				const logs = eventLogger.getLogsByEventType(eventType);

				if (!logs.length) {
					return false;
				}

				const payload = {
					logs,
					type: eventType,
					timestamp: +new Date(),
					pageUrl: window.location.href,
					path: window.location.pathname,
					domain: window.location.host
				};

				// TODO move URLs to config
				this.createAndFireImagePixelForUmLog(payload);

				window.adpushup.config.isInitialPerformanceLogSent = true;
				eventLogger.removeLogsByEventType(eventType);
			}
		} catch (error) {
			window.adpushup.err.push({ msg: 'Error occured in sending performance logs', error });
		}
	},
	logURMEvent: function(name, data = {}) {
		const eventLogger = window.adpushup.eventLogger;
		eventLogger.log({
			name,
			data,
			type: commonConsts.EVENT_LOGGER.TYPES.URM_KEY_VALUE
		});
	},
	// logURMEventKeen: function(name, data = {}) {
	// 	const eventLogger = window.adpushup.eventLogger;
	// 	eventLogger.log({
	// 		name,
	// 		data,
	// 		type: commonConsts.EVENT_LOGGER.TYPES.URM_KEY_VALUE_KEEN
	// 	});
	// },
	logURMPageFeedbackEvent: function(name, data = {}) {
		const eventLogger = window.adpushup.eventLogger;
		eventLogger.log({
			name,
			data,
			type: commonConsts.EVENT_LOGGER.TYPES.URM_PAGE_FEEDBACK
		});
	},
	logURMTargettingEvent: function(name, data = {}) {
		const eventLogger = window.adpushup.eventLogger;
		eventLogger.log({
			name,
			data,
			type: commonConsts.EVENT_LOGGER.TYPES.URM_TARGETTING
		});
	},
	// logURMTargettingEventKeen: function(name, data = {}) {
	// 	const eventLogger = window.adpushup.eventLogger;
	// 	eventLogger.log({
	// 		name,
	// 		data,
	// 		type: commonConsts.EVENT_LOGGER.TYPES.URM_TARGETTING_KEEN
	// 	})
	// },
	getUrmResponseTimeFromEventLogs: function(urmLogs) {
		let urmReqSuccessTimestamp = 0;
		let urmReqStartedTimestamp = 0;

		for (let i = 0; i < urmLogs.length; i++) {
			const log = urmLogs[i];
			if (log.name === commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_STARTED) {
				urmReqStartedTimestamp = log.timestamp;
			}

			if (log.name === commonConsts.EVENT_LOGGER.EVENTS.URM_REQUEST_SUCCESS) {
				urmReqSuccessTimestamp = log.timestamp;
				break;
			}
		}

		return urmReqStartedTimestamp && urmReqSuccessTimestamp
			? urmReqSuccessTimestamp - urmReqStartedTimestamp
			: -1;
	},
	getPreparedURMResponseData: function(urmLogs) {
		const urmResponseTime = this.getUrmResponseTimeFromEventLogs(urmLogs);

		return {
			data: { time: urmResponseTime },
			timestamp: new Date().getTime(),
			name: commonConsts.EVENT_LOGGER.EVENTS.URM_RESPONSE_TIME
		};
	},
	sendURMTargettingEventLogs: function() {
		try {
			const { utils, eventLogger } = window.adpushup;
			const eventType = commonConsts.EVENT_LOGGER.TYPES.URM_TARGETTING;

			let urmTargettingLogs = eventLogger.getLogsByEventType(eventType);

			if (!urmTargettingLogs.length) {
				utils.logURMTargettingEvent(commonConsts.EVENT_LOGGER.EVENTS.EMPTY);
				urmTargettingLogs = eventLogger.getLogsByEventType(eventType);
			}

			const packetId = window.adpushup.config.packetId;
			const payload = {
				packetId,
				type: eventType,
				timestamp: new Date().getTime(),
				logs: urmTargettingLogs,
				pageUrl: window.location.href,
				path: window.location.pathname,
				domain: window.location.host
			};

			// TODO move url to config
			this.createAndFireImagePixelForUmLog(payload);

			eventLogger.removeLogsByEventType(eventType);
		} catch (error) {
			window.adpushup.err.push({
				error,
				msg: 'Error occured while sending URM trigger logs'
			});
		}
	},
	// sendURMTargettingEventLogsKeen: function() {
	// 	try {
	// 		const { utils, eventLogger, pageUrlMappingRetries, urmRequestStatus = commonConsts.URM_REPORTING.EVENTS.PENDING } = window.adpushup;
	// 		const eventType = commonConsts.EVENT_LOGGER.TYPES.URM_TARGETTING_KEEN;

	// 		let urmLogs = eventLogger.getLogsByEventType(eventType);
	// 		if (!urmLogs.length) {
	// 			utils.logURMTargettingEventKeen(commonConsts.EVENT_LOGGER.EVENTS.EMPTY, {
	// 				[commonConsts.EVENT_LOGGER.EVENTS.EMPTY]: new Date().getTime()
	// 			});
	// 			urmLogs = eventLogger.getLogsByEventType(eventType);
	// 		}

	// 		const packetId = window.adpushup.config.packetId;
	// 		let urmLogsObj = {};
	// 		urmLogs.map(log => {
	// 			urmLogsObj = Object.assign({}, urmLogsObj, log.data);
	// 		});

	// 		const payload = {
	// 			packetId,
	// 			type: eventType,
	// 			logs: urmLogsObj,
	// 			timestamp: new Date().getTime(),
	// 			pageUrl: window.location.href,
	// 			path: window.location.pathname,
	// 			domain: window.location.host,
	// 			retries: pageUrlMappingRetries || 0,
	// 			user_agent: "${keen.user_agent}",
	// 			ip_address: "${keen.ip}",
	// 			keen: {
	// 				addons: [
	// 					{
	// 						name: "keen:ua_parser",
	// 						input: {
	// 							ua_string: "user_agent"
	// 						},
	// 						output: "parsed_user_agent"
	// 					},
	// 					{
	// 						name: "keen:ip_to_geo",
	// 						input: {
	// 						  ip: "ip_address"
	// 						},
	// 						output: "ip_geo_info"
	// 					}
	// 				]
	// 			},
	// 			urmRequestStatus
	// 		};

	// 		utils.log('targetting logs keen', {payload});

	// 		this.createAndFireImagePixelForUmLogUsingKeen(payload);
	// 		window.adpushup.isURMTargettingLogsSent = true;
	// 		eventLogger.removeLogsByEventType(eventType);
	// 	} catch(error) {
	// 		window.adpushup.err.push({
	// 			error,
	// 			msg: 'Error occured while sending URM targetting event logs'
	// 		});
	// 	}
	// },
	sendURMPageFeedbackEventLogs: function(feedback) {
		try {
			if (window.adpushup.config.isURMPageFeedbackSent) {
				return false;
			}

			const { utils, eventLogger } = window.adpushup;
			const eventType = commonConsts.EVENT_LOGGER.TYPES.URM_PAGE_FEEDBACK;

			let urmLogs = eventLogger.getLogsByEventType(eventType);

			if (!urmLogs.length) {
				utils.logURMPageFeedbackEvent(commonConsts.EVENT_LOGGER.EVENTS.EMPTY);
				urmLogs = eventLogger.getLogsByEventType(eventType);
			}

			const packetId = window.adpushup.config.packetId;

			const payload = {
				packetId,
				type: eventType,
				timestamp: new Date().getTime(),
				logs: urmLogs,
				feedback,
				pageUrl: window.location.href,
				path: window.location.pathname,
				domain: window.location.host
			};
			// TODO move url to config
			this.createAndFireImagePixelForUmLog(payload);

			window.adpushup.config.isURMPageFeedbackSent = true;
			eventLogger.removeLogsByEventType(eventType);
		} catch (error) {
			window.adpushup.err.push({
				error,
				msg: 'Error occured while sending URM page feedback logs'
			});
		}
	},
	// sendURMPageFeedbackEventLogsKeen: function() {
	// 	try {
	// 		if (window.adpushup.config.isURMPageFeedbackKeenSent) {
	// 			return false;
	// 		}

	// 		const eventType = commonConsts.EVENT_LOGGER.TYPES.URM_PAGE_FEEDBACK;
	// 		const packetId = window.adpushup.config.packetId;
	// 		const payload = {
	// 			packetId,
	// 			type: eventType,
	// 			timestamp: new Date().getTime(),
	// 			logs: {
	// 				[eventType]: new Date().getTime()
	// 			},
	// 			pageUrl: window.location.href,
	// 			path: window.location.pathname,
	// 			domain: window.location.host
	// 		};
	// 		// TODO move url to config
	// 		this.createAndFireImagePixelForUmLogUsingKeen(payload);

	// 		window.adpushup.config.isURMPageFeedbackKeenSent = true;
	// 	} catch (error) {
	// 		window.adpushup.err.push({
	// 			error,
	// 			msg: 'Error occured while sending URM page feedback logs'
	// 		});
	// 	}
	// },
	sendURMKeyValueEventLogs: function() {
		try {
			const { utils, eventLogger } = window.adpushup;
			const eventType = commonConsts.EVENT_LOGGER.TYPES.URM_KEY_VALUE;

			let urmLogs = eventLogger.getLogsByEventType(eventType);

			if (!urmLogs.length) {
				utils.logURMEvent(commonConsts.EVENT_LOGGER.EVENTS.EMPTY);
				urmLogs = eventLogger.getLogsByEventType(eventType);
			}

			const packetId = window.adpushup.config.packetId;
			const urmResponseLog = utils.getPreparedURMResponseData(urmLogs);
			urmLogs.push(urmResponseLog);
			const payload = {
				packetId,
				type: eventType,
				logs: urmLogs,
				timestamp: new Date().getTime(),
				pageUrl: window.location.href,
				path: window.location.pathname,
				domain: window.location.host
			};

			// TODO move url to config
			this.createAndFireImagePixelForUmLog(payload);

			window.adpushup.config.isURMPageFeedbackSent = true;
			eventLogger.removeLogsByEventType(eventType);
		} catch (error) {
			window.adpushup.err.push({
				error,
				msg: 'Error occured while sending URM event logs'
			});
		}
	},
	// sendURMKeyValueEventLogsKeen: function() {
	// 	try {
	// 		const { utils, eventLogger, pageUrlMappingRetries } = window.adpushup;
	// 		const eventType = commonConsts.EVENT_LOGGER.TYPES.URM_KEY_VALUE_KEEN;

	// 		let urmLogs = eventLogger.getLogsByEventType(eventType);

	// 		if (!urmLogs.length) {
	// 			utils.logURMEventKeen(commonConsts.EVENT_LOGGER.EVENTS.EMPTY, {
	// 				[commonConsts.EVENT_LOGGER.EVENTS.EMPTY]: new Date().getTime()
	// 			});
	// 			urmLogs = eventLogger.getLogsByEventType(eventType);
	// 		}

	// 		const packetId = window.adpushup.config.packetId;

	// 		let urmLogsObj = {};
	// 		urmLogs.map(log => {
	// 			urmLogsObj = Object.assign({}, urmLogsObj, log.data);
	// 		});

	// 		const payload = {
	// 			packetId,
	// 			type: eventType,
	// 			logs: urmLogsObj,
	// 			timestamp: new Date().getTime(),
	// 			pageUrl: window.location.href,
	// 			path: window.location.pathname,
	// 			domain: window.location.host,
	// 			retries: pageUrlMappingRetries || 0,
	// 			user_agent: "${keen.user_agent}",
	// 			ip_address: "${keen.ip}",
	// 			keen: {
	// 				addons: [
	// 					{
	// 						name: "keen:ua_parser",
	// 						input: {
	// 							ua_string: "user_agent"
	// 						},
	// 						output: "parsed_user_agent"
	// 					},
	// 					{
	// 						name: "keen:ip_to_geo",
	// 						input: {
	// 						  ip: "ip_address"
	// 						},
	// 						output: "ip_geo_info"
	// 					}
	// 				]
	// 			}
	// 		};

	// 		utils.log({payload});
	// 		// TODO move url to config
	// 		this.createAndFireImagePixelForUmLogUsingKeen(payload);

	// 		window.adpushup.config.isURMPageFeedbackSent = true;
	// 		eventLogger.removeLogsByEventType(eventType);
	// 	} catch (error) {
	// 		window.adpushup.err.push({
	// 			error,
	// 			msg: 'Error occured while sending URM event logs'
	// 		});
	// 	}
	// },
	injectHeadCodeOnPage: function(src) {
		const scriptEl = document.createElement('script');
		scriptEl.type = 'text/javascript';
		scriptEl.async = true;
		scriptEl.src = src;

		const headEl = document.getElementsByTagName('head')[0];
		headEl.appendChild(scriptEl);
	},

	checkCmp: function() {
		let f = window;
		let cmpFrame;

		while (!cmpFrame) {
			try {
				if (typeof f.__tcfapi === 'function' || typeof f.__cmp === 'function') {
					cmpFrame = f;
					break;
				}
			} catch (e) {}

			// need separate try/catch blocks due to the exception errors thrown when trying to check for a frame that doesn't exist in 3rd party env
			try {
				if (f.frames['__tcfapiLocator']) {
					cmpFrame = f;
					break;
				}
			} catch (e) {}

			try {
				if (f.frames['__cmpLocator']) {
					cmpFrame = f;
					break;
				}
			} catch (e) {}

			if (f === window.top) break;
			f = f.parent;
		}
		return cmpFrame;
	},

	findCmp: function(timeout) {
		const overAllTimeout = timeout;
		const timerTimeout = 150;
		let runningTime = 0;

		const self = this;
		return new Promise((resolve, reject) => {
			const checkCmpRecursively = time => {
				setTimeout(() => {
					try {
						self.log('in checkCmpRecursively', time, runningTime);
						const cmpFound = !!self.checkCmp();
						if (cmpFound) {
							self.log('in checkCmpRecursively cmp found, resolving');
							return resolve(cmpFound);
						}
						runningTime = runningTime + time;
						if (runningTime >= overAllTimeout) {
							self.log('in checkCmpRecursively timeout, rejecting');
							return reject();
						}

						checkCmpRecursively(timerTimeout);
					} catch (e) {
						self.log('in checkCmpRecursively error, rejecting', e);
						return reject();
					}
				}, time);
			};

			checkCmpRecursively(0);
		});
	},

	isAdPushupForceDisabled: function() {
		return !!this.getQueryParams().forceDisableAp;
	},
	checkForLighthouse: function(siteId) {
		var ua = navigator.userAgent;
		return ua && ua.includes('Lighthouse') && commonConsts.LIGHTHOUSE_HACK_SITES.includes(siteId);
	},
	checkAndInjectUniversalGAHeadCode: function() {
		//here we are setting GA3 head code
		const gaTrackingId = window.adpushup.config.gaTrackingId;
		if (gaTrackingId) {
			if (window.ga && typeof window.ga === 'function') {
				this.log('Universal GA tag already present on site');
			} else {
				this.log('Injecting GA tag on site');
				const gaUrl = `${commonConsts.GOOGLE_ANALYTICS_URL}${gaTrackingId}`;
				this.injectHeadCodeOnPage(gaUrl);
				window.ga =
					window.ga ||
					function() {
						(ga.q = ga.q || []).push(arguments);
					};
				ga.l = +new Date();
			}
			window.ga('create', gaTrackingId, 'auto', 'adpushupClientTracker');
		}
	},
	checkAndInjectGAHeadCode: function() {
		//here we are setting GA4 head code
		if (window.gtag && typeof window.gtag === 'function') {
			this.log('GA tag already present on site');
		} else {
			this.log('Injecting GA tag on site');
			const gaUrl = `${commonConsts.GOOGLE_ANALYTICS_URL}${commonConsts.GOOGLE_ANALYTICS_ID}`;
			this.injectHeadCodeOnPage(gaUrl);
			window.dataLayer = window.dataLayer || [];
			window.gtag = function() {
				window.dataLayer.push(arguments);
			};
		}

		window.gtag('js', new Date());
		window.gtag('config', commonConsts.GOOGLE_ANALYTICS_ID, {
			send_page_view: false,
			custom_map: { dimension1: 'siteid' }
		});
	},
	emitGaEvent: function(action) {
		if (
			window.adpushup.config.enableGAAnalytics &&
			window.gtag &&
			typeof window.gtag === 'function'
		) {
			const siteid = window.adpushup.config.siteId;
			this.log(`Emitting event ${action} for site ${siteid}`);
			window.gtag('event', action, { send_to: commonConsts.GOOGLE_ANALYTICS_ID, siteid });
		}
	},
	emitGa3Event: function(action) {
		const gaTrackingId = window.adpushup.config.gaTrackingId;
		if (
			gaTrackingId &&
			window.adpushup.config.enableGAAnalytics &&
			window.ga &&
			typeof window.ga === 'function'
		) {
			const siteid = window.adpushup.config.siteId;
			this.log(`Emitting event ${action} for site ${siteid}`);
			window.ga('adpushupClientTracker.send', 'event', 'user-interaction', action, `${siteid}`, {
				nonInteraction: true
			});
		}
	}
};
