const cron = require('node-cron');

const CC = require('../../../configs/commonConsts');
const { userConfig, authConfig, MAILER_EMAIL_ADDRESS } = require('./config.js');
const { fetchAllActiveSites, fetchUserData, fetchSellerJsonData } = require('./dataFetch');
const { verifyAdsTxt, verifySellerJson, verifyGamSellerId } = require('./dataValidation');
const { convertToCSV, generateEmailSiteMapping, updateEmailSiteMapping } = require('./utils');
const {
	updateGoogleSpreadSheet,
	sendGoogleSpreadsheetLinkOnEmail
} = require('./googleSpreadsheetService');
const { getAllCompanies } = require('./googleDfp');
const { headerFields } = require('./const');
const sdClient = require('../../../helpers/ServerDensityLogger');
const config = require('../../../configs/config');

const spreadsheetID = CC.GOOGLE_SPREAD_SHEET_ID.sellersJSONReporting;

async function start() {
	try {
		const activeSites = await fetchAllActiveSites();
		const emailSiteMapping = generateEmailSiteMapping(activeSites); //uniqueUserAccount = {'vineet@trainman.in': { siteId: [ 25013, ... ] }, 'support@rentdigs.com': { siteId: [ 25019 ] }, ...}
		const allEmails = Object.keys(emailSiteMapping); //["vineet@trainman.in", "support@rentdigs.com"]
		const userData = await fetchUserData(allEmails); //emailSiteMapping
		updateEmailSiteMapping(emailSiteMapping, userData);
		const sellerJsonData = await fetchSellerJsonData();
		const allCompaniesList = await getAllCompanies(userConfig, authConfig);
		const resultJSON = await processSites(emailSiteMapping, sellerJsonData, allCompaniesList);
		const csvData = convertToCSV(resultJSON);
		const googleSpreadsheetLink = await updateGoogleSpreadSheet(
			csvData,
			spreadsheetID,
			headerFields
		);
		await sendGoogleSpreadsheetLinkOnEmail(googleSpreadsheetLink, MAILER_EMAIL_ADDRESS);
	} catch (error) {
		console.error('An error occurred:', error);
		throw error;
	}
}

async function processSites(emailSiteMapping, sellerJsonData, allCompaniesList) {
	let resultJSON = [];
	for (let email in emailSiteMapping) {
		const emailObj = emailSiteMapping[email];
		const siteLevelPromises = emailObj.siteId.map(async site => {
			try {
				const verifyAdsTxtResp = await verifyAdsTxt(emailObj.sellerId, site);
				const siteLevelObj = {
					siteId: site,
					siteDomain: verifyAdsTxtResp.domain,
					adpushupConsoleEntry: 'adpushup.com ' + emailObj.sellerId + ' DIRECT b0b8ff8485794fdd',
					mandatoryEntry: verifyAdsTxtResp.sellerIdMatched,
					sellerJsonVerified: await verifySellerJson(emailObj.sellerId, sellerJsonData),
					gamSellerIdVerified: verifyGamSellerId(
						allCompaniesList,
						emailObj.childPublisherId,
						emailObj.sellerId
					)
				};
				return siteLevelObj;
			} catch (error) {
				console.log(error);
			}
		});
		let siteLevelObjs = await Promise.all(siteLevelPromises);
		resultJSON = [...resultJSON, ...siteLevelObjs];
	}
	return resultJSON; //[{siteId: 25013, adpushupConsoleEntry:'adpushup.com, 836188694c9a56b38c66c1bfd3cbc1f6, DIRECT, b0b8ff8485794fdd', mandatoryEntry: false, sellerJsonVerified: false}, {}]
}

if (config.environment.HOST_ENV === 'production') {
	process.on('uncaughtException', error => {
		console.log(error.stack);
		sdClient.increment('Monitoring.SellersJsonVerificationReport');
		setTimeout(() => process.exit(1), 2000);
	});

	process.on('unhandledRejection', error => {
		console.log(error.stack);
		sdClient.increment('Monitoring.SellersJsonVerificationReport');
		setTimeout(() => process.exit(1), 2000);
	});
}

start();

cron.schedule(CC.cronSchedule.sellersJsonReportingService, start, false);
