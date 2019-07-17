// GPT interfacing module

var constants = require('./constants');
var feedback = require('./feedback');
var responsiveAds = require('./responsiveAds');
var targeting = require('./targeting');
var gpt = {
	refreshGPTSlot: function (googletag, gSlot) {
		return googletag.pubads().refresh([gSlot]);
	},
	renderSlot: function (googletag, adpSlot) {
		if (!adpSlot.containerPresent || !adpSlot.biddingComplete || adpSlot.hasRendered) {
			return;
		}
		adpSlot.hasRendered = true;

		googletag.display(adpSlot.containerId);
		if (googletag.pubads().isInitialLoadDisabled() || adpSlot.toBeRefreshed) {
			this.refreshGPTSlot(googletag, adpSlot.gSlot);
		}
	},
	defineSlot: function (googletag, adpSlot) {
		var networkId = adpSlot.activeDFPNetwork ? adpSlot.activeDFPNetwork : constants.NETWORK_ID;
		var isResponsive = adpSlot.isResponsive;
		var computedSizes = adpSlot.computedSizes;
		var isComputedSizes = !!(computedSizes && computedSizes.length);
		var responsiveAdsData, size;

		if (isResponsive) {
			responsiveAdsData = responsiveAds.getAdSizes(adpSlot.optionalParam.adId);
			size = responsiveAdsData.collection.concat([]).reverse();
		} else {
			// reverse() is added below as multiple ad size mapping originates from our common
			// IAB backward ad size mapping for every ad and all ad sizes in this mapping are added in
			// increasing order of their widths and probably DFP prioritizes ad sizes as per their
			// added order in `size` argument. If DFP does prioritizes this, then we need to ensure that
			// selected ad size is the first size present in `size` array.
			size = isComputedSizes ? computedSizes.concat([]).reverse() : adpSlot.size;
		}

		if (!adpSlot.gSlot) {
			adpSlot.gSlot = googletag.defineSlot(
				'/' + networkId + '/' + adpSlot.optionalParam.dfpAdunitCode,
				size,
				adpSlot.containerId
			);
		}

		targeting.setSlotLevel(adpSlot);
		if (!adpSlot.toBeRefreshed) {
			adpSlot.gSlot.addService(googletag.pubads());
		}
	},
	setSlotRenderListener: function (w) {
		w.googletag.cmd.push(function () {
			w.googletag.pubads().addEventListener(constants.EVENTS.GPT.SLOT_RENDER_ENDED, function (event) {
				var slot = null;
				var adUnitPath = event.slot.getAdUnitPath();
				var adUnitPathArray = adUnitPath.split('/');
				var adUnitCode = adUnitPathArray[adUnitPathArray.length - 1];
				var networkCode = constants.NETWORK_ID;

				Object.keys(window.adpushup.adpTags.adpSlots).forEach(function (adpSlot) {
					var currentSlot = window.adpushup.adpTags.adpSlots[adpSlot];
					var slotMatched = !!(
						currentSlot.optionalParam.dfpAdunitCode == adUnitCode && currentSlot.activeDFPNetwork
					);

					if (slotMatched) {
						networkCode = currentSlot.activeDFPNetwork;
					}
					if ('/' + networkCode + '/' + currentSlot.optionalParam.dfpAdunitCode === adUnitPath) {
						slot = currentSlot;
					}
				});

				if (slot) {
					return feedback.send(slot);
				}
			});
		});
	},
	loadGpt: function (w, d) {
		var gptScript = d.createElement('script');
		gptScript.src = '//securepubads.g.doubleclick.net/tag/js/gpt.js';
		gptScript.async = true;

		d.head.appendChild(gptScript);
		return this.setSlotRenderListener(w);
	},
	init: function (w, d) {
		w.googletag = w.googletag || {};
		googletag.cmd = googletag.cmd || [];

		return this.loadGpt(w, d);
	}
};

module.exports = gpt;
