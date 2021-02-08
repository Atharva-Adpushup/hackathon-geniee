const siteModel = require('../../../models/siteModel');
const userModel = require('../../../models/userModel');

function getActiveUsers() {
	return siteModel
		.getActiveSites()
		.then(users => Array.from(new Set(users.map(({ accountEmail }) => accountEmail))))
		.catch(err => console.log(err));
}

function getUserSites(ownerEmail) {
	let siteid = [];

	return userModel
		.getUserByEmail(ownerEmail)
		.then(user => {
			const userSites = user.get('sites');

			return userSites
				.map(({ siteId }) => siteId)
				.sort((a, b) => a - b)
				.join();
		})
		.catch(err => console.log(err));
}

module.exports = {
	getUserSites,
	getActiveUsers
};
