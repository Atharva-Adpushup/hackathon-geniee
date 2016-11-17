// AdPushup REST API controller

var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	channelModel = require('../models/channelModel'),
	router = express.Router(),
	schema = require('../helpers/schema'),
	FormValidator = require('../helpers/FormValidator');

router
	.get('/site/create', function (req, res) {
		res.render('geniee/createSite');
	})
	.post('/site/create', function (req, res) {
		var json = req.body;

		// Set partner to geniee
		if (req.isGenieeSite) {
			json.partner = 'geniee';
		}
		var partnerEmail = json.partner + '@adpushup.com', siteId;
		json.ownerEmail = partnerEmail;

		// Function to create partner user account and site
		function createPartnerAndSite() {
			return userModel.createNewUser({
				email: partnerEmail,
				firstName: json.partner,
				password: json.partner + 'adpushup',
				site: json.siteDomain,
				userType: 'partner'
			})
			.then(function (firstSite) { 
				json.siteId = firstSite.siteId;
				return siteModel.saveSiteData(firstSite.siteId, 'POST', json) 
			})
			.then(function (site) {
				return res.status(200).send({ success: true, data: { siteId: site.data.siteId } });
			});
		};

		// Validate input params and create site
		return FormValidator.validate(json, schema.api.validations)
			.then(function () { return userModel.getUserByEmail(partnerEmail).then(function (user) { return user }) })
			.then(function (user) {
				return siteModel.createSite(json).then(function (site) { return { site: site, user: user } });
			})
			.then(function (data) {
				if (data.user.data) {
					data.user.get('sites').push({ siteId: data.site.data.siteId, domain: data.site.data.siteDomain })
					data.user.save();
				}
				return res.status(200).send({ success: true, data: { siteId: data.site.data.siteId } });
			})
			.catch(function (err) {
				if (err.name !== 'AdPushupError') {
					if (err.code === 13) {
						// If partner is not present then create partner account and site
						createPartnerAndSite();
					}
					else {
						return res.status(500).send({ success: false, message: 'Some error occurred' });
					}
				}
				else {
					var error = err.message[0];
					return res.status(error.status).send({ success: false, message: error.message });
				}
			});
	})
	.get('/site/view', function (req, res) {
		var json = { siteId: req.query.siteId };

		// Validate input params and fetch site
		return FormValidator.validate(json, schema.api.validations)
			.then(function () { return siteModel.getSiteById(json.siteId) })
			.then(function (site) {
				// Send relevant site data as API output
				return res.status(200).send({ success: true, data: { siteId: site.data.siteId, siteName: site.data.siteName, siteDomain: site.data.siteDomain } });
			})
			.catch(function (err) {
				if (err.name !== 'AdPushupError') {
					return res.status(500).send({ success: false, message: 'Some error occurred' });
				}

				var error = err.message[0];
				return res.status(error.status).send({ success: false, message: error.message });
			});
	})
	.post('/site/edit', function (req, res) {
		var json = req.body;

		// Validate input params and update site
		return FormValidator.validate(json, schema.api.validations)
			.then(function () { return siteModel.updateSite(json) })
			.then(function (site) {
				return res.status(200).send({ success: true });
			})
			.catch(function (err) {
				if (err.name !== 'AdPushupError') {
					return res.status(500).send({ success: false, message: 'Some error occurred' });
				}

				var error = err.message[0];
				return res.status(error.status).send({ success: false, message: error.message });
			});
	})
	.post('/site/delete', function (req, res) {
		var json = req.body;

		// Validate input params and delete site
		return FormValidator.validate(json, schema.api.validations)
			.then(function () { return siteModel.deleteSite(json.siteId) })
			.then(function (site) {
				return res.status(200).send({ success: true });
			})
			.catch(function (err) {
				if (err.name !== 'AdPushupError') {
					return res.status(500).send({ success: false, message: 'Some error occurred' });
				}

				var error = err.message[0];
				return res.status(error.status).send({ success: false, message: error.message });
			});
	})
	.get('/pagegroup/create', function (req, res) {
		res.render('geniee/createPagegroup');
	})
	.post('/pagegroup/create', function (req, res) {
		var json = req.body;

		// Validate input params and create pagegroup
		return FormValidator.validate(json, schema.api.validations)
			.then(function () { return channelModel.createPageGroup(json) })
			.then(function (data) {
				return res.status(200).send({ success: true, data: { pageGroupId: data.id } });
			})
			.catch(function (err) {
				if (err.name !== 'AdPushupError') {
					return res.status(500).send({ success: false, message: 'Some error occurred' });
				}

				var error = err.message[0];
				return res.status(error.status).send({ success: false, message: error.message });
			});
	})
	.get('/pagegroup/view', function (req, res) {
		var pageGroupId = req.query.pageGroupId;

		// Validate input params and fetch pagegroup
		return FormValidator.validate({ pageGroupId: pageGroupId }, schema.api.validations)
			.then(function () { return channelModel.getPageGroupById(pageGroupId) })
			.then(function (data) {
				res.status(200).send({ success: true, data: data });
			})
			.catch(function (err) {
				if (err.name !== 'AdPushupError') {
					return res.status(500).send({ success: false, message: 'Some error occurred' });
				}

				var error = err.message[0];
				return res.status(error.status).send({ success: false, message: error.message });
			});
	})
	.post('/pagegroup/edit', function (req, res) {
		var json = req.body;

		// Validate input params and update pagegroup
		return FormValidator.validate(json, schema.api.validations)
			.then(function () { return channelModel.updatePagegroup(json) })
			.then(function (data) {
				res.status(200).send({ success: true });
			})
			.catch(function (err) {
				if (err.name !== 'AdPushupError') {
					return res.status(500).send({ success: false, message: 'Some error occurred' });
				}

				var error = err.message[0];
				return res.status(error.status).send({ success: false, message: error.message });
			});
	})
	.post('/pagegroup/delete', function (req, res) {
		var json = req.body;

		// Validate input params and delete pagegroup
		return FormValidator.validate(json, schema.api.validations)
			.then(function () { return channelModel.deletePagegroupById(json.pageGroupId) })
			.then(function (data) {
				return res.status(200).send({ success: true });
			})
			.catch(function (err) {
				if (err.name !== 'AdPushupError') {
					return res.status(500).send({ success: false, message: 'Some error occurred' });
				}

				var error = err.message[0];
				return res.status(error.status).send({ success: false, message: error.message });
			});
	});

module.exports = router;


