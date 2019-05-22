// Header bidding feedback module

var config = require('./config'),
	utils = require('../helpers/utils'),
	getBidDataForFeedback = function(containerId) {
		var bidData = [],
			// Not using getBidResponses() because context of all slot containers is not getting saved in it, instead using getBidResponsesForAdUnitCode(':adUnitCode')
			slotBids = pbjs.getBidResponsesForAdUnitCode(containerId),
			computedCPMValue = utils.isValidThirdPartyDFPAndCurrencyConfig() ? 'originalCpm' : 'cpm';

		if (slotBids) {
			var bids = slotBids.bids;
			for (var i in bids) {
				bidData.push({
					revenue: bids[i][computedCPMValue] / 1000, // Actual revenue for impression = cpm/1000
					bidder: bids[i].bidder,
					adId: bids[i].adId,
					responseTime: bids[i].timeToRespond
				});
			}
			return bidData;
		}
		return bidData;
	},
	feedback = function(slot) {
		if (!slot.type || slot.feedbackSent || slot.feedback.winner === config.DEFAULT_WINNER) {
			return;
		}
		slot.feedbackSent = true;

		var type = slot.type,
			feedback = {
				success: true,
				data: {
					size: slot.size[0] + 'x' + slot.size[1],
					siteId: config.SITE_ID,
					siteDomain: window.adpushup.config.siteDomain,
					placement: slot.placement,
					containerId: slot.containerId,
					type: slot.type,
					url: window.location.href,
					bids: getBidDataForFeedback(slot.containerId) || [],
					winner: slot.feedback.winner || config.DEFAULT_WINNER,
					winningRevenue: slot.feedback.winningRevenue || 0,
					winnerAdUnitId: slot.feedback.winnerAdUnitId || null,
					timedOutBidders: slot.feedback.timedOutBidders || [],
					timeout: slot.feedback.timeout || slot.timeout,
					status: null,
					sectionId: slot.sectionId,
					variationId: slot.variationId,
					sectionName: slot.sectionName,
					pageGroup: slot.pageGroup,
					platform: slot.platform,
					packetId: window.adpushup.config.packetId
				}
			};

		switch (type) {
			case 1:
				Object.assign(feedback.data, {
					status: 'Type 1: Prebid rendered!'
				});
				feedback.data.bids.push({
					adId: slot.slotId,
					bidder: 'adx'
				});
				break;
			case 2:
				Object.assign(feedback.data, {
					status: 'Type 2: Postbid rendered!'
				});
				break;
			case 3:
				Object.assign(feedback.data, {
					status: 'Type 3: No bid or $0 bid from postbid, collapsing div!',
					winner: null
				});
				break;
			case 4:
				Object.assign(feedback.data, {
					status: 'Type 4: No bidder config present but dfp slot present, rendering adx tag!',
					winner: null
				});
				break;
			case 5:
				Object.assign(feedback.data, {
					status: 'Type 5: No bidder config or dfp slot present, collapsing div!',
					winner: null
				});
				break;
			case 6:
				Object.assign(feedback.data, {
					status: 'Type 6: Browser not supported but dfp slot present, rendering adx tag!',
					winner: null
				});
				break;
			case 7:
				Object.assign(feedback.data, {
					status: 'Type 7: Browser not supported and no dfp slot present, collapsing div!',
					winner: null
				});
				break;
			case 8:
				Object.assign(feedback.data, {
					status: 'Type 8: Adsense fallback won!',
					winner: config.ADSENSE.bidderName
				});
		}
		//if (feedback.data.winner && feedback.data.winner !== config.DEFAULT_WINNER) {
		utils.sendFeedback(feedback);
		//}
	};

module.exports = {
	feedback: feedback,
	getBidDataForFeedback: getBidDataForFeedback
};
