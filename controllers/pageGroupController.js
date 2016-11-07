// Geniee-Ap REST API controller

var express = require('express'),
	siteModel = require('../models/siteModel'),
	_ = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
	router = express.Router({ mergeParams: true });

router
	.get('/:pageGroupId', function(req, res) {
		res.render('pageGroup', {
			pageGroupName: 'Post Page - Desktop',
			sampleUrl: 'http://mysite.com/post',
			platform: 'DESKTOP',
			inventoryType: 'Standard Banner Ads',
			category: 'Health and Wellness',
			subCategory: 'Preventive Health',
			majorAudience: 'United States',
			useSSL: true,
			adultContent: true,
			variations: [{
				variationName: 'Variation 1',
				zones: 4,
				impressions: 12342,
				ctr: 1.61,
				rpm: 2.54,
				topPerforming: false
			}, {
				variationName: 'Variation 2',
				zones: 3,
				impressions: 10142,
				ctr: 1.21,
				rpm: 1.54,
				topPerforming: false
			}, {
				variationName: 'Variation 3',
				zones: 4,
				impressions: 18342,
				ctr: 2.61,
				rpm: 3.54,
				topPerforming: true
			}]
		});
	});

module.exports = router;
