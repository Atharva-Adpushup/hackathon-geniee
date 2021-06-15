var w = window;
var pageGroupTimer;
var adp = (w.adpushup = w.adpushup || {});

var utils = require('../libs/utils');
var EventLogger = require('../libs/eventLogger');
var config = (adp.config = require('../config/config.js'));
var commonConsts = require('../config/commonConsts');
var browserConfig = require('../libs/browserConfig');
var adCreater = require('./adCreater');
var hookAndInit = require('./hooksAndBlockList');
var control = require('./control')();
var adCodeGenerator = require('./adCodeGenerator');
var session = require('../libs/session');
var refreshAdSlot = require('./refreshAdSlot');

var googlFcCmp = require('../libs/googleFcCmp');

var defaultConfig = {};

function start() {
	defaultConfig = adp.$.extend({}, require('../config/config.js'));

	if (!SEPARATE_PREBID_DISABLED && HB_ACTIVE) {
		utils.injectHeadCodeOnPage(config.prebidBundleUrl);
	}

	if (LAYOUT_ACTIVE) {
		var selectVariation = require('./variationSelectionModels/index');
		var nodewatcher = require('../libs/nodeWatcher');
	}
	if (GENIEE_ACTIVE) {
		var genieeObject = require('./genieeObject');
	}
	if (SPA_ACTIVE) {
		var spaHandler = require('./spaHandler');
	}
	if (APTAG_ACTIVE) {
		var apTagModule = require('./trigger');
		var triggerAd = apTagModule.triggerAd;
		var processApTagQue = apTagModule.processApTagQue;
	} else {
		triggerAd = function() {};
	}
	if (INNOVATIVE_ADS_ACTIVE) {
		var processInnovativeAds = require('../modules/interactiveAds/index').default;
	}
	// var	Tracker = require('../libs/tracker');
	// var	heartBeat = require('../libs/heartBeat');
	// var	ampInit = require('./ampInit');

	var isGenieeSite;
	w.adpushup.configExtended = false;

	// Extend adpushup object
	adp.$.extend(adp, {
		creationProcessStarted: false,
		afterJSExecuted: false,
		err: [],
		utils: utils,
		control: control,
		// tracker: new Tracker(),
		eventLogger: new EventLogger(),
		nodewatcher: nodewatcher,
		geniee: genieeObject,
		triggerAd: triggerAd,
		session: session,
		generateAdCode: adCodeGenerator.generateAdCode,
		executeAdpTagsHeadCode: adCodeGenerator.executeAdpTagsHeadCode,
		executeAfterJS: adCreater.executeAfterJS,
		services: {
			APTAG_ACTIVE: APTAG_ACTIVE,
			INNOVATIVE_ADS_ACTIVE: INNOVATIVE_ADS_ACTIVE,
			LAYOUT_ACTIVE: LAYOUT_ACTIVE,
			ADPTAG_ACTIVE: ADPTAG_ACTIVE,
			SPA_ACTIVE: SPA_ACTIVE,
			GENIEE_ACTIVE: GENIEE_ACTIVE,
			HB_ACTIVE: HB_ACTIVE,
			GDPR_ACTIVE: GDPR_ACTIVE,
			INCONTENT_ACTIVE: INCONTENT_ACTIVE,
			AP_LITE_ACTIVE: AP_LITE_ACTIVE
		}
	});

	// Destroy ADP slots and their associated GPT slots
	function destroyAdpSlots() {
		var adpSlots = Object.keys(w.adpTags.adpSlots);

		if (adpSlots.length) {
			var adpGSlots = [];
			adpSlots.forEach(function(adpSlot) {
				var slot = w.adpTags.adpSlots[adpSlot];
				if (slot && !slot.optionalParam.isManual && slot.gSlot) {
					// remove the slot from adpSlots
					w.adpTags.adpSlots[adpSlot] = undefined;
					adpGSlots.push(slot.gSlot);
				}
			});

			// w.adpTags.adpSlots = {};
			w.googletag.cmd.push(function() {
				w.googletag.destroySlots(adpGSlots);
			});
		}
	}

	// Reset adpTags config and destroy all ADP slots
	function resetAdpTagsConfig() {
		if (w.adpTags && w.adpTags.config) {
			w.adpTags.adpBatches = [];
			w.adpTags.batchPrebiddingComplete = false;
			w.adpTags.currentBatchAdpSlots = [];
			w.adpTags.currentBatchId = null;
			w.adpTags.gptRefreshIntervals = [];
			destroyAdpSlots();
		}
	}

	// Reset adpushup config
	function resetAdpConfig() {
		config = adp.config = adp.$.extend(true, {}, defaultConfig);
	}

	// Resets and initialises the adpushup config object
	function initAdpConfig() {
		return new Promise(function(resolve) {
			resetAdpConfig();

			adp.$.extend(adp, {
				creationProcessStarted: false,
				afterJSExecuted: false,
				err: []
			});
			// Extend the settings with generated settings
			// eslint-disable-next-line no-undef
			adp.$.extend(adp.config, __AP_CONFIG__, {
				platform: browserConfig.platform,
				browser: browserConfig.name,
				packetId: utils.uniqueId(__SITE_ID__)
			});

			!adp.config.apLiteActive && resetAdpTagsConfig();

			resolve();
		}).then(function() {
			if (!w.adpushup.configExtended) {
				if (ADPTAG_ACTIVE) {
					//TODO: this needs to be changed
					require('../modules/adpTags/hbScript/src/index');
				}
				if (GDPR_ACTIVE) {
					require('../modules/gdpr/index');
				}
				w.adpushup.configExtended = true;
			}
		});
	}

	// Fire user async API
	function syncUser() {
		return utils.sendBeacon(commonConsts.USER_SYNC_URL);
	}

	function shouldWeNotProceed() {
		var hasGenieeStarted = !!(
			config.partner === 'geniee' &&
			w.gnsmod &&
			w.gnsmod.creationProcessStarted &&
			!config.isAdPushupControlWithPartnerSSP
		);

		return config.disable || adp.creationProcessStarted || hasGenieeStarted;
	}

	function triggerControl(mode, errorCode) {
		var isGenieeModeSelected = !!(adp && adp.geniee && adp.geniee.sendSelectedModeFeedback);

		//Geniee method call for control mode
		if (isGenieeModeSelected) {
			adp.geniee.sendSelectedModeFeedback('CONTROL');
		}

		if (shouldWeNotProceed()) {
			return false;
		}
		config.mode = mode;

		if (!errorCode) {
			errorCode = commonConsts.ERROR_CODES.UNKNOWN;
		}
		if (config.partner === 'geniee' && !config.isAdPushupControlWithPartnerSSP) {
			if (w.gnsmod && !w.gnsmod.creationProcessStarted && w.gnsmod.triggerAds) {
				w.gnsmod.triggerAds();

				// New feedback
				utils.sendFeedback({
					errorCode: errorCode,
					mode: mode,
					referrer: config.referrer
				});

				// Old feedback
				/*utils.sendFeedbackOld({
				eventType: 3,
				mode: mode,
				referrer: config.referrer
			});*/
			}
		} else {
			adp.creationProcessStarted = true;
			control.trigger();

			// New feedback
			utils.sendFeedback({
				errorCode: errorCode ? errorCode : commonConsts.ERROR_CODES.PAGEGROUP_NOT_FOUND,
				mode: mode,
				referrer: config.referrer
			});

			// Old feedback
			/*utils.sendFeedbackOld({
			eventType: 3,
			mode: mode,
			referrer: config.referrer
		});*/
		}
	}

	function selectVariationWrapper() {
		if (w.adpushup.services.LAYOUT_ACTIVE && selectVariation) {
			return selectVariation(config);
		}
		return Promise.resolve({
			selectedVariation: false,
			config: {}
		});
	}

	function startCreation(forced) {
		return new Promise(function(resolve) {
			// ampInit(adp.config);
			// if config has disable or this function triggered more than once or no pageGroup found then do nothing;
			if (
				!forced &&
				(shouldWeNotProceed() || !config.pageGroup || parseInt(config.mode, 10) === 2)
			) {
				return resolve(false);
			}

			var innovativeInteractiveAds = [];
			// var layoutAndManualInteractiveAds = [];
			var isControlVariation = false;

			if (w.adpushup.services.INNOVATIVE_ADS_ACTIVE && w.adpushup.config.innovativeAds.length) {
				var channel = config.platform.toUpperCase() + ':' + config.pageGroup.toUpperCase();
				innovativeInteractiveAds = utils.filterInteractiveAds(
					w.adpushup.config.innovativeAds,
					true,
					channel
				);
			}

			return selectVariationWrapper().then(function(variationData) {
				var selectedVariation = variationData.selectedVariation;
				var moduleConfig = variationData.config;
				var isGenieeModeSelected = !!(adp && adp.geniee && adp.geniee.sendSelectedModeFeedback);

				config = adp.config = moduleConfig;
				if (selectedVariation) {
					adp.creationProcessStarted = true;

					clearTimeout(pageGroupTimer);
					config.selectedVariation = selectedVariation.id;
					config.selectedVariationName = selectedVariation.name;
					config.selectedVariationType = selectedVariation.isControl
						? commonConsts.PAGE_VARIATION_TYPE.BENCHMARK
						: commonConsts.PAGE_VARIATION_TYPE.NON_BENCHMARK;

					//Geniee method call for chosen variation id
					if (isGenieeModeSelected) {
						adp.geniee.sendSelectedModeFeedback(selectedVariation.id);
					}

					// Load interactive ads script if interactive ads are present in adpushup config
					// layoutAndManualInteractiveAds = utils.getInteractiveAds(config);

					if (selectedVariation.isControl) {
						isControlVariation = true;
					}

					// adCreater.createAds(adp, selectedVariation);

					setTimeout(() => {
						adCreater.createAds(adp, selectedVariation);
					});
				} else {
					triggerControl(
						commonConsts.MODE.FALLBACK,
						commonConsts.ERROR_CODES.VARIATION_NOT_SELECTED
					);
				}

				// var finalInteractiveAds = !isControlVariation
				// 	? innovativeInteractiveAds.concat(layoutAndManualInteractiveAds)
				// 	: layoutAndManualInteractiveAds;

				var shouldRunInnovativeAds = !!(
					w.adpushup.services.INNOVATIVE_ADS_ACTIVE &&
					!isControlVariation &&
					innovativeInteractiveAds &&
					innovativeInteractiveAds.length
				);

				if (shouldRunInnovativeAds) {
					try {
						function refreshSlotProcessing() {
							var ads = innovativeInteractiveAds;
							for (var id in ads) {
								var hasDfpAdUnit = ads[id].networkData && ads[id].networkData.dfpAdunit;
								if (hasDfpAdUnit) {
									var slotId = ads[id].id;
									var container = adp.$('#' + slotId);
									var currentTime = new Date();
									container.attr('data-render-time', currentTime.getTime());
									if (ads[id].networkData && ads[id].networkData.refreshSlot) {
										refreshAdSlot.refreshSlot(container, ads[id]);
									}
								}
							}
						}
						// processInnovativeAds(innovativeInteractiveAds, refreshSlotProcessing);

						setTimeout(() => {
							processInnovativeAds(innovativeInteractiveAds, refreshSlotProcessing);
						});
					} catch (e) {
						utils.log('Innovative Ads Failed', e);
					}
				}

				return resolve(true);
			});
		});
	}

	function startApLiteCreation() {
		var apLiteAdpModule = require('../modules/apLite/adp');
		apLiteAdpModule.init();
	}

	function processQue() {
		while (w.adpushup.que.length) {
			w.adpushup.que.shift().call();
		}
	}

	function initAdpQue() {
		if (w.adpushup && Array.isArray(w.adpushup.que) && w.adpushup.que.length) {
			adp.que = w.adpushup.que;
		} else {
			adp.que = [];
		}

		processQue();
		adp.que.push = function(queFunc) {
			[].push.call(w.adpushup.que, queFunc);
			processQue();
		};
	}

	//check if google funding choice is already avaialble on page
	function isGoogleFcAvailable() {
		return (
			window.googlefc &&
			window.googlefc.ConsentStatusEnum &&
			Object.keys(window.googlefc.ConsentStatusEnum).length
		);
	}

	// we need to check CMP availabilityt for European countries only
	function isCmpAplicable() {
		return Promise.resolve(
			!isGoogleFcAvailable() &&
				!commonConsts.CMP_CHECK_EXCLUDED_SITES.includes(adp.config.siteId) &&
				!adp.config.cmpAvailable &&
				commonConsts.EU_COUNTRY_LIST.includes(adp.config.country)
		);
	}

	function loadGoogleFundingChoicesCmp() {
		return googlFcCmp.loadAndInitiateCmp(() => {
			if (adp.config.renderPostBid) {
				adp.config.renderPostBid = false;
				setTimeout(() => {
					adp.config.apLiteActive
						? window.apLite.reInitAfterPostBid(window)
						: adp.adpTags.reInitAfterPostBid(window);
				}, 10);
			}
		});
	}

	function main() {
		// Initialise adp config
		initAdpConfig();

		if (GA_ANALYTICS_ACTIVE) {
			utils.checkAndInjectGAHeadCode();
			utils.checkAndInjectUniversalGAHeadCode();
		}

		utils.emitGaEvent(commonConsts.GA_EVENTS.SCRIPT_LOADED);

		const gaEventSampling1 = window.adpushup.config.gaEventSampling1;
		const gaEventSampling2 = window.adpushup.config.gaEventSampling2;
		const currentFallBack = Math.random() * 100;
		if (gaEventSampling1 && currentFallBack <= gaEventSampling1) {
			utils.emitGa3Event(commonConsts.GA_EVENTS.SCRIPT_LOADED);
		}
		if (gaEventSampling2 && currentFallBack <= gaEventSampling2) {
			utils.emitGa3Event(commonConsts.GA_EVENTS.SCRIPT_LOADED_SECOND);
		}

		utils.logPerformanceEvent(commonConsts.EVENT_LOGGER.EVENTS.MAIN_FN_CALL_DELAY);

		// if traffic is from lighthouse and site has to be paused for lighthouse
		if (!utils.getQueryParams().stopLightHouseHack && utils.checkForLighthouse(adp.config.siteId))
			return;

		// Set user syncing cookies
		syncUser();

		// disable header bidding if query param contains `?adpushupHeaderBiddingDisabled=true`
		adp.services.HB_ACTIVE =
			adp.services.HB_ACTIVE && !utils.getQueryParams().adpushupHeaderBiddingDisabled;

		if (utils.isAdPushupForceDisabled()) {
			utils.log(`AdPushup has been forced disabled...`);
			return false;
		}

		var beforeJs = adp.config.beforeJs;

		if (beforeJs) {
			try {
				utils.runScript(utils.base64Decode(beforeJs));
			} catch (e) {
				err.push({
					msg: 'Error in beforeJs.',
					js: beforeJs,
					error: e
				});
			}
		}

		var apLiteActive = adp.config.apLiteActive;

		//for SPAs: remove any interactive ad containers, if available and apLite is disabled
		!apLiteActive && adp.$('.adp_interactive_ad').remove();

		// Initialise SPA handler
		if (adp.config.isSPA && adp.services.SPA_ACTIVE) {
			spaHandler(w, adp);
		}

		// Initialise adpushup session
		session.init();

		if (adp.config.isUrlReportingEnabled) {
			utils.fetchAndSetKeyValueForUrlReporting(adp);
		}

		//Initialise refresh slots
		refreshAdSlot.init(w);

		if (!apLiteActive) {
			//Geniee ad network specific site check
			isGenieeSite = !!(adp.config.partner && adp.config.partner === 'geniee');
			adp.config.isGeniee = isGenieeSite;
		}

		// Geniee specific check
		if (shouldWeNotProceed()) {
			return false;
		}

		/**
		 * For European countries we need to make sure that cmp is there on the page for user consent management, before sending an ad request to Google.
		 * So, we load googleFundingChoices on the page for the user to provide consent, but initiate our HB auction alongside, in case cmp is loaded and consent is available before auction end, we send ad request to GAM else we simply render the winning bid from HB (postBidding)
		 */
		isCmpAplicable()
			.then(cmpApplicable => {
				utils.log('cmpApplicable', cmpApplicable);
				if (cmpApplicable) {
					adp.config.renderPostBid =
						adp.config.postBidEnabled === null || adp.config.postBidEnabled === undefined
							? true
							: adp.config.postBidEnabled;
					return loadGoogleFundingChoicesCmp();
				}
				return '';
			})
			.then(() => {
				utils.log('CMP loaded');
				adp.config.cmpLoaded = true;

				// invoke processApTagQue function from trigger.js in case there has been and calls to adpushup.triggerAd from page while we were waiting for CMP check and CMP load. Use timeout so that current init function is done before apTags are processed
				setTimeout(() => {
					processApTagQue && processApTagQue();
				}, 0);
				if (!apLiteActive) {
					// Hook Pagegroup, find pageGroup and check for blockList
					hookAndInit(adp, startCreation, browserConfig.platform);

					// AdPushup Debug Force Variation
					if (
						utils.getQueryParams &&
						utils.getQueryParams().forceVariation &&
						!adp.creationProcessStarted
					) {
						startCreation(true);
						return false;
					}

					// AdPushup Debug Force Control
					if (utils.getQueryParams && utils.getQueryParams().forceControl) {
						triggerControl(commonConsts.MODE.FALLBACK, commonConsts.ERROR_CODES.FALLBACK_FORCED); // Control forced (run fallback)
						return false;
					}

					// AdPushup Mode Logic
					if (parseInt(config.mode, 10) === 2) {
						triggerControl(commonConsts.MODE.FALLBACK, commonConsts.ERROR_CODES.PAUSED_IN_EDITOR); // Paused from editor (run fallback)
						return false;
					}

					// AdPushup Percentage Logic
					var rand = Math.floor(Math.random() * 100) + 1;
					if (rand > config.adpushupPercentage) {
						triggerControl(commonConsts.MODE.FALLBACK, commonConsts.ERROR_CODES.FALLBACK_PLANNED); // Control planned (run fallback)
						return false;
					}

					if (!config.pageGroup) {
						pageGroupTimer = setTimeout(function() {
							!config.pageGroup
								? triggerControl(
										commonConsts.MODE.FALLBACK,
										commonConsts.ERROR_CODES.PAGEGROUP_NOT_FOUND
								  )
								: clearTimeout(pageGroupTimer);
						}, config.pageGroupTimeout);
					} else {
						// start heartBeat
						// heartBeat(config.feedbackUrl, config.heartBeatMinInterval, config.heartBeatDelay).start();

						//Init creation
						// startCreation();

						setTimeout(startCreation);
					}
				}

				apLiteActive && startApLiteCreation();
			});
	}

	adp.init = function() {
		browserConfig.detectPlatform().then(() => {
			main();
			initAdpQue();
		});
	};

	if (!adp.config.isSPA && !adp.services.SPA_ACTIVE) {
		adp.init();
	}
}

utils.injectJqueryIfDoesntExist(start);
