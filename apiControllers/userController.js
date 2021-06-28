const express = require('express');
const crypto = require('crypto');
const Promise = require('bluebird');
const uuid = require('node-uuid');
const request = require('request-promise');
const _ = require('lodash');

const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const utils = require('../helpers/utils');
const CC = require('../configs/commonConsts');
const httpStatus = require('../configs/httpStatusConsts');
const formValidator = require('../helpers/FormValidator');
const schema = require('../helpers/schema');
const oauthHelper = require('../helpers/googleOauth');
const config = require('../configs/config');
// eslint-disable-next-line no-unused-vars
const AdpushupError = require('../helpers/AdPushupError');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const authToken = require('../helpers/authToken');
const {
	errorHandler,
	appBucket,
	checkParams,
	sendDataToAuditLogService
} = require('../helpers/routeHelpers');

const {
	AUDIT_LOGS_ACTIONS: { OPS_PANEL, MY_SITES }
} = CC;

const router = express.Router();

let googleOAuthUniqueString = '';

router
	.get('/', (req, res) => {
		res.status(200).json({ email: 'sdjklf@kewrle.com' });
	})
	.post('/addSite', (req, res) => {
		const site = req.body.site ? utils.getSafeUrl(req.body.site) : req.body.site;
		let prevConfig;
		const { dataForAuditLogs } = req.body;
		const { email, originalEmail } = req.user;

		return formValidator
			.validate({ site }, schema.user.validations)
			.then(() => userModel.getUserByEmail(req.user.email).then(user => user))
			.then(user => {
				prevConfig = _.cloneDeep(user.get('sites'));
			})
			.then(() => userModel.addSite(req.user.email, site))
			.spread((user, siteId) => {
				const userSites = user.get('sites');
				// eslint-disable-next-line no-restricted-syntax
				for (const i in userSites) {
					if (userSites[i].siteId === siteId) {
						userSites[i].onboardingStage = 'onboarding';
						userSites[i].step = CC.onboarding.initialStep; // initial site step i.e. 1 now
						user.set('sites', userSites);
						user.save();

						// eslint-disable-next-line no-shadow
						const { siteId, domain, onboardingStage, step } = userSites[i];

						const currentConfig = _.cloneDeep(user.get('sites'));
						// log config changes
						const { siteDomain, appName, type = 'app' } = dataForAuditLogs;
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
								name: MY_SITES.ADD_SITE,
								data: `Add New Site`
							}
						});
						return res.status(httpStatus.OK).json({ siteId, site: domain, onboardingStage, step });
					}
				}
				return res
					.status(httpStatus.INTERNAL_SERVER_ERROR)
					.json({ error: 'Error while Adding site' });
			})
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log('Error while Adding site', err);
				if (err.message.status === 409) {
					return res.status(409).json({ error: err.message.message });
				}
				// eslint-disable-next-line no-undef
				if (err instanceof AdPushupError && Array.isArray(err.message)) {
					return res.status(httpStatus.BAD_REQUEST).json({ error: err.message[0].message });
				}
				return res
					.status(httpStatus.INTERNAL_SERVER_ERROR)
					.json({ error: 'Error while Adding site' });
			});
	})
	.get('/payment', (req, res) => {
		const getTipaltiUrls = email => {
			const tipaltiConfig = config.tipalti;

			let tipaltiUrl = '';

			const tipaltiBaseUrl = tipaltiConfig.baseUrl;

			const payeeId = encodeURIComponent(
				crypto
					.createHash('md5')
					.update(email)
					.digest('hex')
					.substr(0, 64)
			);

			const payer = tipaltiConfig.payerName;

			const date = Math.floor(+new Date() / 1000);

			const paramsStr = `idap=${payeeId}&payer=${payer}&ts=${date}&email=${encodeURIComponent(
				email
			)}`;

			const { key } = tipaltiConfig;

			const hash = crypto
				.createHmac('sha256', key)
				.update(paramsStr.toString('utf-8'))
				.digest('hex');

			const paymentHistoryUrl = `${tipaltiConfig.paymentHistoryUrl + paramsStr}&hashkey=${hash}`;

			tipaltiUrl = `${tipaltiBaseUrl + paramsStr}&hashkey=${hash}`;

			return { paymentHistoryUrl, tipaltiUrl };
		};

		const { email } = req.user;
		return Promise.all([getTipaltiUrls(email), userModel.updateUserPaymentStatus(email)])
			.spread(tipaltiUrls => {
				// eslint-disable-next-line no-console
				console.log(tipaltiUrls);
				res.send({
					tipaltiUrls
				});
			})
			.catch(() => res.status(500).send({ error: 'Some error occurred' }));
	})
	.post('/setSiteStep', (req, res) => {
		const { siteId, onboardingStage, step, dataForAuditLogs } = req.body;
		const { email, originalEmail } = req.user;
		let prevConfig;
		userModel
			.getUserByEmail(req.user.email)
			.then(user => {
				prevConfig = _.cloneDeep(user.get('sites'));
			})
			.then(() => siteModel.setSiteStep(siteId, onboardingStage, step))
			.then(() => userModel.setSitePageGroups(req.user.email))
			.then(user => {
				user.save();
				const currentConfig = _.cloneDeep(user.get('sites'));
				// log config changes
				const { siteDomain, appName, type = 'app' } = dataForAuditLogs;
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
						name: MY_SITES.UPDATE_SITE_STEP,
						data: `Update Site Step`
					}
				});
				return res.status(httpStatus.OK).send({ success: 'Update site step successfully!' });
			})
			.catch(() =>
				res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Something went wrong!' })
			);
	})
	.get('/requestGoogleOAuth', (req, res) => {
		const uniqueString = uuid.v1();

		// TODO: 'googleOAuthUniqueString' temporary global variable is added to keep unique id during Google Oauth authentication process.
		// This temp global gets reset at every new and completion of Oauth authentication process.
		// Find and implement a better unique id storage mechanism.
		googleOAuthUniqueString = uniqueString;
		return res.redirect(oauthHelper.getRedirectUrl(uniqueString));
	})
	.get('/oauth2callback', (req, res) => {
		const { state: queryState, error: queryError } = req.query;
		const isNotMatchingUniqueString = !!(googleOAuthUniqueString !== queryState);
		const isErrorAccessDenied = !!(queryError === 'access_denied');
		const { INTEGRATION_BASE_URL } = CC;

		if (isNotMatchingUniqueString) {
			return res.status(500).send('Fake Request');
		}

		if (isErrorAccessDenied) {
			return res
				.status(500)
				.send(
					'Seems you denied request, if done accidently please press back button to retry again.'
				);
		}

		const getTokens = oauthHelper
			.getAccessTokens(req.query.code)
			// eslint-disable-next-line camelcase
			.then(({ tokens: { access_token, refresh_token, id_token, expiry_date } }) => ({
				access_token,
				refresh_token,
				id_token,
				expiry_date
			}));
		const getAdsenseAccounts = getTokens.then(token =>
			request({
				strictSSL: false,
				uri: `https://www.googleapis.com/adsense/v1.4/accounts?access_token=${token.access_token}`,
				json: true
			})
				.then(adsenseInfo => adsenseInfo.items)
				.catch(err => {
					if (
						err.error &&
						err.error.error &&
						err.error.error.message.indexOf('User does not have an AdSense account') === 0
					) {
						throw new Error('No adsense account');
					}
					throw err;
				})
		);
		const getUserDFPInfo = getTokens.then(token => {
			// eslint-disable-next-line camelcase
			const { refresh_token } = token;
			const { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } = config.googleOauth;

			return request({
				method: 'POST',
				uri: CC.DFP_WEB_SERVICE_ENDPOINT,
				body: {
					clientCode: OAUTH_CLIENT_ID,
					clientSecret: OAUTH_CLIENT_SECRET,
					refreshToken: refresh_token
				},
				json: true
			}).then(response => {
				if (response.code === 0) {
					return response.data;
				}

				return [];
			});
		});
		const getUserInfo = getTokens.then(token =>
			request({
				strictSSL: false,
				uri: `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token.access_token}`,
				json: true
			})
		);
		const getUser = userModel.getUserByEmail(req.user.email);

		return Promise.join(
			getUser,
			getTokens,
			getAdsenseAccounts,
			getUserInfo,
			getUserDFPInfo,
			(user, tokens, adsenseAccounts, userInfo, userDFPInfo) => {
				// eslint-disable-next-line camelcase
				const { access_token, refresh_token, expiry_date } = tokens;
				const adServerSettings = user.get('adServerSettings') || {};
				const activeAdServerData = adServerSettings.dfp;

				function setActiveCurrencyDetails() {
					if (!activeAdServerData) {
						user.set('adServerSettings', {
							...adServerSettings,
							dfp: {
								currencyConversion:
									userDFPInfo[0].currencyCode !== CC.hbGlobalSettingDefaults.adpushupDfpCurrency,
								activeDFPCurrencyCode: userDFPInfo[0].currencyCode
							}
						});

						return user.save();
					}
					return false;
				}
				return Promise.all([
					user.addNetworkData({
						networkName: 'ADSENSE',
						refreshToken: refresh_token,
						accessToken: access_token,
						expiresIn: expiry_date,
						pubId: adsenseAccounts[0].id,
						adsenseEmail: userInfo.email,
						userInfo,
						adsenseAccounts
					}),
					user.addNetworkData({
						networkName: 'DFP',
						refreshToken: refresh_token,
						accessToken: access_token,
						expiresIn: expiry_date,
						userInfo,
						dfpAccounts: userDFPInfo
					}),
					setActiveCurrencyDetails()
				]).then(() => {
					const postMessageData = JSON.stringify(user.get('adNetworkSettings'));
					// TODO: Below mentioned https staging url (https://app.staging.adpushup.com) is for testing purposes.
					// This should be replaced with https console product url once this product gets live.
					const postMessageScriptTemplate = `<script type="text/javascript">
					window.opener.postMessage({
						"cmd":"SAVE_GOOGLE_OAUTH_INFO",
						"data": ${postMessageData}
					}, '${INTEGRATION_BASE_URL}');
					window.close();
					</script>`;

					return res.status(httpStatus.OK).send(postMessageScriptTemplate);
				});
			}
		)
			.catch(err => {
				const isNoAdsenseAccountMessage = !!(err.message === 'No adsense account');
				const computedErrorMessage = isNoAdsenseAccountMessage
					? `Sorry but it seems you have no AdSense account linked to your Google account. If this is a recently verified/created account, it might take upto 24 hours to come in effect. Please try again after sometime or contact support.`
					: `Some error occurred while connecting with your Google account. Please try again after some time or contact your account manager.`;

				return res.status(500).send(computedErrorMessage);
			})
			.finally(() => {
				googleOAuthUniqueString = '';
				return true;
			});
	})
	.get('/findUsers', (req, res) => {
		const { isSuperUser } = req.user;
		if (!isSuperUser)
			return sendErrorResponse(
				{
					message: 'Unauthorized Request'
				},
				res,
				httpStatus.UNAUTHORIZED
			);
		return appBucket
			.queryDB(
				`SELECT email, ARRAY site.domain
	              FOR site IN sites WHEN site.domain IS NOT MISSING END AS domains ,
				ARRAY site.siteId
				FOR site IN sites WHEN site.siteId IS NOT MISSING END AS siteIds
				
				FROM AppBucket WHERE meta().id LIKE "user::%"`
			)
			.then(users => {
				let response = [];
				if (users && Array.isArray(users) && users.length) {
					response = users.filter(user => CC.EMAIL_REGEX.test(user.email));
				}
				return sendSuccessResponse(
					{
						users: response
					},
					res
				);
			})
			.catch(err => errorHandler(err, res));
	})
	.post('/switchUser', (req, res) => {
		let { email } = req.body;
		email = utils.htmlEntities(utils.sanitiseString(email));

		if (!req.user.isSuperUser || !email) {
			return sendErrorResponse(
				{
					message: 'Permission Denined'
				},
				res,
				httpStatus.PERMISSION_DENIED
			);
		}
		return userModel
			.setSitePageGroups(email)
			.then(user => {
				const token = authToken.getAuthToken({
					email: user.get('email'),
					isSuperUser: true,
					originalEmail: req.user.originalEmail || req.user.email
				});

				return res
					.status(httpStatus.OK)
					.cookie(
						'user',
						JSON.stringify({
							authToken: token,
							isSuperUser: true
						}),
						{ maxAge: 86400000, path: '/' }
					)
					.send({
						success: 'Changed User',
						authToken: token
					});
			})
			.catch(err => errorHandler(err, res));
	})
	.post('/impersonateCurrentUser', (req, res) => {
		const { isSuperUser, email } = req.user;
		if (!isSuperUser || !email) {
			return sendErrorResponse(
				{
					message: 'Permission Denined'
				},
				res,
				httpStatus.PERMISSION_DENIED
			);
		}

		return userModel
			.setSitePageGroups(email)
			.then(user => {
				const token = authToken.getAuthToken({
					email: user.get('email'),
					isSuperUser: false
				});

				return res
					.status(httpStatus.OK)
					.cookie(
						'user',
						JSON.stringify({
							authToken: token,
							isSuperUser: false
						}),
						{ maxAge: 86400000, path: '/' }
					)
					.send({
						success: 'User Impersonated Successfully',
						authToken: token
					});
			})
			.catch(err => errorHandler(err, res));
	})
	.post('/updateUser', (req, res) => {
		const { email, originalEmail } = req.user;
		const { toUpdate, dataForAuditLogs } = req.body;
		const toSend = [];
		return checkParams(['toUpdate'], req, 'post')
			.then(() => userModel.getUserByEmail(req.user.email))
			.then(user => {
				const prevConfig = {};
				const currentConfig = {};
				toUpdate.forEach(content => {
					const { key, value, replace = false } = content;
					let data = user.get(key);
					// _.cloneDeep
					prevConfig[key] = user.data[key];

					if (typeof data === 'object' && !Array.isArray(data) && !replace) {
						data = {
							...data,
							...value
						};
					} else {
						data = value;
					}

					currentConfig[key] = value;
					user.set(key, data);
					toSend.push({ key, value: data });
				});
				// log config changes
				const { appName, type = 'account' } = dataForAuditLogs;
				sendDataToAuditLogService({
					siteId: '',
					siteDomain: '',
					appName,
					type,
					impersonateId: email,
					userId: originalEmail,
					prevConfig,
					currentConfig,
					action: {
						name: OPS_PANEL.ACCOUNTS_SETTING,
						data: `Accounts Setting`
					}
				});

				return user.save();
			})
			.then(() =>
				sendSuccessResponse(
					{
						message: 'User Updated',
						toUpdate: toSend
					},
					res
				)
			)
			.catch(err => errorHandler(err, res, httpStatus.INTERNAL_SERVER_ERROR));
	});

module.exports = router;
