var Tracker = require('../libs/tracker'),
	nodewatcher = require('../libs/nodeWatcher'),
	browserConfig = require('../libs/browserConfig'),
	selectVariation = require('./variationSelector'),
	createAds = require('./adCreater'),
	heartBeat = require('../libs/heartBeat'),
	hookAndInit = require('./hooksAndBlockList'),
	utils = require('../libs/utils'),
	w = window,
	pageGroupTimer,
	adp = (w.adpushup = w.adpushup || {}),
	control = require('./control')(),
	config = adp.config = require('../config/config.js'),
	$ = adp.$ = require('jquery'),
	genieeObject = require('./genieeObject'),
	isGenieeSite;

// Extend adpushup object
$.extend(adp, {
	creationProcessStarted: false,
	err: [],
	control: control,
	tracker: new Tracker(),
	nodewatcher: nodewatcher,
	geniee: genieeObject
});

// Extend the settings with generated settings
// eslint-disable-next-line no-undef
$.extend(adp.config, ___abpConfig___, {
	platform: browserConfig.platform
});

//Geniee ad network specific site check
isGenieeSite = !!(adp.config.partner && (adp.config.partner === 'geniee'));
adp.config.isGeniee = isGenieeSite;

function shouldWeNotProceed() {
	var hasGenieeStarted = !!((config.partner === 'geniee') && w.gnsmod && w.gnsmod.creationProcessStarted && !config.isAdPushupControlWithPartnerSSP);

	return (config.disable || adp.creationProcessStarted || hasGenieeStarted);
}

function triggerControl(mode) {
	if (shouldWeNotProceed()) {
		return false;
	}
	config.mode = mode;
	if (config.partner === 'geniee' && !config.isAdPushupControlWithPartnerSSP) {
		if (w.gnsmod && !w.gnsmod.creationProcessStarted && w.gnsmod.triggerAds) {
			w.gnsmod.triggerAds();
			utils.sendFeedback({ eventType: 3, mode: mode, referrer: config.referrer });
		}
	} else {
		adp.creationProcessStarted = true;
		control.trigger();
		utils.sendFeedback({ eventType: 3, mode: mode, referrer: config.referrer });
	}
}

function startCreation() {
	// if config has disable or this function triggered more than once or no pageGroup found then do nothing;
	if (shouldWeNotProceed() || !config.pageGroup) {
		return false;
	}
	var selectedVariation = selectVariation(config);
	if (selectedVariation) {
		adp.creationProcessStarted = true;
		clearTimeout(pageGroupTimer);
		config.selectedVariation = selectedVariation.id;
		createAds(adp, selectedVariation);
	} else {
		triggerControl(3);
	}
}

function main() {
	// Hook Pagegroup, find pageGroup and check for blockList
	hookAndInit(adp, startCreation, browserConfig.platform);

	if (shouldWeNotProceed()) {
		return false;
	}

	// AdPushup Debug Force COntrol
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
	var rand = Math.floor(Math.random() * (100)) + 1;
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

module.exports = main;
