var indexController = require('./indexController'),
	userController = require('./userController'),
	dataController = require('./dataController'),
	proxyController = require('./proxyController'),
	siteController = require('./siteController'),
	reportsController = require('./reportController'),
	apiController = require('./apiController'),
	pageGroupController = require('./pageGroupController'),
	authController = require('./authController'),
	opsController = require('./opsController'),
	commonConsts = require('../configs/commonConsts'),
	_ = require('lodash');

module.exports = function(app) {
	// Always invoked middleware added to check for user demo
	// If user requestDemo is true, redirects to thankyou page
	// app.use(function(req, res, next) {
	//     if (!req.session.isSuperUser &&
	//         req.session.user &&
	//         req.session.user.userType !== 'partner' &&
	//         req.session.user.requestDemo &&
	//         (req.originalUrl !== '/user/logout')) {
	//         return res.render('thankyou', {
	//             isUserRequestDemo: true
	//         });
	//     }
	//     next();
	// });

	app.use(function(req, res, next) {
		function isOpenRoute() {
			return _.find(['/tools', '/user/reports/generate'], function(route) {
				return req.url.indexOf(route) !== -1;
			})
				? true
				: false;
		}

		function isAuthorised() {
			return _.find(
				[
					'/ops',
					'/user/site',
					'/genieeApi',
					'/user/connectGoogle',
					'/user/requestOauth',
					'/user/oauth2callback',
					'/data',
					'proxy',
					'/authenticate'
				],
				function(route) {
					return req.url.indexOf(route) !== -1;
				}
			)
				? true
				: false;
		}

		const isSessionInvalid = !!(!req.session || !req.session.user),
			isOpenRouteValid = isOpenRoute();

		if (isOpenRouteValid) {
			return next();
		}

		if ((req.originalUrl.indexOf('/user') !== -1 || req.originalUrl.indexOf('/proxy') !== -1) && isSessionInvalid) {
			return res.redirect('/login');
		}

		if (req.session && req.session.partner === 'geniee' && !isAuthorised()) {
			if (req.url.indexOf('.map') == -1) {
				req.session.destroy(function() {
					return res.redirect('/403');
				});
				return;
			}
		}
		next();
	});

	/*********** Under Login URL's ***************/
	app.use(
		'/user/',
		function(req, res, next) {
			next();
		},
		userController
	);

	app.use(
		'/user/site/',
		function(req, res, next) {
			// session check already done in base user route
			next();
		},
		siteController
	);

	app.use(
		'/user/site/:siteId/pagegroup/',
		function(req, res, next) {
			next();
		},
		pageGroupController
	);

	app.use(
		'/user/site/:siteId/reports/',
		function(req, res, next) {
			next();
		},
		reportsController
	);

	app.use(
		'/user/reports/',
		function(req, res, next) {
			next();
		},
		reportsController
	);

	app.use(
		'/proxy/',
		function(req, res, next) {
			next();
		},
		proxyController
	);

	app.use(
		'/ops/',
		function(req, res, next) {
			next();
		},
		opsController
	);

	/*****************Login URL's End *******************/

	app.use(
		'/authenticate/',
		function(req, res, next) {
			next();
		},
		authController
	);

	app.use(
		'/genieeApi/',
		function(req, res, next) {
			/* @TODO Implement some kind of check to verify geniee Call */
			req.isGenieeSite = true;
			next();
		},
		apiController
	);

	app.use(
		'/data/',
		function(req, res, next) {
			/* if (!req.session || !req.session.user) {
		return res.redirect("/login");
		}*/
			next();
		},
		dataController
	);

	app.use(
		'/',
		function(req, res, next) {
			if (
				(req.path.indexOf('/signup') !== -1 ||
					req.path.indexOf('/forgotPassword') !== -1 ||
					req.path.indexOf('/login') !== -1) &&
				req.session &&
				req.session.user
			) {
				if (req.path.indexOf('/login') !== -1) {
					var sites = req.session.user.sites,
						step = sites[0].step,
						isIncompleteOnboardingSteps = !!(!step || step < commonConsts.onboarding.totalSteps),
						isRequestDemo = !!req.session.user.requestDemo;

					if (sites.length > 1) {
						return res.redirect('/user/dashboard');
					} else if (isRequestDemo && isIncompleteOnboardingSteps) {
						return res.redirect('/user/requestdemo');
					} else if (isIncompleteOnboardingSteps) {
						return res.redirect('/user/onboarding');
					} else {
						return res.redirect('/user/dashboard');
					}
				}
				return res.redirect('/user/dashboard');
			}
			next();
		},
		indexController
	);

	app.use(function(req, res) {
		res.status(404);
		// respond with html page
		if (req.accepts('html')) {
			res.render('404', { url: req.url });
			return;
		}
	});
};
