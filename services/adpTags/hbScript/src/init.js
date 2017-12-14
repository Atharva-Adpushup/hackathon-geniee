// Header bidding initialisation module

function init(w, d) {
	// Disabling floor price optimizer service for now
	// require('./adpOptimizer').init(w);
	w.adpPrebid = require('../../Prebid.js/build/dist/prebid');
	w.adpPrebid();

	var logger = require('../helpers/logger'),
		gpt = require('./gpt'),
		config = require('./config'),
		feedback = require('./feedback'),
		hbStatus = require('./hbStatus');

	// Initialise GPT and set listeners
	gpt.init(w, d);
	gpt.setListeners(w, function(d) {
		logger.log('Feedback sent'); // Feedback for DFP slot render sent here
	});

	var adpQue;
	if (w.adpTags) {
		adpQue = w.adpTags.que;
	} else {
		adpQue = [];
	}

	var existingAdpTags = Object.assign({}, w.adpTags),
		adpTagsModule = require('./adpTags');

	// Set adpTags if already present else initialise module
	w.adpTags = existingAdpTags.adpSlots ? existingAdpTags : adpTagsModule;

	// Merge adpQue with any existing que items if present
	w.adpTags.que = w.adpTags.que.concat(adpQue);

	adpTags.processQue();
	w.adpTags.que.push = function(queFunc) {
		[].push.call(w.adpTags.que, queFunc);
		adpTags.processQue();
	};

	w.pbjs = w.pbjs || {};
	w.pbjs.que = w.pbjs.que || [];

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
			logger.log('Bid winner decided from prebid auction');
			var slot = w.adpTags.adpSlots[bidData.adUnitCode];
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

module.exports = init;
