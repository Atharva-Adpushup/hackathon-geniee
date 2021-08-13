const adsSyncService = require('./adsSyncService/index');

function init(site, forcePrebidBuild) {
	return adsSyncService
		.publish(site, forcePrebidBuild)
		.then(response =>
			response && response.hasOwnProperty('empty')
				? console.log(response.message)
				: console.log(response)
		)
		.catch(console.log);
}

module.exports = { init: (site, forcePrebidBuild) => init(site, forcePrebidBuild) };
