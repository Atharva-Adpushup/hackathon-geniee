// AdPushup REST API controller

var express = require('express'),
	siteModel = require('../models/siteModel'),
	channelModel = require('../models/channelModel'),
	router = express.Router(),
	schema = require('../helpers/schema'),
	FormValidator = require('../helpers/FormValidator');

router
	.get('/site/create', function(req, res) {
		res.render('geniee/createSite');
	})
	.post('/site/create', function(req, res) {
		var json = req.body;

		return FormValidator.validate(json, schema.api.validations)
			.then(function() { return siteModel.createSite(json) })
			.then(function(site) {
				return res.status(200).send({success: true, data: {siteId: site.data.siteId}});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});	
				}

				var error = err.message[0];
				return res.status(error.status).send({success: false, message: error.message});
			});
	})
	.get('/site/view', function(req, res) {
		var json = {siteId: req.query.siteId};

		return FormValidator.validate(json, schema.api.validations)
			.then(function() { return siteModel.getSiteById(json.siteId) })
			.then(function(site) {
				return res.status(200).send({success: true, data: {siteId: site.data.siteId, siteName: site.data.siteName, siteDomain: site.data.siteDomain}});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});	
				}

				var error = err.message[0];
				return res.status(error.status).send({success: false, message: error.message});
			});
	})
	.post('/site/edit', function(req, res) {
		var json = req.body;

		return FormValidator.validate(json, schema.api.validations)
			.then(function() { return siteModel.updateSite(json) })
			.then(function(site) {
				return res.status(200).send({success: true});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});	
				}

				var error = err.message[0];
				return res.status(error.status).send({success: false, message: error.message});
			});
	})
	.post('/site/delete', function(req, res) {
		var json = req.body;

		return FormValidator.validate(json, schema.api.validations)
			.then(function() { return siteModel.deleteSite(json.siteId) })
			.then(function(site) {
				return res.status(200).send({success: true});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});	
				}

				var error = err.message[0];
				return res.status(error.status).send({success: false, message: error.message});
			});
	})
	.get('/pagegroup/create', function(req, res) {
		res.render('geniee/createPagegroup');
	})
	.post('/pagegroup/create', function(req, res) {
		var json = req.body;

		return FormValidator.validate(json, schema.api.validations)
			.then(function(){ return channelModel.createPageGroup(json) })
			.then(function(data){ 
				return res.status(200).send({success: true, data: {pageGroupId: data.id}});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});
				}

				var error = err.message[0];
				return res.status(error.status).send({success: false, message: error.message});
			});
	})
	.get('/pagegroup/view', function(req, res) {
		var pageGroupId = req.query.pageGroupId;

		return FormValidator.validate({pageGroupId: pageGroupId}, schema.api.validations)
			.then(function(){ return channelModel.getPageGroupById(pageGroupId) })
			.then(function(data) {
				res.status(200).send({success: true, data: data});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});
				}

				var error = err.message[0];
				return res.status(error.status).send({success: false, message: error.message});
			});
	})
	.post('/pagegroup/edit', function(req, res) {
		var json = req.body;

		return FormValidator.validate(json, schema.api.validations)
			.then(function(){ return channelModel.updatePagegroup(json) })
			.then(function(data) {
				res.status(200).send({success: true});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});
				}

				var error = err.message[0];
				return res.status(error.status).send({success: false, message: error.message});
			});
	})
	.post('/pagegroup/delete', function(req, res) {
		var json = req.body;

		return FormValidator.validate(json, schema.api.validations)
			.then(function(){ return channelModel.deletePagegroupById(json.pageGroupId) })
			.then(function(data) {
				return res.status(200).send({success: true});
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					return res.status(500).send({success: false, message: 'Some error occurred'});
				}

				var error = err.message[0];
				return res.status(error.status).send({success: false, message: error.message});
			});
	});

module.exports = router;
