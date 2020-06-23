// AdpTags module

var adp = require('./adp');
var config = require('./config');
var constants = require('./constants');
var utils = require('./utils');
var responsiveAds = require('./responsiveAds');
var hb = require('./hb');
var gpt = require('./gpt');
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
		isHbRuleTriggerMatch: function(trigger, sectionName) {
			function isMatch(triggerValue, triggerValueType, currentValue, operator) {
				var matched;

				switch (triggerValueType) {
					case 'array': {
						matched = triggerValue.indexOf(currentValue) !== -1;

						break;
					}
					case 'boolean': {
						matched = triggerValue;

						break;
					}
				}

				return operator === 'contain' ? matched : !matched;
			}

			switch (trigger.key) {
				case 'device': {
					if (!(Array.isArray(trigger.value) && trigger.value.length)) return false;

					var currentDevice = adpushup.config.platform.toLowerCase();

					return isMatch(trigger.value, 'array', currentDevice, trigger.operator);
				}
				case 'country': {
					if (!(Array.isArray(trigger.value) && trigger.value.length)) return false;

					var currentCountry = 'IN'; // TODO: [HbRules] Add get currentCountry Feature

					return isMatch(trigger.value, 'array', currentCountry, trigger.operator);
				}
				case 'time_range': {
					if (!(Array.isArray(trigger.value) && trigger.value.length)) return false;

					var timeNow = new Date();

					var isTimeMatch = utils.isGivenTimeExistsInTimeRanges(timeNow, trigger.value);

					return isMatch(isTimeMatch, 'boolean', timeNow, trigger.operator);
				}
				case 'day_of_the_week': {
					if (!(Array.isArray(trigger.value) && trigger.value.length)) return false;

					var days = [
						'sunday',
						'monday',
						'tuesday',
						'wednesday',
						'thursday',
						'friday',
						'saturday'
					];
					var todayIndex = new Date().getDay();
					var today = days[todayIndex];

					return isMatch(trigger.value, 'array', today, trigger.operator);
				}
				case 'adunit': {
					if (!(Array.isArray(trigger.value) && trigger.value.length)) return false;

					return isMatch(trigger.value, 'array', sectionName, trigger.operator);
				}
			}
		},
		getMatchedHbRules: function(sectionName) {
			var rules = config.PREBID_CONFIG.rules || [];

			matchedRules = rules.filter(rule => {
				var isActive = rule.isActive !== false; // we assumed a rule is active until it's defined as inactive.

				if (!isActive) return false;

				var ruleMatched = true;

				/**
				 * An Hb rule will match if it's all triggers matches
				 */
				for (var i = 0; i < rule.triggers.length; i++) {
					var trigger = rule.triggers[i];
					ruleMatched = this.isHbRuleTriggerMatch(trigger, sectionName);

					if (!ruleMatched) break;
				}

				return ruleMatched;
			});

			return matchedRules;
		},
		getComputedActions: function(hbRules) {
			if (!Array.isArray(hbRules) || !hbRules.length) return [];

			if (hbRules.length === 1) return hbRules[0].actions;

			/**
			 * If there are multiple rules then merge their actions.
			 * In case of duplicate action, choose the latest created rule action
			 */
			var actionsMapping = {};
			hbRules.forEach(hbRule => {
				for (var i = 0; i < hbRule.actions.length; i++) {
					var action = hbRule.actions[i];
					var currentActionDate = new Date(hbRule.createdAt);
					var oldActionDate =
						actionsMapping[action.key] &&
						new Date(actionsMapping[action.key].createdAt);

					if (!actionsMapping[action.key] || currentActionDate > oldActionDate) {
						actionsMapping[action.key] = {
							action: action,
							createdAt: hbRule.createdAt
						};

						continue;
					}
				}
			});

			var computedActions = Object.keys(actionsMapping).map(
				key => actionsMapping[key].action
			);

			return computedActions;
		},
		getDataByRules: function(size, formats, sectionName) {
			var outputData = {};

			var matchedHbRules = this.getMatchedHbRules(sectionName);
			var actions = this.getComputedActions(matchedHbRules);

			// TODO: [HbRules] Remove temp console logs
			console.log('matchedHbRules', matchedHbRules);
			console.log('actions', actions);

			var bidderRulesConfig = {};

			// if rule matches then apply actions
			actions.forEach(action => {
				switch (action.key) {
					// slotwise
					case 'allowed_bidders': {
						if (Array.isArray(action.value) && action.value.length) {
							bidderRulesConfig.allowedBidders = action.value;
						}

						break;
					}
					// slotwise
					case 'bidders_order': {
						if (Array.isArray(action.value) && action.value.length) {
							bidderRulesConfig.bidderSequence = action.value;

							config.PREBID_CONFIG.prebidConfig.enableBidderSequence = true;
						}

						break;
					}
					// slotwise
					case 'disable_header_bidding': {
						outputData.headerBidding = false;

						break;
					}
					// slotwise
					case 'formats': {
						if (
							Array.isArray(action.value) &&
							action.value.length &&
							action.value.indexOf('display') !== -1
						) {
							bidderRulesConfig.formats = action.value;
							outputData.formats = action.value;
						}

						break;
					}
					// prebid-batch-wise
					case 'refresh_timeout': {
						var refreshTimeOut = parseInt(action.value, 10);
						if (!isNaN(refreshTimeOut)) {
							config.PREBID_CONFIG.prebidConfig.refreshTimeOut = refreshTimeOut;

							var isAmazonUAMActive =
								config.PREBID_CONFIG &&
								config.PREBID_CONFIG.amazonUAMConfig &&
								config.PREBID_CONFIG.amazonUAMConfig.isAmazonUAMActive &&
								config.PREBID_CONFIG.amazonUAMConfig.publisherId;

							if (isAmazonUAMActive) {
								config.PREBID_CONFIG.amazonUAMConfig.refreshTimeOut = refreshTimeOut;
							}
						}

						break;
					}
					// prebid-batch-wise
					case 'initial_timeout': {
						var initialTimeOut = parseInt(action.value, 10);
						if (!isNaN(initialTimeOut)) {
							config.PREBID_CONFIG.prebidConfig.timeOut = initialTimeOut;

							var isAmazonUAMActive =
								config.PREBID_CONFIG &&
								config.PREBID_CONFIG.amazonUAMConfig &&
								config.PREBID_CONFIG.amazonUAMConfig.isAmazonUAMActive &&
								config.PREBID_CONFIG.amazonUAMConfig.publisherId;

							if (isAmazonUAMActive) {
								config.PREBID_CONFIG.amazonUAMConfig.timeOut = initialTimeOut;
							}
						}

						break;
					}
				}
			});

			/**
			 * Compute bidders only if headerbidding is not
			 * disabled by "disable_header_bidding" action
			 */
			outputData.bidders =
				outputData.headerBidding !== false
					? utils.getBiddersForSlot(size, formats, bidderRulesConfig)
					: [];

			// TODO: [HbRules] Remove temp console logs
			console.log('dataByRules', outputData);

			return outputData;
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

			var timeout =
				config.PREBID_CONFIG &&
				config.PREBID_CONFIG.prebidConfig &&
				config.PREBID_CONFIG.prebidConfig.timeOut
					? config.PREBID_CONFIG.prebidConfig.timeOut
					: constants.PREBID.TIMEOUT;
			var adType = optionalParam.adType;

			var bidders;
			if (optionalParam.headerBidding) {
				var {
					bidders: computedBidders,
					formats: computedFormats,
					headerBidding
				} = this.getDataByRules(size, formats, sectionName);

				if (computedBidders) bidders = computedBidders;
				if (headerBidding !== undefined) optionalParam.headerBidding = headerBidding;
				if (computedFormats) formats = computedFormats;
			}

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
				refreshCount: 0
			};

			this.computeSizesAndDefineSlot(adpSlot);

			this.adpSlots[containerId] = adpSlot;

			return this.adpSlots[containerId];
		},
		computeSizesAndDefineSlot: function(adpSlot) {
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
				computedSizes =
					constants.AD_SIZE_MAPPING.IAB_SIZES.BACKWARD_COMPATIBLE_MAPPING[
						adpSlot.size.join(',')
					] || [];
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
					this.computeSizesAndDefineSlot(slot);
					this.queSlotForBidding(slot);
				}
				slot.hasRendered = true;
				gpt.renderSlots(window.googletag, [slot]);
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
