const axios = require('axios');
const { BACKEND_API_URL } = require('./config')
const emailer = require('./emailer');
const saveAnomaliesToDb = async (data, PARTNER_NAME) => {

	const config = {
		method: 'post',
		url: BACKEND_API_URL,
		data
	}
	return await axios(config)
		.then(response => response.data)
		.then(async response => {
			console.log(response, 'API DB Save response');
			if(response.code === -1) {
				await emailer.serviceErrorNotificationMailService({
					partner: PARTNER_NAME,
					error: response.message
				})	
			}
			return response;
		})
		.catch(async e => {
			console.log(`error API DB Save :${e}`);
			await emailer.serviceErrorNotificationMailService({
				partner: PARTNER_NAME,
				error
			})
			throw { error: true };
			// return err;
		});
};

module.exports = saveAnomaliesToDb;
