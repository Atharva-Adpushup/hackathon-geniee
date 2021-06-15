const axios = require('axios');
const URL = 'http://queuepublisher.adpushup.com/publish';
const { PRODUCT_TEAM, OPS_TEAM, DEV_TEAM, TESTING_TEAM } = require('./config');

let ownerEmails = [];
let ownerEmailsForDevIssue = [];
if (process.env.NODE_ENV === 'production') {
	ownerEmails = ownerEmails.concat(TESTING_TEAM, PRODUCT_TEAM, OPS_TEAM);
	ownerEmailsForDevIssue = DEV_TEAM;
} else if (process.env.NODE_ENV === 'staging') {
	ownerEmails = ownerEmails.concat(TESTING_TEAM, PRODUCT_TEAM);
	ownerEmailsForDevIssue = TESTING_TEAM;
} else {
	ownerEmails = TESTING_TEAM;
	ownerEmailsForDevIssue = TESTING_TEAM;
}

const anomaliesMailService = async ({ partner, anomalies }) => {
	if (!ownerEmails.length) {
		throw new Error("Please add owner email's in the config file to send email's to the owners");
	}
	const emailRecepient = ownerEmails.join(',');

	const dataConvertedToTableRow = () => {
		let tableRow = '';
		anomalies.forEach(siteData => {
			const thisRow = `<tr>
			<td> ${siteData.date} </td>
			<td> ${partner} </td>
			<td> ${siteData.siteDomain} </td>
			<td> ${siteData.diffPer.toFixed(2)} </td> 
			<td> ${siteData.pubRevenue} </td> 
			<td> ${siteData.adpRevenue} </td>`;

			tableRow = tableRow + thisRow;
		});
		return tableRow;
	};

	let emailbody = `<h1> ${partner} - Anomalies Detection Service </h1>
        <table border="1" style="width:80%">
        <tr>
          <th> Date </th>
          <th> Partner </th>
          <th> Website </th>
          <th> Difference % </th>
          <th> Demand Partner Revenue </th>
          <th> AdPushup Revenue </th>
        </tr>
        ${dataConvertedToTableRow()}
        </table>
    `;

	const apiBody = {
		queue: 'MAILER',
		data: {
			to: emailRecepient,
			body: emailbody,
			subject: `${partner} - Partners Panel Anomaly Detection Service !!!`
		}
	};

	return await axios
		.post(URL, apiBody)
		.then(response => response.data)
		.then(response => {
			console.log(response, 'Mail response');
			return response;
		})
		.catch(e => {
			console.log(`error Mail:${e}`);
			throw { error: true };
			// return err;
		});
};

const serviceErrorNotificationMailService = async (error, module) => {
	if (!ownerEmailsForDevIssue.length) {
		throw new Error("Please add owner email's in the config file to send email's to the owners");
	}
	const emailRecepient = ownerEmailsForDevIssue.join(',');

	let emailbody = `<h1> ${module} - Error Notification Service </h1>
		<p>
			${error}
        </p>
    `;

	const apiBody = {
		queue: 'MAILER',
		data: {
			to: emailRecepient,
			body: emailbody,
			subject: `${module} - Service Error Alert!!!`
		}
	};

	return await axios
		.post(URL, apiBody)
		.then(response => response.data)
		.then(response => {
			console.log(response, 'Mail response');
			return response;
		})
		.catch(e => {
			console.log(`error Mail:${e}`);
			throw { error: true };
		});
};

module.exports = {
	anomaliesMailService,
	serviceErrorNotificationMailService
};
