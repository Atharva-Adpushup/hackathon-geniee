// Geniee-Ap REST API controller

var express = require('express'),
	siteModel = require('../models/siteModel'),
	_ = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
	router = express.Router();

router
	.get('/:pageGroupId', function(req, res) {

		res.render('pageGroup', {
			pageGroupName: 'Post Page - Desktop',
			sampleUrl: 'http://mysite.com/post',
			platform: 'DESKTOP'
		});
	});

module.exports = router;
