/**
 * Created by Dhiraj on 2/27/2016.
 */
var express = require('express'),
	userModel = require('../models/userModel'),
	// eslint-disable-next-line new-cap
	router = express.Router();

router
	.get('/controlVsAdPushup/', function(req, res) {
		userModel
			.getUserByEmail(req.query.email)
			.then(function(user) {
				user.merge({ test: 'hi' });
				res.json(user);
			})
			.catch(function(err) {
				res.send(err.toString());
			});
		/* site.test(req.query.id).then(function (doc) {
		res.json(doc);
		}).catch(function (err) {
		res.send(err.toString());
		})*/
	})
	.get('/template/', function(req, res) {
		res.send('Hello' + req.params.id);
	})
	.get('/topUrls/', function(req, res) {
		res.send('Hello' + req.params.id);
	})
	.get('/trafficWise/', function(req, res) {
		res.send('Hello' + req.params.id);
	})
	.get('/countryWise/', function(req, res) {
		res.send('Hello' + req.params.id);
	})
	.get('/adformat/', function(req, res) {
		res.send('Hello' + req.params.id);
	});

module.exports = router;
