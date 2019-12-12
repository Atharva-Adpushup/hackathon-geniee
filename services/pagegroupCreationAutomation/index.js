const { promiseForeach } = require('node-utils');

const AdPushupError = require('../../helpers/AdPushupError');
const utils = require('../../helpers/utils');
const userModel = require('../../models/userModel');
const channelModel = require('../../models/channelModel');

function channelCreation(data, channel) {
	channel = utils.getHtmlEncodedJSON(channel);
	channel.siteId = data.siteId;

	return channelModel
		.createPageGroup(channel)
		.then(() => userModel.setSitePageGroups(data.userEmail).then(user => user.save()));
}

function init(data) {
	/*
		JSON from client
		{"siteId":"1","pageGroupName":"TEST","sampleUrl":"http://www.createyourplans.com","forceSampleUrl":"on","device":"desktop"}
	*/
	if (!data || !data.userEmail || !data.siteId || !data.url) {
		throw new AdPushupError({
			message: 'Incomplete Parameters. User Email, Site Id and Url are required params.'
		});
	}
	const channels = [
		{
			device: 'DESKTOP',
			pageGroupName: 'HOME',
			sampleUrl: data.url,
			forceSampleUrl: 'off',
			siteId: data.siteId
		},
		{
			device: 'MOBILE',
			pageGroupName: 'HOME',
			sampleUrl: data.url,
			forceSampleUrl: 'off',
			siteId: data.siteId
		}
	];
	const failed = [];
	const response = {
		error: false,
		message: 'Operation Successful'
	};
	return promiseForeach(channels, channelCreation.bind(null, data), (data, err) => {
		console.log(err);
		failed.push[`${data.device}-${data.pageGroupName}`];
		return true;
	})
		.then(() => response)
		.catch(err => {
			console.log(err);
			return {
				...response,
				error: true,
				message: `Operation Failed. ${failed.length ? `Failed for: ${failed.join(', ')}` : ''}`
			};
		});
}

module.exports = init;

// init({
// 	siteId: 1,
// 	url: 'http://www.createyourplans.com/test/1',
// 	userEmail: 'yomesh.gupta@mailinator.com'
// });
