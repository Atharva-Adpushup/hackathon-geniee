// GPT library module

var config = require('./config'),
	feedback = require('./feedback').feedback,
	utils = require('../helpers/utils'),
	$ = window.adpushup.$,
	init = function(d) {
		var gptScriptEl = d.createElement('script');
		gptScriptEl.src = '//www.googletagservices.com/tag/js/gpt.js';
		gptScriptEl.async = true;

		return d.head.appendChild(gptScriptEl);
	},
	setListeners = function(w, cb) {
		w.googletag.cmd.push(function() {
			w.googletag.pubads().addEventListener('slotRenderEnded', function(event) {
				var slot;
				var adUnitPath = event.slot.getAdUnitPath();
				var adUnitArray = adUnitPath.split('/');
				var adUnitDFPAdunitCode = adUnitArray[adUnitArray.length - 1];
				var networkCode = config.NETWORK_ID;

				Object.keys(w.adpushup.adpTags.adpSlots).forEach(function(adpSlot) {
					var currentSlot = w.adpushup.adpTags.adpSlots[adpSlot];
					var slotMatched = !!(
						currentSlot.optionalParam.dfpAdunitCode == adUnitDFPAdunitCode && currentSlot.activeDFPNetwork
					);
					if (slotMatched) {
						networkCode = currentSlot.activeDFPNetwork;
					}
					if ('/' + networkCode + '/' + currentSlot.optionalParam.dfpAdunitCode === adUnitPath) {
						slot = currentSlot;
					}
				});

				if (
					slot &&
					slot.feedback.winner !== config.ADSENSE.bidderName &&
					slot.optionalParam &&
					slot.optionalParam.network !== config.PARTNERS.GENIEE
				) {
					return cb(feedback(slot));
				}
			});
		});
	},
	refreshIntervalSwitch = function(w) {
		w.adpushup.$(w).on('blur', function() {
			if (w.adpushup.adpTags.gptRefreshIntervals.length) {
				w.adpushup.adpTags.gptRefreshIntervals.forEach(function(interval) {
					clearInterval(interval.id);
				});
			}
		});
		w.adpushup.$(w).on('focus', function() {
			if (w.adpushup.adpTags.gptRefreshIntervals.length) {
				w.adpushup.adpTags.gptRefreshIntervals.forEach(function(interval) {
					var gptRefreshInterval = setInterval(function() {
						var el = $('#' + interval.sectionId);
						if (utils.isElementInViewport(el)) {
							googletag.pubads().refresh([interval.gSlot]);
						}
					}, config.GPT_REFRESH_INTERVAL);
					interval.id = gptRefreshInterval;
				});
			}
		});
	};

module.exports = {
	init: init,
	setListeners: setListeners,
	refreshIntervalSwitch: refreshIntervalSwitch
};
