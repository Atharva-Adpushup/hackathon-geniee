// Adp tags library

var prebidSandbox = require('./prebidSandbox'),
	utils = require('../helpers/utils'),
	logger = require('../helpers/logger'),
	config = require('./config'),
	inventory = config.INVENTORY,
	find = require('lodash.find'),
	adpRender = require('./adpRender'),
	// Maps a particular adp slot to a dfp ad unit and a prebid bidder config
	inventoryMapper = function(size, optionalParam) {
		var width = size[0],
			height = size[1],
			size = width + 'x' + height,
			dfpAdUnit = null,
			availableSlots = inventory.dfpAdUnits[size],
			bidders = null;

		if (
			optionalParam.headerBidding &&
			inventory.hbConfig &&
			Array.isArray(inventory.hbConfig.bidderAdUnits[size])
		) {
			var overrideSize = size;
			if (
				optionalParam.overrideActive &&
				optionalParam.overrideSizeTo &&
				Array.isArray(inventory.hbConfig.bidderAdUnits[optionalParam.overrideSizeTo])
			) {
				overrideSize = optionalParam.overrideSizeTo;
			}

			bidders = inventory.hbConfig.bidderAdUnits[overrideSize]
				? inventory.hbConfig.bidderAdUnits[overrideSize].pop()
				: null;
		}

		if (availableSlots.length) {
			if (optionalParam.dfpAdunit && availableSlots.indexOf(optionalParam.dfpAdunit) !== -1) {
				dfpAdUnit = availableSlots.splice(availableSlots.indexOf(optionalParam.dfpAdunit), 1)[0];
			} else {
				dfpAdUnit = inventory.dfpAdUnits[size].pop();
			}
		}
		return {
			dfpAdUnit: dfpAdUnit,
			bidders: bidders
		};
	},
	// Adds batch Id to all the adp slots in a batch
	addBatchIdToAdpSlots = function(adpSlots, batchId) {
		Object.keys(adpSlots).forEach(function(slot) {
			adpSlots[slot].batchId = batchId;
		});
	},
	// Initiate prebidding for an adpSlots batch
	prebidBatching = function(adpSlotsBatch) {
		prebidSandbox.createPrebidContainer(adpSlotsBatch);
	},
	createSlot = function(containerId, size, placement, optionalParam) {
		var adUnits = inventoryMapper(size, optionalParam),
			slotId = adUnits.dfpAdUnit,
			bidders = optionalParam.headerBidding ? adUnits.bidders : [];

		adpTags.adpSlots[containerId] = {
			slotId: slotId,
			optionalParam: optionalParam,
			bidders: bidders || [],
			placement: placement,
			activeDFPNetwork: utils.getActiveDFPNetwork(),
			size: size,
			containerId: containerId,
			timeout: config.PREBID_TIMEOUT,
			gSlot: null,
			hasRendered: false,
			biddingComplete: false,
			containerPresent: false,
			feedbackSent: false,
			hasTimedOut: false,
			feedback: {
				winner: config.DEFAULT_WINNER
			}
		};
		return adpTags.adpSlots[containerId];
	},
	processBatchForBidding = function() {
		var batchId = adpTags.currentBatchId,
			adpSlots = adpTags.currentBatchAdpSlots;

		adpTags.adpBatches.push({
			batchId: batchId,
			adpSlots: adpSlots
		});

		// Add batch id to all batched adpSlots
		addBatchIdToAdpSlots(adpSlots, batchId);

		// Initiate prebidding for current adpSlots batch
		prebidBatching(utils.getCurrentAdpSlotBatch(adpTags.adpBatches, batchId));

		// Reset the adpSlots batch
		adpTags.currentBatchId = null;
		adpTags.currentBatchAdpSlots = [];
		adpTags.slotInterval = null;

		logger.log('Timeout interval ended');
	},
	queSlotForBidding = function(slot) {
		if (!adpTags.slotInterval) {
			adpTags.currentBatchId = !adpTags.currentBatchId
				? Math.abs(utils.hashCode(+new Date() + ''))
				: adpTags.currentBatchId;
		} else {
			logger.log('Timeout interval already defined, resetting it');
			clearTimeout(adpTags.slotInterval);
		}
		adpTags.currentBatchAdpSlots.push(slot);
		adpTags.slotInterval = setTimeout(processBatchForBidding, config.SLOT_INTERVAL);
	},
	// Adp tags main object instance - instantiates adpslots
	adpTags = {
		adpSlots: {},
		config: config,
		que: [],
		gptRefreshIntervals: [],
		slotInterval: null,
		adpBatches: [],
		currentBatchAdpSlots: [],
		currentBatchId: null,
		batchPrebiddingComplete: false,
		// Function to define new adp slot
		shouldRun: function(optionalParam) {
			if (optionalParam && optionalParam.network == 'geniee') {
				return false;
			}
		},
		defineSlot: function(containerId, size, placement, optionalParam) {
			var optionalParam = optionalParam || {},
				slot = createSlot(containerId, size, placement, optionalParam);
			logger.log('Slot defined for container : ' + containerId);

			if (utils.isSupportedBrowser()) {
				// && adpTags.shouldRun(optionalParam)) {
				if (!optionalParam.headerBidding) {
					slot.type = 9;
					logger.log('Type 9: HB disabled by editor.');
				} else if (slot.bidders.length) {
					if (slot.slotId) {
						logger.log('Type 1: Attaching gSlot and running prebid sandboxing');
						slot.type = 1;
					} else {
						logger.log('Type 2: Running prebid sandboxing and then postbid as dfp slot is not present');
						slot.type = 2;
					}
				} else {
					// Type 3 handled from within case 2
					// slot.biddingComplete = true;
					if (slot.slotId) {
						logger.log('Type 4: No prebid bidder config, rendering adx tag');
						slot.type = 4;
					} else {
						logger.log('Type 5: No prebid bidder config or dfp slot, collapsing div');
						slot.type = 5;
					}
				}
			} else {
				logger.log('Browser not supported by AdPushup.');
				// slot.biddingComplete = true;

				slot.type = slot.slotId ? 6 : 7;
			}
			queSlotForBidding(this.adpSlots[containerId]);
			return this.adpSlots[containerId];
		},
		processQue: function() {
			while (this.que.length) {
				this.que.shift().call(this);
			}
		},
		extendConfig: function(newConfig) {
			Object.assign(config, newConfig);
		},
		extendTargeting: function(newTargeting) {
			Object.assign(config.TARGETING, newTargeting);
		},
		// Function to display adp slot for given container id
		display: function(containerId) {
			var slot = this.adpSlots[containerId];

			if (slot && !slot.containerPresent) {
				slot.containerPresent = true;
				slot.sectionId = utils.getSectionId(containerId);
				slot.variationId = utils.getVariationId(containerId);

				slot.pageGroup = utils.getPageGroup();
				slot.platform = utils.getPlatform();
				//logger.log('Rendering adp tag for container : ' + containerId);
				adpRender.renderGPT(slot);
			}
		}
	};

module.exports = adpTags;
