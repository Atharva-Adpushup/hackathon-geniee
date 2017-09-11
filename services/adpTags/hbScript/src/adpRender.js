// Adp tags rendering module

var logger = require('../helpers/logger'),
	utils = require('../helpers/utils'),
	config = require('./config'),
	feedback = require('./feedback'),
	hbStatus = require('./hbStatus'),
	getFloorWithGranularity = function(floor) {
		var val = parseFloat(Math.abs(floor).toFixed(1));
		if (val > 20) {
			return 20;
		} else if (val == 0) {
			val = 0.01;
		}
		console.log('Sent floor : ' + val);
		return val;
	},
	renderGPT = function(slot) {
		if (!slot.containerPresent || !slot.biddingComplete || slot.hasRendered) {
			return false;
		}
		slot.hasRendered = true;
		googletag.cmd.push(function() {
			googletag.display(slot.containerId);
		});
	},
	renderPostbid = function(slot) {
		logger.log('Rendering postbid');

		var params = pbjs.getAdserverTargetingForAdUnitCode(slot.containerId),
			adIframe = utils.createEmptyIframe();

		document.getElementById(slot.containerId).appendChild(adIframe);

		var iframeDoc = adIframe.contentWindow.document;

		if (params && params.hb_adid) {
			logger.log('Bid present from postbid');

			pbjs.renderAd(iframeDoc, params.hb_adid);
			adIframe.contentWindow.onload = function() {
				slot.hasRendered = true;
				feedback(slot);
			};
		} else {
			logger.log('No bid or $0 cpm bid for slot, collapsing div');
			slot.type = 3;
			feedback(slot);
		}
	},
	setGPTargeting = function(slot) {
		var targeting = {
				hb_siteId: config.SITE_ID,
				hb_ran: 0
			},
			adServerTargeting = pbjs.getAdserverTargeting()[slot.containerId];

		if (utils.isSupportedBrowser() && slot.bidders.length) {
			Object.assign(targeting, { hb_ran: 1 });
		}

		if (adServerTargeting) {
			Object.assign(targeting, adServerTargeting);
		}

		if (slot.optionalParam.priceFloor) {
			var obj = {};
			obj[config.ADX_FLOOR.key] = getFloorWithGranularity(slot.optionalParam.priceFloor);
			Object.assign(targeting, obj);
		}

		Object.keys(targeting).forEach(function(key) {
			slot.gSlot.setTargeting(key, String(targeting[key]));
		});
	},
	enableGoogServicesForSlot = function(slot) {
		slot.gSlot = googletag.defineSlot('/' + config.NETWORK_ID + '/' + slot.slotId, slot.size, slot.containerId);
		setGPTargeting(slot);
		slot.gSlot.addService(googletag.pubads());
	},
	nonDFPSlotRenderSwitch = function(slot) {
		var type = slot.type;

		switch (type) {
			case 2:
				renderPostbid(slot);
				break;

			case 5:
				feedback(slot);
				break;

			case 7:
				feedback(slot);
				break;
		}
	},
	ifAdsenseWinner = function(containerId) {
		return pbjs.getHighestCpmBids(containerId)[0].bidder === config.ADSENSE.bidderName ? true : false;
	},
	renderAdsenseBackfill = function(slot) {
		var bid = pbjs.getHighestCpmBids(slot.containerId)[0],
			adData = JSON.stringify({
				containerId: slot.containerId,
				ad: btoa(bid.ad),
				type: config.ADSENSE_RENDER_EVENT
			});

		bid.ad = config.ADSENSE_FALLBACK_ADCODE.replace('__AD_CODE__', adData);
	},
	afterBiddingProcessor = function(slots) {
		if (!Array.isArray(slots) || !slots.length) {
			return false;
		}
		var adpSlotsWithDFPSlots = [];

		slots.forEach(function(slot) {
			slot.biddingComplete = true;
			slot.slotId ? adpSlotsWithDFPSlots.push(slot) : nonDFPSlotRenderSwitch(slot);
		});

		if (!adpSlotsWithDFPSlots.length) {
			return true;
		}

		//This code must be inside googletag.cmd.push as it depends upon gpt availability
		googletag.cmd.push(function() {
			// Attach gpt slot for each adpSlot in batch
			adpSlotsWithDFPSlots.forEach(function(slot) {
				enableGoogServicesForSlot(slot);
			});
			//when defineslot is done for whole batch enable gpt SRA
			googletag.pubads().enableSingleRequest();
			googletag.enableServices();

			var adUnits = utils.getBatchAdUnits(adpSlotsWithDFPSlots).join(',');
			hbStatus.hbRender(adUnits);

			//In last try rendering all slots.
			adpSlotsWithDFPSlots.forEach(function(slot) {
				// if (ifAdsenseWinner(slot.containerId)) {
				//     renderAdsenseBackfill(slot);
				// }
				renderGPT(slot);
			});
		});
	};

module.exports = {
	afterBiddingProcessor: afterBiddingProcessor,
	renderGPT: renderGPT
};
