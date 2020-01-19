// AdpTags module

var adp = require('./adp');
var config = require('./config');
var constants = require('./constants');
var utils = require('./utils');
var hb = require('./hb');
var gpt = require('./gpt');
var BACKWARD_COMPATIBLE_MAPPING = require('./constants').AD_SIZE_MAPPING.IAB_SIZES
	.BACKWARD_COMPATIBLE_MAPPING;
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
		prebidBatching: function(adpSlotsBatch) {
			if (adpSlotsBatch && adpSlotsBatch.length) {
				hb.createPrebidSlots(adpSlotsBatch);
			}
		},
		processBatchForBidding: function() {
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
		resetSlotFeedback: function(slot) {
			slot.hasRendered = false;
			slot.biddingComplete = false;
			slot.feedbackSent = false;
			slot.hasTimedOut = false;
			slot.feedback = {
				winner: constants.FEEDBACK.DEFAULT_WINNER
			};
		},
		queSlotForBidding: function(slot) {
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
			this.slotInterval = setTimeout(
				this.processBatchForBidding.bind(this),
				constants.BATCHING_INTERVAL
			);
		},
		getBiddersForSlot: function(size) {
			var width = size[0];
			var height = size[1];
			var size = width + 'x' + height;
			var bidders = [];
			var prebidConfig = config.PREBID_CONFIG;
			var hbConfig = prebidConfig.hbcf;

			if (hbConfig && Object.keys(hbConfig).length) {
				Object.keys(hbConfig).forEach(function(bidder) {
					var bidderData = hbConfig[bidder];

					if (!bidderData.isPaused) {
						if (bidderData.sizeLess) {
							bidders.push({
								bidder: bidder,
								params: bidderData.config
							});
						}

						function getOriginalOrDownwardSizeBidderParams(
							allSizesParams,
							inventorySize
						) {
							if (!allSizesParams || !Object.keys(allSizesParams).length) return;

							if (
								inventorySize === 'responsivexresponsive' &&
								allSizesParams['responsive']
							)
								return allSizesParams['responsive'];

							if (allSizesParams[inventorySize]) return allSizesParams[inventorySize];

							for (const originalSize in BACKWARD_COMPATIBLE_MAPPING) {
								if (
									originalSize === inventorySize &&
									BACKWARD_COMPATIBLE_MAPPING[originalSize].length
								) {
									const backwardSizes = BACKWARD_COMPATIBLE_MAPPING[originalSize];

									for (let backwardSize of backwardSizes) {
										backwardSize = backwardSize.join('x');
										if (allSizesParams[backwardSize])
											return allSizesParams[backwardSize];
									}

									return;
								}
							}
						}

						if (!bidderData.sizeLess && bidderData.reusable) {
							const bidderParams = getOriginalOrDownwardSizeBidderParams(
								bidderData.config,
								size
							);

							if (bidderParams) {
								bidders.push({
									bidder: bidder,
									params: bidderParams
								});
							}
						}
					}
				});
			}

			return bidders;
		},
		createSlot: function(containerId, size, placement, optionalParam) {
			var slotId = optionalParam.dfpAdunit;
			var bidders = this.getBiddersForSlot(size);
			var isResponsive = optionalParam.isResponsive;
			var sectionName = optionalParam.sectionName;
			var multipleAdSizes =
				constants.AD_SIZE_MAPPING.IAB_SIZES.BACKWARD_COMPATIBLE_MAPPING[size.join('x')] ||
				optionalParam.multipleAdSizes;
			var services = optionalParam.services;
			var formats =
				config.PREBID_CONFIG && config.PREBID_CONFIG.formats
					? config.PREBID_CONFIG.formats
					: constants.PREBID.DEFAULT_FORMATS;
			var timeout =
				config.PREBID_CONFIG && config.PREBID_CONFIG.timeOut
					? config.PREBID_CONFIG.timeOut
					: constants.PREBID.TIMEOUT;

			this.adpSlots[containerId] = {
				slotId: slotId,
				optionalParam: optionalParam,
				bidders: bidders || [],
				formats: formats,
				placement: placement,
				activeDFPNetwork: utils.getActiveDFPNetwork(),
				size: size,
				sectionName: sectionName,
				computedSizes: multipleAdSizes || [],
				isResponsive: isResponsive,
				containerId: containerId,
				timeout: timeout,
				gSlot: null,
				hasRendered: false,
				biddingComplete: false,
				containerPresent: false,
				feedbackSent: false,
				hasTimedOut: false,
				services: services,
				feedback: {
					winner: constants.FEEDBACK.DEFAULT_WINNER
				}
			};

			return this.adpSlots[containerId];
		},
		defineSlot: function(containerId, size, placement, optionalParam) {
			var optionalParam = optionalParam || {};
			var slot = this.createSlot(containerId, size, placement, optionalParam);

			this.queSlotForBidding(slot);
			return slot;
		},
		processQue: function() {
			while (this.que.length) {
				this.que.shift().call(this);
			}
		},
		extendConfig: function(newConfig) {
			Object.assign(config, newConfig);
		},
		display: function(containerId) {
			var slot = this.adpSlots[containerId];

			if (slot) {
				slot.sectionId = utils.getSectionId(containerId);
				slot.pageGroup = adp.config.pageGroup;
				slot.platform = adp.config.platform;

				gpt.renderSlot(window.googletag, slot);
			}
		}
	},
	init: function(w) {
		w.adpTags = w.adpTags || {};
		w.adpTags.que = w.adpTags.que || [];

		var adpQue;
		if (w.adpushup.adpTags) {
			adpQue = w.adpushup.adpTags.que;
		} else {
			adpQue = [];
		}

		var existingAdpTags = Object.assign({}, w.adpushup.adpTags);
		var adpTagsModule = this.module;

		// Set adpTags if already present else initialise module
		w.adpushup.adpTags = existingAdpTags.adpSlots ? existingAdpTags : adpTagsModule;

		// Merge adpQue with any existing que items if present
		w.adpushup.adpTags.que = w.adpushup.adpTags.que.concat(adpQue).concat(w.adpTags.que);
		w.adpTags = w.adpushup.adpTags;

		w.adpushup.adpTags.processQue();
		w.adpushup.adpTags.que.push = function(queFunc) {
			[].push.call(w.adpushup.adpTags.que, queFunc);
			w.adpushup.adpTags.processQue();
		};
	}
};

module.exports = adpTags;
