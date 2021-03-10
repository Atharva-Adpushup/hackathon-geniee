const request = require('request-promise');
const { BlobServiceClient } = require('@azure/storage-blob');
const ejs = require('ejs');
const path = require('path');
const { getAdpToken } = require('../../../helpers/authToken');
const CC = require('../../../configs/commonConsts');
const { BASE_URL } = require('../../../configs/commonConsts');
const siteModel = require('../../../models/siteModel');
const userModel = require('../../../models/userModel');
const couchbase = require('../../../helpers/couchBaseService');
const config = require('../../../configs/config');

function getActiveUsers() {
	return siteModel
		.getActiveSites()
		.then(users => Array.from(new Set(users.map(({ accountEmail }) => accountEmail))))
		.catch(err => console.log(err));
}

function getUserSites(ownerEmail) {
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

function sendEmail(body) {
	return request({
		method: 'POST',
		uri: config.weeklyDailySnapshots.mailerQueueUrl,
		json: true,
		body: { ...body }
	})
		.then(response => {
			console.log('Mail send succesfully');
		})
		.catch(error => {
			throw new Error(`Error in sending email:${error}`);
		});
}

function getSiteWidgetData(params) {
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
			return response.body;
		}
		throw new Error('Invalid widget data');
	});
}

function getLastRunInfo() {
	const bucket = 'apLocalBucket';
	return couchbase.connectToBucket(bucket).then(requestBucket =>
		requestBucket.getAsync(CC.docKeys.lastRunInfoDoc).then(doc => {
			//from where lastRunOn is set first
			const { value = {} } = doc;
			const { lastRunOn } = value;
			return lastRunOn;
		})
	);
}

async function generateEmailTemplate(base, template, params) {
	// Get the EJS file that will be used to generate the HTML
	const file = path.join(__dirname, `../${base}/templates/${template}.ejs`);

	// Throw an error if the file path can't be found
	if (!file) throw new Error(`Could not find the ${template} in path ${file}`);
	const result = await ejs.renderFile(file, params, { async: true });
	return result;
}

const roundOffTwoDecimal = value => {
	if (Number.isInteger(value)) return value;
	const roundedNum = Math.round(value * 100) / 100;
	return roundedNum.toFixed(2);
};

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

async function uploadImageToAzure(blobClientName, fileStream) {
	try {
		const STORAGE_CONNECTION_STRING = config.weeklyDailySnapshots.CONNECTION_STRING;
		if (!STORAGE_CONNECTION_STRING) {
			throw new Error(`Azure Connection string does not exist`);
		}
		const blobServiceClient = await BlobServiceClient.fromConnectionString(
			STORAGE_CONNECTION_STRING
		);
		const containerClient = await blobServiceClient.getContainerClient(
			config.weeklyDailySnapshots.CONTAINER_NAME
		);
		const blobclient = await containerClient.getBlockBlobClient(blobClientName);
		await blobclient.upload(fileStream, fileStream.length);
		console.log('succesfully uploaded image');
	} catch (error) {
		throw new Error(`Error in uploading image:${error}`);
	}
}

function getBase64Image(body) {
	return request({
		method: 'POST',
		uri: `${config.weeklyDailySnapshots.highchartsServer}:${
			config.weeklyDailySnapshots.highchartsServerPort
		}`,
		json: true,
		body: { ...body }
	}).catch(error => {
		throw new Error(`Error in generating image:${error}`);
	});
}

module.exports = {
	getUserSites,
	getActiveUsers,
	getSiteWidgetData,
	getLastRunInfo,
	generateEmailTemplate,
	roundOffTwoDecimal,
	numberWithCommas,
	sendEmail,
	uploadImageToAzure,
	getBase64Image
};
