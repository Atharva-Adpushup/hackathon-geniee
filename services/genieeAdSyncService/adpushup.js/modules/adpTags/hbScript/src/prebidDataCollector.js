var w = null,
	adp = null,
	utils = null,
	config = null,
	constants = null,
	isApLiteActive = null,
	getPageFeedbackData = function() {
		return {
			siteId: config.SITE_ID,
			url: adp.config.pageUrl,
			siteDomain: adp.config.siteDomain,
			pageGroup: adp.config.pageGroup || null,
			pageVariationId: w.adpushup.config.selectedVariation || null,
			pageVariationName: w.adpushup.config.selectedVariationName || null,
			pageVariationType: w.adpushup.config.selectedVariationType || null,
			platform: adp.config.platform,
			packetId: adp.config.packetId
		};
	},
	calculateBidCpmForFeedback = function(bid) {
		var bidderConfig = config.PREBID_CONFIG.hbcf[bid.bidder || bid.bidderCode];

		if (utils.currencyConversionActive(config.PREBID_CONFIG.currencyConfig)) {
			var revShare = bidderConfig.bids == 'gross' && bidderConfig.revenueShare;
			if (revShare) {
				return bid.originalCpm - bid.originalCpm * (revShare / 100);
			}
			return bid.originalCpm;
		}

		return bid.cpm;
	};

var helpers = {
	getSlotsAuctioned: function(auctionEndData) {
		var slots = {};

		auctionEndData['adUnitCodes'].forEach(function(adUnitCode) {
			var slot = isApLiteActive
				? w.apLite.adpSlots[adUnitCode]
				: w.adpushup.adpTags.adpSlots[adUnitCode];

			if (slot) {
				slots[adUnitCode] = slot;
			}
		});

		return slots;
	},
	collectAdUnitPrebidWinner: function(adUnitPrebidWinner, adUnitAuctionData, auctionEndData) {
		if (Object.keys(adUnitPrebidWinner).length) {
			var adId = adUnitPrebidWinner['hb_ap_adid'];
			var bids = auctionEndData.bidsReceived;

			// get the calculated cpm of the winning bid
			var winningBid = helpers.findBidByAdId(adId, bids);

			if (winningBid) {
				var cpm = calculateBidCpmForFeedback(winningBid);
				adUnitAuctionData['prebidWinner'] = adUnitPrebidWinner['hb_ap_bidder'];
				adUnitAuctionData['prebidWinnerAdUnitId'] = adUnitPrebidWinner['hb_ap_adid'];
				adUnitAuctionData['prebidWinnerCpm'] = cpm / 1000;
			}
		}
	},
	collectAdUnitBidsData: function(auctionEndData, slots) {
		var adUnits = w.hbAnalytics.adUnits;
		var auctionId = auctionEndData['auctionId'];
		var bidsReceived = auctionEndData['bidsReceived'];

		bidsReceived.forEach(function(bid) {
			var mediaType = bid['mediaType'];
			var adUnitCode = bid['adUnitCode'];
			var slot = slots[adUnitCode];

			if (slot) {
				var adUnitAuctionData = adUnits[adUnitCode][auctionId];

				var cpm = calculateBidCpmForFeedback(bid);

				var bidData = {
					bidder: bid['bidder'],
					revenue: cpm / 1000,
					formatType: mediaType,
					timeOfBidReceived: bid['responseTimestamp']
				};

				adUnitAuctionData['bids'].push(bidData);
			}
		});
	},
	collectAuctionData: function(auctionEndData, slots) {
		var adUnits = w.hbAnalytics.adUnits;
		var auctionId = auctionEndData['auctionId'];
		var adUnitCodes = auctionEndData['adUnitCodes'];

		var auctionStartTime = auctionEndData['timestamp'];
		var prebidWinners = w._apPbJs.getAdserverTargeting();

		adUnitCodes.forEach(adUnitCode => {
			var slot = slots[adUnitCode];

			if (slot) {
				// slot.isATF = 0 means value is unknown, if unknown, try again
				if (typeof slot.isATF === 'undefined' || slot.isATF === 0) {
					var isSlotATF = utils.isSlotATF(slot);
					slot.isATF = typeof isSlotATF === 'undefined' ? 0 : isSlotATF ? 1 : 2;
				}

				var commonAdUnitData = {
					sectionId: (slot.optionalParam && slot.optionalParam.originalId) || slot.sectionId,
					sectionName: slot.sectionName,
					placement: slot.isATF,
					refreshCount: slot.refreshCount,
					prebidAuctionId: auctionId,
					timeOfAuction: auctionStartTime,
					bids: [],
					timedOutBidders: [],
					requestedFormats: slot.formats || []
				};

				adUnits[adUnitCode] = adUnits[adUnitCode] || {};
				var adUnitData = adUnits[adUnitCode];

				adUnitData[auctionId] = w.adpushup.$.extend(
					{},
					commonAdUnitData,
					adUnitData[auctionId] || {}
				);
				var adUnitAuctionData = adUnitData[auctionId];
				var adUnitPrebidWinner = prebidWinners[adUnitCode] || {};

				this.collectAdUnitPrebidWinner(
					adUnitPrebidWinner,
					adUnitAuctionData,
					auctionEndData
				);
			}
		});
	},
	markSlotFeedbackSent: function(slots) {
		Object.keys(slots).forEach(function(slotId) {
			var slot = slots[slotId];
			slot.auctionFeedbackSent = true;
		});
	},
	getAuctionFeedbackData: function(auctionId) {
		var feedbackData = [];
		var adUnits = w.hbAnalytics.adUnits;

		Object.keys(adUnits).forEach(function(adUnit) {
			var adUnitFeedback = adUnits[adUnit];
			var auctionFeedback = adUnitFeedback[auctionId] || {};

			if (Object.keys(auctionFeedback).length) {
				feedbackData.push(auctionFeedback);
			}
		});
		return feedbackData;
	},
	getBidWonFeedbackData: function(slot, defaultWinner, bidWonData) {
		var winner = slot.feedback.winner || defaultWinner;
		if (bidWonData.source === 's2s') {
			winner = winner + '[s2s]';
		}
		var winningRevenue = slot.feedback.winningRevenue || 0;
		var bidResponseTime = bidWonData['timeToRespond'];

		if (typeof slot.isATF === 'undefined' || slot.isATF === 0) {
			var isSlotATF = utils.isSlotATF(slot);
			slot.isATF = typeof isSlotATF === 'undefined' ? 0 : isSlotATF ? 1 : 2;
		}

		var slotFeedbackData = {
			bids: [
				{
					bidder: winner,
					revenue: winningRevenue,
					responseTime: bidResponseTime
				}
			],
			mode: adp.config.mode,
			errorCode: constants.ERROR_CODES.NO_ERROR,
			winner: winner,
			winningRevenue: winningRevenue,
			winnerAdUnitId: slot.feedback.winnerAdUnitId || null,
			timedOutBidders: [],
			services: slot.services,
			sectionId: (slot.optionalParam && slot.optionalParam.originalId) || slot.sectionId,
			sectionName: slot.sectionName,
			formatType: slot.feedback.unitFormat,
			refreshCount: slot.refreshCount,
			placement: slot.isATF
		};

		var feedbackData = w.adpushup.$.extend({}, getPageFeedbackData(), slotFeedbackData);

		if (slot.feedback.renderedSize) feedbackData.renderedSize = slot.feedback.renderedSize;

		return feedbackData;
	},
	findBidByAdId: function(adId, bids) {
		for (var i = 0; i < bids.length; i++) {
			var bid = bids[i];

			if (bid.adId === adId) {
				return bid;
			}
		}

		return false;
	}
};

var feedback = {
	sendBidWonFeedback: function(bidWonData, slot) {
		var defaultWinner = constants.FEEDBACK.DEFAULT_WINNER;
		var hbTypes = constants.FEEDBACK.HB_TYPES;
		var hbType = hbTypes[bidWonData['source']];

		if (slot.feedbackSent || slot.feedback.winner === defaultWinner) {
			return;
		}
		slot.feedbackSent = true;
		var feedbackData = helpers.getBidWonFeedbackData(slot, defaultWinner, bidWonData);

		feedbackData['renderedAdSize'] = bidWonData['size'];
		feedbackData['prebidAuctionId'] = bidWonData['auctionId'];
		feedbackData['headerBiddingType'] = typeof hbType === 'undefined' ? 0 : hbType;

		return adp.$.get(
			constants.FEEDBACK.URL + adp.utils.base64Encode(JSON.stringify(feedbackData))
		);
	},
	sendAuctionFeedack: function(auctionId, slots) {
		var feedbackData = w.adpushup.$.extend({}, getPageFeedbackData());
		feedbackData['sections'] = helpers.getAuctionFeedbackData(auctionId, w);

		helpers.markSlotFeedbackSent(slots);

		return adp.$.get(
			constants.FEEDBACK.AUCTION_FEEDBACK_URL +
			adp.utils.base64Encode(JSON.stringify(feedbackData))
		);
	}
};

var handleAuctionEndEvent = function(auctionEndData) {
	utils.log('========= auctionEnd =========', auctionEndData);

	if (auctionEndData['auctionStatus'] === 'completed') {
		var slots = helpers.getSlotsAuctioned(auctionEndData);
		var auctionId = auctionEndData['auctionId'];

		helpers.collectAuctionData(auctionEndData, slots);
		helpers.collectAdUnitBidsData(auctionEndData, slots);
		feedback.sendAuctionFeedack(auctionId, slots);
	}
};

var handleBidTimeoutEvent = function(bidTimeoutData) {
	utils.log('========= timeout =========', bidTimeoutData);
	var adUnits = w.hbAnalytics.adUnits;

	bidTimeoutData.forEach(bid => {
		var bidder = bid['bidder'];
		var auctionId = bid['auctionId'];
		var adUnitCode = bid['adUnitCode'];

		adUnits[adUnitCode] = adUnits[adUnitCode] || {};
		var adUnitData = adUnits[adUnitCode];

		adUnitData[auctionId] = adUnitData[auctionId] || {};
		var adUnitAuctionData = adUnitData[auctionId];

		adUnitAuctionData['timedOutBidders'] = adUnitAuctionData['timedOutBidders'] || [];

		adUnitAuctionData['timedOutBidders'].push(bidder);
	});
};

var handleBidWonEvent = function(bidWonData) {
	utils.log('========= bidWon =========', bidWonData);
	// for winning video bids, feedback will be sent on adImpression event from jwplayer
	if (bidWonData.mediaType == 'video') {
		return;
	}
	collectBidWonData(bidWonData);
};

var collectBidWonData = function(bidWonData) {
	var slot = isApLiteActive
		? w.apLite.adpSlots[bidWonData.adUnitCode]
		: w.adpushup.adpTags.adpSlots[bidWonData.adUnitCode];
	var cpm = calculateBidCpmForFeedback(bidWonData);

	if (slot) {
		slot.feedback.winner = bidWonData.bidder;
		slot.feedback.winningRevenue = cpm / 1000;
		slot.feedback.winnerAdUnitId = bidWonData.adId;
		slot.feedback.unitFormat = bidWonData.mediaType;

		if (isApLiteActive) slot.feedback.renderedSize = [bidWonData.width, bidWonData.height];

		return feedback.sendBidWonFeedback(bidWonData, slot);
	}
};

var API = {
	init: function(params) {
		var deps = ['w', 'adp', 'utils', 'config', 'constants'];

		var missingDeps = deps.filter(function(dep) {
			return typeof params[dep] === 'undefined' || params[dep] === null;
		});

		if (missingDeps.length) {
			throw new Error('Missing dependencies for HB Analytics: ' + missingDeps.join(', '));
		}

		w = params['w'];
		adp = params['adp'];
		utils = params['utils'];
		config = params['config'];
		constants = params['constants'];
		isApLiteActive = w.adpushup.config.apLiteActive;

		w.hbAnalytics = {
			adUnits: {}
		};

		return API;
	},
	enableEvents: function(events) {
		if (!Array.isArray(events)) {
			events = [events];
		}

		var prebidEvents = constants.EVENTS.PREBID;

		var eventHandlers = {
			[prebidEvents.BID_WON]: handleBidWonEvent,
			[prebidEvents.BID_TIMEOUT]: handleBidTimeoutEvent,
			[prebidEvents.AUCTION_END]: handleAuctionEndEvent
		};

		var wrapErrorHandler = function(fn) {
			return function() {
				try {
					fn.apply(this, arguments);
				} catch (error) {
					Array.isArray(window.adpushup.err) &&
						window.adpushup.err.push({
							msg: 'Error in Prebid Data Collector',
							error: error
						});
				}
			};
		};

		events.forEach(function(event) {
			var handler = eventHandlers[event];
			if (handler) {
				w._apPbJs.que.push(function() {
					w._apPbJs.onEvent(event, wrapErrorHandler(handler));
				});
			}
		});
	},
	collectBidWonData: collectBidWonData
};

module.exports = API;
