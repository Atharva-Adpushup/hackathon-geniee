// Geniee-Ap REST API controller

var express = require('express'),
	siteModel = require('../models/siteModel'),
	_ = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
	router = express.Router();

router
	.get('/:pageGroupId', function(req, res) {
		console.log(req.params.pageGroupId);

		res.render('pageGroup');
	});

module.exports = router;
