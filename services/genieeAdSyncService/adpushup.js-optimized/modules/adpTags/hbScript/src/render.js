// Ad rendering module

var targeting = require('./targeting');
var config = require('./config');
var adp = window.adpushup;
var gpt = require('./gpt');
var utils = require('./utils');

var getDfpContainerFromDom = function(containerId) {
	return document.getElementById(containerId);
};

let isWindowLoadEventFired = false;
let isDocumentReadyEventFired = document.readyState === 'complete';

var render = {
	renderGPTSlots: function(adpSlots) {
		var googletag = window.googletag || { cmd: [] };

		const _this = this;
		let renderAfterDomReady = false;
		let renderAfterWindowLoad = false;

		const renderFn = function() {
			window.adpushup.utils.log('started render process', performance.now());
			_this.setPageAndUtmTargeting(googletag);
			if (!adp.config.apLiteActive) {
				gpt.renderSlots(googletag, adpSlots);
			} else {
				gpt.renderApLiteSlots(googletag, adpSlots);
			}
		};

		try {
			let params = new URL(window.location).searchParams;
			renderAfterDomReady = params.get('renderAfterDomReady');
			renderAfterWindowLoad = params.get('renderAfterWindowLoad');
		} catch (error) {
			renderAfterDomReady = false;
			renderAfterWindowLoad = false;
		}

		googletag.cmd.push(function() {
			window.adpushup.utils.log(
				'goggletag render enqueued fn running',
				{
					renderAfterDomReady,
					renderAfterWindowLoad,
					isDocumentReadyEventFired,
					isWindowLoadEventFired
				},
				performance.now()
			);

			if (!isDocumentReadyEventFired && renderAfterDomReady) {
				window.adpushup.$(function() {
					let timeout = parseInt(renderAfterDomReady, 10);

					if (!isNaN(timeout)) {
						setTimeout(renderFn, timeout);
					} else {
						renderFn();
					}

					isDocumentReadyEventFired = true;
				});
			} else if (!isDocumentReadyEventFired && renderAfterWindowLoad) {
				window.adpushup.$(window).load(function() {
					renderFn();
					isWindowLoadEventFired = true;
				});
			} else {
				renderFn();
			}
		});
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
			if (window.adpushup.services.HB_ACTIVE) {
				var containerId = slot.containerId;
				var bid = utils.getHighestAliveBid(
					_apPbJs,
					containerId,
					['video', 'banner'],
					config.POST_BID_SUPPORTED_BIDDERS
				);
				if (bid) {
					var iframe = utils.getIframeDocument(adp.$(`#${containerId}`), {
						width: bid.width,
						height: bid.height
					});

					// we can consider calling this also after document.ready via $
					_apPbJs.renderAd(iframe, bid.adId);
				}
			}
		});
	}
};

module.exports = render;
