// Geniee-Ap REST API controller

var express = require('express'),
	siteModel = require('../models/siteModel'),
	_ = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
	router = express.Router();

router
	.get('/:pageGroupId', function(req, res) {
		var data = {
			pageGroupName: 'Post Page - Desktop',
			sampleUrl: 'http://mysite.com/post',
			platform: 'DESKTOP',
			inventoryType: 'Standard Banner Ads'
		};

		res.render('pageGroup', {
			pageGroupName: data.pageGroupName
		});
	});

module.exports = router;
