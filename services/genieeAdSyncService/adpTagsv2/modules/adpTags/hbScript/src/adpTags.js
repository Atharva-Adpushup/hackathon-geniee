// AdpTags module

var adp = require('./adp');
var config = require('./config');
var constants = require('./constants');
var utils = require('./utils');
var hb = require('./hb');
var inventoryMapper = require('./inventoryMapper');
var inventory = config.INVENTORY;
var adpTags = {
    module: {
        adpSlots: {},
        config: config,
        que: [],
        slotInterval: null,
        currentBatchId: null,
        currentBatchAdpSlots: [],
        adpBatches: [],
        batchPrebiddingComplete: false,
        prebidBatching: function (adpSlotsBatch) {
            hb.createPrebidSlots(adpSlotsBatch);
        },
        processBatchForBidding: function () {
            var batchId = this.currentBatchId;
            var adpSlots = this.currentBatchAdpSlots;

            this.adpBatches.push({ batchId: batchId, adpSlots: adpSlots });

            // Add batch id to all batched adpSlots
            utils.addBatchIdToAdpSlots(adpSlots, batchId);

            // Initiate prebidding for current adpSlots batch
            this.prebidBatching(utils.getCurrentAdpSlotBatch(this.adpBatches, batchId));

            // Reset the adpSlots batch
            this.currentBatchId = null;
            this.currentBatchAdpSlots = [];
            this.slotInterval = null;
        },
        resetSlotFeedback: function (slot) {
            slot.hasRendered = false;
            slot.biddingComplete = false;
            slot.feedbackSent = false;
            slot.hasTimedOut = false;
            slot.feedback = {
                winner: constants.FEEDBACK.DEFAULT_WINNER
            };
        },
        queSlotForBidding: function (slot) {
            if (slot.toBeRefreshed) {
                this.resetSlotFeedback(slot);
            }

            if (!this.slotInterval) {
                this.currentBatchId = !this.currentBatchId
                    ? Math.abs(utils.hashCode(String(+new Date())))
                    : this.currentBatchId;
            } else {
                clearTimeout(this.slotInterval);
            }
            this.currentBatchAdpSlots.push(slot);
            this.slotInterval = setTimeout(this.processBatchForBidding, constants.BATCHING_INTERVAL);
        },
        createSlot: function (containerId, size, placement, optionalParam) {
            var adUnits = inventoryMapper.get(inventory, size, optionalParam);
            var slotId = adUnits.dfpAdUnit;
            var bidders = optionalParam.headerBidding ? adUnits.bidders : [];
            var isResponsive = optionalParam.isResponsive;
            var sectionName = optionalParam.sectionName;
            var multipleAdSizes = optionalParam.multipleAdSizes;

            this.adpSlots[containerId] = {
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
                timeout: constants.PREBID.TIMEOUT,
                gSlot: null,
                hasRendered: false,
                biddingComplete: false,
                containerPresent: false,
                feedbackSent: false,
                hasTimedOut: false,
                feedback: {
                    winner: constants.FEEDBACK.DEFAULT_WINNER
                }
            };

            return this.adpSlots[containerId];
        },
        defineSlot: function (containerId, size, placement, optionalParam) {
            var optionalParam = optionalParam || {};
            var slot = this.createSlot(containerId, size, placement, optionalParam);

            this.queSlotForBidding(slot);
            return slot;
        },
        processQue: function () {
            while (this.que.length) {
                this.que.shift().call(this);
            }
        },
        extendConfig: function (newConfig) {
            Object.assign(config, newConfig);
        }
    },
    init: function (w) {
        w.adpTags = w.adpTags || {};
        w.adpTags.que = w.adpTags.que || [];

        var adpQue;
        if (adp.adpTags) {
            adpQue = adp.adpTags.que;
        } else {
            adpQue = [];
        }

        var existingAdpTags = Object.assign({}, adp.adpTags);
        var adpTagsModule = this.module;

        // Set adpTags if already present else initialise module
        adp.adpTags = existingAdpTags.adpSlots ? existingAdpTags : adpTagsModule;

        // Keep deep copy of inventory in adpTags module
        adp.adpTags.defaultInventory = adp.$.extend(true, {}, inventory);

        // Merge adpQue with any existing que items if present
        adp.adpTags.que = adp.adpTags.que.concat(adpQue).concat(w.adpTags.que);
        w.adpTags = adp.adpTags;

        adp.adpTags.processQue();
        adp.adpTags.que.push = function (queFunc) {
            [].push.call(adp.adpTags.que, queFunc);
            adp.adpTags.processQue();
        };
    }
};

module.exports = adpTags;