var indexController = require('./indexController'),
	userController = require('./userController'),
	dataController = require('./dataController'),
	proxyController = require('./proxyController'),
	siteController = require('./siteController'),
	reportsController = require('./reportController'),
	apiController = require('./apiController'),
	pageGroupController = require('./pageGroupController');

module.exports = function (app) {
	// Always invoked middleware added to check for user demo
	// If user requestDemo is true, redirects to thankyou page
	app.use(function (req, res, next) {
		if (!req.session.isSuperUser && req.session.user && req.session.user.requestDemo && (req.originalUrl !== '/user/logout')) {
			return res.render('thankyou', {
				isUserRequestDemo: true
			});
		}
		next();
	});

	app.use(function (req, res, next) {
		if ((req.path.indexOf('/user') !== -1 || req.path.indexOf('/api') !== -1 || req.path.indexOf('/proxy') !== -1) && (!req.session || !req.session.user)) {
			return res.redirect('/login');
		}
		next();
	});


	/*********** Under Login URL's ***************/

	app.use('/user/', function (req, res, next) {
		next();
	}, userController);

	app.use('/user/site/', function (req, res, next) {
		// session check already done in base user route
		next();
	}, siteController);

	app.use('/user/site/:siteId/pagegroup/', function (req, res, next) {
		next();
	}, pageGroupController);

	app.use('/user/site/:siteId/reports/', function (req, res, next) {
		next();
	}, reportsController);

	app.use('/user/reports/', function (req, res, next) {
		next();
	}, reportsController);

	app.use('/proxy/', function (req, res, next) {
		next();
	}, proxyController);

	app.use('/api/', function (req, res, next) {
		next();
	}, apiController);


	/*****************Login URL's End *******************/

	app.use('/genieeApi/', function (req, res, next) {
		/* @TODO Implement some kind of check to verify geniee Call */
		req.isGenieeSite = true;
		next();
	}, apiController);

	app.use('/data/', function (req, res, next) {
		/* if (!req.session || !req.session.user) {
		return res.redirect("/login");
		}*/
		next();
	}, dataController);

	app.use('/', function (req, res, next) {
		if ((req.path.indexOf('/signup') !== -1 || req.path.indexOf('/forgotPassword') !== -1 || req.path.indexOf('/login') !== -1) && req.session && req.session.user) {
			return res.redirect('/user/dashboard');
		}
		next();
	}, indexController);


	app.use(function (req, res) {
		res.status(404);
		// respond with html page
		if (req.accepts('html')) {
			res.render('404', { url: req.url });
			return;
		}
	});
};

