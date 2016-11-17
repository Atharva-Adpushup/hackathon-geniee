// Geniee-Ap REST API controller

var express = require('express'),
    siteModel = require('../models/siteModel'),
    _ = require('lodash'),
    AdPushupError = require('../helpers/AdPushupError'),
    utils = require('../helpers/utils'),
    channelModel = require('../models/channelModel'),
    config = require('../configs/config'),
    userModel = require('.././models/userModel'),
    router = express.Router({ mergeParams: true });

function checkAuth(req, res, next) {
    userModel.verifySiteOwner(req.session.user.email, req.params.siteId)
        .then(function () {
            next();
        })
        .catch(function () {
            if (req.session.partner === 'geniee') {
                req.session.destroy(function () {
                    return res.redirect('/403');
                });
            } else {
                req.session.destroy(function () {
                    return res.redirect('/login');
                });
            }
        });
};

router
    .get('/:siteId/*', checkAuth)
    .get('/:siteId/settings', function (req, res) {
        siteModel.getSiteById(req.params.siteId)
            .then(function (site) {
                res.render('settings', {
                    pageGroups: site.data.cmsInfo.pageGroups,
                    patterns: site.data.apConfigs.pageGroupPattern ? site.data.apConfigs.pageGroupPattern : [],
                    siteId: req.params.siteId
                });
            })
            .catch(function (err) {
                res.send('Some error occurred!');
            });
    })
    .post('/:siteId/savePageGroupPattern', function (req, res) {
        var json = { siteId: req.body.siteId, pageGroupName: req.body.pageGroupName, pageGroupPattern: req.body.pageGroupPattern };
        siteModel.setPagegroupPattern(json)
            .then(function (data) {
                res.send({ success: 1 });
            })
            .catch(function (err) {
                if (err.name === 'AdPushupError') {
                    res.send({ succes: 0, message: err.message })
                }
                else {
                    res.send({ success: 0, message: 'Some error occurred!' });
                }
            });
    })
    .get('/:siteId/editor', function (req, res) {
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
    .get('/:siteId/dashboard', function (req, res) {
        return res.send('dashboard')
        siteModel.getSitePageGroups(req.params.siteId)
            .then(function (pageGroups) {
                res.render('dashboard', {
                    pageGroups: pageGroups,
                    siteId: req.params.siteId
                });
            })
            .catch(function (err) {
                res.send('Site not found!');
            });
    });

module.exports = router;
