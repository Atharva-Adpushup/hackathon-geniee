const adsSyncService = require('./adsSyncService/index');

function init(siteId, forcePrebidBuild) {
	return adsSyncService
		.publish(siteId, forcePrebidBuild)
		.then(response =>
			response && response.hasOwnProperty('empty')
				? console.log(response.message)
				: console.log(response)
		)
		.catch(console.log);
}

module.exports = { init };
