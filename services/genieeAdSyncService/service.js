var Promise = require('bluebird'),
	retry = require('bluebird-retry'),
	configPublishService = require('./apV2SiteConfigPublishService/index');

function publishCDNWrapper(site) {
	return configPublishService
		.publish(site)
		.then(
			response =>
				response && response.hasOwnProperty('empty') ? console.log(response.message) : console.log(response)
		)
		.catch(console.log);
}

module.exports = { init: site => publishCDNWrapper(site) };
