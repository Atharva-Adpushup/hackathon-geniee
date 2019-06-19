// Auction handler

var utils = require('./utils');
var adp = require('./adp');
var constants = require('./constants');
var render = require('./render');
var auction = {
	end: function (adpBatchId) {
		var adpSlots = utils.getCurrentAdpSlotBatch(adp.adpTags.adpBatches, adpBatchId);

		adp.adpTags.batchPrebiddingComplete = true;
		if (Object.keys(adpSlots).length) {
			return render.init(adpSlots);
		}

		return;
	},
	response: function (adpBatchId) {
		console.log(window.pbjs.getBidResponses());

		return this.end(adpBatchId);
	},
	requestBids: function (pbjs, adpBatchId) {
		var that = this;

		pbjs.requestBids({
			timeout: constants.PREBID.TIMEOUT,
			bidsBackHandler: that.response.bind(that, adpBatchId)
		});
	},
	setPrebidConfig: function (pbjs) {
		pbjs.setConfig({
			rubicon: {
				singleRequest: true
			},
			publisherDomain: adp.config.siteDomain,
			bidderSequence: constants.PREBID.BIDDER_SEQUENCE,
			priceGranularity: constants.PREBID.PRICE_GRANULARITY
				__SIZE_CONFIG___
				_PREBID_CURRENCY_CONFIG__
		});

		pbjs.addAdUnits(__AD_UNIT_CODE__);

		pbjs.bidderSettings = {
			openx: {
				bidCpmAdjustment: function (bidCpm) {
					return bidCpm - (bidCpm * (10 / 100));
				}
			},
			districtm: {
				bidCpmAdjustment: function (bidCpm) {
					return bidCpm - (bidCpm * (10 / 100));
				}
			},
			oftmedia: {
				bidCpmAdjustment: function (bidCpm) {
					return bidCpm - (bidCpm * (12 / 100));
				}
			},
			rubicon: {
				bidCpmAdjustment: function (bidCpm) {
					return bidCpm - (bidCpm * (20 / 100));
				}
			}
		};

		pbjs.aliasBidder("appnexus", "springserve");
		pbjs.aliasBidder("appnexus", "districtm");
		pbjs.aliasBidder("appnexus", "brealtime");
		pbjs.aliasBidder("appnexus", "oftmedia");
	},
	start: function (adpBatchId) {
		var pbjs = window.pbjs;

		pbjs.que.push(function () {
			this.setPrebidConfig(pbjs);
			this.requestBids(pbjs, adpBatchId);
		}.bind(this));
	}
};

module.exports = auction;
