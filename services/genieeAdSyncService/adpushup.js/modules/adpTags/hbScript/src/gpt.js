// GPT interfacing module

var $ = require('../../../../libs/jquery');
var targeting = require('./targeting');
var constants = require('./constants');
var responsiveAds = require('./responsiveAds');
var adpConfig = window.adpushup.config;
var refreshAdSlot = require('../../../../src/refreshAdSlot');
var commonConsts = require('../../../../config/commonConsts');
var getDfpContainerFromDom = function(containerId) {
	return document.getElementById(containerId);
};
var gpt = {
	refreshGPTSlots: function(googletag, gSlots) {
		if (Array.isArray(gSlots) && gSlots.length) {
			return googletag.pubads().refresh(gSlots);
		}
	},
	renderSlots: function(googletag, adpSlots) {
		var gSlots = adpSlots.map(adpSlot => {
			targeting.setSlotLevel(adpSlot);
			return adpSlot.gSlot;
		});

		var refreshGPTSlots = this.refreshGPTSlots.bind(this);

		googletag.cmd.push(function() {
			refreshGPTSlots(googletag, gSlots);
		});
	},
	renderApLiteSlots: function(googletag, adpSlots) {
		if (googletag.pubads().isInitialLoadDisabled()) {
			var gSlots = adpSlots.map(adpSlot => {
				targeting.setSlotLevel(adpSlot);
				return adpSlot.gSlot;
			});

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
				googletag.display(adpSlot.containerId);
			}
		});
		//return gSlot;
	},
	setSlotRenderListener: function(w) {
		w.googletag.cmd.push(
			function() {
				w.googletag
					.pubads()
					.addEventListener(constants.EVENTS.GPT.SLOT_RENDER_ENDED, function(event) {
						if (event && event.slot) {
							var gSlot = event.slot,
								slotElementId = gSlot.getSlotElementId(),
								slot = adpConfig.apLiteActive
									? window.apLite.adpSlots[slotElementId]
									: window.adpTags.adpSlots[slotElementId];
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
									var adId = adpConfig.apLiteActive
										? slotElementId
										: slot.optionalParam.adId;
									refreshAdSlot.stopRefreshForASlot(adId);
								}
							}

							// powered by adpushup optimisations
							if (!adpConfig.apLiteActive && slotElementId.indexOf('STICKY') === 0) { 
								const stickyBg = $(`#bg-sticky-${slotElementId}`);
								const adpBanner = $(`#banner-${slotElementId}`);
		
								// Ads by adpushup is disabled. nothing more to do
								if (!adpBanner[0]) return;
		
								// const unitHeight = parseInt(stickyBg[0].dataset.unitheight);
								let unitHeight;
								if (stickyBg[0]) {
									unitHeight = parseInt(stickyBg[0].dataset.unitHeight);
								}
		
								if (!event.isEmpty) {
									stickyBg[0] && stickyBg.css('height', unitHeight + commonConsts.POWERED_BY_BANNER.HEIGHT);
									adpBanner.css('display', 'inline-block');
								} else {
									stickyBg[0] && stickyBg.css('height', unitHeight);
									adpBanner.css('display', 'none');
								}
		
							}
						}
					});
			}.bind(this)
		);
	},
	loadGpt: function(w, d) {
		if (!adpConfig.apLiteActive) {
			var gptScript = d.createElement('script');
			gptScript.src = '//securepubads.g.doubleclick.net/tag/js/gpt.js';
			gptScript.async = true;

			d.head.appendChild(gptScript);
		}

		return this.setSlotRenderListener(w);
	},
	init: function(w, d) {
		var googletag = (w.googletag = w.googletag || {});
		googletag.cmd = googletag.cmd || [];

		if (!adpConfig.apLiteActive) {
			googletag.cmd.push(function() {
				!adpConfig.gptSraDisabled && googletag.pubads().enableSingleRequest();
				googletag.pubads().disableInitialLoad();
				googletag.enableServices();
			});
		}

		return this.loadGpt(w, d);
	}
};

module.exports = gpt;
