const request = require('request-promise');
const globalConfig = require('../../configs/config');
const config = require('./config');

module.exports = {
	sendEmail: body => {
		return request({
			method: 'POST',
			uri: globalConfig.mailerQueueUrl,
			json: true,
			body: { ...body }
		})
			.then(response => {
				console.log('Mail sent succesfully');
			})
			.catch(error => {
				throw new Error(`Error in sending email:${error}`);
			});
	},
	async handleError(error) {
		const emailBody = `<p>Error in fetching MCM Status: ${error} </p>`;
		const emailSubject = 'MCM Fetching Error';
		await this.sendEmail({
			queue: 'MAILER',
			data: {
				to: config.errorEmail,
				body: emailBody,
				subject: emailSubject
			}
		});
		console.log(error);
		process.exit(1);
	}
};
