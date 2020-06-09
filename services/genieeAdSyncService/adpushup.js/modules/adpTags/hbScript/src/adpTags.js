// AdpTags module

var adp = require('./adp');
var config = require('./config');
var constants = require('./constants');
var utils = require('./utils');
var responsiveAds = require('./responsiveAds');
var hb = require('./hb');
var gpt = require('./gpt');
var globalSizes = config.SIZE_MAPPING.sizes || [];

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
				hb.start(adpSlotsBatch);
			}
		},
		processBatchForBidding: function() {
			var batchId = this.currentBatchId;
			var adpSlots = this.currentBatchAdpSlots;

			/**
			 * #TODO: this can be converted to a map with batchId being the key, instead of array.
			 * This will also allow to do away with using utils.getCurrentAdpSlotBatch everytime to get a batch of adpSlots for a given batchId
			 *
			 * */

			this.adpBatches.push({
				batchId: batchId,
				adpSlots: adpSlots,
				auctionStatus: {
					amazonUam: 'pending',
					prebid: 'pending'
				}
			});

			// Add batch id to all batched adpSlots
			utils.addBatchIdToAdpSlots(adpSlots, batchId);

			// Initiate prebidding for current adpSlots batch
			this.prebidBatching(utils.getCurrentAdpSlotBatch(this.adpBatches, batchId).adpSlots);

			// Reset the adpSlots batch
			this.currentBatchId = null;
			this.currentBatchAdpSlots = [];
			this.slotInterval = null;
		},
		resetSlotFeedback: function(slot) {
			//slot.hasRendered = false;
			slot.biddingComplete = false;
			slot.feedbackSent = false;
			slot.auctionFeedbackSent = false;
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
		createSlot: function(containerId, size, placement, optionalParam) {
			var slotId = optionalParam.dfpAdunit;
			var isResponsive = optionalParam.isResponsive;
			var sectionName = optionalParam.sectionName;
			// var computedSizes = constants.AD_SIZE_MAPPING.IAB_SIZES.BACKWARD_COMPATIBLE_MAPPING[size.join(',')] || [];
			var services = optionalParam.services;
			var formats =
				(Array.isArray(optionalParam.formats) &&
					optionalParam.formats.length &&
					optionalParam.formats) ||
				constants.PREBID.DEFAULT_FORMATS;
			var bidders = optionalParam.headerBidding ? utils.getBiddersForSlot(size, formats) : [];
			var timeout =
				config.PREBID_CONFIG &&
				config.PREBID_CONFIG.prebidConfig &&
				config.PREBID_CONFIG.prebidConfig.timeOut
					? config.PREBID_CONFIG.prebidConfig.timeOut
					: constants.PREBID.TIMEOUT;
			var adType = optionalParam.adType;
			var sizeMapping = optionalParam.sizeMapping;

			/*
			if (isResponsive) {
				computedSizes = responsiveAds.getAdSizes(optionalParam.adId).collection;
			}

			computedSizes =
				computedSizes && computedSizes.length ? computedSizes.concat([]).reverse() : size;
			*/
			var adpSlot = {
				slotId: slotId,
				optionalParam: optionalParam,
				bidders: bidders || [],
				formats: formats,
				placement: placement,
				headerBidding: optionalParam.headerBidding,
				activeDFPNetwork: utils.getActiveDFPNetwork(),
				size: size,
				sectionName: sectionName,
				//computedSizes: computedSizes,
				isResponsive: isResponsive,
				containerId: containerId,
				timeout: timeout,
				gSlot: null,
				hasRendered: false,
				biddingComplete: false,
				containerPresent: false,
				feedbackSent: false,
				auctionFeedbackSent: false,
				hasTimedOut: false,
				services: services,
				feedback: {
					winner: constants.FEEDBACK.DEFAULT_WINNER
				},
				adType: adType,
				refreshCount: 0,
				sizeMapping: sizeMapping
			};

			this.computeSizesAndDefineGPTSlot(adpSlot);

			this.adpSlots[containerId] = adpSlot;

			return this.adpSlots[containerId];
		},
		computeSizesAndDefineGPTSlot: function(adpSlot) {
			var computedSizes = this.getComputedSizes(adpSlot);

			if (!computedSizes) {
				return;
			}

			adpSlot.computedSizes =
				computedSizes && computedSizes.length
					? computedSizes.concat([]).reverse()
					: [adpSlot.size];

			gpt.defineSlot(window.googletag, adpSlot);
		},
		defineSlot: function(containerId, size, placement, optionalParam) {
			var optionalParam = optionalParam || {};
			var slot = this.createSlot(containerId, size, placement, optionalParam);
			/**
			 * only case where computedSizes will not be set on slot is where it's a responsive slot and the ad container is not in the DOM
			 * So, there is no point doing header bidding on this slot without known sizes
			 */
			if (slot.computedSizes) {
				this.queSlotForBidding(slot);
			}
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

				/**
				 * only case where computedSizes will not be set on slot is where it's a responsive slot and the ad container was not in the DOM at the time of slot creation.
				 * Now, at the time of display call, ad container must be in the DOM.
				 * So, now we can compute the sizes and initiate header bidding on this slot.
				 */
				if (!slot.computedSizes) {
					this.computeSizesAndDefineGPTSlot(slot);
					this.queSlotForBidding(slot);
				}
				slot.hasRendered = true;
				gpt.renderSlots(window.googletag, [slot]);
			}
		},

		getComputedSizes: function(adpSlot) {
			var computedSizes;

			if (adpSlot.isResponsive) {
				// for a responsive slot the ad container has to be in the DOM for size computation.
				if (document.getElementById(adpSlot.containerId)) {
					computedSizes = responsiveAds.getAdSizes(adpSlot.optionalParam.adId).collection;
				} else {
					// return without defining gpt slot since we can not compute applicable sizes
					return;
				}
			} else {
				/**
				 * First we try to compute sizes using the size mapping (if present) for this adpSlot
				 * If size mapping is not present or if the sizes array returned is empty
				 * We use the adpSlot.size ([width, height]) to compute the sizes
				 *
				 * NOTE: The sizes are computed from the global list and filtered if their height and width are <= maxHeight and maxWidth
				 */

				const { sizeMapping } = adpSlot;
				const isValidSizeMapping = Array.isArray(sizeMapping) && sizeMapping.length > 0;

				if (isValidSizeMapping) {
					computedSizes = utils.getSizesComputedUsingSizeMapping(
						sizeMapping,
						globalSizes
					);
				}

				/*
				 * Checking if computed sizes is array with length 0 to handle the case where
				 * the sizeMapping might exist but no config for current viewport is present in
				 * the size mapping
				 */

				const isInvalidComputedSizes =
					!computedSizes || (Array.isArray(computedSizes) && computedSizes.length === 0);

				if (isInvalidComputedSizes) {
					const [width, height] = adpSlot.size;

					computedSizes = utils.getDownwardCompatibleSizes(width, height, globalSizes);
				}
			}

			return computedSizes;
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
