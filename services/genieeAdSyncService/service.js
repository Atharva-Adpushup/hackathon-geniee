const adsSyncService = require('./adsSyncService/index');

function init(siteId, forcePrebidBuild, options = {}) {
	return adsSyncService
		.publish(siteId, forcePrebidBuild, options)
		.then(response =>
			response && response.hasOwnProperty('empty')
				? console.log(response.message)
				: console.log(response)
		)
		.catch(console.log);
}

module.exports = { init };
