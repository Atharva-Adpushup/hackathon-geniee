const { promiseForeach } = require('node-utils');
const express = require('express');

const utils = require('../helpers/utils');
const userModel = require('../models/userModel');
const channelModel = require('../models/channelModel');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const { errorHandler, verifyOwner } = require('../helpers/routeHelpers');

const router = express.Router();

const hlprs = {
	channelCreation: (channel, userEmail) => {
		const encodedChannel = utils.getHtmlEncodedJSON(channel);

		return channelModel
			.createPageGroup(encodedChannel)
			.then(() => userModel.setSitePageGroups(userEmail).then(user => user.save()));
	}
};

router.post('/createChannels', (req, res) => {
	const { channels, siteId } = req.body;
	const failed = [];
	if (!channels || !siteId) {
		return sendErrorResponse(
			{
				message: 'Missing params. Channels and SiteId are required params.'
			},
			res
		);
	}

	return verifyOwner(siteId, req.user.email)
		.then(() =>
			promiseForeach(
				channels,
				channel => hlprs.channelCreation(channel, req.user.email),
				(data, err) => {
					console.log(err);
					failed.push(data);
					return true;
				}
			)
		)
		.then(() =>
			sendSuccessResponse({
				message: 'Pagegroups successfully created',
				failed: failed.length ? failed : null
			})
		)
		.catch(err => errorHandler(err, res));
});

module.exports = router;
