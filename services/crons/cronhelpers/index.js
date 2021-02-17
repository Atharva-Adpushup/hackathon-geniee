const request = require('request-promise');
const ejs = require('ejs');
const path = require('path');
const { getAdpToken } = require('../../../helpers/authToken');
const CC = require('../../../configs/commonConsts');
const { BASE_URL } = require('../../../configs/commonConsts');
const siteModel = require('../../../models/siteModel');
const userModel = require('../../../models/userModel');
const couchbase = require('../../../helpers/couchBaseService');
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

function getWidgetsDataSite(params) {
	return request({
		uri: `${BASE_URL}/api/reports/getWidgetData`,
		json: true,
		qs: {
			...params,
			bypassCache: true
		},
		headers: {
			authorization: getAdpToken()
		},
		resolveWithFullResponse: true
	}).then(response => {
		if (response.statusCode == 200 && response.body) {
			console.log('fetched widget');
			return Promise.resolve(response.body);
		}
		return Promise.reject(new Error('Invalid widget data'));
	});
}

function getLastRunInfo() {
	const bucket = 'apLocalBucket';
	return couchbase.connectToBucket(bucket).then(requestBucket =>
		requestBucket.getAsync(CC.docKeys.lastRunInfoDoc).then(doc => {
			//from where lastRunOn is set first
			const { value = {} } = doc;
			const { lastRunOn } = value;
			return Promise.resolve(lastRunOn);
		})
	);
}

async function generateEmailTemplate(template, params) {
	// Get the EJS file that will be used to generate the HTML
	const file = path.join(__dirname, `../ReportsSnapshotEmail/templates/${template}.ejs`);

	// Throw an error if the file path can't be found
	if (!file) {
		throw new Error(`Could not find the ${template} in path ${file}`);
	}
	const result = await ejs.renderFile(file, params, { async: true });
	return result;
}

const roundOffTwoDecimal = value => {
	if (Number.isInteger(value)) return value;
	const roundedNum = Math.round(value * 100) / 100;
	return roundedNum.toFixed(2);
};

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

module.exports = {
	getUserSites,
	getActiveUsers,
	getWidgetsDataSite,
	getLastRunInfo,
	generateEmailTemplate,
	roundOffTwoDecimal,
	numberWithCommas
};
