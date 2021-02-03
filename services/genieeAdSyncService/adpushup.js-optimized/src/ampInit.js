var utils = require('../libs/utils'),
	CONFIG = require('../config/commonConsts'),
	ampInitCalled = false,
	removeUtmlParams = function removeUtmlParams(oldUrl) {
		return oldUrl.toString().replace(/(\&|\?)utm([_a-z0-9=]+)/g, '');
	},
	isUrlInBlocklist = function isUrlInBlocklist(config) {
		var blockList = config.ampSettings && config.ampSettings.blockList,
			nonUtmUrl = removeUtmlParams(window.location);
		if (blockList && blockList instanceof Array) {
			for (var x = 0, j = blockList, k = j[x]; x < j.length; k = j[++x]) {
				if (nonUtmUrl.match(new RegExp(k, 'i'))) {
					return true;
				}
			}
		}
		return false;
	},
	isPageGroupAmpEnabled = function isPageGroupAmpEnabled(config) {
		var ampPath = window.adpushup && window.adpushup.ampPath,
			ampDomain = window.adpushup && window.adpushup.ampDomain,
			isConfig = config,
			experiment = isConfig && config.experiment,
			isEnabled =
				ampPath &&
				ampDomain &&
				experiment &&
				experiment[config.platform] &&
				experiment[config.platform][config.pageGroup] &&
				experiment[config.platform][config.pageGroup].ampSettings &&
				experiment[config.platform][config.pageGroup].ampSettings.isEnabled;
		return isEnabled;
	};

module.exports = function(config) {
	var blockedUrlMatched = isUrlInBlocklist(config),
		isEnabled = isPageGroupAmpEnabled(config);
	if (!ampInitCalled && !blockedUrlMatched && isEnabled) {
		var randomNum = utils.getRandomNumberBetween(1, 100),
			samplingPercent =
				config.ampSettings && config.ampSettings.samplingPercent
					? parseInt(config.ampSettings.samplingPercent)
					: 10;
		randomNum <= samplingPercent &&
			utils.requestServer(
				CONFIG.AMP_PUBLISH_URL, // This is to be changed
				JSON.stringify({
					url: window.location.href,
					channelData: {
						siteId: config.siteId,
						platform: config.platform,
						pagegroup: config.pageGroup || null
					},
					ampPath: window.adpushup && window.adpushup.ampPath ? window.adpushup.ampPath : false,
					ampDomain: window.adpushup && window.adpushup.ampDomain ? window.adpushup.ampDomain : false
				}),
				null,
				'post',
				'json',
				'application/json'
			);
	}
	ampInitCalled = true;
};
