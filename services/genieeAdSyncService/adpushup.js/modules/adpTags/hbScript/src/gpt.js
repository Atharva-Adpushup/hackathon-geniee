// GPT interfacing module

var $ = require('../../../../libs/jquery');
var constants = require('./constants');
var responsiveAds = require('./responsiveAds');
var adpConfig = window.adpushup.config;
var refreshAdSlot = require('../../../../src/refreshAdSlot');
var getDFPCOntainerFromDom = function(containerId) {
	return document.getElementById(containerId);
};
var gpt = {
	refreshGPTSlot: function(googletag, gSlot) {
		if (gSlot) {
			return googletag.pubads().refresh([gSlot]);
		}
	},
	refreshGPTSlots: function(googletag, gSlots) {
		if (Array.isArray(gSlots) && gSlots.length) {
			return googletag.pubads().refresh(gSlots);
		}
	},
	renderSlot: function(googletag, adpSlot) {
		//if (!adpSlot.containerPresent || !adpSlot.biddingComplete || adpSlot.hasRendered) {
		if (
			!getDFPCOntainerFromDom(adpSlot.containerId) ||
			!adpSlot.biddingComplete ||
			adpSlot.hasRendered
		) {
			return;
		}
		adpSlot.hasRendered = true;

		googletag.display(adpSlot.containerId);
		if (googletag.pubads().isInitialLoadDisabled() || adpSlot.toBeRefreshed) {
			this.refreshGPTSlot(googletag, adpSlot.gSlot);
		}
	},
	renderApLiteSlots: function(googletag, adpSlots) {
		if (googletag.pubads().isInitialLoadDisabled()) {
			var gSlots = adpSlots
				.filter(
					adpSlot =>
						getDFPCOntainerFromDom(adpSlot.containerId) &&
						adpSlot.biddingComplete &&
						!adpSlot.hasRendered
				)
				.map(adpSlot => ((adpSlot.hasRendered = true), adpSlot.gSlot));

			this.refreshGPTSlots(googletag, gSlots);
		}
	},
	defineSlot: function(googletag, adpSlot) {
		var networkId = adpSlot.activeDFPNetwork ? adpSlot.activeDFPNetwork : constants.NETWORK_ID;
		var isResponsive = adpSlot.isResponsive;
		var computedSizes = adpSlot.computedSizes;
		var isComputedSizes = !!(computedSizes && computedSizes.length);
		var responsiveAdsData, size;

		/*if (isResponsive) {
			responsiveAdsData = responsiveAds.getAdSizes(adpSlot.optionalParam.adId);
			size = responsiveAdsData.collection.concat([]).reverse();
		} else {
			// reverse() is added below as multiple ad size mapping originates from our common
			// IAB backward ad size mapping for every ad and all ad sizes in this mapping are added in
			// increasing order of their widths and probably DFP prioritizes ad sizes as per their
			// added order in `size` argument. If DFP does prioritizes this, then we need to ensure that
			// selected ad size is the first size present in `size` array.
			size = isComputedSizes ? computedSizes.concat([]).reverse() : adpSlot.size;
		}*/

		size = isComputedSizes ? computedSizes : adpSlot.size;

		var isMultipleSizes =
			Array.isArray(size) && size.some(val => Array.isArray(val) || val === 'fluid');
		size =
			// if multiple sizes and fluid doesn't exist then add fluid size
			(isMultipleSizes && size.indexOf('fluid') === -1 && [...size, 'fluid']) ||
			// if single size and that's not fluid then create a multisize array and add fluid size
			(!isMultipleSizes && size !== 'fluid' && [size, 'fluid']) ||
			// else return fluid size as it is
			size;

		if (!adpSlot.gSlot) {
			adpSlot.gSlot = googletag.defineSlot(
				'/' + networkId + '/' + adpSlot.optionalParam.dfpAdunitCode,
				size,
				adpSlot.containerId
			);
		}

		if (!adpSlot.toBeRefreshed) {
			adpSlot.gSlot.addService(googletag.pubads());
		}
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
