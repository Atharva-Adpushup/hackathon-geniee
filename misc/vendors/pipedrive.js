const _ = require('lodash');
const Promise = require('bluebird');
const request = require('request-promise');
const CC = require('../../configs/commonConsts');

function getOptions(action, payload) {
	let options = {
		method: '',
		uri: 'https://api.pipedrive.com',
		json: true,
	};

	function updateOptions(method, requestContent) {
		requestContent.api_token = CC.analytics.PIPEDRIVE_SYNC_TOKEN;
		options.method = method;
		switch(method) {
			case 'GET':
				options.qs = requestContent;
				break;
			case 'POST':
				options.body = requestContent;
				break;
			case 'PUT':
				options.qs = { api_token: requestContent.api_token };
				options.body = requestContent;
				break;
		}
	}

	switch (action) {
		case 'getUserByTerm':
			options.uri += '/v1/persons/find';
			updateOptions('GET', payload);
			break;
		case 'getUserById':
			options.uri += '/v1/persons/' + payload.user_id;
			updateOptions('GET', payload);
			break;
		case 'updateDeal':
			options.uri += '/v1/deals/' + payload.deal_id;
			updateOptions('PUT', payload);
			break;
		default:
			break;
	}

	return Promise.resolve(options);
};

function callPipedriveAPI(action, payload) {
	return getOptions(action, payload)
	.then(request)
	.then(Promise.resolve)
	.catch(err => err);
}

module.exports = callPipedriveAPI;