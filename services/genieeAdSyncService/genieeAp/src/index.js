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
	creationProcessStarted = false,
	config = adp.config = require('../config/config.js'),
	$ = adp.$ = require('jquery');

// Extend adpushup object
$.extend(adp, {
	err: [],
	control: control,
	tracker: new Tracker(),
	nodewatcher: nodewatcher,
	platform: browserConfig.platform
});

// Extend the settings with generated settings
// eslint-disable-next-line no-undef
$.extend(adp.config, ___abpConfig___);


function triggerControl(mode) {
	// if config has disable or this function triggered more than once or no pageGroup found then do nothing;
	if (config.disable || creationProcessStarted) {
		return false;
	}
	creationProcessStarted = true;
	control.trigger();
	// TODO send feedback to server regarding control
	utils.sendFeedback({ eventType: 3, mode: mode, referrer: config.referrer });
}

function startCreation() {
	// if config has disable or this function triggered more than once or no pageGroup found then do nothing;
	if (config.disable || creationProcessStarted || !config.pageGroup) {
		return false;
	}
	creationProcessStarted = true;
	var selectedVariation = selectVariation(config);
	if (selectedVariation) {
		clearTimeout(pageGroupTimer);
		config.selectedVariation = selectedVariation;
		createAds(adp, selectVariation);
	}
}

function main() {
	// Hook Pagegroup, find pageGroup and check for blockList
	hookAndInit(adp, startCreation);

	if (config.disable  || creationProcessStarted) {
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
		}, 5000);
	} else {
		// start heartBeat
		heartBeat(config.feedbackUrl, config.heartBeatMinInterval, config.heartBeatDelay).start();

		//Init creation
		startCreation();
	}
}

module.exports = main;
