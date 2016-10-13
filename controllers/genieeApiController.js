// Geniee-Ap REST API controller

var express = require('express'),
	siteModel = require('../models/siteModel'),
	_ = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
	router = express.Router();

router
	.get('/site/create', function(req, res) {
		res.render('geniee/createSite');
	})
	.post('/site/create', function(req, res) {
		var json = req.body;

		siteModel.createSite(json)
			.then(function(site) {
				return res.status(200).send({success: true, data: {siteId: site.data.siteId}});
			})	
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});	
				}

				var error = err.message;
				return res.status(error.status).send({success: false, message: error.message});
			});
	})
	.get('/site/view', function(req, res) {
		var siteId = req.query.siteId;

		if(!siteId) {
			return res.status(403).send({success: false, message: 'Required parameter not found'});
		}	

		siteModel.getSiteById(siteId)
			.then(function(site) {
				res.status(200).send({success: true, data: {siteId: site.data.siteId, siteName: site.data.siteName, siteDomain: site.data.siteDomain}});
			})
			.catch(function(err) {
				if(err.code && err.code === 13) {
					return res.status(404).send({success: false, message: 'Site does not exist'});
				}

				return res.status(500).send({success: false, message: 'Some error occurred'});
			});
	})
	.post('/site/edit', function(req, res) {
		var json = req.body;

		siteModel.updateSite(json)
			.then(function(site) {
				return res.status(200).send({success: true});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});	
				}

				var error = err.message;
				return res.status(error.status).send({success: false, message: error.message});
			});
	})
	.post('/site/delete', function(req, res) {
		var json = req.body;

		if(!json.siteId) {
			return res.status(403).send({success: false, message: 'Required parameter not found'});
		}	

		siteModel.deleteSite(json.siteId)
			.then(function(site) {
				return res.status(200).send({success: true});
			})
			.catch(function(err) {
				if(err.code && err.code === 13) {
					return res.status(404).send({success: false, message: 'Site does not exist'});
				}

				return res.status(500).send({success: false, message: 'Some error occurred'});
			});
	})
	.get('/pagegroup/create', function(req, res) {
		res.render('geniee/createPagegroup');
	})
	.post('/pagegroup/create', function(req, res) {
		var json = req.body;

		siteModel.saveChannelData(json)
			.then(function(data) {
				return res.status(200).send({success: true, data: {pageGroupId: data.id}});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});
				}

				var error = err.message;
				return res.status(error.status).send({success: false, message: error.message});
			});
	})
	.get('/pagegroup/view', function(req, res) {
		var pageGroupId = req.query.pageGroupId;

		siteModel.getPageGroupById(pageGroupId)
			.then(function(data) {
				res.status(200).send({success: true, data: data});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});
				}

				var error = err.message;
				return res.status(error.status).send({success: false, message: error.message});
			});
	})
	.post('/pagegroup/edit', function(req, res) {
		var json = req.body;

		siteModel.updatePagegroup(json)
			.then(function(data) {
				res.status(200).send({success: true});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});
				}

				var error = err.message;
				return res.status(error.status).send({success: false, message: error.message});
			});
	})
	.post('/pagegroup/delete', function(req, res) {
		var json = req.body;

		siteModel.deletePagegroupById(json.pageGroupId)
			.then(function(data) {
				return res.status(200).send({success: true});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});
				}

				var error = err.message;
				return res.status(error.status).send({success: false, message: error.message});
			});
	});

module.exports = router;
