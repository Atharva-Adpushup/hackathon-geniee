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

router.get('/genieeUser/', function(req, res) {
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
			return res.redirect('/403');
		});
	}

	if (req.session.user) {
		req.session.destroy(function() {
			req.sessionStore.generate(req);
			try {
				doIt();
			} catch (e) {
				return res.redirect('/403');
			}
		});
	} else {
		try {
			doIt();
		} catch (e) {
			return res.redirect('/403');
		}
	}
});

module.exports = router;
