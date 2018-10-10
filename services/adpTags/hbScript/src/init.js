// Header bidding initialisation module

function init(w, d) {
	var control = require('./control');

	w.pbjs = w.pbjs || {};
	w.pbjs.que = w.pbjs.que || [];

	w.googletag = w.googletag || {};
	googletag.cmd = googletag.cmd || [];

	if (w.adpushup.config && w.adpushup.config.mode !== 1) {
		w.adpTags = w.adpTags || {};
		w.adpTags.control = control.initControl('prebid');
		control.initControlFeedback(w);

		return w.adpTags.control.trigger();
	} else {
		w.adpushup.adpPrebid = __PREBID_SCRIPT__;
		w.adpushup.adpPrebid();

		var gpt = require('./gpt'),
			config = require('./config'),
			geniee = require('./geniee'),
			feedback = require('./feedback').feedback;

		// Initialise GPT and set listeners
		gpt.init(d);
		gpt.setListeners(w, function(d) {});

		var adpQue;
		window.adpTags = window.adpTags || {};
		window.adpTags.que = window.adpTags.que || [];
		if (w.adpushup.adpTags) {
			adpQue = w.adpushup.adpTags.que;
		} else {
			adpQue = [];
		}
		gpt.refreshIntervalSwitch(w);

		var existingAdpTags = Object.assign({}, w.adpushup.adpTags),
			adpTagsModule = require('./adpTags');

		// Set adpTags if already present else initialise module
		w.adpushup.adpTags = existingAdpTags.adpSlots ? existingAdpTags : adpTagsModule;

		// Merge adpQue with any existing que items if present
		w.adpushup.adpTags.que = w.adpushup.adpTags.que.concat(adpQue).concat(w.adpTags.que);
		w.adpTags = w.adpushup.adpTags;

		w.adpushup.adpTags.processQue();
		w.adpushup.adpTags.que.push = function(queFunc) {
			[].push.call(w.adpushup.adpTags.que, queFunc);
			w.adpushup.adpTags.processQue();
		};

		function messageListener(e) {
			var data = e.data;

			// Check for adsense fallback render event
			if (data && data.type && data.type === config.ADSENSE_RENDER_EVENT) {
				var containerId = '#' + data.containerId,
					adCode = atob(data.ad);

				adpushup.$('div[id*=google_ads]').hide();
				adpushup.$('iframe[id*=google_ads]').hide();
				adpushup.$(containerId).prepend(adCode);
			}
		}

		w.addEventListener('message', messageListener, false);

		// Declaring prebid winner, if anyone
		w.pbjs.que.push(function() {
			w.pbjs.onEvent('bidWon', function(bidData) {
				var slot = w.adpushup.adpTags.adpSlots[bidData.adUnitCode];
				slot.feedback.winner = bidData.bidder;
				slot.feedback.winningRevenue = bidData.cpm / 1000;

				// if(slot.feedback.winner === config.ADSENSE.bidderName) {
				//     hbStatus.hbDfpRender(slot.containerId);

				//     slot.type = 8;
				//     feedback(slot);
				// }
			});
		});
	}
}

module.exports = init;
