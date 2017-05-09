var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	path = require('path'),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	config = require('./configs/config'),
	genieeCreds = { userName: 'geniee', pass: 'aclockworkorange' },
	dataController = require('./controllers/ops/data');

app.use(logger('dev'));
app.use(bodyParser.json({ limit: '5mb' }));

app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));


// Authenticator source : http://stackoverflow.com/questions/24283848/express-basicauth-throwing-error
app.use(function(req, res, next) {
	var auth;

	// check whether an autorization header was send
	if (req.headers.authorization) {
		// only accepting basic auth, so:
		// * cut the starting "Basic " from the header
		// * decode the base64 encoded username:password
		// * split the string at the colon
		// -> should result in an array
		auth = new Buffer(req.headers.authorization.substring(6), 'base64').toString().split(':');
	}
	function sendUnauthorized() {
		// send an Basic Auth request (HTTP Code: 401 Unauthorized)
		res.statusCode = 401;
		// MyRealmName can be changed to anything, will be prompted to the user
		res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
		// this will displayed in the browser when authorization is cancelled
		res.end('Unauthorized');
	}

	// checks if:
	// * auth array exists
	// * first value matches the expected user
	// * second value the expected password
	if (!(auth && Array.isArray(auth)) ||
		!(((auth[0] === config.ops.auth.username) && (auth[1] === config.ops.auth.pass)) || 
		((auth[0] === genieeCreds.userName) && (auth[1] === genieeCreds.pass)))
	) {
		sendUnauthorized();
		return;
	}
	if ((auth[0] === genieeCreds.userName) && (auth[1] === genieeCreds.pass) &&
		((req.path.indexOf('enableLogin') === -1) && (!req.headers.referer || req.headers.referer.indexOf('enableLogin') === -1))) {
		sendUnauthorized();
	} else {
		next();
	}
});


app.use(express.static(path.join(__dirname, 'public')));

app.use('/ops/data', function(req, res, next) {
	next();
}, dataController);


app.use(function(req, res) {
	res.status(404);

	if (req.accepts('html')) {
		res.sendFile(path.join(__dirname, 'public', 'ops', '404.html'));
	}

	res.send('404');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.locals.pretty = true;
	app.use(function(err, req, res) {
		res.status(err.status || 500);
		res.json({
			'error': true,
			'message': err.message
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
	res.status(err.status || 500);

	res.json({
		'error': true,
		'message': err.message
	});
});

server.listen(config.environment.OPS_HOST_PORT);


module.exports = app;
