// Header bidding initialisation module

function shouldRunControl(config) {
	/*
		Prebid control should run if 
			config is present
			mode is not 1 and manualmode is disabled
	*/
	return !!(config && config.mode !== 1 && !config.manualModeActive);
}

function init(w, d) {
	// var control = require('./control');
	var adp = require('./adp').adp,
		apConfig = adp.config,
		utils = require('../helpers/utils');

	w.pbjs = w.pbjs || {};
	w.pbjs.que = w.pbjs.que || [];

	w.googletag = w.googletag || {};
	googletag.cmd = googletag.cmd || [];

	if (shouldRunControl(apConfig)) {
		w.adpTags = w.adpTags || {};
		// w.adpTags.control = control.initControl('prebid');
		// control.initControlFeedback(w);

		// return w.adpTags.control.trigger();
	} else {
		// Execute prebid script
		if (HB_ACTIVE) {
			(function() {
				require('../../Prebid.js/build/dist/prebid');
			})();
		}
		// (function() {
		// 	__PREBID_SCRIPT__;
		// })();

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
		if (adp.adpTags) {
			adpQue = adp.adpTags.que;
		} else {
			adpQue = [];
		}
		//gpt.refreshIntervalSwitch(w);

		var existingAdpTags = Object.assign({}, adp.adpTags),
			adpTagsModule = require('./adpTags');

		// Set adpTags if already present else initialise module
		adp.adpTags = existingAdpTags.adpSlots ? existingAdpTags : adpTagsModule;

		// Keep deep copy of inventory in adpTags module
		adp.adpTags.defaultInventory = adp.$.extend(true, {}, config.INVENTORY);

		// Merge adpQue with any existing que items if present
		adp.adpTags.que = adp.adpTags.que.concat(adpQue).concat(w.adpTags.que);
		w.adpTags = adp.adpTags;

		adp.adpTags.processQue();
		adp.adpTags.que.push = function(queFunc) {
			[].push.call(adp.adpTags.que, queFunc);
			adp.adpTags.processQue();
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
				console.log('===BidWon====', bidData);
				var slot = adp.adpTags.adpSlots[bidData.adUnitCode],
					computedCPMValue = utils.isValidThirdPartyDFPAndCurrencyConfig(apConfig) ? 'originalCpm' : 'cpm';

				slot.feedback.winner = bidData.bidder;
				slot.feedback.winningRevenue = bidData[computedCPMValue] / 1000;
				slot.feedback.winnerAdUnitId = bidData.adId;
			});
		});
	}
}

module.exports = init;
