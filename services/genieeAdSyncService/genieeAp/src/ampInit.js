let utils = require('../libs/utils'),
	ampInitCalled = false,
	removeUtmlParams = oldUrl => {
		let newUrl = '';
		if (oldUrl.search.indexOf('utm_') != -1) {
			newUrl = oldUrl.toString().replace(/(\&|\?)utm([_a-z0-9=]+)/g, '');
		}
		return newUrl;
	},
	isUrlInBlocklist = config => {
		let blocklist = config.ampSettings.blocklist, nonUtmUrl = removeUtmlParams(window.location);
		if (blocklist && blocklist instanceof Array) {
			for (var x = 0, j = blocklist, k = j[x]; x < j.length; k = j[++x]) {
				if (nonUtmUrl.match(new RegExp(k, 'i'))) {
					return true;
				}
			}
		}
		return false;
	},
	isPageGroupAmpEnabled = config => {
		var isConfig = config,
			experiment = isConfig && config.experiment,
			isEnabled =
				!experiment ||
				!experiment[config.platform] ||
				!experiment[config.platform][config.pageGroup] ||
				!experiment[config.platform][config.pageGroup].ampSettings ||
				!experiment[config.platform][config.pageGroup].ampSettings.isEnabled;
		return isEnabled;
	};

module.exports = function (config) {
	let blockedUrlMatched = isUrlInBlocklist(config), isEnabled = isPageGroupAmpEnabled();
	console.group();
	console.log('config', config);
	console.log('blockedUrlMatched', blockedUrlMatched);
	console.log('isEnabled', isEnabled);
	console.groupEnd();
	if (!ampInitCalled && !blockedUrlMatched && isEnabled) {
		let randomNum = utils.getRandomNumberBetween(1, 100),
			samplingPercent = config.ampSettings && config.ampSettings.samplingPercent
				? parseInt(config.ampSettings.samplingPercent)
				: 10;
		randomNum >= samplingPercent &&
			utils.requestServer(
				'http://autoamp.io/publishAmpJob', // This is to be changed
				JSON.stringify({
					url: window.location.href,
					channelData: {
						siteId: config.siteId,
						platform: config.platform,
						pagegroup: config.pageGroup || null
					}
				}),
				null,
				'post',
				'json',
				'application/json'
			);
		ampInitCalled = true;
	}
};
