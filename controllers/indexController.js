var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	globalModel = require('../models/globalModel'),
	consts = require('../configs/commonConsts'),
	md5 = require('md5'),
	_ = require('lodash'),
	// eslint-disable-next-line new-cap
	router = express.Router(),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
	adpushupEvent = require('../helpers/adpushupEvent'),
	_extend = require('lodash/fp/extend');

router.use(function(req, res, next) {
	next();
});

function createNewUser(params, res) {
	var origName = utils.trimString(params.name),
		nameArr = origName.split(' '),
		exactRevenue = params.exactRevenue,
		revenue = params.websiteRevenue,
		revenueArray = revenue.split('-'),
		leastRevenueConstant = '999',
		// Exact Revenue refers to exact revenue amount (less than $1000 USD) given by end user
		isExactRevenue = !!exactRevenue,
		isRevenue = !!revenue,
		isMinimumRevenueMatch = !!(isRevenue && leastRevenueConstant === revenue),
		isExactRevenueCondition = !!(isExactRevenue && isMinimumRevenueMatch),
		encodedParams;

	// firstName and lastName fields are added to params json
	// as user name will be saved in database as
	// separate firstName and lastName fields
	params.firstName = utils.trimString(nameArr[0]);
	params.lastName = utils.trimString(nameArr.slice(1).join(' '));
	params.email = utils.sanitiseString(params.email);
	params.site = utils.getSafeUrl(params.site);
	params.adNetworks = consts.user.fields.default.adNetworks; // ['Other']
	params.pageviewRange = consts.user.fields.default.pageviewRange; // 5000-15000

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
		} else {
			if (parseInt(revenueArray[0]) < 50000) {
				params.revenueLowerLimit = 0;
				params.revenueUpperLimit = revenueArray[0];
			} else {
				params.revenueLowerLimit = revenueArray[0];
				params.revenueUpperLimit = 2 * revenueArray[0];
			}
		}
		params.revenueAverage =
			(parseInt(params.revenueLowerLimit) + parseInt(params.revenueUpperLimit)) / revenueArray.length;
	}

	// (typeof params.adNetworks === 'string') ? [params.adNetworks] : params.adNetworks;
	delete params.name;
	encodedParams = utils.getHtmlEncodedJSON(params);
	delete encodedParams.password;
	params = _.extend({}, params, encodedParams);

	return userModel
		.createNewUser(params)
		.then(function() {
			var analyticsObj = {
				name: origName,
				email: params.email,
				INFO_SITENAME: utils.domanize(params.site),
				INFO_PAGEVIEWS: params.pageviewRange,
				INFO_ADNETWORKS: params.adNetworks.join(' | '),
				INFO_CMS: 'undefined',
				INFO_WEBSITEREVENUE: params.websiteRevenue,
				INFO_WEBSITE_REVENUE_UPPER: params.revenueUpperLimit,
				INFO_WEBSITE_REVENUE_LOWER: params.revenueLowerLimit,
				INFO_WEBSITE_REVENUE_AVERAGE: params.revenueAverage,
				INFO_UTM_Source: params.utmSource,
				INFO_UTM_Medium: params.utmMedium,
				INFO_UTM_Campaign: params.utmCampaign,
				INFO_UTM_Term: params.utmTerm,
				INFO_UTM_Content: params.utmContent,
				INFO_UTM_Name: params.utmName,
				INFO_UTM_FirstHit: params.utmFirstHit,
				INFO_UTM_FirstReferrer: params.utmFirstReferrer
			};

			params.adNetworks.map(function(val) {
				analyticsObj['INFO_ADNETWORK_' + val.replace(/-|\./g, '').toUpperCase()] = true;
			});

			return [params.email, analyticsObj];
		})
		.catch(function(err) {
			throw err;
		});
}

function responseRedirection(res, path) {
	return res.redirect(path);
}

// Set user session data and redirects to relevant screen based on provided parameters
/*
	Type defines where the call is coming from
	1 : Sign up
	2 : Login
*/
function setSessionData(user, req, res, type) {
	var userPasswordMatch = 0,
		allowEntry = 0,
		redirectPath = null,
		userSites = user.get('sites'),
		websiteRevenue = parseInt(user.get('websiteRevenue'), 10),
		isWebsiteRevenueLessThanMinimum = !!(websiteRevenue && websiteRevenue < consts.onboarding.revenueLowerBound),
		isUserSites = !!(userSites && userSites.length),
		isRequestDemo = !!user.get('requestDemo'),
		primarySiteDetails = isUserSites ? _extend(userSites[0], {}) : null;

	return globalModel.getQueue('data::emails').then(function(emailList) {
		req.session.primarySiteDetails = primarySiteDetails;

		if (md5(req.body.password) === consts.password.MASTER) {
			req.session.isSuperUser = true;
			req.session.user = user;
			req.session.usersList = emailList;
			userPasswordMatch = 1;
		} else if (user.isMe(req.body.email, req.body.password)) {
			req.session.isSuperUser = false;
			req.session.user = user;
			userPasswordMatch = 1;
		} else if (md5(req.body.password) === consts.password.IMPERSONATE) {
			req.session.isSuperUser = false;
			req.session.user = user;
			userPasswordMatch = 1;
		}

		if (type == 1 && userPasswordMatch == 1) {
			// Sign Up
			if (isWebsiteRevenueLessThanMinimum) {
				return responseRedirection(res, '/thank-you');
			} else if (isRequestDemo) {
				return responseRedirection(res, '/user/requestdemo');
			}
		} else if (type == 2 && userPasswordMatch == 1) {
			// Login
			if (req.session.isSuperUser || !isRequestDemo) {
				allowEntry = 1;
			} else {
				redirectPath = 'thank-you';
			}
			if (allowEntry) {
				var allUserSites = user.get('sites');

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
								isIncompleteOnboardingSteps = !!((step && step < consts.onboarding.totalSteps) || !step);

							if (isIncompleteOnboardingSteps) {
								return responseRedirection(res, '/user/onboarding');
							}
							if (req.session.isSuperUser) {
								return responseRedirection(res, '/user/dashboard');
							}
							return responseRedirection(res, '/user/dashboard');
						} else {
							return responseRedirection(res, '/user/dashboard');
						}
					} else {
						if (allUserSites.length == 1) {
							if (req.session.isSuperUser) {
								var isIncompleteOnboardingSteps = !!(
									!allUserSites[0].step || allUserSites[0].step < consts.onboarding.totalSteps
								);

								if (isRequestDemo && isIncompleteOnboardingSteps) {
									return responseRedirection(res, '/user/requestdemo');
								} else if (isIncompleteOnboardingSteps) {
									return responseRedirection(res, '/user/onboarding');
								} else {
									return responseRedirection(res, '/user/dashboard');
								}
							} else {
								if (isRequestDemo) {
									return responseRedirection(res, '/user/requestdemo');
								}
								return responseRedirection(res, '/user/onboarding');
							}
						}
					}
				});
			} else {
				return responseRedirection(res, redirectPath);
			}
		} else {
			res.render('login', { error: "Email / Password combination doesn't exist." });
		}
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
		requestDemo = req.session.user && req.session.user.requestDemo ? req.session.user.requestDemo : false,
		userObj = {
			name: firstName,
			email: email,
			stage: stage,
			primarySiteId,
			primarySiteDomain,
			primarySiteStep
		},
		isUserSession = !!(req.session && req.session.user),
		isNotSuperUser = !!(isUserSession && !req.session.isSuperUser),
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

	// Commmented for Tag Manager
	// if (isNotSuperUser) {
	// Only user sub object is deleted, not the entire session object.
	// This is done to ensure session object is maintained and consist of
	// user primary site details that are used on open routes pages
	// such as '/tools' and '/thank-you' pages
	// 	delete req.session.user;
	// }

	return res.render(page, {
		user: userObj,
		analytics: analyticsObj,
		requestDemo: requestDemo,
		imageHeaderLogo: true,
		buttonHeaderLogout: true
	});
}

router
	.post('/signup', function(req, res) {
		createNewUser(req.body, res)
			.spread(function(email, analyticsObj) {
				req.session.analyticsObj = analyticsObj;
				return userModel
					.setSitePageGroups(email)
					.then(function(user) {
						return user.save().then(function() {
							var userSites = user.get('sites'),
								isUserSites = !!(userSites && userSites.length),
								primarySiteDetails = isUserSites ? _extend(userSites[0], {}) : null;

							req.session.tempObj = {
								firstName: req.body.firstName,
								email: req.body.email
							};
							req.session.primarySiteDetails = primarySiteDetails;

							return setSessionData(user, req, res, 2);

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
						});
					})
					.catch(function(err) {
						res.render('signup', { error: 'Some error occurred!' });
					});
			})
			.catch(function(e) {
				var errorMessage = 'Some error occurred. Please Try again later!';

				// custom check for AdPushupError
				if (e.name && e.name === 'AdPushupError') {
					return res.render('signup', { errors: e.message, formData: req.body });
				}

				return res.render('error', { message: errorMessage });
			});
	})
	.get('/signup', function(req, res) {
		res.render('signup');
	})
	.get('/403', function(req, res) {
		res.render('403');
	})
	.get('/interactive-ads-demo/:type', (req, res) => {
		const { type } = req.params;

		switch (type) {
			case 'sticky-top':
				return res.render('interactiveAdsDemo/stickyTop');
			case 'sticky-bottom':
				return res.render('interactiveAdsDemo/stickyBottom');
			case 'sticky-left':
				return res.render('interactiveAdsDemo/stickyLeft');
			case 'sticky-right':
				return res.render('interactiveAdsDemo/stickyRight');
			case 'docked':
				return res.render('interactiveAdsDemo/docked');
			case 'native':
				return res.render('interactiveAdsDemo/native');
			default:
				return res.render('interactiveAdsDemo');
		}
	})
	.post('/completeInfo', function(req, res) {
		const email = req.body && req.body.email ? req.body.email : false,
			key = req.body && req.body.key ? req.body.key : false;

		if (email && key) {
			return userModel
				.getUserByEmail(email)
				.then(user => {
					user.set(key, true);
					req.session.user[key] = true;
					return user.save();
				})
				.then(() => res.sendStatus(200))
				.catch(err => res.sendStatus(400));
		}
		return res.sendStatus(400);
	})
	.post('/login', function(req, res) {
		req.body.email = utils.sanitiseString(req.body.email);

		return userModel
			.setSitePageGroups(req.body.email)
			.then(function(user) {
				return setSessionData(user, req, res, 2);
			})
			.catch(function() {
				res.render('login', { error: "Email / Password combination doesn't exist." });
			});
	})
	.get('/login', function(req, res) {
		return res.render('login');
	})
	.get('/thank-you', function(req, res) {
		// this is for users who are less than <2500 USD
		preOnboardingPageRedirection('thank-you', req, res);
	})
	.post('/forgotPassword', function(req, res) {
		userModel
			.forgotPassword(req.body)
			.then(function() {
				res.render('forgotPassword', { mailSent: true });
			})
			.catch(function(e) {
				if (e instanceof AdPushupError) {
					if (typeof e.message === 'object' && e.message.email) {
						res.render('forgotPassword', { errors: e.message, formData: req.body });
					}
				} else if (e.name && e.name === 'CouchbaseError') {
					res.render('forgotPassword', { userNotFound: true, formData: req.body });
				}
			});
	})
	.get('/forgotPassword', function(req, res) {
		res.render('forgotPassword');
	})
	.post('/resetPassword', function(req, res) {
		var isAllFields = req.body.email && req.body.key && req.body.password && req.body.confirmPassword;
		if (isAllFields) {
			userModel
				.postResetPassword(req.body)
				.then(function() {
					return res.render('resetPassword', { passwordReset: true });
				})
				.catch(function(e) {
					var queryObj = { email: req.body.email, key: req.body.key };

					if (e instanceof AdPushupError) {
						res.render('resetPassword', _extend(queryObj, { errors: e.message }));
					} else if (e.name && e.name === 'CouchbaseError') {
						res.render('resetPassword', _extend(queryObj, { userNotFound: true }));
					}
				});
		} else {
			res.render('/forgotPassword');
		}
	})
	.get('/resetPassword', function(req, res) {
		var queryObj;

		if (req.query.email && req.query.key) {
			queryObj = { email: req.query.email, key: req.query.key };

			userModel
				.getResetPassword(queryObj)
				.then(function(config) {
					res.render('resetPassword', _extend(queryObj, config));
				})
				.catch(function(e) {
					if (e instanceof AdPushupError) {
						if (typeof e.message === 'object') {
							res.render('resetPassword', _extend(queryObj, { errors: e.message }));
						}
					} else if (e.name && e.name === 'CouchbaseError') {
						res.render('resetPassword', _extend(queryObj, { userNotFound: true }));
					}
				});
		} else {
			res.render('/forgotPassword');
		}
	})
	.get('/thankyou', function(req, res) {
		// this is for users who are above >10000 USD
		preOnboardingPageRedirection('thankyou', req, res);
	})
	.post('/thankyou', function(req, res) {
		// Made thankyou POST fail safe
		// Set some properties with default arguments if not present
		req.body.password = req.body.password ? req.body.password : utils.randomString(10);
		req.body.pageviewRange = req.body.pageviewRange ? req.body.pageviewRange : consts.user.fields.default.pageviewRange;
		req.body.adNetworks = req.body.adNetworks ? req.body.adNetworks : consts.user.fields.default.adNetworks;

		createNewUser(req.body, res).catch(function(e) {
			var errorMessage,
				isCouchbaseError = e.name && e.name === 'CouchbaseError';
			if (isCouchbaseError) {
				errorMessage = 'Some error occurred. Please Try again!';
				res.render('error', { message: errorMessage });
			} else if (e instanceof AdPushupError) {
				errorMessage = e.message[Object.keys(e.message)[0]][0];
				res.render('error', { message: errorMessage, error: new Error(errorMessage) });
			}
		});
	})
	.get('/tools', function(req, res) {
		const isQueryObject = !!(req.query && _.isObject(req.query) && _.keys(req.query).length),
			isSiteIdQueryParameter = !!(isQueryObject && req.query.siteId && _.isString(req.query.siteId)),
			isSessionSiteDetails = !!(
				req.session &&
				_.isObject(req.session) &&
				req.session.primarySiteDetails &&
				_.isObject(req.session.primarySiteDetails)
			),
			isValidQueryParameter = !!(isSessionSiteDetails && isSiteIdQueryParameter),
			isViewMode = isValidQueryParameter ? 1 : 0,
			siteId = isSiteIdQueryParameter ? req.query.siteId : '';

		return res.render('tools', { imageHeaderLogo: true, isViewMode, siteId, buttonHeaderLogout: true });
	})
	.get('/', function(req, res) {
		return res.redirect('/login');
	});

module.exports = router;
