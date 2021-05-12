const request = require('request-promise');
const config = require('../configs/config');
const ejs = require('ejs');
const path = require('path');
module.exports = {
	sendEmail: body => {
		return request({
			method: 'POST',
			uri: config.mailerQueueUrl,
			json: true,
			body: { ...body }
		})
			.then(response => {
				console.log('Mail send succesfully');
			})
			.catch(error => {
				throw new Error(`Error in sending email:${error}`);
			});
	},
	generateEmailTemplate: async (base, templateName, params) => {
		// Get the EJS file that will be used to generate the HTML
		const file = path.join(__dirname, `../${base}/${templateName}.ejs`);

		// Throw an error if the file path can't be found
		if (!file) throw new Error(`Could not find the ${template} in path ${file}`);
		const result = await ejs.renderFile(file, params, { async: true });
		return result;
	}
};
