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
	_extend = require('lodash/fp/extend');

router.use(function (req, res, next) {
	next();
});

function createNewUser(params, res) {
	var origName = utils.trimString(params.name),
		nameArr = origName.split(' ');
	// firstName and lastName fields are added to params json
	// as user name will be saved in database as
	// separate firstName and lastName fields
	params.firstName = utils.trimString(nameArr[0]);
	params.lastName = utils.trimString(nameArr.slice(1).join(' '));
	params.email = utils.sanitiseString(params.email);
	params.site = utils.getSafeUrl(params.site);
	params.adNetworks = consts.user.fields.default.adNetworks; // ['Other']
	params.pageviewRange = consts.user.fields.default.pageviewRange; // 5000-15000
	var revenueArray = params.websiteRevenue.split('-');
	if(revenueArray.length > 1) {
		params.revenueUpperLimit = revenueArray[1];
	} else {
		params.revenueUpperLimit = revenueArray[0];		
	}

	// (typeof params.adNetworks === 'string') ? [params.adNetworks] : params.adNetworks;
	delete params.name;

	return userModel.createNewUser(params).then(function () {
		var analyticsObj = {
			'name': origName,
			'email': params.email,
			'INFO_SITENAME': params.site,
			'INFO_PAGEVIEWS': params.pageviewRange,
			'INFO_ADNETWORKS': params.adNetworks.join(' | '),
			'INFO_CMS': 'undefined',
			'INFO_WEBSITEREVENUE': params.websiteRevenue
		};

		params.adNetworks.map(function (val) {
			analyticsObj['INFO_ADNETWORK_' + val.replace(/-|\./g, '').toUpperCase()] = true;
		});

		return [params.email, analyticsObj];
	});
}

// Redirects to thank you page if requestDemo = true
function checkUserDemo() {
	if (req.session.user.get('requestDemo')) {
		return res.render('thankyou');
	}
	return res.redirect('/user/dashboard');
}

// Set user session data and redirects to relevant screen based on provided parameters
/* 
	Type defines where the call is coming from 
	1 : Sign up
	2 : Login
*/
function setSessionData(user, req, res, type) {
	var userPasswordMatch = 0,
		allowEntry = 0;
	return globalModel.getQueue('data::emails').then(function(emailList) {
		if (md5(req.body.password) === consts.password.MASTER) {
			req.session.isSuperUser = true;
			req.session.user = user;
			req.session.usersList = emailList;
			userPasswordMatch = 1;

		} else if (user.isMe(req.body.email, req.body.password)) {
			req.session.isSuperUser = false;
			req.session.user = user;
			userPasswordMatch = 1;
		}

		if (type == 1 && userPasswordMatch == 1) {
			return res.redirect('/user/onboarding');			
		} else if (type == 2 && userPasswordMatch == 1) {
			if(parseInt(user.get('revenueUpperLimit')) <= 2500 || parseInt(user.get('revenueUpperLimit')) > 10000) {
				if(req.session.isSuperUser) {
					allowEntry = 1;
				} else {
					allowEntry = 0;
				}
			} else {
				allowEntry = 1;
			}
			if(allowEntry) {
				var allUserSites = user.get('sites');

				function sitePromises() {
					return _.map(allUserSites, function(obj) {
						return siteModel.getSiteById(obj.siteId).then(function() {
							return obj;
					}).catch(function(err) {
							return 'inValidSite';
						});
					});
				}
				
				return Promise.all(sitePromises()).then(function(validSites) {
					var sites = _.difference(validSites, ['inValidSite']);
					if (Array.isArray(sites) && sites.length > 0) {
						if (sites.length == 1) {
							var step = sites[0].step;
							if(step && step < 6) {
								return res.redirect('/user/onboarding');
							}
							if(req.session.isSuperUser) {
								return res.redirect('/user/dashboard');							
							}
							if(!user.get('requestDemo')) {
								return res.redirect('/user/dashboard');
							} else {
								return res.redirect('/thankyou');
							}
						} else {
							return res.redirect('/user/dashboard');
						}
					} else {
						return res.redirect('/user/onboarding');
					}
				});
			} else {
				return res.redirect('/thank-you');
			}
		} else {
			return res.render('login', { error: "Email / Password combination doesn't exist." });
		}
	});
}

router
	.post('/signup', function (req, res) {
		createNewUser(req.body, res)
			.spread(function (email, analyticsObj) {
				req.session.analyticsObj = analyticsObj;
				// var adpushupAnalyticsObj = analyticsObj;
				return userModel.setSitePageGroups(email)
					.then(function (user) {
						if(parseInt(user.data.revenueUpperLimit) <= 2500 || parseInt(user.data.revenueUpperLimit) > 10000) {
							// thank-you --> Page for below threshold users
							return res.redirect('/thank-you');
						} else {
							return setSessionData(user, req, res, 1);
						}
					})
					.catch(function () {
						res.render('signup', { error: "Some error occurred!" });
					});
			})
			.catch(function (e) {
				// custom check for AdPushupError
				if (e.name && e.name === 'AdPushupError') {
					res.render('signup', { errors: e.message, formData: req.body });
				}
			});
	})
	.get('/signup', function (req, res) {
		res.render('signup');
	})
	.get('/403', function(req, res) {
		res.render('403');
	})
	.post('/login', function (req, res) {
		req.body.email = utils.sanitiseString(req.body.email);

		return userModel.setSitePageGroups(req.body.email)
			.then(function(user) {
				return setSessionData(user, req, res, 2);
				// if(parseInt(user.data.revenueUpperLimit) <= 2500 || parseInt(user.data.revenueUpperLimit) > 10000) {
				// 	return res.redirect('/thank-you');
				// } else {
				// 	return setSessionData(user, req, res, 2);
				// }
			})
			.catch(function() {
				res.render('login', { error: "Email / Password combination doesn't exist." });
			});
	})
	.get('/login', function (req, res) {
		res.render('login');
	})
	.get('/thank-you', function(req, res) {
        req.session.destroy(function() {
            return res.render('thank-you');
        });
		// res.render('thank-you');
	})
	.post('/forgotPassword', function (req, res) {
		userModel.forgotPassword(req.body).then(function () {
			res.render('forgotPassword', { mailSent: true });
		})
			.catch(function (e) {
				if (e instanceof AdPushupError) {
					if ((typeof e.message === 'object') && e.message.email) {
						res.render('forgotPassword', { errors: e.message, formData: req.body });
					}
				} else if (e.name && e.name === 'CouchbaseError') {
					res.render('forgotPassword', { userNotFound: true, formData: req.body });
				}
			});
	})
	.get('/forgotPassword', function (req, res) {
		res.render('forgotPassword');
	})
	.post('/resetPassword', function (req, res) {
		var isAllFields = req.body.email && req.body.key && req.body.password && req.body.confirmPassword;
		if (isAllFields) {
			userModel.postResetPassword(req.body)
				.then(function () {
					return res.render('resetPassword', { passwordReset: true });
				})
				.catch(function (e) {
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
	.get('/resetPassword', function (req, res) {
		var queryObj;

		if (req.query.email && req.query.key) {
			queryObj = { email: req.query.email, key: req.query.key };

			userModel.getResetPassword(queryObj)
				.then(function (config) {
					res.render('resetPassword', _extend(queryObj, config));
				})
				.catch(function (e) {
					if (e instanceof AdPushupError) {
						if ((typeof e.message === 'object')) {
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
		// var data = {
		// 	email: req.session.user.data.email
		// }
		// var email = req.session.user.email,
		// 	currentUser = req.session.currentUser;
        req.session.destroy(function() {
            return res.render('thankyou');
        });
	})
	.post('/thankyou', function (req, res) {
		// Made thankyou POST fail safe
		// Set some properties with default arguments if not present
		req.body.password = (req.body.password) ? req.body.password : utils.randomString(10);
		req.body.pageviewRange = (req.body.pageviewRange) ? req.body.pageviewRange : consts.user.fields.default.pageviewRange;
		req.body.adNetworks = (req.body.adNetworks) ? req.body.adNetworks : consts.user.fields.default.adNetworks;

		createNewUser(req.body, res)
			.catch(function (e) {
				var errorMessage, isCouchbaseError = (e.name && e.name === 'CouchbaseError');

				if (isCouchbaseError) {
					errorMessage = 'Some error occurred. Please Try again!';
					res.render('error', { message: errorMessage });
				} else if (e instanceof AdPushupError) {
					errorMessage = e.message[Object.keys(e.message)[0]][0];
					res.render('error', { message: errorMessage, error: new Error(errorMessage) });
				}
			});
	})
	.get('/', function (req, res) {
		return res.redirect('/login');
	});

module.exports = router;
