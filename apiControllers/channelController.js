const { promiseForeach } = require('node-utils');
const express = require('express');

const utils = require('../helpers/utils');
const config = require('../configs/config');
const HTTP_STATUS = require('../configs/httpStatusConsts');
const userModel = require('../models/userModel');
const channelModel = require('../models/channelModel');
const AdPushupError = require('../helpers/AdPushupError');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const { errorHandler, verifyOwner, appBucket } = require('../helpers/routeHelpers');

const router = express.Router();

const hlprs = {
	channelCreation: (channel, userEmail, successful) => {
		const encodedChannel = utils.getHtmlEncodedJSON(channel);
		encodedChannel.siteId = channel.siteId;

		return channelModel
			.createPageGroup(encodedChannel)
			.then(() => userModel.setSitePageGroups(userEmail))
			.then(user => user.save())
			.then(() => {
				if (successful.cmsInfo.created.indexOf(channel.pageGroupName) === -1) {
					successful.cmsInfo.created.push(channel.pageGroupName);
					successful.cmsInfo.pagegroups.push({
						sampleUrl: channel.sampleUrl,
						pageGroup: channel.pageGroupName
					});
				}
				successful.channels.push(`${channel.device}:${channel.pageGroupName}`);
				return true;
			});
	}
};

router
	.get('/fetchChannelsInfo', (req, res) => {
		const { siteId } = req.query;
		if (!siteId) {
			return sendErrorResponse(
				{
					message: 'Missing params. SiteId is a required param.'
				},
				res
			);
		}
		return verifyOwner(siteId, req.user.email)
			.then(() =>
				appBucket.queryDB(
					`select  meta().id, object_length(variations) as variationsCount, platform, pageGroup from ${
						config.couchBase.DEFAULT_BUCKET
					} where meta().id like 'chnl::%' and siteId = ${siteId};`
				)
			)
			.then(channels => {
				const response = {};
				channels.forEach(channel => {
					response[`${channel.platform}:${channel.pageGroup}`] = channel;
				});
				return sendSuccessResponse(
					{
						channels: response
					},
					res
				);
			})
			.catch(err => errorHandler(err, res, HTTP_STATUS.INTERNAL_SERVER_ERROR));
	})
	.post('/createChannels', (req, res) => {
		const { channels, siteId } = req.body;
		const failed = {
			channels: [],
			details: {}
		};
		const successful = {
			channels: [],
			cmsInfo: {
				pagegroups: [],
				created: []
			}
		};
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
					channels.device,
					device =>
						hlprs.channelCreation(
							{ ...channels.common, device: device.toUpperCase() },
							req.user.email,
							successful
						),
					(device, err) => {
						console.log(err);
						let additionalData = {};
						if (err instanceof AdPushupError) {
							additionalData = err.message;
						}
						const current = `${device.toUpperCase()}:${channels.common.pageGroupName}`;
						failed.channels.push(current);
						failed.details[current] = { ...channels.common, device, additionalData };
						return true;
					}
				)
			)
			.then(() =>
				sendSuccessResponse(
					{
						message: 'Pagegroups successfully created',
						failed,
						successful
					},
					res
				)
			)
			.catch(err => errorHandler(err, res, HTTP_STATUS.BAD_REQUEST, { failed, successful }));
	});

module.exports = router;
