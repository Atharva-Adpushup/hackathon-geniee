var w = window;
var pageGroupTimer;
var adp = (w.adpushup = w.adpushup || {});
var $ = (adp.$ = require('jquery'));
var utils = require('../libs/utils');
var defaultConfig = $.extend({}, require('../config/config.js'));
var config = (adp.config = require('../config/config.js'));
var commonConsts = require('../config/commonConsts');
var browserConfig = require('../libs/browserConfig');
var adCreater = require('./adCreater');
var hookAndInit = require('./hooksAndBlockList');
var control = require('./control')();
var adCodeGenerator = require('./adCodeGenerator');
var session = require('../libs/session');
var refreshAdSlot = require('./refreshAdSlot');

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
	var triggerAd = require('./trigger');
}
if (INNOVATIVE_ADS_ACTIVE) {
	var processInnovativeAds = require('../modules/interactiveAds/index');
}
// var	Tracker = require('../libs/tracker');
// var	heartBeat = require('../libs/heartBeat');
// var	ampInit = require('./ampInit');

var isGenieeSite;
window.adpushup.configExtended = false;

// Destroy ADP slots and their associated GPT slots
function destroyAdpSlots() {
	var adpSlots = Object.keys(w.adpTags.adpSlots);

	if (adpSlots.length) {
		var adpGSlots = [];
		adpSlots.forEach(function(adpSlot) {
			adpGSlots.push(w.adpTags.adpSlots[adpSlot].gSlot);
		});

		w.adpTags.adpSlots = {};
		w.googletag.cmd.push(function() {
			w.googletag.destroySlots(adpGSlots);
		});
	}
}

// Reset adpTags config and destroy all ADP slots
function resetAdpTagsConfig() {
	if (w.adpTags && w.adpTags.config) {
		w.adpTags.config.INVENTORY = $.extend(true, {}, w.adpTags.defaultInventory);
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
	config = adp.config = $.extend(true, {}, defaultConfig);
}

// Resets and initialises the adpushup config object
function initAdpConfig() {
	return new Promise(function(resolve) {
		resetAdpConfig();
		resetAdpTagsConfig();

		// Extend adpushup object
		$.extend(adp, {
			creationProcessStarted: false,
			afterJSExecuted: false,
			err: [],
			utils: utils,
			control: control,
			// tracker: new Tracker(),
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
				INCONTENT_ACTIVE: INCONTENT_ACTIVE
			}
		});

		// Extend the settings with generated settings
		// eslint-disable-next-line no-undef
		$.extend(adp.config, __AP_CONFIG__, {
			platform: browserConfig.platform,
			packetId: utils.uniqueId(__SITE_ID__)
		});
		resolve();
	}).then(function() {
		if (!window.adpushup.configExtended) {
			if (ADPTAG_ACTIVE) {
				//TODO: this needs to be changed
				require('../../adpTagsv2/modules/adpTags/hbScript/src/index');
			}
			if (GDPR_ACTIVE) {
				require('../modules/gdpr/index');
			}
			window.adpushup.configExtended = true;
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
	if (config.partner === 'geniee' && !config.isAdPushupControlWithPartnerSSP) {
		if (w.gnsmod && !w.gnsmod.creationProcessStarted && w.gnsmod.triggerAds) {
			w.gnsmod.triggerAds();

			// New feedback
			utils.sendFeedback({
				eventType: errorCode ? errorCode : commonConsts.ERROR_CODES.PAGEGROUP_NOT_FOUND,
				mode: mode,
				referrer: config.referrer
			});

			// Old feedback
			utils.sendFeedbackOld({
				eventType: 3,
				mode: mode,
				referrer: config.referrer
			});
		}
	} else {
		adp.creationProcessStarted = true;
		control.trigger();

		// New feedback
		utils.sendFeedback({
			eventType: errorCode ? errorCode : commonConsts.ERROR_CODES.PAGEGROUP_NOT_FOUND,
			mode: mode,
			referrer: config.referrer
		});

		// Old feedback
		utils.sendFeedbackOld({
			eventType: 3,
			mode: mode,
			referrer: config.referrer
		});
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
		if (!forced && (shouldWeNotProceed() || !config.pageGroup || parseInt(config.mode, 10) === 2)) {
			return resolve(false);
		}

		var innovativeInteractiveAds = [];
		var layoutAndManualInteractiveAds = [];
		var isControlVariation = false;

		if (w.adpushup.services.INNOVATIVE_ADS_ACTIVE && w.adpushup.config.innovativeAds.length) {
			var channel = config.platform.toUpperCase() + ':' + config.pageGroup.toUpperCase();
			innovativeInteractiveAds = utils.filterInteractiveAds(w.adpushup.config.innovativeAds, true, channel);
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
				layoutAndManualInteractiveAds = utils.getInteractiveAds(config);

				if (selectVariation.isControl) {
					isControlVariation = true;
				}

				adCreater.createAds(adp, selectedVariation);
			} else {
				triggerControl(commonConsts.MODE.FALLBACK);
			}

			var finalInteractiveAds = !isControlVariation
				? innovativeInteractiveAds.concat(layoutAndManualInteractiveAds)
				: layoutAndManualInteractiveAds;
			var shouldRunInnovatibeAds = !!(
				w.adpushup.services.INNOVATIVE_ADS_ACTIVE &&
				finalInteractiveAds &&
				finalInteractiveAds.length
			);

			if (shouldRunInnovatibeAds) {
				try {
					function refreshSlotProcessing() {
						var ads = finalInteractiveAds;
						for (var id in ads) {
							var hasDfpAdUnit = ads[id].networkData && ads[id].networkData.dfpAdunit;
							if (hasDfpAdUnit) {
								var slotId = ads[id].networkData.dfpAdunit;
								var container = $('#' + slotId);
								var currentTime = new Date();
								container.attr('data-render-time', currentTime.getTime());
								if (ads[id].networkData && ads[id].networkData.refreshSlot) {
									refreshAdSlot.refreshSlot(container, ads[id]);
								}
							}
						}
					}
					processInnovativeAds(finalInteractiveAds, refreshSlotProcessing);
				} catch (e) {
					console.log('Innovative Ads Failed', e);
				}
			}

			return resolve(true);
		});
	});
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

function main() {
	// Set user syncing cookies
	syncUser();

	// Initialise adp config
	initAdpConfig();

	// Initialise SPA handler
	if (adp.config.isSPA && adp.services.SPA_ACTIVE) {
		spaHandler(w, adp);
	}

	// Initialise adpushup session
	session.init();

	//Initialise refresh slots
	refreshAdSlot.init(w);

	//Geniee ad network specific site check
	isGenieeSite = !!(adp.config.partner && adp.config.partner === 'geniee');
	adp.config.isGeniee = isGenieeSite;

	// Initialise adp que
	initAdpQue();

	// Hook Pagegroup, find pageGroup and check for blockList
	hookAndInit(adp, startCreation, browserConfig.platform);

	// AdPushup Debug Force Variation
	if (utils.queryParams && utils.queryParams.forceVariation && !adp.creationProcessStarted) {
		startCreation(true);
		return false;
	}

	if (shouldWeNotProceed()) {
		return false;
	}

	// AdPushup Debug Force Control
	if (utils.queryParams && utils.queryParams.forceControl) {
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
			!config.pageGroup ? triggerControl(commonConsts.MODE.FALLBACK) : clearTimeout(pageGroupTimer);
		}, config.pageGroupTimeout);
	} else {
		// start heartBeat
		// heartBeat(config.feedbackUrl, config.heartBeatMinInterval, config.heartBeatDelay).start();

		//Init creation
		startCreation();
	}
}

adp.init = main;
adp.init();
