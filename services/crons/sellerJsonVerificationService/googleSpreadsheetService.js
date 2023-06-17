const { GoogleSpreadsheet } = require('google-spreadsheet');
const { sendEmail } = require('../../../helpers/queueMailer');
const config = require('../../../configs/config');

async function updateGoogleSpreadSheet(csvData, spreadsheetID, headerFields) {
	try {
		const doc = new GoogleSpreadsheet(spreadsheetID);
		const creds = JSON.parse(Buffer.from(config.googleSheetCreds, 'base64').toString());
		await doc.useServiceAccountAuth(creds);
		await doc.loadInfo();
		const worksheet = doc.sheetsByIndex[0];
		await worksheet.clear();
		await worksheet.setHeaderRow(headerFields);
		await worksheet.addRows(csvData);
		const spreadSheetLink = `https://docs.google.com/spreadsheets/d/${spreadsheetID}/edit#gid=0`;
		return spreadSheetLink;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

async function sendGoogleSpreadsheetLinkOnEmail(googleSpreadsheetLink, MAILER_EMAIL_ADDRESS) {
	try {
		const emailData = {
			to: MAILER_EMAIL_ADDRESS,
			body: `Seller.json verification sheet: ${googleSpreadsheetLink}`,
			subject: 'Sellers.json Verification report'
		};
		return await sendEmail({
			queue: 'MAILER',
			data: emailData
		});
	} catch (error) {
		console.error(error);
		const errorEmailData = {
			to: MAILER_EMAIL_ADDRESS,
			body: error.message,
			subject: 'Sellers.json Verification Service fails'
		};
		return sendEmail({
			queue: 'MAILER',
			data: errorEmailData
		});
	}
}

module.exports = {
	updateGoogleSpreadSheet,
	sendGoogleSpreadsheetLinkOnEmail
};
