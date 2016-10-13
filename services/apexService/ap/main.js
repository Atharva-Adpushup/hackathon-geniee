var adp = require('./adpushup');

(function() {
	var config = adp.config, rand;

	// AdPushup Mode Logic
	if (parseInt(config.mode, 10) === 2) {
		adp.triggerControl(2);
		return false;
	}

	// AdPushup Percentage Logic
	rand = Math.floor(Math.random() * (100)) + 1;
	if (rand > config.adpushupPercentage) {
		adp.triggerControl(4);
		return false;
	}

	adp.startCreation();
})();
