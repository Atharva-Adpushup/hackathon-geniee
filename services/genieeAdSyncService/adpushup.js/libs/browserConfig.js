var $ = require('./jquery'),
	MobileDetect = require('mobile-detect'),
	browserConfig = {
		name: 'other',
		platform: 'DESKTOP',
		$pingEl: null,
		pageVisibility: {
			supported: false,
			type: null,
			vendorPrefix: null,
			visibilityStateKey: 'visibilityState',
			visibilitychangeEventName: 'visibilitychange'
		},
		dataSendingMethod: null,
		unloadMethod: null,
		trackerSupported: false
	};

(function detectPlatform() {
	var md = new MobileDetect(window.navigator.userAgent);
	try {
		if (md.phone()) {
			browserConfig.platform = 'MOBILE';
		} else if (md.tablet()) {
			browserConfig.platform = 'TABLET';
		}
	} catch (e) {} // eslint-disable-line no-empty
})();

(function detectBrowser() {
	var ua = navigator.userAgent;
	try {
		if ((!!window.opera || ua.indexOf(' OPR/') >= 0) && ua.indexOf('Opera Mini') === -1) {
			browserConfig.name = 'opera';
		} else if (ua.indexOf('Edge') !== -1) {
			browserConfig.name = 'edge';
		} else if (typeof InstallTrigger !== 'undefined') {
			browserConfig.name = 'firefox';
		} else if (
			/Android/i.test(ua) &&
			typeof navigator.vendor !== 'undefined' &&
			navigator.vendor.indexOf('Google') > -1 &&
			/ Version\/[^ ]+ Chrome/i.test(ua)
		) {
			browserConfig.name = 'chrome-wv';
		} else if (ua.indexOf(' CriOS/') !== -1) {
			browserConfig.name = 'safari-chrome';
		} else if (!!window.chrome && ua.match(/chrome/i)) {
			// Later condition because Dolphin browser has window.chrome a valid object
			browserConfig.name = 'chrome';
		} else if (/* @cc_on!@*/ false || !!document.documentMode) {
			browserConfig.name = 'ie';
		} else if (
			Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 &&
			/AppleWebKit/i.test(ua)
		) {
			if (/(iPhone|iPod|iPad)/i.test(ua) && ua.indexOf('Safari') !== -1 && ua.indexOf('Version') !== -1) {
				browserConfig.name = 'safari-mobile';
			} else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Version') !== -1) {
				browserConfig.name = 'safari';
			} else {
				browserConfig.name = 'safari-wv';
			}
		}
		if (browserConfig.name !== 'chrome') {
			browserConfig.name = 'other';
		}
	} catch (e) {} // eslint-disable-line no-empty
})();

(function detectVisibilitySupport() {
	var pV = browserConfig.pageVisibility,
		vendorPrefix;

	pV.supported = true;
	pV.type = 'standard';

	// We need to make sure that on multiple callbacks
	if (document.visibilityState !== void 0) {
		vendorPrefix = '';
	} else if (document.webkitVisibilityState !== void 0) {
		vendorPrefix = 'webkit';
	} else if (document.mozVisibilityState !== void 0) {
		vendorPrefix = 'moz';
	} else if (document.msVisibilityState !== void 0) {
		vendorPrefix = 'ms';
	} else if (document.hasFocus !== void 0) {
		pV.type = 'blur';
	} else {
		pV.type = null;
		pV.supported = false;
	}

	pV.vendorPrefix = vendorPrefix;

	pV.visibilityStateKey = vendorPrefix ? vendorPrefix + 'VisibilityState' : 'visibilityState';
	pV.visibilitychangeEventName = vendorPrefix ? vendorPrefix + 'visibilitychange' : 'visibilitychange';
})();

(function detectDataSendingMethod() {
	if (navigator && typeof navigator.sendBeacon === 'function') {
		browserConfig.dataSendingMethod = 'sendBeacon';
	} else if (
		(browserConfig.name.match(/^safari*/) ||
			browserConfig.name.match(/chrome*/) ||
			browserConfig.name === 'opera') &&
		typeof document.createElement('a').ping !== 'undefined'
	) {
		browserConfig.dataSendingMethod = 'ping';
	}
})();

(function detectUnloadMethod() {
	browserConfig.unloadMethod = browserConfig.name.match('safari*') ? 'pagehide' : 'beforeunload';
})();

(function initBeacon() {
	if (browserConfig.dataSendingMethod === 'ping') {
		$(function() {
			$('body').append(
				'<a id="_ap_ping_tracker" href="javascript::void(0)" style="display:none" ping="">ping</a>'
			);
			browserConfig.$pingEl = $('#_ap_ping_tracker');
			browserConfig.$pingEl.click(function(e) {
				e.stopPropagation();
				e.stopImmediatePropagation();
			});
		});
	}
})();

(function checkTrackerSupport() {
	browserConfig.trackerSupported = !(
		browserConfig.name === 'other' ||
		!browserConfig.pageVisibility.supported ||
		((browserConfig.name === 'safari-mobile' || browserConfig.name === 'safari-wv') &&
			typeof window.requestAnimationFrame !== 'function')
	);
})();

browserConfig.pageVisibility.isPageVisible = function() {
	var pV = browserConfig.pageVisibility;

	if (!pV.supported) {
		return -1;
	}
	if (pV.type === 'standard') {
		return document[pV.visibilityStateKey] === 'visible';
	}
	return document.hasFocus();
};

browserConfig.pageVisibility.getVisiblityState = function() {
	var pV = browserConfig.pageVisibility;

	if (!pV.supported) {
		return false;
	}
	if (pV.type === 'standard') {
		return document[pV.visibilityStateKey];
	}
	return document.hasFocus() ? 'visible' : 'hidden';
};

browserConfig.pageVisibility.onChange = function(hiddenCallback, visibleCallback) {
	var pV = browserConfig.pageVisibility;

	// We need to make sure that on multiple callbacks
	window.currentState = browserConfig.pageVisibility.getVisiblityState();

	// Standards:
	if (pV.type === 'standard') {
		document.addEventListener(pV.visibilitychangeEventName, onchange);
	} else {
		window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
	}

	function onchange(event) {
		var evtMap = {
				focus: 'visible',
				pageshow: 'visible',
				blur: 'hidden',
				pagehide: 'hidden'
			},
			evt = event || window.event,
			evtType = evt.type,
			triggerCallback;

		triggerCallback = function(visibleState) {
			if (window.currentState !== visibleState) {
				window.currentState = visibleState;
				if (visibleState === 'hidden') {
					hiddenCallback();
				} else {
					visibleCallback();
				}
			}
		};

		if (this[pV.vendorPrefix + 'hidden']) {
			triggerCallback('hidden', evt.type);
		} else {
			triggerCallback('visible', evt.type);
		}
		if (evtMap[evtType] === 'visible') {
			triggerCallback('visible', evt.type);
		} else {
			setTimeout(function() {
				if (!document.hasFocus()) {
					triggerCallback('hidden', evtType);
				}
			}, 1000); // IE, doesn't immediately loses focus; switches to another tab after sometime.
		}
	}
};

module.exports = browserConfig;
