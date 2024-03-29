const Promise = require('bluebird');
const { promiseForeach } = require('node-utils');
const express = require('express');

const utils = require('../helpers/utils');
const config = require('../configs/config');
const HTTP_STATUS = require('../configs/httpStatusConsts');
const userModel = require('../models/userModel');
const channelModel = require('../models/channelModel');
const siteModel = require('../models/siteModel');
const AdPushupError = require('../helpers/AdPushupError');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const {
	errorHandler,
	verifyOwner,
	appBucket,
	checkParams,
	sendDataToAuditLogService
} = require('../helpers/routeHelpers');

const {
	AUDIT_LOGS_ACTIONS: { CHANNELS }
} = require('../configs/commonConsts');

const router = express.Router();

const hlprs = {
	channelCreation: (channel, userEmail, successful) => {
		const encodedChannel = utils.getHtmlEncodedJSON(channel);
		encodedChannel.siteId = channel.siteId;

		return Promise.join(channelModel.createPageGroup(encodedChannel), response => {
			const { id: channelId } = response;
			return userModel
				.setSitePageGroups(userEmail)
				.then(user => user.save())
				.then(() => {
					if (successful.cmsInfo.created.indexOf(channel.pageGroupName) === -1) {
						successful.cmsInfo.created.push(channel.pageGroupName);
						successful.cmsInfo.pagegroups.push({
							sampleUrl: channel.sampleUrl,
							pageGroup: channel.pageGroupName
						});
					}
					successful.cmsInfo.channelsInfo[`${channel.device}:${channel.pageGroupName}`] = {
						id: `chnl::${channel.siteId}:${channel.device}:${channel.pageGroupName}`,
						channelId,
						variationsCount: 0,
						platform: channel.device,
						pageGroup: channel.pageGroupName
					};
					successful.channels.push(`${channel.device}:${channel.pageGroupName}`);
					return true;
				});
		});
	},
	updateChannel: (channel, toUpdate) => {
		toUpdate.forEach(content => {
			const { key, value } = content;
			let data = channel.get(key);
			if (typeof data === 'object' && !Array.isArray(data)) {
				data = {
					...data,
					...value
				};
			} else {
				data = value;
			}
			channel.set(key, data);
		});
		return channel.save();
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
					`select meta().id, id as channelId, object_length(variations) as variationsCount, platform, pageGroup, variations, autoOptimise
					from ${config.couchBase.DEFAULT_BUCKET} where meta().id like 'chnl::%' and siteId = ${siteId};`
				)
			)
			.then(channels => {
				const response = {};
				channels.forEach(channel => {
					const { variations = {} } = channel;
					const variationsData = {};
					const keys = Object.keys(variations);

					keys.forEach(variationId => {
						const current = variations[variationId];
						variationsData[variationId] = {
							variationId,
							name: current.name,
							trafficDistribution: current.trafficDistribution
						};
					});
					response[`${channel.platform}:${channel.pageGroup}`] = {
						...channel,
						variations: variationsData
					};
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
		const { channels, siteId, dataForAuditLogs } = req.body;
		const failed = {
			channels: [],
			details: {}
		};
		const successful = {
			channels: [],
			cmsInfo: {
				pagegroups: [],
				created: [],
				channelsInfo: {}
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
						let additionalData = {};
						if (err instanceof AdPushupError) {
							additionalData = err.message;
						}
						const current = `${device.toUpperCase()}:${channels.common.pageGroupName}`;
						failed.channels.push(current);
						failed.details[current] = { ...channels.common, device, additionalData };
						const { email, originalEmail } = req.user;
						// log config changes
						const { siteDomain, appName, type = 'site' } = dataForAuditLogs;
						sendDataToAuditLogService({
							siteId,
							siteDomain,
							appName,
							type,
							impersonateId: email,
							userId: originalEmail,
							prevConfig: {},
							currentConfig: {
								successful,
								failed
							},
							action: {
								name: CHANNELS.CREATE_CHANNEL,
								data: 'Create Channel'
							}
						});
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
	})
	.post('/deleteChannel', (req, res) => {
		const { channelId, siteId, dataForAuditLogs, platform, pageGroup } = req.body;
		if (!channelId || !siteId) {
			return sendErrorResponse(
				{
					message: 'Missing params. ChannelId and SiteId are required params.',
					code: HTTP_STATUS.BAD
				},
				res
			);
		}

		let prevConfig = {};
		return verifyOwner(siteId, req.user.email)
			.then(() =>
				channelModel.getChannel(siteId, platform, pageGroup).then(channel => {
					prevConfig = { ...channel.data };
					return channel;
				})
			)
			.then(() => channelModel.deletePagegroupById(channelId))
			.then(site => {
				const { email, originalEmail } = req.user;
				// log config changes
				const { siteDomain, appName, type = 'site' } = dataForAuditLogs;
				sendDataToAuditLogService({
					siteId,
					siteDomain,
					appName,
					type,
					impersonateId: email,
					userId: originalEmail,
					prevConfig,
					currentConfig: {},
					action: {
						name: CHANNELS.DELETE_CHANNEL,
						data: `Delete Channels - ${channelId}`
					}
				});
				sendSuccessResponse(
					{
						message: 'Pagegroup successfully deleted',
						channels: site.get('channels'),
						cmsInfo: site.get('cmsInfo')
					},
					res
				);
			})
			.catch(err => errorHandler(err, res, HTTP_STATUS.INTERNAL_SERVER_ERROR));
	})
	.post('/updateChannel', (req, res) => {
		const { siteId, pageGroup, platform, toUpdate, dataForAuditLogs } = req.body;
		let prevConfig = {};
		return checkParams(['siteId', 'pageGroup', 'platform', 'toUpdate'], req, 'post')
			.then(() => verifyOwner(siteId, req.user.email))
			.then(() =>
				channelModel.getChannel(siteId, platform, pageGroup).then(channel => {
					prevConfig = { ...channel.data };
					return channel;
				})
			)
			.then(channel => hlprs.updateChannel(channel, toUpdate))
			.then(() =>
				channelModel.getChannel(siteId, platform, pageGroup).then(channel => {
					const currentConfig = channel.data;
					const { email, originalEmail } = req.user;
					// log config changes
					const { siteDomain, appName, type = 'site' } = dataForAuditLogs;
					sendDataToAuditLogService({
						siteId,
						siteDomain,
						appName,
						type,
						impersonateId: email,
						userId: originalEmail,
						prevConfig,
						currentConfig,
						action: {
							name: CHANNELS.UPDATE_CHANNEL,
							data: `Update Channels`
						}
					});
				})
			)
			.then(() =>
				sendSuccessResponse(
					{
						message: 'Channel Updated'
					},
					res
				)
			)
			.catch(err => errorHandler(err, res, HTTP_STATUS.INTERNAL_SERVER_ERROR));
	})
	.post('/updateChannels', (req, res) => {
		const { siteId, toUpdate } = req.body;

		function channelProcessing(channelKey) {
			const [platform, pageGroup] = channelKey.split(':');
			return channelModel
				.getChannel(siteId, platform, pageGroup)
				.then(channel => hlprs.updateChannel(channel, toUpdate));
		}

		return checkParams(['siteId', 'toUpdate'], req, 'post')
			.then(() => verifyOwner(siteId, req.user.email))
			.then(() => siteModel.getSiteChannels(siteId))
			.then(channels =>
				promiseForeach(channels, channelProcessing, (data, err) => {
					console.log(`${err.message} | Data: ${data}`);
					return false;
				})
			)
			.then(() =>
				sendSuccessResponse(
					{
						message: 'Channels Updated'
					},
					res
				)
			)
			.catch(err => errorHandler(err, res, HTTP_STATUS.INTERNAL_SERVER_ERROR));
	});

module.exports = router;
