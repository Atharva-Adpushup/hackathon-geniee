// AdPushup auth controller

var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	router = express.Router({ mergeParams: true }),
	partners = require('../configs/commonConsts').partners;

router.get('/geniee/', function(req, res) {
	// Generate session for authenticated user
	function doIt() {
		userModel
			.getUserByEmail(partners.geniee.email)
			.then(function(user) {
				return siteModel.getSiteById(req.query.siteId);
			})
			.then(function(site) {
				return userModel.verifySiteOwner(partners.geniee.email, req.query.siteId);
			})
			.then(function(data) {
				req.session.user = data.user;
				req.session.siteId = data.site.siteId;
				req.session.partner = 'geniee';
				req.session.isSuperUser = false;
				return res.redirect('/user/site/' + data.site.siteId + '/dashboard');
			})
			.catch(function(err) {
				if (err.name !== 'AdPushupError') {
					if (err.code === 13) {
						return res.send('User does not exist!');
					}
					return res.send('Authentication failed!');
				} else {
					var error = err.message[0];
					return res.send(error.message);
				}
			});
	}

	if (req.session.user) {
		req.session.destroy(function() {
			req.sessionStore.generate(req);
			doIt();
		});
	} else {
		doIt();
	}
});

module.exports = router;
