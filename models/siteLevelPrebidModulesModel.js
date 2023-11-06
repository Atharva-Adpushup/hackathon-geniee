const SiteModel = require('./siteModel');
const {
	PREBID_BUNDLING: { MODULES }
} = require('../configs/commonConsts');

const getActiveSiteLevelAdditionalModules = function(site) {
	const prebidAdditionalModules = site.get('prebidAdditionalModules') || [];
	const apps = site.get('apps');
	const floorEngineAppEnabled = !!apps.floorEngine;

	// Using a Set here to ensure uniqueness of module names
	const uniquePrebidAdditionalModuleNames = new Set(
		prebidAdditionalModules
			.filter(prebidModule => !!prebidModule.isEnabled)
			.map(prebidModule => prebidModule.moduleName)
	);

	if (floorEngineAppEnabled) {
		uniquePrebidAdditionalModuleNames.add(MODULES.PRICE_FLOORS);
	}

	return Array.from(uniquePrebidAdditionalModuleNames);
};

module.exports = {
	getSiteLevelPrebidAdditionalModules: function(siteId) {
		return SiteModel.getSiteById(siteId).then(site => getActiveSiteLevelAdditionalModules(site));
	}
};
