/* eslint-disable */
const Promise = require('bluebird');
const express = require('express');
const md5 = require('md5');
const _ = require('lodash');
const { promiseForeach } = require('node-utils');
const request = require('request-promise');
const jwt = require('jsonwebtoken')

const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const consts = require('../configs/commonConsts');
const utils = require('../helpers/utils');
const {
	jwt: { refreshTokenConfig }
} = require('../configs/config');
const authToken = require('../helpers/authToken');
const httpStatus = require('../configs/httpStatusConsts');
const formValidator = require('../helpers/FormValidator');
const schema = require('../helpers/schema');
const AdPushupError = require('../helpers/AdPushupError');
const {
	getNetworkConfig,
	getNetworkWideHBRules,
	sendErrorResponse,
	sendSuccessResponse
} = require('../helpers/commonFunctions');
const { getMetaInfo } = require('../apiServices/metaInfoService');
const {
	appBucket,
	errorHandler,
	checkParams,
	sendDataToAuditLogService,
	getAssociatedAccountsWithUser,
	isVideoAdsDashboardEnabled,
	addActiveProductsToMeta,
	getGlobalClientConfig
} = require('../helpers/routeHelpers');

const router = express.Router();

function createNewUser(params) {
	const origName = utils.trimString(params.name);
	const nameArr = origName.split(' ');
	// ['999', '1000-2500', '2500-5000', '5000-10000', '10000-50000', '50000-200000', '200001'];
	const { exactRevenue, websiteRevenue: revenue } = params;
	const revenueArray = revenue.split('-');
	const leastRevenueConstant = '999';

	// Exact Revenue refers to exact revenue amount (less than $1000 USD) given by end user
	const isExactRevenue = !!exactRevenue;
	const isRevenue = !!revenue;
	const isMinimumRevenueMatch = !!(isRevenue && leastRevenueConstant === revenue);
	const isExactRevenueCondition = !!(isExactRevenue && isMinimumRevenueMatch);
	let encodedParams;

	// firstName and lastName fields are added to params json
	// as user name will be saved in database as
	// separate firstName and lastName fields
	params.firstName = utils.trimString(nameArr[0]);
	params.lastName = utils.trimString(nameArr.slice(1).join(' '));
	params.email = utils.sanitiseString(params.email);
	params.site = utils.getSafeUrl(params.site);
	params.adNetworks = consts.user.fields.default.adNetworks; // ['Other']
	params.pageviewRange = consts.user.fields.default.pageviewRange; // 5000-15000
	params.sellerId = md5(params.email.toLowerCase());

	params.utmSource = params.utmSource || '';
	params.utmMedium = params.utmMedium || '';
	params.utmCampaign = params.utmCampaign || '';
	params.utmTerm = params.utmTerm || '';
	params.utmName = params.utmName || '';
	params.utmContent = params.utmContent || '';
	params.utmFirstHit = params.utmFirstHit || '';
	params.utmFirstReferrer = params.utmFirstReferrer || '';

	// Below conditions
	// IF: Set all revenue parameters equal to exact revenue
	// given by end user if the revenue is less than $1000 USD
	// ELSE: Compute all revenue parameters with given revenue range
	if (isExactRevenueCondition) {
		params.revenueLowerLimit = '0';
		params.revenueUpperLimit = exactRevenue;
		params.revenueAverage = Number(Number(exactRevenue).toFixed(2));
		params.websiteRevenue = exactRevenue;
	} else {
		if (revenueArray.length > 1) {
			params.revenueLowerLimit = revenueArray[0];
			params.revenueUpperLimit = revenueArray[1];
		} else if (parseInt(revenueArray[0]) < 50000) {
			params.revenueLowerLimit = 0;
			params.revenueUpperLimit = revenueArray[0];
		} else {
			params.revenueLowerLimit = revenueArray[0];
			params.revenueUpperLimit = 2 * revenueArray[0];
		}
		params.revenueAverage =
			(parseInt(params.revenueLowerLimit) + parseInt(params.revenueUpperLimit)) /
			revenueArray.length;
	}

	// (typeof params.adNetworks === 'string') ? [params.adNetworks] : params.adNetworks;
	delete params.name;
	encodedParams = utils.getHtmlEncodedJSON(params);
	delete encodedParams.password;
	params = Object.assign({}, params, encodedParams);

	return userModel
		.createNewUser(params)
		.then(() => params.email)
		.catch(err => {
			throw err;
		});
}

function getUserSites(user) {
	const userSites = user.get('sites');
	const siteIds = _.compact(_.map(userSites, 'siteId'));
	const sites = {};

	function getSite(siteId) {
		return siteModel.getSiteById(siteId).then(site => {
			sites[site.get('siteId')] = site;
			return true;
		});
	}

	return promiseForeach(siteIds, getSite, (data, err) => {
		console.log(err);
		return true;
	}).then(() => sites);
}

async function getReportsMetaData(params) {
	return getMetaInfo(params)
		.then(async response => {
			const { data, code } = response;
			if (code == 1 && data) {
				const updatedData = await addActiveProductsToMeta(data);
				return updatedData;
			} else {
				return {};
			}
		})
		.catch(err => {
			console.log(err);
			return {};
		});
}

// Set user session data and redirects to relevant screen based on provided parameters
/*
	Type defines where the call is coming from
	1 : Sign up
	2 : Login
*/

router
	.get('/globalData', (req, res) => {
		const { email, isSuperUser, originalEmail } = req.user;

		return userModel
			.getUserByEmail(email)
			.then(user =>
				Promise.join(
					getNetworkConfig(),
					getUserSites(user),
					getNetworkWideHBRules(),
					// get logged in user's details in case of switched user
					(originalEmail && userModel.getUserByEmail(originalEmail)) || Promise.resolve(''),
					getGlobalClientConfig(),
					async (networkConfig, sites, networkWideHBRules, originalUser, globalClientConfig) => {
						try {
							const userEmail = req.user.originalEmail || req.user.email;
							// This is for AdOps/Account Managers to prevent unAuth access to other accounts
							let associatedAccounts = await getAssociatedAccountsWithUser(userEmail);

							const originalUsersData = (originalUser && originalUser.cleanData()) || {};
							const userData = user.cleanData();
							const siteKeys = Object.keys(sites);

							const userSitesArray = siteKeys.length > 0 ? [...userData.sites] : [];
							const userSitesArrayLength = userSitesArray.length;

							userData.sites = {};

							const showVideoAdsDashboard = isVideoAdsDashboardEnabled(sites);
							userData[consts.SHOW_VIDEO_ADS_DASHBOARD] = showVideoAdsDashboard;

							// get `paymentReconciliation` flag from original user's data and set it into
							// impersonate user's data
							// Flag to check if the user is allowed to export site owners email, account managers email or not
							// under Ops Panel reports with csv export
							const { paymentReconciliation = false } = originalEmail
								? originalUsersData
								: userData;

							if (userSitesArrayLength === 0) {
								return res.status(httpStatus.OK).json({
									user: { ...userData, isSuperUser, paymentReconciliation },
									networkConfig,
									networkWideHBRules,
									associatedAccounts,
									sites,
									globalClientConfig
								});
							}

							for (let i = 0; i < userSitesArrayLength; i += 1) {
								const site = userSitesArray[i];
								userData.sites[site.siteId] = site;
							}

							let params = { siteid: siteKeys.toString(), isSuperUser };
							// enabled to get meta info for HB Analytics Reporting - Enabled or not
							// and pass as globalMeta data along with sites data

							return getReportsMetaData(params).then(reports => {
								const { site: sitesFromReportMeta } = reports;
								if (sitesFromReportMeta) {
									Object.keys(sitesFromReportMeta).map(site => {
										// to check is HB enabled or not
										if (userData.sites[site] && sitesFromReportMeta[site].product) {
											userData.sites[site].product = sitesFromReportMeta[site].product;
										}
									});
								}

								return res.status(httpStatus.OK).json({
									user: {
										...userData,
										isSuperUser,
										paymentReconciliation /** Pass the flag to check if the user is allowed to export site owners email or not */
									},
									networkConfig,
									networkWideHBRules,
									associatedAccounts,
									sites,
									globalClientConfig
								});
							});
						} catch (err) {
							throw err;
						}
					}
				)
			)
			.catch(err => {
				console.log(err);
				return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
					message: err.message
				});
			});
	})
	.post('/signup', (req, res) => {
		createNewUser(req.body)
			.then(email =>
				userModel
					.setSitePageGroups(email)
					.then(user =>
						user.save().then(() => {
							const token = authToken.getAuthToken({
								email,
								isSuperUser: false,
								loginTime: Date.now()
							});

							res
								.status(httpStatus.OK)
								.cookie(
									'user',
									JSON.stringify({
										authToken: token,
										isSuperUser: false
									}),
									{ maxAge: 86400000, path: '/' }
								)
								.json({
									success: 'signed up successfully',
									authToken: token
								});

							// Commented for Tag Manager
							// if (parseInt(user.data.revenueUpperLimit) <= consts.onboarding.revenueLowerBound) {
							// 	// thank-you --> Page for below threshold users
							// 	req.session.stage = 'Pre Onboarding';
							// 	return res.redirect('/thank-you');
							// } else {
							// 	/* Users with revenue > 1,000 */
							// 	return setSessionData(user, req, res, 1);
							// }

							// This was commented before Tag Manager
							// else if (parseInt(user.data.revenueUpperLimit) > 10000) {
							// 	// thank-you --> Page for above threshold users
							// 	req.session.stage = 'Pre Onboarding';
							// 	return res.redirect('/thankyou');
							// }
						})
					)
					.catch(() => {
						res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Some error occurred!' });
					})
			)
			.catch(e => {
				const errorMessage = 'Some error occurred. Please Try again later!';

				// custom check for AdPushupError
				if (e.name && e.name === 'AdPushupError') {
					return res.status(httpStatus.BAD_REQUEST).json({ errors: e.message });
				}

				return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: errorMessage });
			});
	})
	.post('/login', (req, res) => {
		const email = utils.sanitiseString(req.body.email);
		const { password } = req.body;

		formValidator
			.validate({ email, password }, schema.user.validations)
			.then(() =>
				userModel
					.setSitePageGroups(req.body.email)
					.then(user => {
						const userPasswordMatch = user.isMe(email, password);

						if (userPasswordMatch) {
							const isSuperUser = user.get('isAdmin') === true;
							const token = authToken.getAuthToken({ email, isSuperUser, loginTime: Date.now() });
							const refreshToken = authToken.generateRefreshToken({ email, isSuperUser });

							res
								.status(httpStatus.OK)
								.cookie(
									'user',
									JSON.stringify({
										authToken: token,
										isSuperUser
									}),
									{ maxAge: 86400000, path: '/' }
								)
								.json({
									success: 'logged in successfully',
									authToken: token,
									refreshToken
								});
						} else {
							res
								.status(httpStatus.UNAUTHORIZED)
								.json({ error: "Email / Password combination doesn't exist." });
						}
					})
					.catch(err => {
						console.log('err: ', err);
						res
							.status(httpStatus.UNAUTHORIZED)
							.json({ error: "Email / Password combination doesn't exist." });
					})
			)
			.catch(err => {
				res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
			});
	})
	.get('/getAccessToken', (req, res) => {
		const refreshToken = req.headers.authorization;
		if (!refreshToken) {
			return res.status(httpStatus.UNAUTHORIZED).json({ error: "Pass refresh token in header to generate access token!" });
		}
		const { salt } = refreshTokenConfig;
		jwt.verify(refreshToken, salt, (err, decodedData) => {
			if (err) {
				return res.status(httpStatus.FORBIDDEN).json({ error: "Invalid refresh token passed!" });
			}
			const isSuperUser = decodedData.isSuperUser;
			const email = decodedData.email;
			const loginTime = Date.now();
			const token = authToken.getAuthToken({ email, isSuperUser, loginTime });
			return res.status(httpStatus.OK)
				.json({
					success: "Successfully generated access token.",
					token
				})

		})
	})
	.post('/forgotPassword', (req, res) => {
		userModel
			.forgotPassword(req.body)
			.then(() => {
				res
					.status(httpStatus.OK)
					.json({ success: 'Verification Email has been sent successfully!' });
			})
			.catch(e => {
				if (e instanceof AdPushupError) {
					if (typeof e.message === 'object' && e.message.email) {
						res.status(httpStatus.BAD_REQUEST).json({ errors: e.message });
					}
				} else if (e.name && e.name === 'CouchbaseError') {
					res.status(httpStatus.NOT_FOUND).json({ error: 'User Not Found!' });
				}
			});
	})
	.post('/resetPassword', (req, res) => {
		// email, key, password
		userModel
			.postResetPassword(req.body)
			.then(() =>
				res.status(httpStatus.OK).json({ success: 'Your password has been reset successfully!' })
			)
			.catch(e => {
				if (e instanceof AdPushupError) {
					res
						.status(httpStatus.BAD_REQUEST)
						.json(e.message.keyNotFound ? { error: 'Key not found!' } : { errors: e.message });
				} else if (e.name && e.name === 'CouchbaseError') {
					res.status(httpStatus.NOT_FOUND).json({ error: 'User not found!' });
				}
			});
	})
	.post('/updateNetworkConfig', (req, res) => {
		if (!req.user.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request'
				},
				res,
				httpStatus.UNAUTHORIZED
			);
		}

		let toSend = {};

		return checkParams(['config'], req, 'post')
			.then(() => appBucket.getDoc(consts.docKeys.networkConfig))
			.then(docWithCase => {
				const { value, cas } = docWithCase;
				const { config, dataForAuditLogs } = req.body;
				// log config changes
				const { siteDomain, appName } = dataForAuditLogs;
				const { email, originalEmail } = req.user;
				const {
					AUDIT_LOGS_ACTIONS: { OPS_PANEL }
				} = consts;
				const prevConfig = { ...value };

				const networks = Object.keys(config);

				networks.forEach(network => {
					const networkDataFromDoc = value[network];
					if (networkDataFromDoc) {
						value[network] = {
							...networkDataFromDoc,
							...config[network]
						};
					}
				});
				// log config changes
				sendDataToAuditLogService({
					siteId: '',
					siteDomain,
					appName,
					type: 'account',
					impersonateId: email,
					userId: originalEmail,
					prevConfig,
					currentConfig: value,
					action: {
						name: OPS_PANEL.TOOLS,
						data: `Bidders Config`
					}
				});

				toSend = value;
				return appBucket.updateDoc(consts.docKeys.networkConfig, value, cas);
			})
			.then(() =>
				sendSuccessResponse(
					{
						message: 'Operation successful',
						networkConfig: toSend
					},
					res
				)
			)
			.catch(err => errorHandler(err, res, httpStatus.INTERNAL_SERVER_ERROR));
	})
	.get('/getGlobalClientConfig', (req, res) => {
		return getGlobalClientConfig()
			.then(globalClientConfig =>
				sendSuccessResponse(
					{
						message: 'Operation successful',
						globalClientConfig
					},
					res
				)
			)
			.catch(err => errorHandler(err, res, httpStatus.INTERNAL_SERVER_ERROR));
	});

module.exports = router;
