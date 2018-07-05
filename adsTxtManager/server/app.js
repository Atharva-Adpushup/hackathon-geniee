const express = require('express'),
	app = express(),
	path = require('path'),
	{ emailSiteMap, HOST_PORT } = require('./config'),
	axios = require('axios'),
	publicPath = path.join(__dirname, '../public/'),
	bodyParser = require('body-parser'),
	crypto = require('crypto'),
	querystring = require('querystring');

process.on('uncaughtException', function(err) {
	console.error('\n unhandled error \n', err);
});

app.use(express.static(publicPath));

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
	bodyParser.urlencoded({
		// to support URL-encoded bodies
		extended: true
	})
);
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded());

app.get('/getAdsTxt', function(req, res) {
	const { userId, domain } = req.query;
	if (
		userId &&
		domain &&
		emailSiteMap[userId] &&
		emailSiteMap[userId][domain] &&
		emailSiteMap[userId][domain].apiUrl
	) {
		var apiUrl = emailSiteMap[userId][domain].apiUrl;
		axios
			.get(apiUrl)
			.then(response => {
				if (response.data.status == 1) {
					res.json({
						adsTxt: response.data.data || ' '
					});
				} else {
					res.status(500).json({
						error: response.data.status_message
					});
				}
			})
			.catch(error => {
				if ((error.response.status = 404)) {
					res.json({
						adsTxt: ' '
					});
				} else {
					res.json({
						error: error.response.data.status_message
					});
				}
			});
	} else {
		res.status(400).json({
			error: 'no/wrong email id or domain'
		});
	}
});

app.post('/setAdsTxt', function(req, res) {
	const { userId, domain, adsTxt, securityKey } = req.body;
	if (
		userId &&
		domain &&
		adsTxt &&
		securityKey &&
		emailSiteMap[userId] &&
		emailSiteMap[userId][domain] &&
		emailSiteMap[userId][domain].apiUrl
	) {
		const apiUrl = emailSiteMap[userId][domain].apiUrl,
			timestamp = Math.floor(+new Date() / 1000),
			hash = crypto
				.createHmac('sha256', securityKey)
				.update(`email=${encodeURIComponent(userId)}&ts=${timestamp}`)
				.digest('hex');

		var params = { ts: timestamp, data: adsTxt, hash: hash };

		axios
			.post(apiUrl, querystring.stringify(params))
			.then(response => {
				if (response.data.status == 1) {
					res.json({
						message: 'ads.txt updated'
					});
				} else {
					res.status(500).json({
						error: response.data.status_message
					});
				}
			})
			.catch(error => {
				console.log(error.response.status);
				res.status(500).json({
					error: error.response.data.status_message
				});
			});
	} else {
		res.status(400).json({
			error: 'no/wrong email id or domain'
		});
	}
});

app.listen(HOST_PORT, function() {
	console.log('Server listening at port : ' + HOST_PORT);
});
