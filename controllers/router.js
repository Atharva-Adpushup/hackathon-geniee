var indexController = require('./indexController'),
	userController = require('./userController'),
	dataController = require('./dataController'),
	proxyController = require('./proxyController'),
	reportsController = require('./reportController'),
	genieeApiController = require('./genieeApiController'),
	pageGroupController = require('./pageGroupController');

module.exports = function(app) {
	// Always invoked middleware added to check for user demo
	// If user requestDemo is true, redirects to thankyou page
	app.use(function(req, res, next) {
		if (!req.session.isSuperUser && req.session.user && req.session.user.requestDemo && (req.originalUrl !== '/user/logout')) {
			return res.render('thankyou', {
				isUserRequestDemo: true
			});
		}
		next();
	});

	app.use('/user/reports/', function(req, res, next) {
		if (!req.session || !req.session.user) {
			return res.redirect('/login');
		}
		next();
	}, reportsController);

	app.use('/geniee/', function(req, res, next) {
		// if (!req.session || !req.session.user) {
		// 	return res.redirect('/login');
		// }
		next();
	}, genieeApiController);

	app.use('/user/pagegroup/', function(req, res, next) {
		// if (!req.session || !req.session.user) {
		// 	return res.redirect('/login');
		// }
		next();
	}, pageGroupController);

	app.use('/user/', function(req, res, next) {
		if (!req.session || !req.session.user) {
			return res.redirect('/login');
		}
		next();
	}, userController);

	app.use('/proxy/', function(req, res, next) {
		if (!req.session || !req.session.user) {
			res.json({ success: 0, message: 'Not Authenticated' });
		}
		next();
	}, proxyController);

	app.use('/data/', function(req, res, next) {
		/* if (!req.session || !req.session.user) {
		return res.redirect("/login");
		}*/
		next();
	}, dataController);

	app.use('/', function(req, res, next) {
		if ((req.path.indexOf('/signup') !== -1 || req.path.indexOf('/forgotPassword') !== -1 || req.path.indexOf('/login') !== -1) && req.session && req.session.user) {
			return res.redirect('/user/dashboard');
		}
		next();
	}, indexController);


	app.use(function(req, res) {
		res.status(404);

		// respond with html page
		if (req.accepts('html')) {
			res.render('404', { url: req.url });
			return;
		}
	});
};

