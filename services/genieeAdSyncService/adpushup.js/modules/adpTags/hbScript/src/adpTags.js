// Adp tags library

var w = window,
	prebidSandbox = require('./prebidSandbox'),
	utils = require('../helpers/utils'),
	config = require('./config'),
	inventory = config.INVENTORY,
	$ = require('./adp').$,
	adp = require('./adp').adp,
	adpRender = require('./adpRender'),
	// Maps a particular adp slot to a dfp ad unit and a prebid bidder config
	inventoryMapper = function(size, optionalParam) {
		// Reset inventory as default if site is SPA
		if (adp.config.isSPA || adp.config.spaButUsingHook) {
			inventory = $.extend(true, {}, w.adpTags.defaultInventory);
		}

		var width = size[0],
			height = size[1],
			size = width + 'x' + height,
			dfpAdUnit = null,
			availableSlots = inventory.dfpAdUnits[size],
			bidders = null;

		if (optionalParam.headerBidding && inventory.hbConfig && Array.isArray(inventory.hbConfig.bidderAdUnits[size])) {
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
				if (optionalParam.isManual) {
					dfpAdUnit = optionalParam.dfpAdunit;
				} else {
					dfpAdUnit = availableSlots.splice(availableSlots.indexOf(optionalParam.dfpAdunit), 1)[0];
				}
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
			bidders = optionalParam.headerBidding ? adUnits.bidders : [],
			isResponsive = optionalParam.isResponsive,
			sectionName = optionalParam.sectionName,
			multipleAdSizes = optionalParam.multipleAdSizes,
			services = optionalParam.services;

		adpTags.adpSlots[containerId] = {
			slotId: slotId,
			optionalParam: optionalParam,
			bidders: bidders || [],
			placement: placement,
			activeDFPNetwork: utils.getActiveDFPNetwork(),
			size: size,
			sectionName: sectionName,
			computedSizes: multipleAdSizes ? multipleAdSizes : [],
			isResponsive: isResponsive,
			containerId: containerId,
			timeout: config.PREBID_TIMEOUT,
			gSlot: null,
			hasRendered: false,
			biddingComplete: false,
			feedbackSent: false,
			hasTimedOut: false,
			services: services,
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
		shouldRun: function(optionalParam) {
			if (optionalParam && optionalParam.network == 'geniee') {
				return false;
			}
		},
		// Function to define new adp slot
		defineSlot: function(containerId, size, placement, optionalParam) {
			var optionalParam = optionalParam || {},
				slot = createSlot(containerId, size, placement, optionalParam);

			if (utils.isSupportedBrowser()) {
				// && adpTags.shouldRun(optionalParam)) {
				if (!optionalParam.headerBidding) {
					slot.type = 9;
				} else if (slot.bidders.length) {
					if (slot.slotId) {
						slot.type = 1;
					} else {
						slot.type = 2;
					}
				} else {
					// Type 3 handled from within case 2
					// slot.biddingComplete = true;
					if (slot.slotId) {
						slot.type = 4;
					} else {
						slot.type = 5;
					}
				}
			} else {
				// slot.biddingComplete = true;

				slot.type = slot.slotId ? 6 : 7;
			}
			this.queSlotForBidding(this.adpSlots[containerId]);
			return this.adpSlots[containerId];
		},
		resetSlotFeedback: function(slot) {
			slot.hasRendered = false;
			slot.biddingComplete = false;
			slot.feedbackSent = false;
			slot.hasTimedOut = false;
			slot.feedback = {
				winner: config.DEFAULT_WINNER
			};
		},
		queSlotForBidding: function(slot) {
			if (slot.toBeRefreshed) {
				this.resetSlotFeedback(slot);
			}

			if (!adpTags.slotInterval) {
				adpTags.currentBatchId = !adpTags.currentBatchId
					? Math.abs(utils.hashCode(+new Date() + ''))
					: adpTags.currentBatchId;
			} else {
				clearTimeout(adpTags.slotInterval);
			}
			adpTags.currentBatchAdpSlots.push(slot);
			adpTags.slotInterval = setTimeout(processBatchForBidding, config.SLOT_INTERVAL);
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

			if (slot) {
				slot.sectionId = utils.getSectionId(containerId);
				slot.variationId = utils.getVariationId();
				slot.variationName = utils.getVariationName();
				slot.pageGroup = utils.getPageGroup();
				slot.platform = utils.getPlatform();
				adpRender.renderGPT(slot);
			}
		}
	};

module.exports = adpTags;
