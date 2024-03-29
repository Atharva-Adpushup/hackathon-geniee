const axios = require('axios');
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
	sendDataToAuditLogService,
	getAssociatedAccountsWithUser,
	getAllAccountsDetailWithTheirAccountManagerFromHubspot,
	checkAllowedEmailForSwitchAndImpersonate
} = require('../helpers/routeHelpers');

const { sendEmail } = require('../helpers/queueMailer');

const {
	DFP_WEB_SERVICE_ENDPOINT,
	EMAIL_REGEX,
	INTEGRATION_BASE_URL,
	GOOGLE_OAUTH_POST_MESSAGE_SCRIPT_TEMPLATE,
	hbGlobalSettingDefaults: { adpushupDfpCurrency },
	onboarding: { initialStep },
	AUDIT_LOGS_ACTIONS: { OPS_PANEL, MY_SITES },
	GOOGLE_SERVICES_API: { ADSENSE_ACCOUNT_URL, OAUTH2_USERINFO_URL },
	USER_PROPERTIES: { AD_NETWORK_SETTINGS, AD_SERVER_SETTINGS, EMAIL, SITES, NETWORK },
	ERROR_MESSAGES: { GOOGLE_ERRORS }
} = CC;

const {
	RABBITMQ: { PUBLISHER_API: QUEUE_PUBLISHER_ADPUSHUP }
} = config;

const router = express.Router();

let googleOAuthUniqueString = '';

/*
	in adsense V2 API the response for /accounts REST URL changed from the previous
	"items": [
		{
			"creation_time": "1292409972000",
			"id": "pub-6717584324019958",
			"kind": "adsense#account",
			"name": "Zee Entertainment Enterprises Limited",
			"premium": false,
			"timezone": "Asia/Calcutta"
		}
	],

	to

	{
		accounts: [
			{
				name: "accounts/pub-1325340429823502",
				displayName: "AdPushup, Inc",
				timeZone: {	id: "Asia/Calcutta"},
				createTime: "2015-07-07T11:05:01Z",
			}
		]
	}
*/

const mapAdsenseAccounts = adsenseInfo => {
	const { accounts = [] } = adsenseInfo;

	return accounts.map(account => ({
		creation_time: account.createTime,
		id: account.name.replace('accounts/', ''),
		kind: 'adsense#account',
		name: account.displayName,
		premium: false,
		timezone: account.timeZone.id
	}));
};

const getAdsenseAccounts = accessToken =>
	request({
		strictSSL: false,
		uri: `${ADSENSE_ACCOUNT_URL}?access_token=${accessToken}`,
		json: true
	})
		.then(mapAdsenseAccounts)
		.catch(err => {
			if (
				err.error &&
				err.error.error &&
				err.error.error.message.indexOf('User does not have an AdSense account') === 0
			) {
				return [];
			}
			throw err;
		});

const getUserInfo = accessToken =>
	request({
		strictSSL: false,
		uri: `${OAUTH2_USERINFO_URL}?access_token=${accessToken}`,
		json: true
	});

const getUserDFPInfo = refreshToken => {
	const { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } = config.googleOauth;

	return request({
		method: 'POST',
		uri: DFP_WEB_SERVICE_ENDPOINT,
		body: {
			clientCode: OAUTH_CLIENT_ID,
			clientSecret: OAUTH_CLIENT_SECRET,
			refreshToken
		},
		json: true
	}).then(response => {
		if (response.code === 0) {
			return response.data;
		}

		return [];
	});
};

const setActiveCurrencyDetails = (user, userDFPInfo) => {
	const adServerSettings = user.get(AD_SERVER_SETTINGS) || {};
	const activeAdServerData = adServerSettings.dfp;
	if (!activeAdServerData) {
		user.set(AD_SERVER_SETTINGS, {
			...adServerSettings,
			dfp: {
				currencyConversion: userDFPInfo[0].currencyCode !== adpushupDfpCurrency,
				activeDFPCurrencyCode: userDFPInfo[0].currencyCode
			}
		});

		return user.save();
	}
	return false;
};

const addAdSenseData = ({ user, userInfo, tokens, adsenseAccounts }) => {
	if (adsenseAccounts && adsenseAccounts.length) {
		const { accessToken, refreshToken, expiryDate } = tokens;
		const { ADSENSE } = NETWORK;
		return user.addNetworkData({
			networkName: ADSENSE,
			refreshToken,
			accessToken,
			expiresIn: expiryDate,
			pubId: adsenseAccounts[0].id,
			adsenseEmail: userInfo.email,
			userInfo,
			adsenseAccounts
		});
	}
	return Promise.resolve();
};

const addDFPData = ({ user, userInfo, tokens, userDFPInfo }) => {
	const { accessToken, refreshToken, expiryDate } = tokens;
	const { DFP } = NETWORK;
	return user.addNetworkData({
		networkName: DFP,
		refreshToken,
		accessToken,
		expiresIn: expiryDate,
		userInfo,
		dfpAccounts: userDFPInfo
	});
};

const configureAdNetworkAndServerData = (
	oauthSkipped,
	tokens,
	user,
	adsenseAccounts,
	userInfo,
	userDFPInfo
	// eslint-disable-next-line max-params
) =>
	Promise.all([
		addAdSenseData({ user, userInfo, tokens, adsenseAccounts }),
		addDFPData({ user, userInfo, tokens, userDFPInfo }),
		setActiveCurrencyDetails(user, userDFPInfo)
	]).then(() => {
		const postMessageData = JSON.stringify(user.get(AD_NETWORK_SETTINGS));
		if (oauthSkipped) return postMessageData;
		// TODO: Below mentioned https staging url (https://app.staging.adpushup.com) is for testing purposes.
		// This should be replaced with https console product url once this product gets live.
		const postMessageScript = GOOGLE_OAUTH_POST_MESSAGE_SCRIPT_TEMPLATE.replace(
			'__MESSAGE_DATA__',
			postMessageData
		).replace('__TARGET_ORIGIN__', INTEGRATION_BASE_URL);

		return postMessageScript;
	});

const manageUserAdsenseDFPData = (tokens, userEmail, oauthSkipped = false) => {
	const getUser = userModel.getUserByEmail(userEmail);
	return Promise.join(
		oauthSkipped,
		tokens,
		getUser,
		getAdsenseAccounts(tokens.accessToken),
		getUserInfo(tokens.accessToken),
		getUserDFPInfo(tokens.refreshToken),
		configureAdNetworkAndServerData
	);
};

function errorMessageForGoogleAccountConnection(isNoAdsenseAccountMessage) {
	const { NO_ADSENSE_ACCOUNT_ERROR, GOOGLE_ACCOUNT_CONNECTION_ERROR } = GOOGLE_ERRORS;
	return isNoAdsenseAccountMessage ? NO_ADSENSE_ACCOUNT_ERROR : GOOGLE_ACCOUNT_CONNECTION_ERROR;
}

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
				prevConfig = _.cloneDeep(user.get(SITES));
			})
			.then(() => userModel.addSite(req.user.email, site))
			.spread((user, siteId) => {
				const userSites = user.get(SITES);
				// eslint-disable-next-line no-restricted-syntax
				for (const i in userSites) {
					if (userSites[i].siteId === siteId) {
						userSites[i].onboardingStage = 'onboarding';
						userSites[i].step = initialStep; // initial site step i.e. 1 now
						user.set(SITES, userSites);
						user.save();

						// eslint-disable-next-line no-shadow
						const { siteId, domain, onboardingStage, step } = userSites[i];

						const currentConfig = _.cloneDeep(user.get(SITES));
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
				prevConfig = _.cloneDeep(user.get(SITES));
			})
			.then(() => siteModel.setSiteStep(siteId, onboardingStage, step))
			.then(() => userModel.setSitePageGroups(req.user.email))
			.then(user => {
				user.save();
				const currentConfig = _.cloneDeep(user.get(SITES));
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
	.get('/oauth2callback', async (req, res) => {
		try {
			const { state: queryState, error: queryError } = req.query;
			const isNotMatchingUniqueString = !!(googleOAuthUniqueString !== queryState);
			const isErrorAccessDenied = !!(queryError === 'access_denied');

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

			const {
				tokens: { access_token: accessToken, refresh_token: refreshToken, expiry_date: expiryDate }
			} = await oauthHelper.getAccessTokens(req.query.code);

			const postMessageScript = await manageUserAdsenseDFPData(
				{ accessToken, refreshToken, expiryDate },
				req.user.email
			);
			return res.status(httpStatus.OK).send(postMessageScript);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log(`In oauth2callback, Error: ${err}`);
			const isNoAdsenseAccountMessage = !!(err.message === 'No adsense account');
			const computedErrorMessage = errorMessageForGoogleAccountConnection(
				isNoAdsenseAccountMessage
			);
			return res.status(500).send(computedErrorMessage);
		} finally {
			googleOAuthUniqueString = '';
		}
	})
	.get('/skipOauth2WithRefreshToken', async (req, res) => {
		try {
			const {
				credentials: {
					access_token: accessToken,
					refresh_token: refreshToken,
					expiry_date: expiryDate
				}
			} = await oauthHelper.getAccessTokensFromRefreshToken(config.SUPPORT_ACCOUNT_REFRESH_TOKEN);

			const oauthSkipped = true;
			const networkData = await manageUserAdsenseDFPData(
				{ accessToken, refreshToken, expiryDate },
				req.user.email,
				oauthSkipped
			);
			return res.status(httpStatus.OK).send(networkData);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log(`In skipOauth2WithRefreshToken, Error: ${err}`);
			const isNoAdsenseAccountMessage = !!(err.message === 'No adsense account');
			const computedErrorMessage = errorMessageForGoogleAccountConnection(
				isNoAdsenseAccountMessage
			);
			sendEmail({
				queue: 'MAILER',
				data: {
					to: config.consoleErrorAlerts.hackersMail,
					body: `Connect via support account failed. Try updating the refreshToken in the config.`,
					subject: `Connect via Support Account failed`
				}
			});
			return res.status(500).send(computedErrorMessage);
		}
	})
	.get('/findUsers', async (req, res) => {
		try {
			const { isSuperUser, email, originalEmail } = req.user;
			const { forPaymentReconciliation } = req.query;
			if (!isSuperUser)
				return sendErrorResponse(
					{
						message: 'Unauthorized Request'
					},
					res,
					httpStatus.UNAUTHORIZED
				);

			const userEmail = originalEmail || email;
			// This is for AdOps/Account Managers to prevent unAuth access to other accounts
			const associatedAccounts = await getAssociatedAccountsWithUser(userEmail);
			if (associatedAccounts.length) {
				// send only allowed accounts
				return sendSuccessResponse(
					{
						users: associatedAccounts
					},
					res
				);
			}

			// send all accounts
			return appBucket
				.queryDB(
					`SELECT email, ARRAY site.domain
						FOR site IN sites WHEN site.domain IS NOT MISSING END AS domains ,
						ARRAY site.siteId
						FOR site IN sites WHEN site.siteId IS NOT MISSING END AS siteIds
						FROM AppBucket WHERE meta().id LIKE "user::%"`
				)
				.then(async users => {
					let filteredUsers = [];
					if (users && Array.isArray(users) && users.length) {
						filteredUsers = users.filter(user => EMAIL_REGEX.test(user.email));
					}

					// value here is a string boolean
					if (forPaymentReconciliation && forPaymentReconciliation.toLowerCase() === 'true') {
						try {
							const accountsWithAMMappingFromHubspot = await getAllAccountsDetailWithTheirAccountManagerFromHubspot();
							const {
								publisherAndAccountManagersMapping,
								domainAndAccountManagersMapping
							} = accountsWithAMMappingFromHubspot;

							filteredUsers = filteredUsers.map(userDetails => {
								if (publisherAndAccountManagersMapping[userDetails.email]) {
									// search with publisher's email
									// eslint-disable-next-line no-param-reassign
									userDetails.accountManagerEmail =
										(publisherAndAccountManagersMapping[userDetails.email] &&
											publisherAndAccountManagersMapping[userDetails.email].owner) ||
										'';
								} else if (!userDetails.accountManagerEmail) {
									// search with domains
									// eslint-disable-next-line no-unused-expressions
									userDetails.domains &&
										userDetails.domains.find(domain => {
											const sanitizedDomainName = domain
												.replace(/^https?:\/\//, '') // replace http/https
												.replace(/^w+\./, '') // replace www
												.replace(/\/$/, ''); // replace trailing '/' from end

											// eslint-disable-next-line no-param-reassign
											userDetails.accountManagerEmail =
												(domainAndAccountManagersMapping[sanitizedDomainName] &&
													domainAndAccountManagersMapping[sanitizedDomainName].owner) ||
												'';
											// if AM's email is set then exit
											if (userDetails.accountManagerEmail) {
												// exit when found
												return true;
											}
											return false;
										});
								}
								return userDetails;
							});
						} catch (err) {
							// eslint-disable-next-line no-console
							console.log(err);
						}
					}

					return sendSuccessResponse(
						{
							users: filteredUsers
						},
						res
					);
				})
				.catch(err => errorHandler(err, res));
		} catch (err) {
			return errorHandler(err, res);
		}
	})
	.get('/blockedSitesPeerPerformance', async (req, res) => {
		try {
			const peerPerformanceBlockedQuery =
				'SELECT sites FROM AppBucket WHERE notParticipatingInPeerPerformance=true and meta().id like "user::%";';
			const userSites = await appBucket.queryDB(peerPerformanceBlockedQuery);
			const peerBlockedSites = userSites.reduce((allBlockedSites, currentUserSites) => {
				const { sites = [] } = currentUserSites;
				const blockedSites = sites.map(site => site.siteId);
				return [...allBlockedSites, ...blockedSites];
			}, []);
			return sendSuccessResponse(
				{
					sites: peerBlockedSites
				},
				res
			);
		} catch (err) {
			return errorHandler(err, res);
		}
	})
	.post('/switchUser', async (req, res) => {
		try {
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

			const userEmail = req.user.originalEmail || req.user.email;
			/**
			 * Get accounts associated with user and check before switching
			 */
			const associatedAccounts = await getAssociatedAccountsWithUser(userEmail);
			// This is for AdOps/Account Managers to prevent unAuth access to other accounts
			// if there are some associated accounts then switch only if account to be
			// switched is present in associated accounts list
			if (
				!checkAllowedEmailForSwitchAndImpersonate(associatedAccounts, email /* email to switch */)
			) {
				return sendErrorResponse(
					{
						message: 'Permission Denined'
					},
					res,
					httpStatus.PERMISSION_DENIED
				);
			}

			const userCookie = req.cookies.user;
			const adpToken = req.headers.authorization;
			const token = (userCookie && JSON.parse(userCookie).authToken) || adpToken || null;
			const decoded = await authToken.decodeAuthToken(token);

			return userModel
				.setSitePageGroups(email)
				.then(user => {
					// eslint-disable-next-line no-shadow
					const newAuthToken = authToken.getAuthToken({
						email: user.get(EMAIL),
						isSuperUser: true,
						originalEmail: req.user.originalEmail || req.user.email,
						loginTime: decoded.loginTime
					});

					return res
						.status(httpStatus.OK)
						.cookie(
							'user',
							JSON.stringify({
								authToken: newAuthToken,
								isSuperUser: true
							}),
							{ maxAge: 86400000, path: '/' }
						)
						.send({
							success: 'Changed User',
							authToken: newAuthToken
						});
				})
				.catch(err => errorHandler(err, res));
		} catch (err) {
			return errorHandler(err, res);
		}
	})
	.post('/impersonateCurrentUser', async (req, res) => {
		try {
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

			const userEmail = req.user.originalEmail || req.user.email;
			/**
			 * Get accounts associated with user and check before impersonating
			 */
			const associatedAccounts = await getAssociatedAccountsWithUser(userEmail);
			// This is for AdOps/Account Managers to prevent unAuth access to other accounts
			if (
				!checkAllowedEmailForSwitchAndImpersonate(associatedAccounts, email /* email to switch */)
			) {
				return sendErrorResponse(
					{
						message: 'Permission Denined'
					},
					res,
					httpStatus.PERMISSION_DENIED
				);
			}

			const userCookie = req.cookies.user;
			const adpToken = req.headers.authorization;
			const token = (userCookie && JSON.parse(userCookie).authToken) || adpToken || null;
			const decoded = await authToken.decodeAuthToken(token);

			return userModel
				.setSitePageGroups(email)
				.then(user => {
					const newAuthToken = authToken.getAuthToken({
						email: user.get(EMAIL),
						isSuperUser: false,
						originalEmail: req.user.originalEmail || req.user.email,
						loginTime: decoded.loginTime
					});

					return res
						.status(httpStatus.OK)
						.cookie(
							'user',
							JSON.stringify({
								authToken: newAuthToken,
								isSuperUser: false
							}),
							{ maxAge: 86400000, path: '/' }
						)
						.send({
							success: 'User Impersonated Successfully',
							authToken: newAuthToken
						});
				})
				.catch(err => errorHandler(err, res));
		} catch (err) {
			return errorHandler(err, res);
		}
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
	})
	.post('/triggerLineItemSetup', (req, res) => {
		const { email, originalEmail } = req.user;
		const { integrationEmail } = req.body;
		const apiBody = {
			queue: 'LINE_ITEM_CONSUMER',
			data: {
				user_doc_email: email,
				adops_email: originalEmail,
				auth_user_email: integrationEmail
			}
		};
		axios
			.post(QUEUE_PUBLISHER_ADPUSHUP, apiBody)
			.then(() =>
				sendSuccessResponse(
					{
						message: 'Line Item Automation in Process'
					},
					res
				)
			)
			.catch(err => errorHandler(err, res, httpStatus.INTERNAL_SERVER_ERROR));
	});

module.exports = router;
