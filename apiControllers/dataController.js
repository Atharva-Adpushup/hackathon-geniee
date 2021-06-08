const express = require('express');
const atob = require('atob');
const _ = require('lodash');

const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const channelModel = require('../models/channelModel');
const utils = require('../helpers/utils');
const CC = require('../configs/commonConsts');
const httpStatus = require('../configs/httpStatusConsts');
const pagegroupCreationAutomation = require('../services/pagegroupCreationAutomation');
const AdpushupError = require('../helpers/AdPushupError');
const {
	checkParams,
	errorHandler,
	verifyOwner,
	sendDataToAuditLogService
} = require('../helpers/routeHelpers');
const { sendSuccessResponse, getNetworkConfig } = require('../helpers/commonFunctions');
const logger = require('../helpers/globalBucketLogger');
const helperUtils = require('../helpers/utils');
const config = require('../configs/config');

const {
	AUDIT_LOGS_ACTIONS: { LAYOUT_EDITOR }
} = CC;

const router = express.Router();
const { generateEmailTemplate, sendEmail } = require('../helpers/queueMailer');

function pushToCdnOriginQueue(filePath, content) {
	return helperUtils.publishToRabbitMqQueue(
		config.RABBITMQ.CDN_ORIGIN.NAME_IN_QUEUE_PUBLISHER_SERVICE,
		{
			filePath,
			content
		}
	);
}

router
	.post('/saveSite', (req, res) => {
		// {siteId, site, onboardingStage, step}
		const data = req.body;

		const siteId = parseInt(req.body.siteId, 10);
		let siteObj;

		userModel
			.verifySiteOwner(req.user.email, siteId)
			.catch(() => {
				throw AdpushupError({ message: 'Site not found!', status: httpStatus.NOT_FOUND });
			})
			.then(() => {
				if (data.step !== 1) {
					return siteModel.getSiteById(siteId).then(site => {
						site.set('step', parseInt(data.step, 10));
						site.set('onboardingStage', data.onboardingStage);
						return site.save();
					});
				}
				const siteData = {
					siteDomain: data.site,
					siteId,
					ownerEmail: req.user.email,
					onboardingStage: data.onboardingStage,
					step: parseInt(data.step, 10),
					ads: [],
					channels: [],
					templates: [],
					apConfigs: {
						mode: CC.site.mode.DRAFT,
						isAdPushupControlWithPartnerSSP: CC.apConfigDefaults.isAdPushupControlWithPartnerSSP,
						autoOptimise: false
					}
				};

				return siteModel.saveSiteData(siteId, 'POST', siteData);
			})
			.then(site => {
				siteObj = site;
				return userModel.setSitePageGroups(req.user.email);
			})
			.then(() =>
				pagegroupCreationAutomation({
					siteId: siteObj.data.siteId,
					url: siteObj.data.siteDomain,
					userEmail: req.user.email
				})
			)
			.then(() => siteModel.getSiteById(siteId))
			.then(site => res.status(httpStatus.OK).json(site.data))
			.catch(err => {
				if (err instanceof AdpushupError)
					return res.status(err.message.status).json({ error: err.message.message });
				return res
					.status(httpStatus.INTERNAL_SERVER_ERROR)
					.json({ error: 'Something went wrong!' });
			});
	})
	.post('/sendCode', (req, res) => {
		// developerEmail, subject, emailBody
		const json = {
			email: req.body.developerEmail,
			subject: req.body.subject,
			body: utils.atob(req.body.emailBody)
		};

		return userModel
			.sendCodeToDev(json)
			.then(() => res.status(httpStatus.OK).send({ success: 'Email sent successfully' }))
			.catch(e => {
				if (Array.isArray(e.message))
					return res.status(httpStatus.BAD_REQUEST).send({ error: e.message[0].message });
				return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: e.message });
			});
	})
	.post('/createBackupAd', (req, res) => {
		const { siteId, content, format } = req.body;
		const randomId = utils.randomString();

		return checkParams(['siteId', 'content'], req, 'post')
			.then(() => verifyOwner(siteId, req.user.email))
			.then(() => pushToCdnOriginQueue(`${siteId}/ads/${randomId}.${format}`, content))
			.then(() => {
				sendSuccessResponse(
					{
						message: 'Operation Successful',
						url: `https://cdn.adpushup.com/${siteId}/ads/${randomId}.${format}`
					},
					res
				);
			})
			.catch(err => errorHandler(err, res, httpStatus.INTERNAL_SERVER_ERROR));
	})
	.get('/getData', (req, res) => {
		const {
			query: { siteId }
		} = req;
		const computedJSON = {};

		function sendComputedData(site, channels) {
			computedJSON.siteId = siteId;
			computedJSON.channels = channels;
			computedJSON.site = site.toClientJSON();
			computedJSON.reporting = {};
			return getNetworkConfig().then(networkConfig => {
				computedJSON.networkConfig = networkConfig;
				return res.json(computedJSON);
			});
		}

		function sendEmptyData() {
			computedJSON.channels = [];
			computedJSON.site = {};
			computedJSON.reporting = {};
			return res.json(computedJSON);
		}

		return siteModel
			.getSiteById(siteId)
			.then(site => site.getAllChannels().then(sendComputedData.bind(null, site)), sendEmptyData)
			.catch(() => res.json(computedJSON));
	})
	.post('/saveData', (req, res) => {
		const parsedData =
			typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
		const siteData = {
			apConfigs: { mode: parsedData.siteMode },
			siteId: parseInt(parsedData.siteId, 10),
			siteDomain: parsedData.siteDomain,
			customSizes: parsedData.customSizes || [],
			channels: _.map(parsedData.channels, channel => `${channel.platform}:${channel.pageGroup}`)
		};

		/**
		 * OBJECTIVE: To check whether there is any channel already deleted in database
		 * IMPLEMENTATION: Compute deleted channels, if any exist, throw an error
		 * @param {siteId} siteId site document id
		 * @param {channelNames} channel names array
		 * @returns {boolean} When there is no deleted array
		 */
		function checkChannelsExistence(siteId, channelNames) {
			const deletedChannelsArr = _.map(channelNames, channelNameVal => {
				const channelKey = `chnl::${siteId}:${channelNameVal}`;

				return channelModel
					.isChannelExist(channelKey)
					.then(isExist => (!isExist ? channelNameVal : false));
			});

			return Promise.all(deletedChannelsArr).then(channelsArr => {
				const compactedArr = _.compact(channelsArr);

				if (compactedArr && compactedArr.length) {
					throw new AdpushupError('One or more channels are deleted. Site will not be saved!');
				}

				return Promise.resolve(true);
			});
		}

		return checkChannelsExistence(siteData.siteId, siteData.channels)
			.then(() => siteModel.getSiteById(siteData.siteId))
			.then(prevSiteData => {
				const newObj = {};
				Object.keys(siteData).map(key => {
					newObj[key] = prevSiteData.data[key];
				});
				const { email, originalEmail } = req.user;
				// log config changes
				sendDataToAuditLogService({
					siteId: siteData.siteId,
					siteDomain: siteData.siteDomain,
					appName: 'Console Layout Editor',
					type: 'site',
					impersonateId: email,
					userId: originalEmail,
					prevConfig: newObj,
					currentConfig: siteData,
					action: {
						name: LAYOUT_EDITOR,
						data: `Layout Editor`
					}
				});
			})
			.then(siteModel.saveSiteData.bind(null, siteData.siteId, 'POST', siteData))
			.then(() => siteModel.getSiteChannels(siteData.siteId))
			.then(prevSiteChannelsData => {
				const queue = [];
				prevSiteChannelsData.map(channel => {
					const [platform, pageGroup] = channel.split(':');
					queue.push(channelModel.getChannel(siteData.siteId, platform, pageGroup));
				});
				return Promise.all(queue).then(allChannels => {
					const channels = allChannels.map(channel => channel.data);
					const { email, originalEmail } = req.user;
					// log config changes
					sendDataToAuditLogService({
						siteId: siteData.siteId,
						siteDomain: siteData.siteDomain,
						appName: 'Console Layout Editor',
						type: 'site',
						impersonateId: email,
						userId: originalEmail,
						prevConfig: channels,
						currentConfig: parsedData.channels,
						action: {
							name: LAYOUT_EDITOR,
							data: `Layout Editor`
						}
					});
				});
			})
			.then(
				channelModel.saveChannels.bind(null, parseInt(parsedData.siteId, 10), parsedData.channels)
			)
			.then(() =>
				res.json({
					success: 1,
					siteId: parsedData.siteId,
					siteDomain: parsedData.siteDomain
				})
			)
			.catch(err =>
				res.json({
					success: 0,
					message: err.toString()
				})
			);
	})
	.post('/createLog', (req, res) =>
		checkParams(['err', 'isNotifySupportMail', 'info'], req, 'post')
			.then(async () => {
				let { originalEmail } = req.user;
				const {
					err,
					info,
					firstName,
					lastName,
					email,
					isSuperUser,
					routePath,
					type,
					userInput = '',
					errorMessage
				} = req.body;
				if (!originalEmail && isSuperUser) originalEmail = email;
				const errorInfo = _.escape(info.componentStack).replace(/\n/g, '<br>');
				const dateOfError = new Date().toDateString();
				const mailAlertTemplateData = {
					errorInfo,
					firstName,
					lastName,
					email,
					isSuperUser,
					dateOfError,
					routePath,
					userInput,
					errorMessage,
					originalEmail
				};
				const emailTemplate = await generateEmailTemplate(
					'views/mail',
					'consoleCrashAlerts',
					mailAlertTemplateData
				);
				const subjectMessage = `Console Error Report`;
				if (config.environment.HOST_ENV === 'production') {
					//send alerts only on production
					if (type === 'UserInteraction') {
						//here we will send mail to the support
						sendEmail({
							queue: 'MAILER',
							data: {
								to: config.consoleErrorAlerts.supportMail,
								body: emailTemplate,
								subject: subjectMessage
							}
						});
					} else if (type === 'default') {
						const errorLogToBeTracked = `Error: ${
							err ? JSON.stringify(err, null, '\n') : 'N/A'
						} ,  \n Info:  ${info ? JSON.stringify(info, null, '\n') : 'N/A'}`;
						//By deafult we are alreday sending mail to the hackers
						sendEmail({
							queue: 'MAILER',
							data: {
								to: config.consoleErrorAlerts.hackersMail,
								body: emailTemplate,
								subject: subjectMessage
							}
						});
						return logger({
							source: 'CONSOLE ERROR LOGS',
							message: 'UNCAUGHT ERROR BOUNDARY',
							debugData: errorLogToBeTracked
						});
					}
				}
			})
			.then(() =>
				sendSuccessResponse(
					{
						message: 'Log Written'
					},
					res
				)
			)
			.catch(err =>
				sendSuccessResponse(
					{
						message: `Log Written Failed`
					},
					res
				)
			)
	);

module.exports = router;
