// GPT interfacing module

var $ = require('../../../../libs/jquery');
var constants = require('./constants');
var responsiveAds = require('./responsiveAds');
var adpConfig = window.adpushup.config;
var refreshAdSlot = require('../../../../src/refreshAdSlot');
var getDfpContainerFromDom = function(containerId) {
	return document.getElementById(containerId);
};
var gpt = {
	refreshGPTSlots: function(googletag, gSlots) {
		if (Array.isArray(gSlots) && gSlots.length) {
			return googletag.pubads().refresh(gSlots);
		}
	},
	renderSlot: function(googletag, adpSlot) {
		//if (!adpSlot.containerPresent || !adpSlot.biddingComplete || adpSlot.hasRendered) {
		if (
			!getDfpContainerFromDom(adpSlot.containerId) ||
			!adpSlot.biddingComplete ||
			adpSlot.hasRendered
		) {
			return;
		}
		adpSlot.hasRendered = true;

		var refreshGPTSlots = this.refreshGPTSlots.bind(this);

		googletag.cmd.push(function() {
			googletag.display(adpSlot.containerId);
			if (googletag.pubads().isInitialLoadDisabled() || adpSlot.toBeRefreshed) {
				refreshGPTSlots(googletag, [adpSlot.gSlot]);
			}
		});
	},
	renderApLiteSlots: function(googletag, adpSlots) {
		if (googletag.pubads().isInitialLoadDisabled()) {
			var gSlots = adpSlots
				.filter(
					adpSlot =>
						getDfpContainerFromDom(adpSlot.containerId) &&
						adpSlot.biddingComplete &&
						!adpSlot.hasRendered
				)
				.map(adpSlot => ((adpSlot.hasRendered = true), adpSlot.gSlot));

			this.refreshGPTSlots(googletag, gSlots);
		}
	},

	getSlotSizes: function(sizeList) {
		var isMultipleSizes =
			Array.isArray(sizeList) && sizeList.some(val => Array.isArray(val) || val === 'fluid');
		sizeList =
			// if multiple sizes and fluid doesn't exist then add fluid size
			(isMultipleSizes && sizeList.indexOf('fluid') === -1 && [...sizeList, 'fluid']) ||
			// if single size and that's not fluid then create a multisize array and add fluid size
			(!isMultipleSizes && sizeList !== 'fluid' && [sizeList, 'fluid']) ||
			// else return fluid size as it is
			sizeList;

		return sizeList;
	},
	defineSlot: function(googletag, adpSlot) {
		var networkId = adpSlot.activeDFPNetwork ? adpSlot.activeDFPNetwork : constants.NETWORK_ID;
		var isResponsive = adpSlot.isResponsive;
		var computedSizes = adpSlot.computedSizes;
		var isComputedSizes = !!(computedSizes && computedSizes.length);
		var responsiveAdsData, size;
		var gSlot = null;

		var sizes = this.getSlotSizes(computedSizes);

		googletag.cmd.push(function() {
			if (!adpSlot.gSlot) {
				adpSlot.gSlot = googletag.defineSlot(
					'/' + networkId + '/' + adpSlot.optionalParam.dfpAdunitCode,
					sizes,
					adpSlot.containerId
				);
			}

			if (!adpSlot.toBeRefreshed) {
				adpSlot.gSlot.addService(googletag.pubads());
			}
		});
		//return gSlot;
	},
	setSlotRenderListener: function(w) {
		w.googletag.cmd.push(function() {
			w.googletag
				.pubads()
				.addEventListener(constants.EVENTS.GPT.SLOT_RENDER_ENDED, function(event) {
					// code to run after slot rendered
				});
		});
	},
	setApLiteSlotRenderListener: function(w) {
		w.googletag.cmd.push(
			function() {
				w.googletag
					.pubads()
					.addEventListener(constants.EVENTS.GPT.SLOT_RENDER_ENDED, function(event) {
						if (event && event.slot) {
							var gSlot = event.slot,
								slotElementId = gSlot.getSlotElementId(),
								slot = window.apLite.adpSlots[slotElementId];
							if (slot) {
								// stop refresh if line Item is not price priority type
								var lineItemId =
									(event.sourceAgnosticLineItemId &&
										event.sourceAgnosticLineItemId.toString()) ||
									'';
								var lineItems = adpConfig.lineItems || [];
								var isNotPricePriorityLineItem = !!(
									lineItemId &&
									lineItems &&
									Array.isArray(lineItems) &&
									lineItems.length &&
									lineItems.indexOf(lineItemId) === -1
								);

								if (isNotPricePriorityLineItem) {
									var container = $(`#${slotElementId}`);
									refreshAdSlot.stopRefreshForASlot(container);
								}
							}
						}
					});
			}.bind(this)
		);
	},
	loadGpt: function(w, d) {
		if (adpConfig.apLiteActive) {
			return this.setApLiteSlotRenderListener(w);
		}

		var gptScript = d.createElement('script');
		gptScript.src = '//securepubads.g.doubleclick.net/tag/js/gpt.js';
		gptScript.async = true;

		d.head.appendChild(gptScript);
		return this.setSlotRenderListener(w);
	},
	init: function(w, d) {
		w.googletag = w.googletag || {};
		googletag.cmd = googletag.cmd || [];

		return this.loadGpt(w, d);
	}
};

module.exports = gpt;
