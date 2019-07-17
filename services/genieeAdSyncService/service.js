const adsSyncService = require('./adsSyncService/index');

function init(site) {
	return adsSyncService
		.publish(site)
		.then(response =>
			response && response.hasOwnProperty('empty') ? console.log(response.message) : console.log(response)
		)
		.catch(console.log);
}

module.exports = { init: site => init(site) };
