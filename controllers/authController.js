// AdPushup auth controller

var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	jwt = require('jsonwebtoken'),
	Promise = require('bluebird'),
	router = express.Router({ mergeParams: true }),
	CC = require('../configs/commonConsts'),
	partners = CC.partners,
	vendorAccountPublicKey = partners.geniee.authenticate.vendorAccount.publicKey;

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

router.get('/vendor/', function(req, res) {
	function getUserToken() {
		const userToken = req.query && req.query.token,
			isValid = !!userToken;

		if (!isValid) {
			throw new Error('Error: Invalid user token');
		}

		return new Promise(function(resolve, reject) {
			jwt.verify(userToken, vendorAccountPublicKey, function(err, decodedToken) {
				if (err && err.message && err.stack) {
					console.log(err.stack);
					return reject(err.message);
				}

				let { adpushupSiteId, mediaId, exp } = decodedToken,
					currentTimeStamp = +new Date(),
					isValidExpressionTimeStamp = Number(exp) * 1000 > currentTimeStamp;

				if (!isValidExpressionTimeStamp) {
					return reject('AuthenticationError: Invalid expression timestamp');
				}

				return resolve(decodedToken); // bar
			});
		});
	}

	// Generate session for an authenticated user/vendor
	function doIt() {
		const getToken = getUserToken(),
			getUserByEmail = userModel.getUserByEmail(partners.geniee.email);

		return Promise.join(getToken, getUserByEmail, (userToken, modelInstance) => {
			let { adpushupSiteId } = userToken;

			return siteModel
				.getSiteById(adpushupSiteId)
				.then(function(site) {
					return userModel.verifySiteOwner(partners.geniee.email, adpushupSiteId);
				})
				.then(function(data) {
					req.session.user = data.user;
					req.session.siteId = data.site.siteId;
					req.session.partner = 'geniee';
					req.session.isSuperUser = false;
					return res.redirect('/user/site/' + data.site.siteId + '/dashboard');
				});
		}).catch(function(err) {
			if (err.name === 'AdPushupError') {
				if (err.code === 13) {
					return res.send('Authentication Failed: User does not exist!');
				}
				var error = err.message[0];
				return res.send(`Authentication Failed: ${error.message}`);
			} else {
				var error = err.toString();
				console.log(error);
				return res.send(`Authentication Failed: ${error}`);
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
