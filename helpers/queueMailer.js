const request = require('request-promise');
const ejs = require('ejs');
const path = require('path');
const config = require('../configs/config');

module.exports = {
	sendEmail: body =>
		request({
			method: 'POST',
			uri: config.mailerQueueUrl,
			json: true,
			body: { ...body }
		})
			.then(() => {
				// eslint-disable-next-line no-console
				console.log('Mail sent succesfully');
			})
			.catch(error => {
				throw new Error(`Error in sending email:${error}`);
			}),
	generateEmailTemplate: async (base, templateName, params) => {
		// Get the EJS file that will be used to generate the HTML
		const file = path.join(__dirname, `../${base}/${templateName}.ejs`);

		// Throw an error if the file path can't be found
		if (!file) throw new Error(`Could not find the ${templateName} in path ${file}`);
		const result = await ejs.renderFile(file, params, { async: true });
		return result;
	}
};
