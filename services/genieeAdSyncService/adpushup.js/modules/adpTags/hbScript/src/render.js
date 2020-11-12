// Ad rendering module

var targeting = require('./targeting');
var config = require('./config');
var adp = window.adpushup;
var gpt = require('./gpt');
var utils = require('./utils');

var getDfpContainerFromDom = function(containerId) {
	return document.getElementById(containerId);
};

var render = {
	renderGPTSlots: function(adpSlots) {
		var googletag = window.googletag || { cmd: [] };
		googletag.cmd.push(
			function() {
				this.setPageAndUtmTargeting(googletag);
				if (!adp.config.apLiteActive) {
					gpt.renderSlots(googletag, adpSlots);
				} else {
					gpt.renderApLiteSlots(googletag, adpSlots);
				}
			}.bind(this)
		);
	},
	setPageAndUtmTargeting: function(googletag) {
		targeting.setPageLevel(googletag);

		if (config.SITE_ID === 39041 || config.SITE_ID === 41077 || config.SITE_ID === 41120) {
			targeting.setUTMLevel(googletag);
		}
	},
	init: function(adpSlots = []) {
		if (!Array.isArray(adpSlots) || !adpSlots.length) {
			return;
		}
		adpSlots = adpSlots.filter(
			adpSlot => getDfpContainerFromDom(adpSlot.containerId) && adpSlot.biddingComplete
		);

		if (!adpSlots.length) {
			return;
		}

		if (adp.config.renderPostBid) {
			this.renderPostBid(adpSlots);
		} else {
			this.renderGPTSlots(adpSlots);
		}
	},
	renderPostBid: function(adpSlots = []) {
		adpSlots.forEach(slot => {
			slot.renderedPostBid = true;

			var containerId = slot.containerId;
			var bid = utils.getHighestAliveBid(_apPbJs, slot.containerId, ['video', 'banner']);
			if (bid) {
				var iframe = utils.getIframeDocument(adp.$(`#${slot.containerId}`), {
					width: bid.width,
					height: bid.height
				});

				_apPbJs.renderAd(iframe, bid.adId);
			}
		});
	}
};

module.exports = render;
