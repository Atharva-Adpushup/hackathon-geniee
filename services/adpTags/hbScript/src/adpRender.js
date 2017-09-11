// Adp tags rendering module

var logger = require('../helpers/logger'),
	utils = require('../helpers/utils'),
	config = require('./config'),
	feedback = require('./feedback'),
	hbStatus = require('./hbStatus'),
	getFloorWithGranularity = function(floor) {
		var val = floor;
		//var val = parseFloat((Math.abs(floor)).toFixed(1));
		if (val > 20) {
			return 20;
		} else if (val == 0) {
			val = 0.01;
		}
		console.log('Sent floor : ' + val);
		return val;
	},
	setGPTTargetingForPBSlot = function(containerId) {
		var gSlot = window.adpTags.adpSlots[containerId].gSlot,
			targeting = pbjs.getAdserverTargeting()[containerId],
			floor = parseFloat(config.ADX_FLOOR.cpm);

		// targeting = {
		//     hb_adid: 'abc',
		//     hb_bidder: 'test',
		//     hb_pb: '3.00',
		//     hb_size: '300x250'
		// }

		if (!targeting) {
			var floor = getFloorWithGranularity(floor);
			floor > 0 ? gSlot.setTargeting(config.ADX_FLOOR.key, floor) : null;
			return false;
		}

		var keys = Object.keys(targeting),
			hb_pb = parseFloat(targeting['hb_pb']);

		keys.forEach(function(key) {
			gSlot.setTargeting(key, targeting[key]);
		});

		if (floor && floor < hb_pb) {
			floor = hb_pb.toFixed(1);
		}

		console.log('Setting floor to : ' + floor);

		gSlot.setTargeting(config.ADX_FLOOR.key, getFloorWithGranularity(floor));
	},
	setGPTKeys = function(containerId, gptKeyGroup) {
		var gSlot = window.adpTags.adpSlots[containerId].gSlot;

		for (var gptKey in gptKeyGroup) {
			gSlot.setTargeting(gptKey, String(gptKeyGroup[gptKey]));
		}
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
			hb_placement: slot.placement,
			hb_siteId: config.SITE_ID,
			hb_ran: 0
		};

		if (utils.isSupportedBrowser() && slot.bidders.length) {
			setGPTTargetingForPBSlot(slot.containerId);
			setGPTKeys(
				slot.containerId,
				Object.assign(targeting, {
					hb_ran: 1
				})
			);
		} else {
			setGPTKeys(slot.containerId, targeting);
		}
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
