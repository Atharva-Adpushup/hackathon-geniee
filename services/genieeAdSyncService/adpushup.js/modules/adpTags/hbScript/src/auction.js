// Auction handler

var utils = require('./utils');
var adp = require('./adp');
var config = require('./config');
var adpConfig = window.adpushup.config;
var constants = require('./constants');
var render = require('./render');
var s2sConfigGen = require('./s2sConfigGen');
const commonConsts = require('../../../../config/commonConsts');

const country = window.adpushup.config.country;
const doesGdprApplies = country && commonConsts.EU_COUNTRY_LIST.indexOf(country) > -1;
const doesCcpaApplies = country && country === 'US';

var auction = {
	end: function(adpBatchId) {
		var adpBatches = adpConfig.apLiteActive
			? window.apLite.adpBatches
			: window.adpushup.adpTags.adpBatches;
		var adpBatch = utils.getCurrentAdpSlotBatch(adpBatches, adpBatchId);
		var adpSlots = adpBatch.adpSlots;

		adpConfig.apLiteActive
			? (window.apLite.batchPrebiddingComplete = true)
			: (window.adpTags.batchPrebiddingComplete = true);

		if (
			adpBatch.auctionStatus.prebid == 'done' &&
			adpBatch.auctionStatus.amazonUam == 'done' &&
			adpSlots.length
		) {
			adpSlots.forEach(function(adpSlot) {
				adpSlot.biddingComplete = true;
				adpSlot.renderedPostBid = false;
			});
			return render.init(adpSlots);
		}

		return;
	},
	getAuctionResponse: function(adpBatchId) {
		utils.log(window._apPbJs.getBidResponses());
		var adpBatches = adpConfig.apLiteActive
			? window.apLite.adpBatches
			: window.adpushup.adpTags.adpBatches;
		var adpBatch = utils.getCurrentAdpSlotBatch(adpBatches, adpBatchId);

		adpBatch.auctionStatus.prebid = 'done';
		const returnVal = this.end(adpBatchId);

		window.adpushup.utils.logPerformanceEvent(
			commonConsts.EVENT_LOGGER.EVENTS.AUCTION_END_DELAY
		);

		window.adpushup.utils.sendPerformanceEventLogs();
		return returnVal;
	},
	requestBids: function(pbjs, adpBatchId, slotCodes, timeOut) {
		var that = this;

		pbjs.requestBids({
			timeout: timeOut || constants.PREBID.TIMEOUT,
			adUnitCodes: slotCodes,
			bidsBackHandler: that.getAuctionResponse.bind(that, adpBatchId)
		});

		window.adpushup.utils.logPerformanceEvent(
			commonConsts.EVENT_LOGGER.EVENTS.AUCTION_START_DELAY
		);
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
					},
					{
						key: keys.FORMAT,
						val: function(bidResponse) {
							return bidResponse.mediaType; // Current Ad Format
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
						return bidCpm - bidCpm * (this.revenueShare / 100);
					}.bind({ revenueShare: revenueShare })
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
	setPrebidConfig: function(pbjs, prebidAuctionTimeOut) {
		const userIds = [
			{
				name: 'unifiedId',
				params: {
					url: '//match.adsrvr.org/track/rid?ttd_pid=pubmatic&fmt=json'
				},
				storage: {
					type: 'html5',
					name: 'pbjs-unifiedid', // set localstorage with this name
					expires: 60
				}
			},
			{
				name: 'criteo'
			}
		];

		if (adp.config.siteId === 37780) {
			// release live ramp only for one site for POC testing purposes.
			userIds.push({
				name: "identityLink",
				params: {
					pid: '13302'
				},
				storage: {
					type: "html5",
					name: "pbjs-identityLinkId",
					expires: 30
				}
			});
		}

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
				},
				userIds,
				syncDelay: 3000 // 3 seconds after the first auction
			},
			publisherDomain: adp.config.siteDomain,
			bidderSequence: config.PREBID_CONFIG.prebidConfig.enableBidderSequence
				? constants.PREBID.BIDDER_SEQUENCE.FIXED
				: constants.PREBID.BIDDER_SEQUENCE.RANDOM,
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
			},
			// Prebid client-side cache required for video format bidding by Pubmatic and IX adapters to cache VAST XML
			cache: {
				url: 'https://prebid.adnxs.com/pbc/v1/cache'
			}
		};

		if (doesCcpaApplies) {
			pbConfig.consentManagement = {
				usp: {
					cmpApi: 'iab',
					timeout: 1000 // US Privacy timeout 1000ms
				}
			};
		}

		if (doesGdprApplies) {
			pbConfig.consentManagement = {
				gdpr: {
					cmpApi: 'iab',
					timeout: 8000,
					defaultGdprScope: true
				}
			};
		}

		const s2sConfigObj = s2sConfigGen.generateS2SConfig(prebidAuctionTimeOut);
		if (s2sConfigObj) {
			pbConfig.s2sConfig = s2sConfigObj;
		}

		if (
			config.PREBID_CONFIG.currencyConfig &&
			config.PREBID_CONFIG.currencyConfig.adServerCurrency &&
			config.PREBID_CONFIG.currencyConfig.granularityMultiplier
		) {
			pbConfig.currency = config.PREBID_CONFIG.currencyConfig;

			//add default rates for KhaleejTimes since the ctheir GAM currenct "AED" is not in the currency.json
			// #TODO: remove this once the currecny service is deployed
			if (window.adpushup.config.siteId == 42156) {
				pbConfig.currency.defaultRates = { USD: { AED: 1 } };
			}
		}

		pbjs.setConfig(pbConfig);

		pbjs.bidderSettings = this.getBidderSettings();

		this.setBidderAliases(pbjs);
	},
	addSlotsToPbjs: function(pbjs, prebidSlots) {
		return pbjs.addAdUnits(prebidSlots);
	},
	startAmazonAuction: function(slots, adpBatchId, hasRefreshSlots) {
		var adpBatches = adp.config.apLiteActive
			? window.apLite.adpBatches
			: window.adpushup.adpTags.adpBatches;
		var adpBatch = utils.getCurrentAdpSlotBatch(adpBatches, adpBatchId);
		var apstag = window.apstag;

		var auctionEnd = this.end;

		apstag.fetchBids(
			{
				slots: slots,
				timeout: hasRefreshSlots
					? config.PREBID_CONFIG.amazonUAMConfig.refreshTimeOut
					: config.PREBID_CONFIG.amazonUAMConfig.timeOut
			},
			function(bids) {
				apstag.setDisplayBids();
				adpBatch.auctionStatus.amazonUam = 'done';
				auctionEnd(adpBatchId);
			}
		);
	},
	startPrebidAuction: function(prebidSlots, adpBatchId) {
		var pbjs = window._apPbJs,
			slotCodes = [],
			hasRefreshSlots,
			prebidAuctionTimeOut,
			newSlots = [],
			refreshSlots = [],
			pbjsSlots = pbjs.adUnits.map(slot => slot.code);

		function slotExistsInPbjs(slot) {
			return pbjsSlots.indexOf(slot.code) !== -1;
		}

		prebidSlots.forEach(slot => {
			slotCodes.push(slot.code);
			slotExistsInPbjs(slot) ? refreshSlots.push(slot) : newSlots.push(slot);
		});

		hasRefreshSlots = !!refreshSlots.length;
		prebidAuctionTimeOut = hasRefreshSlots
			? config.PREBID_CONFIG.prebidConfig.refreshTimeOut ||
			  config.PREBID_CONFIG.prebidConfig.timeOut
			: config.PREBID_CONFIG.prebidConfig.timeOut;

		var forceHbTimeout = adp.utils.getQueryParams().forceHbTimeout;
		if (forceHbTimeout) {
			prebidAuctionTimeOut = parseInt(forceHbTimeout, 10);
			adp.utils.log(`Forced HB Timeout to ${forceHbTimeout}`);
		}

		pbjs.que.push(
			function() {
				this.setPrebidConfig(pbjs, prebidAuctionTimeOut);
				newSlots.length && this.addSlotsToPbjs(pbjs, newSlots);
				this.requestBids(pbjs, adpBatchId, slotCodes, prebidAuctionTimeOut);
			}.bind(this)
		);
	}
};

module.exports = auction;
