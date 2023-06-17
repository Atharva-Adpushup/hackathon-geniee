// Function to convert JSON data to CSV format
function convertToCSV(jsonData = []) {
	const dataRows = jsonData.map(item => Object.values(item));
	return dataRows;
}

// The function generateEmailSiteMapping takes an array data as a parameter. This function is responsible for generating a mapping of unique user accounts with their associated site IDs.
function generateEmailSiteMapping(activeSites) {
	const uniqueUserAccount = {};
	activeSites.forEach(element => {
		if (uniqueUserAccount[element.ownerEmail]) {
			uniqueUserAccount[element.ownerEmail].siteId.push(element.siteId);
		} else {
			uniqueUserAccount[element.ownerEmail] = {
				siteId: [element.siteId]
			};
		}
	});
	return uniqueUserAccount; //uniqueUserAccount = {'vineet@trainman.in': { siteId: [ 25013, ... ] }, 'support@rentdigs.com': { siteId: [ 25019 ] }, ...}
}

function updateEmailSiteMapping(emailSiteMapping, userData) {
	userData.forEach(user => {
		const { email, sellerId, childPublisherId } = user;
		if (emailSiteMapping.hasOwnProperty(email)) {
			emailSiteMapping[email].sellerId = sellerId;
			emailSiteMapping[email].childPublisherId = childPublisherId;
		}
	});
}

module.exports = {
	convertToCSV,
	generateEmailSiteMapping,
	updateEmailSiteMapping
};
