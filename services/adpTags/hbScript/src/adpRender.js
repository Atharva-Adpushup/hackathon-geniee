// Adp tags rendering module

var utils = require('../helpers/utils'),
	config = require('./config'),
	feedback = require('./feedback').feedback,
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
	// Please use this refresh functionality within the "googletag.cmd.push" wrapper
	refreshGPTSlot = function(gSlot) {
		googletag.pubads().refresh([gSlot]);
	},
	renderGPT = function(slot) {
		if (!slot.containerPresent || !slot.biddingComplete || slot.hasRendered) {
			return false;
		}
		slot.hasRendered = true;

		var gptRefreshInterval = null;
		if (slot.optionalParam.refreshSlot) {
			window.focus();

			googletag.cmd.push(function() {
				gptRefreshInterval = setInterval(function() {
					var el = $('#' + slot.sectionId);
					if (utils.isElementInViewport(el)) {
						refreshGPTSlot(slot.gSlot);
					}
				}, config.GPT_REFRESH_INTERVAL);
				window.adpushup.adpTags.gptRefreshIntervals.push({
					gSlot: slot.gSlot,
					id: gptRefreshInterval,
					sectionId: slot.sectionId
				});
			});
		}

		googletag.cmd.push(function() {
			googletag.display(slot.containerId);

			/* 
				If multiple DFP implementations exist on the page, then explicitly refresh ADP ad slot, to fetch the ad. This makes sure that the ad is fetched in all cases, even if disableInitialLoad() is used by the publisher for his own DFP implementation.
			*/
			if (utils.hasMultipleDfpAccounts()) {
				refreshGPTSlot(slot.gSlot);
			}
		});
	},
	renderPostbid = function(slot) {
		var params = pbjs.getAdserverTargetingForAdUnitCode(slot.containerId),
			adIframe = utils.createEmptyIframe();

		document.getElementById(slot.containerId).appendChild(adIframe);

		var iframeDoc = adIframe.contentWindow.document;

		if (params && params.hb_adid) {
			pbjs.renderAd(iframeDoc, params.hb_adid);
			adIframe.contentWindow.onload = function() {
				slot.hasRendered = true;
				feedback(slot);
			};
		} else {
			slot.type = 3;
			feedback(slot);
		}
	},
	setPageLevelTargeting = function(targeting, slot) {
		if (slot.optionalParam.keyValues && Object.keys(slot.optionalParam.keyValues).length) {
			return Object.assign(targeting, slot.optionalParam.keyValues);
		}
		return targeting;
	},
	getAdserverTargeting = function(slot) {
		if (slot.optionalParam.headerBidding && slot.bidders.length) {
			return pbjs.getAdserverTargeting()[slot.containerId];
		}
		return null;
	},
	setURLWiseTargeting = function() {
		var urlParams = window.adpushup.utils.queryParams;

		Object.keys(config.URL_WISE_TARGETING).forEach(function(key) {
			var keyVal = config.URL_WISE_TARGETING[key],
				utmParam = urlParams[keyVal];

			googletag.pubads().setTargeting(keyVal.trim(), String(utmParam ? utmParam.trim().substr(0, 40) : null));
		});
	},
	setGPTargeting = function(slot) {
		if (slot.optionalParam && slot.optionalParam.network == config.PARTNERS.GENIEE) {
			var genieeSlots = Object.keys(config.TARGETING);
			networkCodes = {};
			dfpAdunitCodes = [];
			genieeSlots.forEach(function(slot) {
				/*
					From Geniee
					{
						'/123/234': {},
						'/567/789': {},
						'/123/567': {}
					}
					networkCodes
					{
						234: 123,
						789: 567,
						567: 123
					}
					dfpAdunitCodes: [234, 789, 567]
				*/
				var slotInfo = slot.split('/');
				networkCodes[slotInfo[2]] = slotInfo[1];
				dfpAdunitCodes.push(slotInfo[2]);
			});
			if (dfpAdunitCodes.indexOf(slot.optionalParam.dfpAdunitCode) !== -1) {
				var currentTargetingObject =
						config.TARGETING[
							'/' +
								networkCodes[slot.optionalParam.dfpAdunitCode] +
								'/' +
								slot.optionalParam.dfpAdunitCode
						],
					currentTargetingObject = setPageLevelTargeting(currentTargetingObject, slot);
				Object.keys(currentTargetingObject).forEach(function(dfpKey, index) {
					slot.gSlot.setTargeting(dfpKey, String(currentTargetingObject[dfpKey]));
				});
			}
			return;
		}
		var targeting = {
				hb_siteId: config.SITE_ID,
				hb_ran: 0
			},
			adServerTargeting = getAdserverTargeting(slot);

		if (utils.isSupportedBrowser() && slot.bidders.length) {
			Object.assign(targeting, { hb_ran: 1 });
		}

		if (adServerTargeting) {
			Object.assign(targeting, adServerTargeting);
		}

		targeting = setPageLevelTargeting(targeting, slot);

		Object.keys(targeting).forEach(function(key) {
			//check if any of keys belong to price floor key then set price using granularity function,
			// so that it can match with price rules on server
			if (config.ADX_FLOOR.priceFloorKeys.indexOf(key) !== -1) {
				if (parseInt(targeting[key], 10) === 0) {
					return true;
				}

				targeting[key] = getFloorWithGranularity(targeting[key]);
			}
			slot.gSlot.setTargeting(key, String(targeting[key]));
		});
	},
	enableGoogServicesForSlot = function(slot) {
		var networkId =
			slot.optionalParam && slot.optionalParam.network == config.PARTNERS.GENIEE
				? config.GENIEE_NETWORK_ID
				: config.NETWORK_ID;
		networkId = slot.activeDFPNetwork ? slot.activeDFPNetwork : networkId;

		slot.gSlot = googletag.defineSlot(
			'/' + networkId + '/' + slot.optionalParam.dfpAdunitCode,
			slot.optionalParam.multipleAdSizes || slot.size,
			slot.containerId
		);
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
		var genieeRef = window.adpushup && window.adpushup.geniee,
			isSendBeforeBodyTags = genieeRef && genieeRef.sendBeforeBodyTagsFeedback;

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
			//Global key value settings
			for (var key in config.PAGE_KEY_VALUES) {
				googletag.pubads().setTargeting(key, String(config.PAGE_KEY_VALUES[key]));
			}

			if (config.SITE_ID === 32142) {
				setURLWiseTargeting();
			}

			// Attach gpt slot for each adpSlot in batch
			adpSlotsWithDFPSlots.forEach(function(slot) {
				enableGoogServicesForSlot(slot);
			});
			//when defineslot is done for whole batch enable gpt SRA
			googletag.pubads().enableSingleRequest();
			googletag.enableServices();

			var adUnits = utils.getBatchAdUnits(adpSlotsWithDFPSlots).join(',');

			//In last try rendering all slots.
			adpSlotsWithDFPSlots.forEach(function(slot) {
				// if (ifAdsenseWinner(slot.containerId)) {
				//     renderAdsenseBackfill(slot);
				// }
				renderGPT(slot);
			});
		});

		//Check for geniee 'notifyBeforeBodyTags' function
		if (isSendBeforeBodyTags) {
			genieeRef.sendBeforeBodyTagsFeedback();
			if (!genieeRef.hasBodyTagsRendered) {
				genieeRef.hasBodyTagsRendered = true;
			}
		}
	};

module.exports = {
	afterBiddingProcessor: afterBiddingProcessor,
	renderGPT: renderGPT
};
