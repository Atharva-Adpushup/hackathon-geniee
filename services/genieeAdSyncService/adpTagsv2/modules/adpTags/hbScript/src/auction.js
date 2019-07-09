// Auction handler

var utils = require('./utils');
var adp = require('./adp');
var config = require('./config');
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
			timeout: config.PREBID_CONFIG.timeOut,
			bidsBackHandler: that.getAuctionResponse.bind(that, adpBatchId)
		});
	},
	getSizeConfig: function () {
		var sizeConfigFromDB = config.INVENTORY.deviceConfig.sizeConfig;
		var pbSizeConfig = [];
		var labelIndexTracker = {};

		sizeConfigFromDB.forEach(obj => {
			// if label doesn't exist in pbSizeConfig
			if (!labelIndexTracker[obj.labels[0]]) {
				labelIndexTracker[obj.labels[0]] = pbSizeConfig.length;
				pbSizeConfig.push({ mediaQuery: obj.mediaQuery, sizesSupported: obj.sizesSupported, labels: obj.labels });
			}
			// otherwise merge sizesSupported
			else {
				var deviceConfig = pbSizeConfig[labelIndexTracker[obj.labels[0]]];
				var newSizes = deviceConfig.sizesSupported.concat(obj.sizesSupported);
				var newUniqueSizes = newSizes.filter(function (value, index, self) {
					return self.indexOf(value) === index;
				});

				deviceConfig.sizesSupported = newUniqueSizes;
			}
		});

		return pbSizeConfig;
	},
	getBidderSettings: function () {
		var bidders = config.INVENTORY.hbcf;
		var bidderSettings = {};

		for (var bidderCode in bidders) {
			var revenueShare = parseFloat(bidders[bidderCode].revenueShare);

			if (bidders.hasOwnProperty(bidderCode) && bidders[bidderCode].bids === 'gross' && !isNaN(revenueShare) ) {
				bidderSettings[bidderCode] = {
					bidCpmAdjustment: function (bidCpm) {
						return bidCpm - bidCpm * (revenueShare / 100);
					}
				}
			}
		}

		return bidderSettings;
	},
	setPrebidConfig: function(pbjs, prebidSlots) {
		pbjs.setConfig({
			rubicon: {
				singleRequest: true
			},
			publisherDomain: adp.config.siteDomain,
			bidderSequence: constants.PREBID.BIDDER_SEQUENCE,
			priceGranularity: constants.PREBID.PRICE_GRANULARITY,
			sizeConfig: this.getSizeConfig()
		});

		pbjs.addAdUnits(prebidSlots);

		pbjs.bidderSettings = this.getBidderSettings();

		pbjs.aliasBidder('appnexus', 'springserve');
		pbjs.aliasBidder('appnexus', 'districtm');
		pbjs.aliasBidder('appnexus', 'brealtime');
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
