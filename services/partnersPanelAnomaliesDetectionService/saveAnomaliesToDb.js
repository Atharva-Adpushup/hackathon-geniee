const axios = require('axios');
const { BACKEND_API_URL } = require('./config')
const saveAnomaliesToDb = async (data) => {

	const config = {
		method: 'post',
		url: BACKEND_API_URL,
		data
	}
	return await axios(config)
		.then(response => response.data)
		.then(response => {
			console.log(response, 'API DB Save response');
			return response;
		})
		.catch(e => {
			console.log(`error API DB Save :${e}`);
			throw { error: true };
			// return err;
		});
};

module.exports = saveAnomaliesToDb;
