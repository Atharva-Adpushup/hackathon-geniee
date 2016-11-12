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

	app.use('/site/:siteId/reports/', function (req, res, next) {
		// if (!req.session || !req.session.user) {
		// 	return res.redirect('/login');
		// }
		next();
	}, reportsController);

	app.use('/genieeApi/', function (req, res, next) {
		debugger;
		next();
	}, apiController);

	app.use('/api/', function (req, res, next) {
		// if (!req.session || !req.session.user) {
		// 	return res.redirect('/login');
		// }
		next();
	}, apiController);

	app.use('/user/', function (req, res, next) {
		// if (!req.session || !req.session.user) {
		// 	return res.redirect('/login');
		// }
		next();
	}, userController);

	app.use('/user/site/', function (req, res, next) {
		// if (!req.session || !req.session.user) {
		// 	return res.redirect('/login');
		// }
		next();
	}, siteController);

	app.use('/user/site/:siteId/pagegroup/', function (req, res, next) {
		// if (!req.session || !req.session.user) {
		// 	return res.redirect('/login');
		// }
		next();
	}, pageGroupController);



	app.use('/proxy/', function (req, res, next) {
		if (!req.session || !req.session.user) {
			res.json({ success: 0, message: 'Not Authenticated' });
		}
		next();
	}, proxyController);

	app.use('/data/', function (req, res, next) {
		/* if (!req.session || !req.session.user) {
		return res.redirect("/login");
		}*/
		next();
	}, dataController);

	app.use('/', function (req, res, next) {
		console.log(req);
		res.send("test");
		//return res.redirect('/site/' + app.locals.siteId + '/dashboard');
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

