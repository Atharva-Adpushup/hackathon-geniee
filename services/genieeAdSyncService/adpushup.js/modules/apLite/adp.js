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
	hbRules = require('../adpTags/hbScript/src/hbRules'),
	cssescape = require('css.escape'),
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
					hb.start(adpSlotsBatch);
				}
			},
			processBatchForBidding: function() {
				var batchId = this.currentBatchId;
				var adpSlots = this.currentBatchAdpSlots;

				this.adpBatches.push({
					batchId: batchId,
					adpSlots: adpSlots,
					auctionStatus: {
						amazonUam: 'pending',
						prebid: 'pending'
					}
				});

				// Add batch id to all batched adpSlots
				hbUtils.addBatchIdToAdpSlots(adpSlots, batchId);

				// Initiate prebidding for current adpSlots batch
				this.prebidBatching(adpSlots);

				// Reset the adpSlots batch
				this.currentBatchId = null;
				this.currentBatchAdpSlots = [];
				this.slotInterval = null;
			},
			resetSlotFeedback: function(slot) {
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
					config.PREBID_CONFIG &&
					config.PREBID_CONFIG.prebidConfig &&
					config.PREBID_CONFIG.prebidConfig.timeOut
						? config.PREBID_CONFIG.prebidConfig.timeOut
						: constants.PREBID.TIMEOUT;
				var size = allSizes[0];

				var bidders;
				if (optionalParam.headerBidding) {
					hbRulesApi = hbRules({ config, utils: hbUtils, adpushup: window.adpushup || {} });
					var {
						bidders: computedBidders,
						formats: computedFormats,
						headerBidding
					} = hbRulesApi.getDataByRules(size, formats, sectionId);

					if (computedBidders) bidders = computedBidders;
					optionalParam.headerBidding = headerBidding;
					if (computedFormats) formats = computedFormats;
				}

				// native format is not supported in apLite
				var nativeFormatIndex = formats.indexOf('native');
				if (nativeFormatIndex !== -1) {
					formats.splice(nativeFormatIndex, 1);
				}

				var adpSlot = {
					slotId: gptSlotElementId,
					optionalParam,
					bidders: bidders || {},
					headerBidding: optionalParam.headerBidding,
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
					auctionFeedbackSent: false,
					hasTimedOut: false,
					sectionId: sectionId,
					services: optionalParam.services,
					feedback: {
						winner: constants.FEEDBACK.DEFAULT_WINNER
					},
					fluid: optionalParam.fluid,
					refreshCount: 0,
					sizeMapping: optionalParam.sizeMapping || []
				};

				return adpSlot;
			},
			reInitAfterPostBid: function(w) {
				// adpSlots in an array
				var adpSlots = (w.apLite && Object.values(w.apLite.adpSlots)) || [];
				var reInitializableSlots = adpSlots.filter(slot => slot.renderedPostBid);

				if (!adpushup.config.renderPostBid && reInitializableSlots.length) {
					reInitializableSlots.forEach(slot => {
						var dataSet = document.getElementById(slot.containerId).dataset;

						// clear refresh timeout
						if (dataSet.timeout) {
							clearInterval(dataSet.timeout);
							delete dataSet.timeout;
						}

						//reset renderTime
						if (dataSet.renderTime) dataSet.renderTime = +new Date();

						//reset refreshTime
						if (dataSet.refreshTime) dataSet.refreshTime = +new Date();

						//reset the slot feedback flags and queue the slot for auction
						this.resetSlotFeedback(slot);
						this.queSlotForBidding(slot);
					});
				}
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

				feedbackData = $.extend({}, feedbackData, utils.getPageFeedbackMetaData());

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
											/* layout of size object is { l: 300, j: 100 } */
											var width = size.l || size.m,
												height = size.j;
											return [width, height];
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
										container;

									allSizes = allSizes.filter(size => {
										return (
											size &&
											Array.isArray(size) &&
											size.length == 2 &&
											!isNaN(parseInt(size[0])) &&
											!isNaN(parseInt(size[1]))
										);
									});

									try {
										container = $(`#${cssescape(gptSlotElementId)}`);

										// Create adp slot only if defined GPT slot has the associated container in the DOM and gpt ad unit has a valid section id
										if (container.length && dfpAdUnitName && sectionId) {
											var dfpAdunitCode = apLiteAdUnit.dfpAdunitCode,
												slotHbStatus = apLiteAdUnit.headerBidding,
												refreshSlot = apLiteAdUnit.refreshSlot,
												refreshInterval = apLiteAdUnit.refreshInterval,
												// formats = apLiteAdUnit.formats,
												/**
												 * Temporarily Enabled "display" and "video" formats for apLite
												 * until we enable all formats in all ad docs.
												 * Hb Rules can still override formats list.
												 */
												// formats = window.adpushup.config.isAutoAddMultiformatDisabled
												// 	? apLiteAdUnit.formats
												// 	: ['display', 'video'],
												/**
												 * Disabled video format until we integrate any new video player.
												 *
												 * If we disble "video" format here then it won't be added through hb rules
												 * as well. As hb rule only apply intersection of the slot formats and hb rule formats.
												 */
												// formats = ['display'],
												// Temp change: enable video for bb player testing
												formats = !window.adpushup.config.isBbPlayerEnabledForTesting
													? ['display']
													: ['display', 'video'],
												sizeMapping = apLiteAdUnit.sizeMapping || [],
												computedSizes = hbUtils.getSizesComputedUsingSizeMappingOrAdUnitSize(
													apLiteAdUnit,
													false,
													allSizes
												);
											allSizes =
												Array.isArray(computedSizes) && computedSizes.length
													? computedSizes
													: allSizes;
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
													sectionName: dfpAdUnitName,
													refreshSlot,
													refreshInterval,
													services: [commonConsts.SERVICES.AP_LITE],
													fluid: false,
													sizeMapping,
													adId: gptSlotElementId
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
													id: gptSlotElementId,
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
									} catch (error) {
										nonApSlots.push(gptSlot);
										window.adpushup.err.push(error);
									}
								}.bind(this)
							);
						}

						if (nonApSlots && nonApSlots.length && !adpushup.config.handleAPLiteBlacklist) {
							googletag.pubads().refresh(nonApSlots);
						}

						return;
					} catch (e) {
						console && console.error ? console.error(e) : console && console.log(e);
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
			window.googletag = window.googletag || {};
			googletag.cmd = googletag.cmd || [];

			window.apLite = window.apLite && window.apLite.adpSlots ? window.apLite : this.module;
			window.apLite.registerAdpSlots();
		}
	};

module.exports = apLite;
