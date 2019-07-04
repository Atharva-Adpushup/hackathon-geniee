var $ = require('../libs/jquery'),
	utils = require('../libs/utils');

function init(adp, onPageGroupPush, platform) {
	// store configure object in temp variable.
	var tempConfig = adp.configure,
		config = adp.config;

	// hook configure with our own implementation
	adp.configure = {
		push: function(obj) {
			var k;
			// eslint-disable-next-line guard-for-in
			for (k in obj) {
				switch (k) {
					case 'siteId':
						obj.siteId = obj.siteId ? parseInt(obj.siteId, 10) : null;
						break;
					case 'pageGroup':
						// if  PageGroup pushed again then ignore it
						obj.pageGroup = config.pageGroup ? config.pageGroup.toUpperCase() : obj.pageGroup.toUpperCase();
						onPageGroupPush(); // if pagegroup is pushed later the start creation
						break;
					case 'siteDomain':
						obj.siteDomain = obj.siteDomain
							? encodeURIComponent(obj.siteDomain.replace(/^www\./i, ''))
							: null;
						break;
					case 'pageUrl':
						obj.pageUrl = obj.pageUrl ? encodeURIComponent(obj.pageUrl) : null;
						break;
					default:
						break;
				}
			}
			$.extend(adp.config, obj);
		}
	};

	// PageGroup via URL pattern implementation. This must run before we merge tempConfig with config as priority of pageGroupPattern is high then config.
	var done,
		w = window,
		isPlatformExperiment = config.experiment && !!config.experiment[platform],
		platformExperiments = isPlatformExperiment ? config.experiment[platform] : false,
		experimentPageGroups = isPlatformExperiment ? Object.keys(platformExperiments) : [],
		isExperimentPageGroups = !!(experimentPageGroups && experimentPageGroups.length),
		hasInnovativeAds = !!(config.innovativeModeActive && config.innovativeAds && config.innovativeAds.length);

	if (isExperimentPageGroups || hasInnovativeAds) {
		try {
			for (var i = 0; i < experimentPageGroups.length; i++) {
				var key = experimentPageGroups[i],
					//Remove forceVariation param from url so that it doesn't change pageGrop pattern
					url = utils.removeUrlParameter(w.location.href, config.forceVariation),
					// Type casting url pattern to ensure special characters are escaped and variable
					// value is a valid string
					patternToMatch = String(platformExperiments[key].pageGroupPattern);

				//do check if any pageGroup pattern provided or not, if not then don't match
				if (patternToMatch && url.match(new RegExp(patternToMatch, 'i'))) {
					// forceFully set pagegroup in case url pattern matches to current url
					config.pageGroup = key.toUpperCase();
					break;
				}
			}
		} catch (error) {
			utils.log('Error while detecting pageGroup', error, experimentPageGroups);
		}
	}

	// Pushing tempConfig into our configure
	if (tempConfig instanceof Array) {
		for (var i = 0; i < tempConfig.length; i++) {
			if (typeof tempConfig[i] === 'object') {
				// eslint-disable-next-line guard-for-in
				adp.configure.push(tempConfig[i]);
			}
		}
	}

	// Blocklist Implementation
	if (config.blocklist && config.blocklist instanceof Array) {
		for (var x = 0, j = config.blocklist, k = j[x]; x < j.length; k = j[++x]) {
			k = k.trim();
			if (window.location.href.match(new RegExp(k, 'i'))) {
				config.disable = true;
				return true;
			}
		}
	}
}

module.exports = init;
