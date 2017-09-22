const siteModel = require('../../models/siteModel'),
	Promise = require('bluebird'),
	{ map, range } = require('lodash'),
	mailTriggerModule = require('./index');

function testMailTriggerService() {
	const siteIdsArray = [25013, 25095, 8, 25063, 25098],
		getMailTriggerStatusPromises = Promise.all(
			map(siteIdsArray, siteId => {
				return siteModel
					.getSiteById(siteId)
					.then(mailTriggerModule.init)
					.catch(error => {
						return error.message;
					});
			})
		);

	return getMailTriggerStatusPromises.then(console.log);
}

testMailTriggerService();
