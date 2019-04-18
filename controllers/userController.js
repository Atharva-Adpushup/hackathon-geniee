var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	_ = require('lodash'),
	crypto = require('crypto'),
	Promise = require('bluebird'),
	uuid = require('node-uuid'),
	request = require('request-promise'),
	md5 = require('md5'),
	utils = require('../helpers/utils'),
	AdPushupError = require('../helpers/AdPushupError'),
	oauthHelper = require('../helpers/googleOauth'),
	// eslint-disable-next-line new-cap
	router = express.Router({ mergeParams: true }),
	CC = require('../configs/commonConsts'),
	config = require('../configs/config'),
	Mailer = require('../helpers/Mailer'),
	{ getWeeklyComparisionReport } = require('../helpers/commonFunctions'),
	// Create mailer config
	mailConfig = {
		MAIL_FROM: config.email.MAIL_FROM,
		MAIL_FROM_NAME: config.email.MAIL_FROM_NAME,
		SMTP_SERVER: config.email.SMTP_SERVER,
		SMTP_USERNAME: config.email.SMTP_USERNAME,
		SMTP_PASSWORD: config.email.SMTP_PASSWORD
	},
	// Instantiate mailer
	mailer = new Mailer(mailConfig, 'text');

function requestDemoRedirection(res) {
	return res.redirect('/user/requestdemo');
}

function dashboardRedirection(req, res, allUserSites, type) {
	const currentUserEmail = req.session.user.email;

	function setEmailCookie() {
		var cookieName = 'email',
			// "Email" cookie has 1 year expiry and accessible through JavaScript
			cookieOptions = {
				expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 365),
				encode: String,
				httpOnly: false
			},
			isCookieSet = Object.keys(req.cookies).length > 0 && typeof req.cookies[cookieName] !== 'undefined';

		isCookieSet ? res.clearCookie(cookieName, cookieOptions) : '';
		res.cookie(cookieName, currentUserEmail, cookieOptions);
	}

	function sitePromises() {
		return _.map(allUserSites, function(obj) {
			return siteModel
				.getSiteById(obj.siteId)
				.then(function(site) {
					return Object.assign(obj, {
						isManual: site.get('isManual') || false
					});
				})
				.catch(function() {
					return 'inValidSite';
				});
		});
	}

	return Promise.all(sitePromises()).then(function(validSites) {
		var sites = _.difference(validSites, ['inValidSite']),
			unSavedSite;

		sites = Array.isArray(sites) && sites.length > 0 ? sites : [];
		/**
		 * unSavedSite, Current user site object entered during signup
		 *
		 * - Value is Truthy (all user site/sites) only if user has
		 * no saved any site through Visual Editor
		 * - Value is Falsy if user has atleast one saved site
		 */

		unSavedSite = sites.length === 0 ? allUserSites : null;
		req.session.unSavedSite = unSavedSite;

		setEmailCookie(req, res);

		let siteReports = [];

		return Promise.each(sites, site =>
			getWeeklyComparisionReport(site.siteId)
				.then(data => siteReports.push(data))
				.catch(() => {
					return true;
				})
		)
			.then(() => {
				const { AMP_SETTINGS_ACCESS_EMAILS } = CC;
				const isAMPSettingsUIVisible = !!(
					_.indexOf(AMP_SETTINGS_ACCESS_EMAILS, currentUserEmail.toLowerCase()) > -1
				);

				sites = _.map(sites, site => {
					const reportData = _.find(siteReports, { siteId: site.siteId });
					return {
						channels: site.channels,
						domain: site.domain,
						siteId: site.siteId,
						step: site.step,
						isManual: site.isManual,
						reportData
					};
				});

				if (type == 'onboarding') {
					if (sites.length >= CC.onboarding.initialStep) {
						var hasStep = 'step' in sites[0] ? true : false;
						if (hasStep && sites[0].step == CC.onboarding.totalSteps) {
							return res.redirect('/user/dashboard');
						}
					}
				}

				switch (type) {
					case 'dashboard':
					case 'default':
						return userModel.getUserByEmail(currentUserEmail).then(user => {
							let isPaymentDetailsComplete = user.get('isPaymentDetailsComplete');
							return res.render('dashboard', {
								validSites: sites,
								unSavedSite: unSavedSite,
								hasStep: sites.length ? ('step' in sites[0] ? true : false) : false,
								requestDemo: req.session.user.requestDemo,
								imageHeaderLogo: true,
								isSuperUser: req.session.isSuperUser,
								isAMPSettingsUIVisible,
								isPaymentDetailsComplete: isPaymentDetailsComplete || false
							});
						});
						break;
					case 'onboarding':
						return res.render('onboarding', {
							validSites: sites,
							unSavedSite: unSavedSite,
							hasStep: sites.length ? ('step' in sites[0] ? true : false) : false,
							requestDemo: req.session.user.requestDemo,
							analyticsObj: JSON.stringify(req.session.analyticsObj),
							imageHeaderLogo: true,
							buttonHeaderLogout: true,
							isSuperUser: req.session.isSuperUser,
							isOnboarding: true
						});
						break;
				}
			})
			.catch(err => {
				res.send('Some error occurred! Please try again later.');
			});
	});
}

function preOnboardingPageRedirection(page, req, res) {
	var analyticsObj = req.session.analyticsObj ? req.session.analyticsObj : null,
		isAnalyticsObj = !!(analyticsObj && _.isObject(analyticsObj)),
		primarySiteDetails = req.session.primarySiteDetails,
		isPrimarySiteDetails = !!primarySiteDetails,
		primarySiteId = isPrimarySiteDetails ? primarySiteDetails.siteId : null,
		primarySiteDomain = isPrimarySiteDetails ? primarySiteDetails.domain : null,
		primarySiteStep = isPrimarySiteDetails ? primarySiteDetails.step : null,
		firstName = req.session.tempObj && req.session.tempObj.firstName ? req.session.tempObj.firstName : null,
		email = req.session.tempObj && req.session.tempObj.email ? req.session.tempObj.email : null,
		stage = req.session.stage ? req.session.stage : null,
		requestDemo = req.session.user && req.session.user.requestDemo ? req.session.user.requestDemo : true,
		userObj = {
			name: firstName,
			email: email,
			stage: stage,
			primarySiteId,
			primarySiteDomain,
			primarySiteStep
		},
		isUserSession = !!(req.session && req.session.user && !req.session.isSuperUser),
		isPipeDriveDealId = !!(
			isAnalyticsObj &&
			primarySiteDetails &&
			primarySiteDetails.pipeDrive &&
			primarySiteDetails.pipeDrive.dealId
		),
		isPipeDriveDealTitle = !!(
			isAnalyticsObj &&
			primarySiteDetails &&
			primarySiteDetails.pipeDrive &&
			primarySiteDetails.pipeDrive.dealTitle
		);

	if (isPipeDriveDealId) {
		analyticsObj.INFO_PIPEDRIVE_DEAL_ID = primarySiteDetails.pipeDrive.dealId;
	}

	if (isPipeDriveDealTitle) {
		analyticsObj.INFO_PIPEDRIVE_DEAL_TITLE = primarySiteDetails.pipeDrive.dealTitle;
	}

	// Commented for Tag Manager
	// if (isUserSession) {
	// // Only user sub object is deleted, not the entire session object.
	// // This is done to ensure session object is maintained and consist of
	// // user primary site details that are used on open routes pages
	// // such as '/tools' and '/thank-you' pages
	// 	delete req.session.user;
	// }

	return res.render(page, {
		imageHeaderLogo: true,
		buttonHeaderLogout: true,
		user: userObj,
		analytics: analyticsObj,
		requestDemo: requestDemo
	});
}

router
	.get('/dashboard', function(req, res) {
		return userModel
			.getAllUserSites(req.session.user.email)
			.then(function(sites) {
				var allUserSites = sites;
				return dashboardRedirection(req, res, allUserSites, 'dashboard');
			})
			.catch(function(err) {
				var allUserSites = req.session.user.sites;
				return dashboardRedirection(req, res, allUserSites, 'dashboard');
			});
	})
	.get('/onboarding', function(req, res) {
		var allUserSites = req.session.user.sites;
		return dashboardRedirection(req, res, allUserSites, 'onboarding');
	})
	.get('/onboarding-complete', function(req, res) {
		return preOnboardingPageRedirection('onboarding-complete', req, res);
	})
	.get('/requestdemo', function(req, res) {
		return preOnboardingPageRedirection('request-demo', req, res);
	})
	.post('/setSiteStep', function(req, res) {
		siteModel
			.setSiteStep(req.body.siteId, req.body.step)
			.then(function() {
				return userModel.setSitePageGroups(req.session.user.email);
			})
			.then(function(user) {
				req.session.user = user;

				user.save();
				return res.send({ success: 1 });
			})
			.catch(function() {
				return res.send({ success: 0 });
			});
	})
	.post('/setSiteServices', function(req, res) {
		if (req.body && req.body.servicesString) {
			userModel
				.getUserByEmail(req.session.user.email)
				.then(function(user) {
					var userSites = user.get('sites'),
						userWebsiteRevenue = user.get('revenueUpperLimit');
					if (req.body.fromDashboard == 'false') {
						user.set('preferredModeOfReach', req.body.modeOfReach);
						if (
							(req.body['selectedServices[]'] && req.body['selectedServices[]'].length > 1) ||
							userWebsiteRevenue > 10000
						) {
							req.session.stage = 'Onboarding';
						}
					}
					for (var i in userSites) {
						if (userSites[i].domain === req.body.newSiteUnSavedDomain) {
							userSites[i].services = req.body.servicesString;
							userSites[i].step = 1;
							user.set('sites', userSites);
							req.session.user = user;
							user.save();
							return res.send({ success: 1 });
						}
					}
					return res.send({ success: 0 });
				})
				.catch(function(err) {
					console.log(err);
					return res.send({ success: 0 });
				});
		} else {
			return res.send({ success: 0 });
		}
	})
	.post('/sendCode', function(req, res) {
		var json = {
			email: req.body.developerEmail,
			code: req.body.headerCode
		};
		userModel
			.sendCodeToDev(json)
			.then(function() {
				res.send({ success: 1 });
			})
			.catch(function(e) {
				res.send({ success: 0 });
			});
	})
	.get('/billing', function(req, res) {
		if (req.session.user.billingInfoComplete) {
			return res.redirect('/user/dashboard');
		}
		return res.render('billing', {
			user: req.session.user,
			isSuperUser: !!req.session.isSuperUser
		});
	})
	// .get('/payment', function(req, res) {
	// 	if (req.session.user.paymentInfoComplete) {
	// 		return res.redirect('/user/dashboard');
	// 	}
	// 	return res.render('payment', {
	// 		user: req.session.user,
	// 		isSuperUser: !!req.session.isSuperUser
	// 	});
	// })
	.get('/connectGoogle', function(req, res) {
		return userModel
			.getUserByEmail(req.session.user.email)
			.then(function(user) {
				var adSenseData = _.find(user.get('adNetworkSettings'), {
					networkName: 'ADSENSE'
				});
				return res.render('connectGoogle', {
					adNetworkSettings: !_.isEmpty(user.get('adNetworkSettings'))
						? {
								pubId: adSenseData.adsenseAccounts[0].id,
								email: adSenseData.userInfo.email
						  }
						: false,
					siteId: req.session.siteId
				});
			})
			.catch(function(err) {
				res.redirect('/404');
			});
	})
	.get('/addSite', function(req, res) {
		var allUserSites = req.session.user.sites,
			params = {};
		_.map(allUserSites, function(site) {
			if (site.step == 1) {
				params = {
					siteDomain: site.domain,
					siteId: site.siteId,
					step: site.step
				};
			}
		});
		res.render('addSite', params);
	})
	.post('/addSite', function(req, res) {
		var site = req.body.site ? utils.getSafeUrl(req.body.site) : req.body.site;

		userModel
			.addSite(req.session.user.email, site)
			.spread(function(user, siteId) {
				var userSites = user.get('sites');
				for (var i in userSites) {
					if (userSites[i].siteId === siteId) {
						userSites[i].step = CC.onboarding.initialStep; // initial site step i.e. 1 now
						user.set('sites', userSites);
						req.session.user = user;
						user.save();
						return res.send({ success: 1, siteId: siteId });
					}
				}
				return res.send({ success: 0 });
			})
			.catch(function(err) {
				console.log('Error while Adding site', err);
				return res.send({ success: 0 });
			});
	})
	.get('/logout', function(req, res) {
		req.session.destroy(function() {
			return res.redirect('/');
		});
	})
	.post('/deleteSite', function(req, res) {
		userModel
			.verifySiteOwner(req.session.user.email, req.body.siteId)
			.then(function() {
				return siteModel.deleteSite(req.body.siteId);
			})
			.then(function() {
				return res.redirect('dashboard');
			})
			.catch(function(err) {
				console.log(err);
				return res.redirect('dashboard');
			});
	})
	.post('/switchTo', function(req, res) {
		var email = req.body.email ? utils.sanitiseString(req.body.email) : req.body.email;

		if (req.session.isSuperUser === true) {
			userModel.setSitePageGroups(email).then(
				function(user) {
					req.session.user = user;
					var allUserSites = user.get('sites'),
						isRequestDemo = !!user.get('requestDemo');

					function sitePromises() {
						return _.map(allUserSites, function(obj) {
							return siteModel
								.getSiteById(obj.siteId)
								.then(function() {
									return obj;
								})
								.catch(function(err) {
									return 'inValidSite';
								});
						});
					}

					return Promise.all(sitePromises()).then(function(validSites) {
						var sites = _.difference(validSites, ['inValidSite']);
						if (Array.isArray(sites) && sites.length > 0) {
							if (sites.length == 1) {
								var step = sites[0].step,
									isIncompleteOnboardingSteps = !!(step && step < CC.onboarding.totalSteps);

								if (isRequestDemo && isIncompleteOnboardingSteps) {
									return requestDemoRedirection(res);
								}
								if (isIncompleteOnboardingSteps) {
									return res.redirect('/user/onboarding');
								}
								return res.redirect('/user/dashboard');
								// if (!user.get('requestDemo')) {
								// 	return res.redirect('/user/dashboard');
								// } else {
								// 	return res.redirect('/thankyou');
								// }
							} else {
								return res.redirect('/user/dashboard');
							}
						} else {
							// if (isRequestDemo) {
							// 	return requestDemoRedirection(res);
							// }

							return res.redirect('/user/onboarding');
						}
					});
					// return res.redirect('/');
				},
				function() {
					return res.redirect('/');
				}
			);
		} else {
			return res.redirect('/');
		}
	})
	.get('/requestOauth', function(req, res) {
		req.session.state = uuid.v1();
		return res.redirect(oauthHelper.getRedirectUrl(req.session.state));
	})
	.get('/oauth2callback', function(req, res) {
		if (req.session.state !== req.query.state) {
			res.status(500);
			res.send('Fake Request');
		} else if (req.query.error === 'access_denied') {
			res.status(500);
			res.send('Seems you denied request, if done accidently please press back button to retry again.');
		} else {
			var getAccessToken = oauthHelper.getAccessTokens(req.query.code),
				getAdsenseAccounts = getAccessToken.then(function(token) {
					return request({
						strictSSL: false,
						uri: 'https://www.googleapis.com/adsense/v1.4/accounts?access_token=' + token.access_token,
						json: true
					})
						.then(function(adsenseInfo) {
							return adsenseInfo.items;
						})
						.catch(function(err) {
							if (
								err.error &&
								err.error.error &&
								err.error.error.message.indexOf('User does not have an AdSense account') === 0
							) {
								throw new Error('No adsense account');
							}
							throw err;
						});
				}),
				getUserDFPInfo = getAccessToken.then(function(token) {
					const { refresh_token } = token,
						{ OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } = config.googleOauth;

					return request({
						method: 'POST',
						uri: CC.DFP_WEB_SERVICE_ENDPOINT,
						body: {
							clientCode: OAUTH_CLIENT_ID,
							clientSecret: OAUTH_CLIENT_SECRET,
							refreshToken: refresh_token
						},
						json: true
					}).then(res => {
						if (res.code === 0) {
							return res.data;
						}
						return [];
					});
				}),
				getUserInfo = getAccessToken.then(function(token) {
					return request({
						strictSSL: false,
						uri: 'https://www.googleapis.com/oauth2/v2/userinfo?access_token=' + token.access_token,
						json: true
					});
				}),
				getUser = userModel.getUserByEmail(req.session.user.email);

			Promise.join(getUser, getAccessToken, getAdsenseAccounts, getUserInfo, getUserDFPInfo, function(
				user,
				token,
				adsenseAccounts,
				userInfo,
				userDFPInfo
			) {
				Promise.all([
					user.addNetworkData({
						networkName: 'ADSENSE',
						refreshToken: token.refresh_token,
						accessToken: token.access_token,
						expiresIn: token.expires_in,
						pubId: adsenseAccounts[0].id,
						adsenseEmail: userInfo.email,
						userInfo: userInfo,
						adsenseAccounts: adsenseAccounts
					}),
					user.addNetworkData({
						networkName: 'DFP',
						refreshToken: token.refresh_token,
						accessToken: token.access_token,
						expiresIn: token.expires_in,
						userInfo: userInfo,
						dfpAccounts: userDFPInfo
					})
				]).then(function() {
					req.session.user = user;
					var pubIds = _.map(adsenseAccounts, 'id'); // grab all the pubIds in case there are multiple and show them to user to choose
					if (CC.isForceMcm) {
						res.render('mcmConnect', {
							baseUrl: CC.BASE_URL,
							adsenseEmail: userInfo.email,
							pubId: pubIds.length > 1 ? pubIds : pubIds[0],
							userEmail: user.get('email')
						});
					} else {
						res.render('oauthParams', {
							adsenseEmail: userInfo.email,
							pubId: pubIds.length > 1 ? pubIds : pubIds[0]
						});
					}
				});
			}).catch(function(err) {
				res.status(500);
				err.message === 'No adsense account'
					? res.send(
							'Sorry but it seems you have no AdSense account linked to your Google account.' +
								'If this is a recently verified/created account, it might take upto 24 hours to come in effect.' +
								'Please try again after sometime or contact support.'
					  )
					: res.send(err);
			});
		}
	})
	.get('/profile', function(req, res) {
		userModel.getUserByEmail(req.session.user.email).then(
			function(user) {
				var formData = {
					firstName: user.get('firstName'),
					lastName: user.get('lastName'),
					email: user.get('email')
				};

				res.render('profile', {
					formData: formData
				});
			},
			function() {
				return res.redirect('/');
			}
		);
	})
	.post('/profile', function(req, res) {
		req.body.firstName = req.body.firstName ? utils.trimString(req.body.firstName) : req.body.firstName;
		req.body.lastName = req.body.lastName ? utils.trimString(req.body.lastName) : req.body.lastName;
		let jsonParams = Object.assign({}, req.body),
			encodedParams = {
				firstName: req.body.firstName,
				lastName: req.body.lastName
			};

		encodedParams = utils.getHtmlEncodedJSON(encodedParams);
		jsonParams = Object.assign({}, jsonParams, encodedParams);
		userModel
			.saveProfile(jsonParams, req.session.user.email)
			.then(function() {
				/**
				 * TODO: Fix user.save() to return updated user object
				 * and remove below hack
				 * File name: model.js
				 */
				var user = Array.prototype.slice.call(arguments)[0];

				console.log(user);

				req.session.user = user;
				return res.render('profile', {
					profileSaved: true,
					formData: req.body
				});
			})
			.catch(function(e) {
				if (e instanceof AdPushupError) {
					res.render('profile', {
						profileError: e.message,
						formData: req.body
					});
				} else if (e.name && e.name === 'CouchbaseError') {
					res.render('profile', { userNotFound: true, formData: req.body });
				}
			});
	})
	.get('/updateUserStatus', function(req, res) {
		if (req.session.isSuperUser) {
			return res.render('updateUserStatus', {
				currentStatus: req.session.user.requestDemo,
				email: req.session.user.email,
				websiteRevenue: req.session.user.websiteRevenue
			});
		} else {
			return res.redirect('/user/dashboard');
		}
	})
	.post('/updateUserStatus', function(req, res) {
		if (req.session.isSuperUser) {
			var email = req.session.user.email,
				websiteRevenue = req.session.user.websiteRevenue,
				revenueUpperLimit = null;

			if (req.body.websiteRevenue.trim()) {
				websiteRevenue = req.body.websiteRevenue;
			}

			if (email.trim() && req.body.status) {
				var status = true; // By default user would be inactive
				/* 
                    By Default requestDemo would be True | User is inactive
                    To make user active | Need to set requestDemo False
                    If value in request is 0 | User should be active | Set requestDemo to be False
                    If value in request is 1 | User should be inactive | Set requestDemo to be True
                */
				if (req.body.status == 0) {
					status = false;
				}

				var revenueArray = websiteRevenue.split('-');
				if (revenueArray.length > 1) {
					revenueUpperLimit = revenueArray[1];
				} else {
					revenueUpperLimit = revenueArray[0];
				}

				return userModel
					.setUserStatus(
						{
							status: status,
							websiteRevenue: websiteRevenue,
							revenueUpperLimit: revenueUpperLimit
						},
						email.trim()
					)
					.then(function(user) {
						var currentStatus = user.get('requestDemo'),
							websiteRevenue = user.get('websiteRevenue');

						req.session.user = user;

						return res.render('updateUserStatus', {
							status: 'success',
							message: 'User updated successfully',
							currentStatus: currentStatus,
							email: email,
							websiteRevenue: websiteRevenue
						});
					})
					.catch(function(err) {
						if (err) {
							return res.render('updateUserStatus', {
								status: 'failure',
								message: 'Some error occured',
								currentStatus: req.session.user.requestDemo,
								email: email,
								websiteRevenue: websiteRevenue
							});
						}
					});
			} else {
				return res.render('updateUserStatus', {
					status: 'failure',
					message: 'Incomplete values'
				});
			}
		} else {
			return res.redirect('/user/dashboard');
		}
	})
	.get('/credentials', function(req, res) {
		userModel.getUserByEmail(req.session.user.email).then(function(user) {
			var credentialsFromModel = user.get('adnetworkCredentials') || [],
				userAdnetworkCredentials = {
					taboola: {
						username: credentialsFromModel.taboola.username || '',
						password: credentialsFromModel.taboola.password || ''
					},
					revContent: {
						username: credentialsFromModel.revContent.username || '',
						password: credentialsFromModel.revContent.password || ''
					},
					outBrain: {
						username: credentialsFromModel.outBrain.username || '',
						password: credentialsFromModel.outBrain.password || ''
					},
					contentAds: {
						username: credentialsFromModel.contentAds.username || '',
						password: credentialsFromModel.contentAds.password || ''
					},
					mediaNet: {
						username: credentialsFromModel.mediaNet.username || '',
						password: credentialsFromModel.contentAds.password || ''
					},
					yellowhammer: {
						username: credentialsFromModel.yellowhammer.username || '',
						password: credentialsFromModel.yellowhammer.password || ''
					},
					criteo: {
						username: credentialsFromModel.criteo.username || '',
						password: credentialsFromModel.criteo.password || ''
					},
					infolinks: {
						username: credentialsFromModel.infolinks.username || '',
						password: credentialsFromModel.infolinks.password || ''
					}
				};

			userAdnetworkCredentials.commonRandomPassword = 'xxxxxxxxxx';
			return res.render('credentials', {
				formData: userAdnetworkCredentials
			});
		});
	})
	.post('/credentials', function(req, res) {
		userModel
			.getUserByEmail(req.session.user.email)
			.then(function(user) {
				var userAdnetworkCredentials = user.get('adnetworkCredentials'),
					taboolaPassword = '',
					revcontentPassword = '',
					outbrainPassword = '',
					contentadsPassword = '',
					mediaNetPassword = '',
					yellowhammerPassword = '',
					criteoPassword = '',
					infolinksPassword = '';

				if (!req.body.taboolaPassword || req.body.taboolaPassword === '') {
					taboolaPassword = '';
				} else if (req.body.taboolaPassword === 'xxxxxxxxxx') {
					taboolaPassword = userAdnetworkCredentials.taboola.password;
				} else {
					taboolaPassword = req.body.taboolaPassword;
				}

				if (!req.body.revcontentPassword || req.body.revcontentPassword === '') {
					revcontentPassword = '';
				} else if (req.body.revcontentPassword === 'xxxxxxxxxx') {
					revcontentPassword = userAdnetworkCredentials.revContent.password;
				} else {
					revcontentPassword = req.body.revcontentPassword;
				}

				if (!req.body.outbrainPassword || req.body.outbrainPassword === '') {
					outbrainPassword = '';
				} else if (req.body.outbrainPassword === 'xxxxxxxxxx') {
					outbrainPassword = userAdnetworkCredentials.outBrain.password;
				} else {
					outbrainPassword = req.body.outbrainPassword;
				}

				if (!req.body.contentadsPassword || req.body.contentadsPassword === '') {
					contentadsPassword = '';
				} else if (req.body.contentadsPassword === 'xxxxxxxxxx') {
					contentadsPassword = userAdnetworkCredentials.contentAds.password;
				} else {
					contentadsPassword = req.body.contentadsPassword;
				}

				if (!req.body.medianetPassword || req.body.medianetPassword === '') {
					mediaNetPassword = '';
				} else if (req.body.medianetPassword === 'xxxxxxxxxx') {
					mediaNetPassword = userAdnetworkCredentials.mediaNet.password;
				} else {
					mediaNetPassword = req.body.medianetPassword;
				}

				if (!req.body.yellowhammerPassword || req.body.yellowhammerPassword === '') {
					yellowhammerPassword = '';
				} else if (req.body.yellowhammerPassword === 'xxxxxxxxxx') {
					yellowhammerPassword = userAdnetworkCredentials.yellowhammer.password;
				} else {
					yellowhammerPassword = req.body.yellowhammerPassword;
				}

				if (!req.body.criteoPassword || req.body.criteoPassword === '') {
					criteoPassword = '';
				} else if (req.body.criteoPassword === 'xxxxxxxxxx') {
					criteoPassword = userAdnetworkCredentials.criteo.password;
				} else {
					criteoPassword = req.body.criteoPassword;
				}

				if (!req.body.infolinksPassword || req.body.infolinksPassword === '') {
					infolinksPassword = '';
				} else if (req.body.infolinksPassword === 'xxxxxxxxxx') {
					infolinksPassword = userAdnetworkCredentials.infolinks.password;
				} else {
					infolinksPassword = req.body.infolinksPassword;
				}

				var credentials = {
					taboola: {
						username: req.body.taboolaUsername,
						password: taboolaPassword
					},
					revContent: {
						username: req.body.revcontentUsername,
						password: revcontentPassword
					},
					outBrain: {
						username: req.body.outbrainUsername,
						password: outbrainPassword
					},
					contentAds: {
						username: req.body.contentadsUsername,
						password: contentadsPassword
					},
					mediaNet: {
						username: req.body.medianetUsername,
						password: mediaNetPassword
					},
					yellowhammer: {
						username: req.body.yellowhammerUsername,
						password: yellowhammerPassword
					},
					criteo: {
						username: req.body.criteoUsername,
						password: criteoPassword
					},
					infolinks: {
						username: req.body.infolinksUsername,
						password: infolinksPassword
					}
				};
				req.body = credentials;
				return userModel.saveCredentials(credentials, req.session.user.email);
			})
			.then(function() {
				var user = Array.prototype.slice.call(arguments)[0],
					dataToSend = req.body;
				req.session.user = user;
				dataToSend.commonRandomPassword = 'xxxxxxxxxx';
				return res.render('credentials', {
					profileSaved: true,
					formData: req.body
				});
			})
			.catch(function(e) {
				var dataToSend = req.body;
				dataToSend.commonRandomPassword = 'xxxxxxxxxx';
				if (e instanceof AdPushupError) {
					res.render('credentials', {
						credentialError: e.message,
						formData: dataToSend
					});
				} else if (e.name && e.name === 'CouchbaseError') {
					res.render('credentials', {
						userNotFound: true,
						formData: dataToSend
					});
				}
			});
	})
	.post('/updatePublisherId', function(req, res) {
		return userModel
			.getUserByEmail(req.session.user.email)
			.then(user => {
				let adNetworkSettings = user.get('adNetworkSettings') || [];
				adNetworkSettings[0] = adNetworkSettings[0] || {};
				adNetworkSettings[0].pubId = req.body.pubId;
				adNetworkSettings[0].networkName = adNetworkSettings[0].networkName || 'ADSENSE';
				user.set('adNetworkSettings', adNetworkSettings);
				return user.save();
			})
			.then(() => {
				req.session.user.adNetworkSettings = req.session.user.adNetworkSettings || [];
				req.session.user.adNetworkSettings[0] = req.session.user.adNetworkSettings[0] || {};
				req.session.user.adNetworkSettings[0].pubId = req.body.pubId;
				req.session.user.adNetworkSettings[0].networkName =
					req.session.user.adNetworkSettings[0].networkName || 'ADSENSE';
				return res.send({
					error: false
				});
			})
			.catch(err => {
				console.log(err.message);
				return res.send({
					error: true
				});
			});
	})
	.get('/payment', function(req, res) {
		const getTipaltiUrls = email => {
				var tipaltiConfig = config.tipalti,
					tipaltiUrl = '',
					tipaltiBaseUrl = tipaltiConfig.baseUrl,
					payeeId = encodeURIComponent(
						crypto
							.createHash('md5')
							.update(email)
							.digest('hex')
							.substr(0, 64)
					),
					payer = tipaltiConfig.payerName,
					date = Math.floor(+new Date() / 1000),
					paramsStr =
						'idap=' + payeeId + '&payer=' + payer + '&ts=' + date + '&email=' + encodeURIComponent(email),
					key = tipaltiConfig.key,
					hash = crypto
						.createHmac('sha256', key)
						.update(paramsStr.toString('utf-8'))
						.digest('hex'),
					paymentHistoryUrl = tipaltiConfig.paymentHistoryUrl + paramsStr + '&hashkey=' + hash;

				// date = Math.floor(date / 1000);
				tipaltiUrl = tipaltiBaseUrl + paramsStr + '&hashkey=' + hash;

				return { paymentHistoryUrl, tipaltiUrl };
			},
			email = req.session.user.email;
		return Promise.all([getTipaltiUrls(email), userModel.updateUserPaymentStatus(email)])
			.spread(tipaltiUrls => {
				return res.render('payment', {
					tipaltiUrl: tipaltiUrls.tipaltiUrl,
					paymentHistoryUrl: tipaltiUrls.paymentHistoryUrl
				});
			})
			.catch(err => {
				return res.render('payment', {
					error: 'Some error occurred!'
				});
			});
	})
	.get('/updatePaymentStatusAllUser', function(req, res) {
		var userPromises = function(users) {
			return _.map(users, user => {
				return userModel.updateUserPaymentStatus(user);
			});
		};
		return userModel
			.getAllUsers()
			.then(users => {
				Promise.all(userPromises(users));
				return res.send('done');
			})
			.catch(err => {
				console.log(err);
			});
	});

module.exports = router;
