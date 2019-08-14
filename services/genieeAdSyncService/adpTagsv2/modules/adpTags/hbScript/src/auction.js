// Auction handler

var utils = require('./utils');
var adp = require('./adp');
var constants = require('./constants');
var render = require('./render');
var auction = {
	end: function(adpBatchId) {
		var adpSlots = utils.getCurrentAdpSlotBatch(window.adpushup.adpTags.adpBatches, adpBatchId);

		window.adpushup.adpTags.batchPrebiddingComplete = true;
		if (Object.keys(adpSlots).length) {
			return render.init(adpSlots);
		}

		return;
	},
	getAuctionResponse: function(adpBatchId) {
		console.log(window.pbjs.getBidResponses());

		return this.end(adpBatchId);
	},
	requestBids: function(pbjs, adpBatchId) {
		var that = this;

		pbjs.requestBids({
			timeout: constants.PREBID.TIMEOUT,
			bidsBackHandler: that.getAuctionResponse.bind(that, adpBatchId)
		});
	},
	setPrebidConfig: function(pbjs, prebidSlots) {
		pbjs.setConfig({
			rubicon: {
				singleRequest: true
			},
			cache: {
				url: '//prebid.adnxs.com/pbc/v1/cache'
			},
			userSync: {
				filterSettings: {
					iframe: {
						bidders: '*',
						filter: 'include'
					}
				}
			},
			publisherDomain: adp.config.siteDomain,
			bidderSequence: constants.PREBID.BIDDER_SEQUENCE,
			priceGranularity: constants.PREBID.PRICE_GRANULARITY
		});

		pbjs.addAdUnits(prebidSlots);

		pbjs.bidderSettings = {
			districtm: {
				bidCpmAdjustment: function(bidCpm) {
					return bidCpm - bidCpm * (10 / 100);
				}
			},
			aardvark: {
				bidCpmAdjustment: function(bidCpm) {
					return bidCpm - bidCpm * (20 / 100);
				}
			},
			oftmedia: {
				bidCpmAdjustment: function(bidCpm) {
					return bidCpm - bidCpm * (12 / 100);
				}
			},
			rubicon: {
				bidCpmAdjustment: function(bidCpm) {
					return bidCpm - bidCpm * (20 / 100);
				}
			},
			eplanning: {
				bidCpmAdjustment: function(bidCpm) {
					return bidCpm - bidCpm * (40 / 100);
				}
			}
		};

		pbjs.aliasBidder('appnexus', 'districtm');
		pbjs.aliasBidder('appnexus', 'oftmedia');
	},
	start: function(prebidSlots, adpBatchId) {
		var pbjs = window.pbjs;

		pbjs.que.push(
			function() {
				this.setPrebidConfig(pbjs, prebidSlots);
				this.requestBids(pbjs, adpBatchId);
			}.bind(this)
		);
	}
};

module.exports = auction;
