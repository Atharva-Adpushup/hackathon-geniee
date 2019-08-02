require('dotenv').config();

// Set Base Directory
global.__basedir = __dirname;
const express = require('express');
const fs = require('fs');
const server = require('http').createServer(app);
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const CouchbaseStore = require('connect-couchbase')(session);

const config = require('./configs/config');
const consts = require('./configs/commonConsts');
const languageSupport = require('./i18n/language-mapping');
const utils = require('./helpers/utils');
const couchBaseService = require('./helpers/couchBaseService');
const woodlotMiddlewareLogger = require('woodlot').middlewareLogger;
const woodlotEvents = require('woodlot').events;
const uuid = require('uuid');
const locale = require('locale');
const helmet = require('helmet');

const app = express();

// couchbase store
const couchbaseStore = new CouchbaseStore({
	db: couchBaseService.cluster.openBucket(config.couchBase.DEFAULT_BUCKET),
	host: `${config.couchBase.HOST}:8091`,
	connectionTimeout: 15000,
	operationTimeout: 10000,
	ttl: 86400,
	prefix: 'sess::'
});

// Set Node process environment
process.env.NODE_ENV = config.environment.HOST_ENV;

if (
	process.env.NODE_ENV === consts.environment.production ||
	process.env.NODE_ENV === consts.environment.staging
) {
	require('./services/genieeAdSyncService/index');
	// require('./services/hbSyncService/index');
}

// Enable compression at top
app.use(compression());
// Locale support
app.use(locale(languageSupport));
app.use(
	helmet({
		hsts: {
			setIf: () => false
		}
	})
);
process.on('uncaughtException', err => {
	// handle the error safely
	console.log(err);
});

// set static directory
app.use(express.static(path.join(__dirname, 'clientDist')));
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Setup the logger file
fs.existsSync(config.environment.LOGS_DIR) || fs.mkdirSync(config.environment.LOGS_DIR);

// setup basics of express middlewares
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());

// Initialise woodlot module for geniee api HTTP logging
app.use(
	woodlotMiddlewareLogger({
		streams: ['./logs/geniee-api.log'],
		stdout: false,
		routes: {
			whitelist: ['/genieeApi'],
			strictChecking: false
		}
	})
);

// Initialise woodlot module for geniee report api HTTP logging
app.use(
	woodlotMiddlewareLogger({
		streams: ['./logs/geniee-report-api.log'],
		stdout: false,
		routes: {
			whitelist: ['/reports/performance'],
			strictChecking: false
		}
	})
);

// Write log to couchbase database on woodlot's 'reqErr' event
woodlotEvents.on('err', log => {
	if ('name' in log.message && log.message.name === 'GenieeAPI') {
		const logData = log.message;
		couchBaseService
			.connectToBucket('apGlobalBucket')
			.then(appBucket =>
				appBucket.insertPromise(`slog::${uuid.v4()}`, {
					date: +new Date(),
					source: 'Geniee API Logs',
					message: `${logData.method} ${logData.url}`,
					type: 3,
					details: `N/A`,
					debugData: logData.debugData
				})
			)
			.then(success => {
				// console.log('Log added');
			})
			.catch(err => {
				console.log('Error writing log to database');
			});
	}
});

couchBaseService
	.connectToAppBucket()
	.then(() => {
		// set couchbaseStore for session storage
		couchbaseStore.on('disconnect', function() {
			console.log('Couchbase store is disconnected now: ', arguments);
		});

		app.use(
			session({
				store: couchbaseStore,
				secret: config.couchBase.SESSION_SECRET,
				name: 'connectionId',
				cookie: { maxAge: 24 * 60 * 60 * 1000 }, // stay open for 1 day of inactivity
				resave: false,
				saveUninitialized: false
			})
		);

		// Setting template local variables for jade
		app.use((req, res, next) => {
			app.locals.isSuperUser = !!req.session.isSuperUser;
			app.locals.usersList = req.session.usersList ? req.session.usersList : [];
			app.locals.environment = config.environment.HOST_ENV;
			app.locals.currentUser = req.session.user ? req.session.user : {};
			app.locals.currentSiteId = req.session.siteId ? req.session.siteId : null;
			app.locals.partner = req.session.partner ? req.session.partner : null;
			// unSavedSite, template local for showing unsaved site
			// prefilled in 'Add a site' modal's url field
			app.locals.unSavedSite =
				Array.isArray(req.session.unSavedSite) && req.session.unSavedSite.length > 0
					? req.session.unSavedSite
					: '';
			next();
		});
		app.locals.utils = utils;
		app.locals.config = config;
		app.locals.consts = consts;

		// Use main controller module as router init
		require('./apiControllers/router')(app);

		// error handlers

		// development error handler
		// will print stacktrace
		if (app.get('env') === 'development') {
			app.locals.pretty = true;
			app.use((err, req, res) => {
				res.status(err.status || 500);
				res.json({
					message: err.message,
					error: err,
					stacktrace: err.stack
				});
			});
			process.on('uncaughtException', error => console.log(error.stack));
		}

		// production error handler
		// no stacktraces leaked to user
		app.use((err, req, res) => {
			res.status(err.status || 500);
			res.render('error', {
				message: err.message,
				error: {}
			});
		});

		server.listen(config.environment.HOST_PORT);
		console.log(`Server listening at port : ${config.environment.HOST_PORT}`);
	})
	.catch(err => {
		console.log(`err: ${err.toString()}`);
	});

module.exports = app;
