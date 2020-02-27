// ADP slots registering module

var $ = require('../../libs/jquery'),
	hb = require('../adpTags/hbScript/src/hb'),
	config = require('../adpTags/hbScript/src/config'),
	apLiteConfig = require('./config').AP_LITE_CONFIG,
	constants = require('../adpTags/hbScript/src/constants'),
	commonConsts = require('../../config/commonConsts'),
	hbUtils = require('../adpTags/hbScript/src/utils'),
	utils = require('../../libs/utils'),
	refreshAdSlot = require('../../src/refreshAdSlot'),
	apLite = {
		module: {
			config: apLiteConfig,
			adpSlots: {},
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
				hbUtils.addBatchIdToAdpSlots(adpSlots, batchId);

				// Initiate prebidding for current adpSlots batch
				this.prebidBatching(hbUtils.getCurrentAdpSlotBatch(this.adpBatches, batchId));

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
						? Math.abs(hbUtils.hashCode(String(+new Date())))
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
			createAdpSlot: function(
				gptSlotElementId,
				dfpAdUnitName,
				gptSlot,
				allSizes,
				sectionId,
				optionalParam
			) {
				var formats =
					(Array.isArray(optionalParam.formats) &&
						optionalParam.formats.length &&
						optionalParam.formats) ||
					constants.PREBID.DEFAULT_FORMATS;
				var timeout =
					config.PREBID_CONFIG && config.PREBID_CONFIG.timeOut
						? config.PREBID_CONFIG.timeOut
						: constants.PREBID.TIMEOUT;
				var size = allSizes[0];

				var adpSlot = {
					slotId: gptSlotElementId,
					optionalParam,
					bidders: optionalParam.headerBidding ? hbUtils.getBiddersForSlot(size, formats) : [],
					formats,
					activeDFPNetwork: hbUtils.getActiveDFPNetwork(),
					size,
					sectionName: dfpAdUnitName,
					computedSizes: allSizes,
					containerId: gptSlotElementId,
					timeout,
					gSlot: gptSlot,
					biddingComplete: false,
					feedbackSent: false,
					hasTimedOut: false,
					sectionId: sectionId,
					services: optionalParam.services,
					feedback: {
						winner: constants.FEEDBACK.DEFAULT_WINNER
					}
				};

				return adpSlot;
			},
			setFeedbackData: function(adpSlot) {
				var feedbackData = {
					mode: commonConsts.MODE.ADPUSHUP,
					errorCode: commonConsts.ERROR_CODES.NO_ERROR,
					ads: [
						{
							id: adpSlot.sectionId,
							sectionName: adpSlot.sectionName,
							status: commonConsts.AD_STATUS.IMPRESSION,
							network: adpSlot.optionalParam.network,
							networkData: {
								adunitId: adpSlot.optionalParam.dfpAdunit,
								headerBidding: adpSlot.optionalParam.headerBidding
							},
							services: adpSlot.services
						}
					]
				};

				return feedbackData;
			},
			mapGptSlots: function(googletag) {
				if (googletag && googletag.apiReady) {
					try {
						var gptSlots = googletag.pubads().getSlots(),
							nonApSlots = [];

						if (gptSlots.length) {
							gptSlots.forEach(
								function(gptSlot) {
									var allSizes = gptSlot.getSizes().map(function(size) {
											var sizeKeys = Object.keys(size);
											return [size[sizeKeys[0]], size[sizeKeys[1]]];
										}),
										gptSlotElementId = gptSlot.getSlotElementId(),
										gptAdUnitPath = gptSlot.getAdUnitPath(),
										gptAdUnitPathArr = gptAdUnitPath.split('/'),
										dfpAdUnitName = gptAdUnitPathArr[gptAdUnitPathArr.length - 1],
										apLiteAdUnit = apLiteConfig.adUnits.find(adUnit => {
											var adUnitArr = adUnit.dfpAdUnit.split('/');
											var dfpAdUnit = adUnitArr[adUnitArr.length - 1];
											return dfpAdUnit === dfpAdUnitName;
										}),
										sectionId = apLiteAdUnit && apLiteAdUnit.sectionId,
										container = $(`#${gptSlotElementId}`);

									// Create adp slot only if defined GPT slot has the associated container in the DOM and gpt ad unit has a valid section id
									if (container.length && dfpAdUnitName) {
										//filter out units provided to us
										if (sectionId) {
											var dfpAdunitCode = apLiteAdUnit.dfpAdunitCode,
												slotHbStatus = apLiteAdUnit.headerBidding,
												refreshSlot = apLiteAdUnit.refreshSlot,
												refreshInterval = apLiteAdUnit.refreshInterval,
												formats = apLiteAdUnit.formats,
												adpSlot = this.createAdpSlot(
													gptSlotElementId,
													dfpAdUnitName,
													gptSlot,
													allSizes,
													sectionId,
													{
														dfpAdunit: dfpAdUnitName,
														dfpAdunitCode,
														headerBidding: window.adpushup.services.HB_ACTIVE && slotHbStatus,
														network: commonConsts.NETWORKS.ADPTAGS,
														formats,
														enableLazyLoading: false,
														multipleAdSizes: allSizes,
														sectionName: dfpAdUnitName,
														refreshSlot,
														refreshInterval,
														services: [commonConsts.SERVICES.AP_LITE]
													}
												);

											this.adpSlots[gptSlotElementId] = adpSlot;

											var feedbackData = this.setFeedbackData(adpSlot);
											utils.sendFeedback(feedbackData);

											this.queSlotForBidding(adpSlot);

											var currentTime = new Date().getTime();
											container.attr('data-render-time', currentTime);

											refreshSlot &&
												refreshAdSlot.refreshSlot(container, {
													slotId: gptSlotElementId,
													dfpAdUnitName,
													network: 'adpTags',
													networkData: {
														refreshInterval,
														headerBidding: slotHbStatus
													}
												});
										} else {
											//collect rest of the units (not provided to us) separately
											nonApSlots.push(gptSlot);
										}
									}
								}.bind(this)
							);
						}

						if (nonApSlots && nonApSlots.length) {
							googletag.pubads().refresh(nonApSlots);
						}

						return;
					} catch (e) {
						console.err ? console.err(e) : console.log(e);
					}
				} else {
					return false;
				}
			},
			registerAdpSlots: function() {
				var googletag = window.googletag;
				return googletag.cmd.push(
					function() {
						this.mapGptSlots(googletag);
					}.bind(this)
				);
			}
		},
		init: function() {
			window.apLite = window.apLite && window.apLite.adpSlots ? window.apLite : this.module;

			window.apLite.registerAdpSlots();
		}
	};

module.exports = apLite;
