var w = window,
	pageGroupTimer,
	adp = (w.adpushup = w.adpushup || {}),
	$ = (adp.$ = require('jquery')),
	utils = require('../libs/utils'),
	defaultConfig = $.extend({}, require('../config/config.js')),
	config = (adp.config = require('../config/config.js')),
	Tracker = require('../libs/tracker'),
	nodewatcher = require('../libs/nodeWatcher'),
	browserConfig = require('../libs/browserConfig'),
	selectVariation = require('./variationSelectionModels/index'),
	createAds = require('./adCreater').createAds,
	heartBeat = require('../libs/heartBeat'),
	ampInit = require('./ampInit'),
	hookAndInit = require('./hooksAndBlockList'),
	control = require('./control')(),
	genieeObject = require('./genieeObject'),
	triggerAd = require('./trigger'),
	refreshAdSlot = require('./refreshAdSlot'),
	session = require('../libs/session'),
	spaHandler = require('./spaHandler'),
	isGenieeSite;

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
	if (w.adpTags) {
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
	resetAdpConfig();
	resetAdpTagsConfig();

	// Extend adpushup object
	$.extend(adp, {
		creationProcessStarted: false,
		afterJSExecuted: false,
		err: [],
		utils: utils,
		control: control,
		tracker: new Tracker(),
		nodewatcher: nodewatcher,
		geniee: genieeObject,
		triggerAd: triggerAd,
		session: session
	});

	// Extend the settings with generated settings
	// eslint-disable-next-line no-undef
	$.extend(adp.config, __AP_CONFIG__, {
		platform: browserConfig.platform,
		packetId: utils.uniqueId(__SITE_ID__)
	});
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

function triggerControl(mode) {
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
			utils.sendFeedback({
				eventType: 3,
				mode: mode,
				referrer: config.referrer
			});
		}
	} else {
		adp.creationProcessStarted = true;
		control.trigger();
		utils.sendFeedback({
			eventType: 3,
			mode: mode,
			referrer: config.referrer
		});
	}
}

function startCreation(forced) {
	return new Promise(function(resolve) {
		ampInit(adp.config);
		// if config has disable or this function triggered more than once or no pageGroup found then do nothing;
		if (!forced && (shouldWeNotProceed() || !config.pageGroup || parseInt(config.mode, 10) === 2)) {
			return resolve(false);
		}

		var innovativeInteractiveAds = [];
		var layoutAndManualInteractiveAds = [];
		var layoutRunning = false;
		var isControlVariation = false;

		if (config.innovativeModeActive && window.adpushup.config.innovativeAds.length) {
			var channel = config.platform.toUpperCase() + ':' + config.pageGroup.toUpperCase();
			innovativeInteractiveAds = utils.filterInteractiveAds(window.adpushup.config.innovativeAds, true, channel);
		}

		return selectVariation(config).then(function(variationData) {
			var selectedVariation = variationData.selectedVariation,
				moduleConfig = variationData.config,
				isGenieeModeSelected = !!(adp && adp.geniee && adp.geniee.sendSelectedModeFeedback);

			config = adp.config = moduleConfig;
			if (selectedVariation) {
				adp.creationProcessStarted = true;
				layoutRunning = true;

				clearTimeout(pageGroupTimer);
				config.selectedVariation = selectedVariation.id;

				//Geniee method call for chosen variation id
				if (isGenieeModeSelected) {
					adp.geniee.sendSelectedModeFeedback(selectedVariation.id);
				}

				// Load interactive ads script if interactive ads are present in adpushup config
				layoutAndManualInteractiveAds = utils.getInteractiveAds(config);

				if (selectVariation.isControl) {
					isControlVariation = true;
				}

				createAds(adp, selectedVariation);
			} else {
				triggerControl(3);
			}

			var finalInteractiveAds = !isControlVariation
				? innovativeInteractiveAds.concat(layoutAndManualInteractiveAds)
				: layoutAndManualInteractiveAds;

			if (finalInteractiveAds && finalInteractiveAds.length) {
				require.ensure(
					['interactiveAds/index.js'],
					function(require) {
						require('interactiveAds/index')(finalInteractiveAds);
					},
					'adpInteractiveAds' // Generated script will be named "adpInteractiveAds.js"
				);
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
	// Initialise adp config
	initAdpConfig();

	// Initialise SPA handler
	if (adp.config.isSPA) {
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
		triggerControl(5);
		return false;
	}

	// AdPushup Mode Logic
	if (parseInt(config.mode, 10) === 2) {
		triggerControl(2);
		return false;
	}

	// AdPushup Percentage Logic
	var rand = Math.floor(Math.random() * 100) + 1;
	if (rand > config.adpushupPercentage) {
		triggerControl(4);
		return false;
	}

	if (!config.pageGroup) {
		pageGroupTimer = setTimeout(function() {
			!config.pageGroup ? triggerControl(3) : clearTimeout(pageGroupTimer);
		}, config.pageGroupTimeout);
	} else {
		// start heartBeat
		heartBeat(config.feedbackUrl, config.heartBeatMinInterval, config.heartBeatDelay).start();

		//Init creation
		startCreation();
	}
}

adp.init = main;
adp.init();
