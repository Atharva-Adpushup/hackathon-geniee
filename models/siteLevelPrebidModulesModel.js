const SiteModel = require('./siteModel');

const getActiveSiteLevelAdditionalModules = function(site) {
	const prebidAdditionalModules = site.get('prebidAdditionalModules') || [];
	return prebidAdditionalModules
		.filter(prebidModule => !!prebidModule.isEnabled)
		.map(prebidModule => prebidModule.moduleName);
};

module.exports = {
	getSiteLevelPrebidAdditionalModules: function(siteId) {
		return SiteModel.getSiteById(siteId).then(site => getActiveSiteLevelAdditionalModules(site));
	}
};
