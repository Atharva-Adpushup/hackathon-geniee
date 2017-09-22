// GPT library module

var config = require('./config'),
	logger = require('../helpers/logger'),
	feedback = require('./feedback'),
	hbStatus = require('./hbStatus'),
	init = function(w, d) {
		w.googletag = w.googletag || {};
		googletag.cmd = googletag.cmd || [];

		var gptScriptEl = d.createElement('script');
		gptScriptEl.src = '//www.googletagservices.com/tag/js/gpt.js';
		gptScriptEl.async = true;

		return d.head.appendChild(gptScriptEl);
	},
	setListeners = function(w, cb) {
		w.googletag.cmd.push(function() {
			w.googletag.pubads().addEventListener('slotRenderEnded', function(event) {
				var slot;
				Object.keys(w.adpTags.adpSlots).forEach(function(adpSlot) {
					if ('/' + config.NETWORK_ID + '/' + w.adpTags.adpSlots[adpSlot].slotId === event.slot.getName()) {
						slot = w.adpTags.adpSlots[adpSlot];
					}
				});

				if (slot && slot.feedback.winner !== config.ADSENSE.bidderName) {
					hbStatus.hbDfpRender(slot.containerId);

					logger.log('DFP ad slot rendered');
					return cb(feedback(slot));
				}
			});
		});
	};

module.exports = {
	init: init,
	setListeners: setListeners
};
