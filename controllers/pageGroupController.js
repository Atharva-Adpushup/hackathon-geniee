// Geniee-Ap REST API controller

var express = require('express'),
	siteModel = require('../models/siteModel'),
	_ = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
	channelModel = require('../models/channelModel'),
	router = express.Router({ mergeParams: true });

router
	.get('/:pageGroupId', function(req, res) {
		channelModel.getPageGroupById(req.params.pageGroupId, { getExtendedParams: true })
			.then(function(pageGroup) {
				console.log(pageGroup);
				res.render('pageGroup', {
					pageGroup: pageGroup,
					siteId: req.params.siteId
				})
			})
			.catch(function(err) {
				res.render('pageGroup');
			});
	});

module.exports = router;
