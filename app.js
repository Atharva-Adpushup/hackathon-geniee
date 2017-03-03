var express = require('express'),
	app = express(),
	fs = require('fs'),
	FileStreamRotator = require('file-stream-rotator'),
	server = require('http').createServer(app),
	path = require('path'),
	compression = require('compression'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	CouchbaseStore = require('connect-couchbase')(session),
	config = require('./configs/config'),
	consts = require('./configs/commonConsts'),
	utils = require('./helpers/utils'),
	couchBaseService = require('./helpers/couchBaseService'),
	logger = require('./helpers/logger/index'),
	accessLogStream = FileStreamRotator.getStream({
		date_format: 'YYYYMMDD',
		filename: config.development.LOGS_DIR + '/access-%DATE%.log',
		frequency: '1mn',
		verbose: false
	}),
	apiLogStream = FileStreamRotator.getStream({
		date_format: 'YYYYMMDD',
		filename: config.development.LOGS_DIR + '/api-access-%DATE%.log',
		frequency: '1mn',
		verbose: false
	}),
	// couchbase store
	couchbaseStore = new CouchbaseStore({
		bucket: config.couchBase.DEFAULT_BUCKET,
		password: config.couchBase.DEFAULT_BUCKET_PASSWORD,
		host: config.couchBase.HOST + ':8091',
		connectionTimeout: 5000,
		operationTimeout: 2000,
		ttl: 86400,
		prefix: 'sess::'
	});
	

//require('./services/genieeAdSyncService/index');
//require('./services/hbSyncService/index');

// Enable compression at top
app.use(compression());

process.on('uncaughtException', function (err) {
	// handle the error safely
	console.log(err);
});


// set static directory
app.use(express.static(path.join(__dirname, 'public')));

process.env.NODE_ENV = config.development.HOST_ENV;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Setup the logger file
fs.existsSync(config.development.LOGS_DIR) || fs.mkdirSync(config.development.LOGS_DIR);

// Use combined morgan logging for all non-genieeApi requests and stream to log file
// app.use(logger('combined', {
// 	skip: function (req, res) { 
// 		return req.baseUrl === '/genieeApi';
// 	}, stream: accessLogStream
// }));

// // Use combined morgan logging for all genieeApi requests and stream to log file
// app.use(logger('combined', {
// 	skip: function (req, res) { 
// 		return req.baseUrl !== '/genieeApi';
// 	}, stream: apiLogStream
// }));

// // Use dev morgan logging for all genieeApi requests and stream to stdout
// app.use(logger('dev', {
// 	skip: function (req, res) { 
// 		return req.baseUrl !== '/genieeApi';
// 	}
// }));

// Set logger options
logger.options({
	stream: './logs/test.log',
	logToStdOut: false
});

 // Initialise logger middleware module
app.use(logger.init);

// setup basics of express middlewares
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());

couchBaseService.connectToAppBucket().then(function () {
	// set couchbaseStore for session storage
	couchbaseStore.on('disconnect', function () {
		console.log('Couchbase store is disconnected now: ', arguments);
	});

	app.use(session({
		store: couchbaseStore,
		secret: config.couchBase.SESSION_SECRET,
		name: 'connectionId',
		cookie: { maxAge: 24 * 60 * 60 * 1000 }, // stay open for 1 day of inactivity
		resave: false,
		saveUninitialized: false
	}));


	// Setting template local variables for jade
	app.use(function (req, res, next) {
		app.locals.isSuperUser = (req.session.isSuperUser) ? true : false;
		app.locals.usersList = (req.session.usersList) ? req.session.usersList : [];
		app.locals.environment = config.development.HOST_ENV;
		app.locals.currentUser = (req.session.user) ? req.session.user : {};
		app.locals.currentSiteId = (req.session.siteId) ? req.session.siteId : null;
		app.locals.partner = (req.session.partner) ? req.session.partner : null;
		// unSavedSite, template local for showing unsaved site
		// prefilled in 'Add a site' modal's url field
		app.locals.unSavedSite = (Array.isArray(req.session.unSavedSite) && req.session.unSavedSite.length > 0) ? req.session.unSavedSite : '';
		next();
	});
	app.locals.utils = utils;
	app.locals.config = config;
	app.locals.consts = consts;

	// Use main controller module as router init
	require('./controllers/router')(app);


	// error handlers

	// development error handler
	// will print stacktrace
	if (app.get('env') === 'development') {
		app.locals.pretty = true;
		app.use(function (err, req, res) {
			res.status(err.status || 500);
			res.json({
				message: err.message,
				error: err,
				stacktrace: err.stack
			});
		});
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function (err, req, res) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	});

	server.listen(config.development.HOST_PORT);
	console.log('Server listening at port : ' + config.development.HOST_PORT);
}).catch(function (err) {
	console.log('err: ' + err.toString());
});

module.exports = app;
