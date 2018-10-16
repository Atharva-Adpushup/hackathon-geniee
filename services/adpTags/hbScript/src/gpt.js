// GPT library module

var config = require('./config'),
	logger = require('../helpers/logger'),
	feedback = require('./feedback').feedback,
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
				Object.keys(w.adpushup.adpTags.adpSlots).forEach(function(adpSlot) {
					if (
						'/' +
							config.NETWORK_ID +
							'/' +
							w.adpushup.adpTags.adpSlots[adpSlot].optionalParam.dfpAdunitCode ===
						event.slot.getName()
					) {
						slot = w.adpushup.adpTags.adpSlots[adpSlot];
					}
				});

				if (
					slot &&
					slot.feedback.winner !== config.ADSENSE.bidderName &&
					slot.optionalParam &&
					slot.optionalParam.network !== config.PARTNERS.GENIEE
				) {
					logger.log('DFP ad slot rendered');
					return cb(feedback(slot));
				}
			});
		});
	},
	setGptRefreshInterval = function() {
		if (w.adpushup.adpTags.gptRefreshIntervals.length) {
			w.adpushup.adpTags.gptRefreshIntervals.forEach(function(interval) {
				var gptRefreshInterval = setInterval(function() {
					googletag.pubads().refresh([interval.gSlot]);
				}, config.GPT_REFRESH_INTERVAL);
				interval.id = gptRefreshInterval;
			});
		}
	},
	onScroll = function() {
		return utils.throttle(function() {
			w.adpushup.adpTags.gptRefreshIntervals.forEach(function(interval) {
				let el = $('#' + interval.sectionId);
				if (utils.isElementInViewport(el)) {
					googletag.pubads().refresh([interval.gSlot]);
				}
			});
		}, 200)();
	},
	refreshIntervalSwitch = function(w) {
		w.adpushup.$(w).on('blur', function() {
			if (w.adpushup.adpTags.gptRefreshIntervals.length) {
				w.adpushup.adpTags.gptRefreshIntervals.forEach(function(interval) {
					clearInterval(interval.id);
				});
			}
		});
		w.adpushup.$(w).on('focus', setGptRefreshInterval);
		if (w.adpushup.adpTags.gptRefreshIntervals.length) {
			w.adpushup.$(w).on('scroll', onScroll);
		}
	};

module.exports = {
	init: init,
	setListeners: setListeners,
	refreshIntervalSwitch: refreshIntervalSwitch
};
