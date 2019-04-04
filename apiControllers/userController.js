const express = require('express');
const crypto = require('crypto');
const Promise = require('bluebird');
const uuid = require('node-uuid');
const _ = require('lodash');
const request = require('request-promise');
const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const utils = require('../helpers/utils');
const CC = require('../configs/commonConsts');
const httpStatus = require('../configs/httpStatusConsts');
const formValidator = require('../helpers/FormValidator');
const schema = require('../helpers/schema');
const oauthHelper = require('../helpers/googleOauth');
const config = require('../configs/config');
const AdpushupError = require('../helpers/AdPushupError');
const router = express.Router();

let googleOAuthUniqueString = '';

router
	.get('/', (req, res) => {
		res.status(200).json({ email: 'sdjklf@kewrle.com' });
	})
	.post('/addSite', (req, res) => {
		const site = req.body.site ? utils.getSafeUrl(req.body.site) : req.body.site;

		return formValidator
			.validate({ site }, schema.user.validations)
			.then(() => userModel.addSite(req.user.email, site))
			.spread((user, siteId) => {
				const userSites = user.get('sites');
				for (const i in userSites) {
					if (userSites[i].siteId === siteId) {
						userSites[i].onboardingStage = 'onboarding';
						userSites[i].step = CC.onboarding.initialStep; // initial site step i.e. 1 now
						user.set('sites', userSites);
						user.save();

						const { siteId, domain, onboardingStage, step } = userSites[i];

						return res.status(httpStatus.OK).json({ siteId, site: domain, onboardingStage, step });
					}
				}
				return res
					.status(httpStatus.INTERNAL_SERVER_ERROR)
					.json({ error: 'Error while Adding site' });
			})
			.catch(err => {
				console.log('Error while Adding site', err);
				if (err.message.status === 409) {
					return res.status(409).json({ error: err.message.message });
				}
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

			const key = tipaltiConfig.key;

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
				console.log(tipaltiUrls);
				res.send({
					tipaltiUrls
				});
			})
			.catch(err => res.status(500).send({ error: 'Some error occurred' }));
	})
	.post('/setSiteStep', (req, res) => {
		const { siteId, onboardingStage, step } = req.body;
		siteModel
			.setSiteStep(siteId, onboardingStage, step)
			.then(() => userModel.setSitePageGroups(req.user.email))
			.then(user => {
				user.save();
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
	.get('/requestGoogleOAuth2', (req, res) => {
		const postMessageScriptTemplate = `<script type="text/javascript">
		window.opener.postMessage({
			"cmd":"SAVE_GOOGLE_OAUTH_INFO",
			"data": {
				"adsenseEmail": "zahin@adpushup.com",
				"pubId": "ca-pub12345670"
			}
		}, "http://localhost:8080");
		window.close();
		</script>`;

		return res.status(httpStatus.OK).send(postMessageScriptTemplate);
	})
	.get('/oauth2callback', (req, res) => {
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

		const getAccessToken = oauthHelper.getAccessTokens(req.query.code).then(tokenObject => {
			const {
				tokens: { access_token, id_token, expiry_date }
			} = tokenObject;
			const computedObject = { access_token, id_token, expiry_date };

			return computedObject;
		});
		const getAdsenseAccounts = getAccessToken.then(token =>
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
		const getUserDFPInfo = getAccessToken.then(token => {
			const { id_token } = token;
			const { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } = config.googleOauth;

			return request({
				method: 'POST',
				uri: CC.DFP_WEB_SERVICE_ENDPOINT,
				body: {
					clientCode: OAUTH_CLIENT_ID,
					clientSecret: OAUTH_CLIENT_SECRET,
					refreshToken: id_token
				},
				json: true
			}).then(response => {
				if (response.code === 0) {
					return response.data;
				}

				return [];
			});
		});
		const getUserInfo = getAccessToken.then(token =>
			request({
				strictSSL: false,
				uri: `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token.access_token}`,
				json: true
			})
		);
		const getUser = userModel.getUserByEmail(req.user.email);

		return Promise.join(
			getUser,
			getAccessToken,
			getAdsenseAccounts,
			getUserInfo,
			getUserDFPInfo,
			(user, token, adsenseAccounts, userInfo, userDFPInfo) => {
				const { id_token, access_token, expiry_date } = token;

				return Promise.all([
					user.addNetworkData({
						networkName: 'ADSENSE',
						refreshToken: id_token,
						accessToken: access_token,
						expiresIn: expiry_date,
						pubId: adsenseAccounts[0].id,
						adsenseEmail: userInfo.email,
						userInfo,
						adsenseAccounts
					}),
					user.addNetworkData({
						networkName: 'DFP',
						refreshToken: id_token,
						accessToken: access_token,
						expiresIn: expiry_date,
						userInfo,
						dfpAccounts: userDFPInfo
					})
				]).then(() => {
					// grab all the pubIds in case there are multiple and show them to user to choose
					const pubIds = _.map(adsenseAccounts, 'id');
					const adsenseEmail = userInfo.email;
					const pubId = pubIds.length > 1 ? pubIds : pubIds[0];
					// TODO: Below mentioned https staging url is for testing purposes.
					// This should be replaced with https console product url once this product gets live.
					const postMessageScriptTemplate = `<script type="text/javascript">
					window.opener.postMessage({
						"cmd":"SAVE_GOOGLE_OAUTH_INFO",
						"data": {
							"adsenseEmail": "${adsenseEmail}",
							"pubId": "${pubId}"
						}
					}, "https://app.staging.adpushup.com");
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
					: err;

				return res.status(500).send(computedErrorMessage);
			})
			.finally(() => {
				googleOAuthUniqueString = '';
				return true;
			});
	});

module.exports = router;
