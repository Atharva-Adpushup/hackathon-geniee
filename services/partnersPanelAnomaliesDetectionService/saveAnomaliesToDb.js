const axios = require('axios');
const { BACKEND_API_URL } = require('./config')
const emailer = require('./Emailer');
const saveAnomaliesToDb = async (data, module) => {
	const config = {
		method: 'post',
		url: BACKEND_API_URL,
		data,
		headers: {
            'Content-Type': 'application/json'
        }
	}
	return await axios(config)
		.then(response => response.data)
		.then(async response => {
			console.log(response, 'API DB Save response');
			if(response.code === -1) {
				await emailer.serviceErrorNotificationMailService(response.message, module)	
			}
			return response;
		})
		.catch(async e => {
			console.log(`error API DB Save :${e}`);
			await emailer.serviceErrorNotificationMailService({
				partner: module,
				error
			})
			throw { error: true };
			// return err;
		});
};

module.exports = saveAnomaliesToDb;
