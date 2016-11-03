var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	_ = require('lodash'),
	Promise = require('bluebird'),
	uuid = require('node-uuid'),
	request = require('request-promise'),
	md5 = require('md5'),
	utils = require('../helpers/utils'),
	AdPushupError = require('../helpers/AdPushupError'),
	oauthHelper = require('../helpers/googleOauth'),
	// eslint-disable-next-line new-cap
	router = express.Router({ mergeParams: true }),
	CC = require('../configs/commonConsts'),
	config = require('../configs/config');

router
	.get('/dashboard', function(req, res) {
		var pageGroups = [{
			pageGroupId: 'abc-123',
			pageGroupName: 'Post Page - Desktop',
			platform: 'Desktop',
			category: 'Travel and Leisure',
			subCategory: 'Hotels',
			pageviews: 23401,
			variations: 3
		}, {
			pageGroupId: 'pqr-456',
			pageGroupName: 'Category Page - Mobile',
			platform: 'Mobile',
			category: 'Travel and Leisure',
			subCategory: 'Hotels',
			pageviews: 73401,
			variations: 5
		}, {
			pageGroupId: 'xyz-789',
			pageGroupName: 'Post Page - Mobile',
			platform: 'Mobile',
			category: 'Health and Wellness',
			subCategory: 'Salon and Spa',
			pageviews: 15401,
			variations: 2
		}];

		res.render('dashboard', {
			pageGroups: pageGroups
		});
	})
	.get('/settings', function(req, res) {
		res.render('settings');
	})
	.get('/billing', function(req, res) {
		res.render('billing', {
			user: req.session.user,
			isSuperUser: true
		});
	})
	.post('/addSite', function(req, res) {
		var site = (req.body.site) ? utils.getSafeUrl(req.body.site) : req.body.site;

		userModel.addSite(req.session.user.email, site).spread(function(user, siteId) {
			req.session.user = user;
			return res.redirect('editor?siteId=' + siteId);
		}).catch(function(err) {
			res.send(err);
		});
	})
	.get('/logout', function(req, res) {
		req.session.destroy();
		return res.redirect('/');
	})
	.get('/editor', function(req, res) {
		// userModel.verifySiteOwner(req.session.user.email, parseInt(req.query.siteId, 10))
		// 	.then(function(json) {
		// 		if (!json) {
		// 			throw new Error('User for site is not verified');
		// 		} else {
		// 			return { user: json.user.data, siteId: req.query.siteId, domain: json.site.domain };
		// 		}
		// 	}).then(function(json) {
		// 		return siteModel.getSiteById(json.siteId).then(function() {
		// 			json.hasSiteObject = true;
		// 			return json;
		// 		}, function() {
		// 			json.hasSiteObject = false;
		// 			return json;
		// 		});
		// 	}).then(function(json) {
		// 		json.isSuperUser = req.session.isSuperUser ? true : false;
		// 		json.isChrome = _.matches(req.headers['user-agent'], 'Chrome');
		// 		return json;
		// 	}).then(function(json) {
		// 		return res.render('editor', json);
		// 	})
		// 	.catch(function(err) {
		// 		res.send('err: ' + err.toString());
		// 	});
		return res.render('editor', {
			isChrome: true,
			domain: 'http://www.articlemyriad.com',
			siteId: req.params.siteId,
			environment: config.development.HOST_ENV
		});
	})
	.post('/deleteSite', function(req, res) {
		userModel.verifySiteOwner(req.session.user.email, req.body.siteId)
			.then(function() {
				return siteModel.deleteSite(req.body.siteId);
			})
			.then(function() {
				return res.redirect('dashboard');
			}).catch(function(err) {
				console.log(err);
				return res.redirect('dashboard');
			});
	})
	.post('/switchTo', function(req, res) {
		var email = (req.body.email) ? utils.sanitiseString(req.body.email) : req.body.email;

		if (req.session.isSuperUser === true) {
			userModel.setSitePageGroups(email).then(function(user) {
				req.session.user = user;
				return res.redirect('/');
			}, function() {
				return res.redirect('/');
			});
		} else {
			return res.redirect('/');
		}
	})
	.get('/requestOauth', function(req, res) {
		req.session.state = uuid.v1();
		return res.redirect(oauthHelper.getRedirectUrl(req.session.state));
	})
	.get('/oauth2callback', function(req, res) {
		if (req.session.state !== req.query.state) {
			res.status(500);
			res.send('Fake Request');
		} else if (req.query.error === 'access_denied') {
			res.status(500);
			res.send('Seems you denied request, if done accidently please press back button to retry again.');
		} else {
			var getAccessToken = oauthHelper.getAccessTokens(req.query.code),
				getAdsenseAccounts = getAccessToken.then(function(token) {
					return request({
						strictSSL: false,
						uri: 'https://www.googleapis.com/adsense/v1.4/accounts?access_token=' + token.access_token,
						json: true
					}).then(function(adsenseInfo) {
						return adsenseInfo.items;
					}).catch(function(err) {
						if (err.error && err.error.error && err.error.error.message.indexOf('User does not have an AdSense account') === 0) {
							throw new Error('No adsense account');
						}
						throw err;
					});
				}),
				getUserInfo = getAccessToken.then(function(token) {
					return request({
						strictSSL: false,
						uri: 'https://www.googleapis.com/oauth2/v2/userinfo?access_token=' + token.access_token,
						json: true
					});
				}),
				getUser = userModel.getUserByEmail(req.session.user.email);

			Promise.join(getUser, getAccessToken, getAdsenseAccounts, getUserInfo, function(user, token, adsenseAccounts, userInfo) {
				user.addNetworkData({
					'networkName': 'ADSENSE',
					'refreshToken': token.refresh_token,
					'accessToken': token.access_token,
					'expiresIn': token.expires_in,
					'pubId': adsenseAccounts[0].id,
					'adsenseEmail': userInfo.email,
					'userInfo': userInfo,
					'adsenseAccounts': adsenseAccounts
				}).then(function() {
					req.session.user = user;
					var pubIds = _.map(adsenseAccounts, 'id');// grab all the pubIds in case there are multiple and show them to user to choose
					if (CC.isForceMcm) {
						res.render('mcmConnect', {
							baseUrl: CC.BASE_URL,
							adsenseEmail: userInfo.email,
							pubId: pubIds.length > 1 ? pubIds : pubIds[0],
							userEmail: user.get('email')
						});
					} else {
						res.render('oauthParams', {
							adsenseEmail: userInfo.email,
							pubId: pubIds.length > 1 ? pubIds : pubIds[0]
						});
					}
				});
			}).catch(function(err) {
				res.status(500);
				err.message === 'No adsense account' ? res.send('Sorry but it seems you have no AdSense account linked to your Google account.' +
					'If this is a recently verified/created account, it might take upto 24 hours to come in effect.' +
					'Please try again after sometime or contact support.') : res.send(err);
			});
		}
	})
	.get('/profile', function(req, res) {
		userModel.getUserByEmail(req.session.user.email).then(function(user) {
			var formData = {
				'firstName': user.get('firstName'),
				'lastName': user.get('lastName'),
				'email': user.get('email'),
				'md5Email': (md5(user.get('name')))
			};

			res.render('profile', {
				formData: formData
			});
		}, function() {
			return res.redirect('/');
		});
	})
	.post('/profile', function(req, res) {
		req.body.firstName = (req.body.firstName) ? utils.trimString(req.body.firstName) : req.body.firstName;
		req.body.lastName = (req.body.lastName) ? utils.trimString(req.body.lastName) : req.body.lastName;

		userModel.saveProfile(req.body, req.session.user.email)
			.then(function() {
				/**
				 * TODO: Fix user.save() to return updated user object
				 * and remove below hack
				 * File name: model.js
				 */
				var user = Array.prototype.slice.call(arguments)[0];

				req.session.user = user;
				return res.render('profile', { profileSaved: true, formData: req.body });
			})
			.catch(function(e) {
				if (e instanceof AdPushupError) {
					res.render('profile', { profileError: e.message, formData: req.body });
				} else if (e.name && e.name === 'CouchbaseError') {
					res.render('profile', { userNotFound: true, formData: req.body });
				}
			});
	});

module.exports = router;
