const axios = require('axios');

const anomaliesMailService = async dataToSend => {
	// const ownerEmails = config.onwers.emails || [];
	const ownerEmails = ['harpreet.singh@adpushup.com'];

	if (!ownerEmails.length) {
		throw new Error("Please add owner email's in the config file to send email's to the owners");
	}
	const emailRecepient = ownerEmails.join(',');

	const dataConvertedToTableRow = () => {
		let tableRow = '';
		console.log(dataToSend[0], 'dataToSend mail');
		dataToSend.forEach((siteData, siteid) => {
			// "siteDomain": "https://www.thelocal.dk/",
			// "siteId": 41747,
			// "site_name": "thelocal.dk",
			// "pubRevenue": "0.622462",
			// "adpRevenue": 0.1139,
			// "diff": 0.508562,
			// "diffPer": 138.12825756896743

			const thisRow = `<tr>
        <td> ${siteData.siteDomain} </td>
        <td> ${siteData.siteId} </td> 
        <td> ${siteData.site_name} </td> 
        <td> ${siteData.pubRevenue} </td> 
        <td> ${siteData.adpRevenue} </td> 
        <td> ${siteData.diff} </td> 
        <td> ${siteData.diffPer} &nbsp;%</td>`;

			tableRow = tableRow + thisRow;
		});
		return tableRow;
		// <td> ${siteData.dropPercentInImptoPvRatio}&nbsp;%</td> </tr>` ;
	};
	const utctoist = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
	const parseDate = (date, extra) => {
		return new Date(Date.parse(date) + extra + utctoist).getUTCHours().toString() + ':00';
	};

	// <h3> Comparision Between ${parseDate(from,0)} - ${parseDate(from, 3600000)} And ${parseDate(from,3600000)} - ${parseDate(to,0)}</h3>
	// <th> Last Hour Impression To Page Views Ratio </th>
	// <th> This Hour Impressions To Page Views Ratio </th>
	// <th> Drop Percent in Ratio ( impression / pageviews ) </th>
	let emailbody = `<h1> Impression Drop Anomaly Sitewise </h1>
        <table border="1" style="width:80%">
        <tr>
          <th> Site-Domain </th>
          <th> Site-Id </th>
          <th> Site-Name </th>
          <th> Pub Revenue </th>
          <th> ADP Revenue </th>
          <th> Diff </th>
          <th> Diff % </th>
        </tr>
        ${dataConvertedToTableRow()}
        </table>
        
        <h4> heading <h4>
    `;

	const apiBody = {
		queue: 'MAILER',
		data: {
			to: emailRecepient,
			body: emailbody,
			subject: 'Impression Anomaly Detected Testing (impression/ pv ratio) !!!'
		}
	};

	return await axios
		.post('http://queuepublisher.adpushup.com/publish', {
			queue: 'MAILER',
			data: {
				to: 'harpreet.singh@adpushup.com',
				body: emailbody,
				subject: 'Testing mail 6'
			}
		})
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
	anomaliesMailService
};
