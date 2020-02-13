// Auction handler

var utils = require('./utils');
var adp = require('./adp');
var config = require('./config');
var adpConfig = window.adpushup.config;
var constants = require('./constants');
var render = require('./render');
var auction = {
	end: function(adpBatchId) {
		var adpBatches = adpConfig.apLiteActive
			? window.apLite.adpBatches
			: window.adpushup.adpTags.adpBatches;
		var adpSlots = utils.getCurrentAdpSlotBatch(adpBatches, adpBatchId);

		adpConfig.apLiteActive
			? (window.apLite.batchPrebiddingComplete = true)
			: (window.adpTags.batchPrebiddingComplete = true);

		if (adpSlots.length) {
			return render.init(adpSlots);
		}

		return;
	},
	getAuctionResponse: function(adpBatchId) {
		utils.log(window._apPbJs.getBidResponses());

		return this.end(adpBatchId);
	},
	requestBids: function(pbjs, adpBatchId) {
		var that = this;

		pbjs.requestBids({
			timeout: config.PREBID_CONFIG.timeOut || constants.PREBID.TIMEOUT,
			bidsBackHandler: that.getAuctionResponse.bind(that, adpBatchId)
		});
	},
	getSizeConfig: function() {
		var sizeConfigFromDB = config.PREBID_CONFIG.deviceConfig.sizeConfig;
		var pbSizeConfig = [];
		var labelIndexTracker = {};

		sizeConfigFromDB.forEach(function(obj) {
			// if label doesn't exist in pbSizeConfig
			if (!labelIndexTracker[obj.labels[0]]) {
				labelIndexTracker[obj.labels[0]] = pbSizeConfig.length;
				pbSizeConfig.push({
					mediaQuery: obj.mediaQuery,
					sizesSupported: obj.sizesSupported,
					labels: obj.labels
				});
			}
			// otherwise merge sizesSupported
			else {
				var deviceConfig = pbSizeConfig[labelIndexTracker[obj.labels[0]]];
				var newSizes = deviceConfig.sizesSupported.concat(obj.sizesSupported);
				var newUniqueSizes = newSizes.filter(function(value, index, self) {
					return self.indexOf(value) === index;
				});

				deviceConfig.sizesSupported = newUniqueSizes;
			}
		});

		return pbSizeConfig;
	},
	getBidderSettings: function() {
		var bidders = config.PREBID_CONFIG.hbcf;
		var keys = constants.ADSERVER_TARGETING_KEYS;

		// Set custom default key value pairs
		var bidderSettings = {
			standard: {
				adserverTargeting: [
					{
						key: keys.BIDDER,
						val: function(bidResponse) {
							return bidResponse.bidderCode;
						}
					},
					{
						key: keys.AD_ID,
						val: function(bidResponse) {
							return bidResponse.adId;
						}
					},
					{
						key: keys.CPM,
						val: function(bidResponse) {
							return bidResponse.pbDg; // Dense granularity
						}
					}
				]
			}
		};

		// Adjust Bid CPM according to bidder revenueShare
		for (var bidderCode in bidders) {
			var revenueShare = parseFloat(bidders[bidderCode].revenueShare);

			if (
				bidders.hasOwnProperty(bidderCode) &&
				bidders[bidderCode].bids === 'gross' &&
				!isNaN(revenueShare)
			) {
				bidderSettings[bidderCode] = {
					bidCpmAdjustment: function(bidCpm) {
						return bidCpm - bidCpm * (revenueShare / 100);
					}
				};
			}
		}

		return bidderSettings;
	},
	setBidderAliases(pbjs) {
		const bidders = config.PREBID_CONFIG.hbcf;
		for (const bidderCode in bidders) {
			if (bidders.hasOwnProperty(bidderCode) && bidders[bidderCode].alias) {
				pbjs.aliasBidder(bidders[bidderCode].alias, bidderCode);
			}
		}
	},
	setPrebidConfig: function(pbjs, prebidSlots) {
		var pbConfig = {
			rubicon: {
				singleRequest: true
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
			priceGranularity: constants.PREBID.PRICE_GRANULARITY,
			sizeConfig: this.getSizeConfig(),
			useBidCache: true,
			schain: {
				validation: 'strict',
				config: {
					ver: '1.0', //required
					complete: 1, //required
					nodes: [
						//required //SupplyChainNode object
						{
							asi: 'adpushup.com', //required
							sid: adp.config.ownerEmailMD5, //MD5 hash for chris@poshonpennies.com
							hp: 1 //required
						}
					]
				}
			}
		};

		if (
			config.PREBID_CONFIG.currencyConfig &&
			config.PREBID_CONFIG.currencyConfig.adServerCurrency &&
			config.PREBID_CONFIG.currencyConfig.granularityMultiplier
		) {
			pbConfig.currency = config.PREBID_CONFIG.currencyConfig;
		}

		pbjs.setConfig(pbConfig);

		pbjs.addAdUnits(prebidSlots);

		pbjs.bidderSettings = this.getBidderSettings();

		this.setBidderAliases(pbjs);
	},
	start: function(prebidSlots, adpBatchId) {
		var pbjs = window._apPbJs;

		pbjs.que.push(
			function() {
				this.setPrebidConfig(pbjs, prebidSlots);
				this.requestBids(pbjs, adpBatchId);
			}.bind(this)
		);
	}
};

module.exports = auction;
