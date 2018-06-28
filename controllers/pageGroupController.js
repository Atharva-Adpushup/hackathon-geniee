// Geniee-Ap REST API controller

var express = require('express'),
	siteModel = require('../models/siteModel'),
	_ = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
	channelModel = require('../models/channelModel'),
	router = express.Router({ mergeParams: true }),
	config = require('../configs/config');

router
	.get('/:pageGroupId', (req, res) => {
		return channelModel
			.getPageGroupById({ id: req.params.pageGroupId, viewName: 'channelById', isExtendedParams: true })
			.then(function(pageGroup) {
				return res.render('pageGroup', {
					pageGroup: pageGroup,
					siteId: req.params.siteId
				});
			})
			.catch(function(err) {
				res.render('pageGroup');
			});
	})
	.get('/ampSettings/:pageGroupId', (req, res) => {
		let arr = req.params.pageGroupId.split('-'), platform = arr[1], pageGroup = arr[0];

		return channelModel
			.getChannel(req.params.siteId, platform, pageGroup)
			.then(function(pageGroup) {
				return res.render('ampSettings', {
					channel: pageGroup.data,
					siteId: req.params.siteId,
					config: config.ampSettings
				});
			})
			.catch(function(err) {
				res.render('pageGroup');
			});
	})
	.post('/saveAmpSettings', (req, res) => {
		let siteId = req.params.siteId, platform = req.body.platform, pageGroup = req.body.pageGroup;
		channelModel
			.getChannel(siteId, platform, pageGroup)
			.then(function(pageGroup) {
				pageGroup.set('ampSettings', req.body.ampData);
				return pageGroup.save();
			})
			.then(pageGroup => {
				res.json(pageGroup);
			});
	});

module.exports = router;
