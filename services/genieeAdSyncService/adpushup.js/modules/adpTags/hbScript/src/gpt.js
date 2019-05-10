// GPT library module

var config = require('./config'),
	feedback = require('./feedback').feedback,
	$ = require('./adp').$,
	adp = require('./adp').adp,
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

				Object.keys(adp.adpTags.adpSlots).forEach(function(adpSlot) {
					var currentSlot = adp.adpTags.adpSlots[adpSlot];
					var slotMatched = !!(currentSlot.optionalParam.dfpAdunitCode == adUnitDFPAdunitCode &&
						currentSlot.activeDFPNetwork);
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
		var feedbackData = {
			ads: [],
			xpathMiss: [],
			eventType: 1,
			mode: 1,
			referrer: adp.config.referrer,
			tracking: false
		};
		$(w).on('blur', function() {
			if (adp.adpTags.gptRefreshIntervals.length) {
				adp.adpTags.gptRefreshIntervals.forEach(function(interval) {
					clearInterval(interval.id);
				});
			}
		});
		$(w).on('focus', function() {
			if (adp.adpTags.gptRefreshIntervals.length) {
				adp.adpTags.gptRefreshIntervals.forEach(function(interval) {
					clearInterval(interval.id);
					var gptRefreshInterval = setInterval(function() {
						var el = $('#' + interval.sectionId);
						if (adp.utils.isElementInViewport(el)) {
							googletag.pubads().refresh([interval.gSlot]);
							feedbackData.xpathMiss = [];
							feedbackData.ads = [interval.sectionId];
							feedbackData.variationId = adp.config.selectedVariation;
							adp.utils.sendFeedback(feedbackData);
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
