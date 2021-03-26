const axios = require('axios');
const URL = 'http://queuepublisher.adpushup.com/publish'
const { PRODUCT_TEAM, OPS_TEAM, DEV_TEAM } = require('./config')

let ownerEmails = DEV_TEAM;
if (process.env.NODE_ENV === 'production') {
	ownerEmails = ownerEmails.concat(OPS_TEAM);
} else if(process.env.NODE_ENV === 'staging') {
	ownerEmails = ownerEmails.concat(PRODUCT_TEAM);
}

const anomaliesMailService = async ({partner, anomalies}) => {	  
	if (!ownerEmails.length) {
		throw new Error("Please add owner email's in the config file to send email's to the owners");
	}
	const emailRecepient = ownerEmails.join(',');

	const dataConvertedToTableRow = () => {
		let tableRow = '';
		anomalies.forEach((siteData, siteid) => {
			const thisRow = `<tr>
			<td> ${siteData.date} </td>
			<td> ${partner} </td>
			<td> ${siteData.siteDomain} </td>
			<td> ${siteData.diffPer} </td> 
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
          <th> Diff % </th>
          <th> Pub Revenue </th>
          <th> ADP Revenue </th>
        </tr>
        ${dataConvertedToTableRow()}
        </table>
    `;

	const apiBody = {
		queue: 'MAILER',
		data: {
			to: emailRecepient,
			body: emailbody,
			subject: `${partner} - Partners Panel Anomaly Detection Service(Beta verison) !!!`
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
	// const ownerEmails = config.onwers.emails || [];
	const ownerEmails = ['harpreet.singh@adpushup.com'];

	if (!ownerEmails.length) {
		throw new Error("Please add owner email's in the config file to send email's to the owners");
	}
	const emailRecepient = ownerEmails.join(',');

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
			subject: `${module} - Service Error Alert(Beta verison)!!!`
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

module.exports = {
	anomaliesMailService,
	serviceErrorNotificationMailService
};
