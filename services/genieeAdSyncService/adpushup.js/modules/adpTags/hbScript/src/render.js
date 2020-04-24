// Ad rendering module

var targeting = require('./targeting');
var config = require('./config');
var adpConfig = window.adpushup.config;
var gpt = require('./gpt');
var render = {
	renderGPTSlots: function(googletag, adpSlots) {
		if (!adpConfig.apLiteActive) {
			googletag.pubads().enableSingleRequest();
			googletag.enableServices();
		}
		adpSlots.forEach(function(adpSlot) {
			adpSlot.biddingComplete = true;

			targeting.setSlotLevel(adpSlot);
		});

		adpSlots.forEach(function(adpSlot) {
			!adpConfig.apLiteActive && gpt.renderSlot(googletag, adpSlot);
		});

		adpConfig.apLiteActive && gpt.renderApLiteSlots(googletag, adpSlots);
	},
	createGPTSlots: function(googletag, adpSlots) {
		adpSlots.forEach(function(adpSlot) {
			gpt.defineSlot(googletag, adpSlot);
		});

		return this.renderGPTSlots(googletag, adpSlots);
	},
	setPageAndUtmTargeting: function(googletag) {
		targeting.setPageLevel(googletag);

		if (config.SITE_ID === 39041 || config.SITE_ID === 41077) {
			targeting.setUTMLevel(googletag);
		}
	},
	init: function(adpSlots) {
		if (!Array.isArray(adpSlots) || !adpSlots.length) {
			return;
		}

		var googletag = window.googletag;
		googletag.cmd.push(
			function() {
				this.setPageAndUtmTargeting(googletag);
				adpConfig.apLiteActive
					? this.renderGPTSlots(googletag, adpSlots)
					: this.createGPTSlots(googletag, adpSlots);
			}.bind(this)
		);
	}
};

module.exports = render;
