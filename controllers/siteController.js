// Geniee-Ap REST API controller

var express = require('express'),
    siteModel = require('../models/siteModel'),
    _ = require('lodash'),
    AdPushupError = require('../helpers/AdPushupError'),
    utils = require('../helpers/utils'),
    channelModel = require('../models/channelModel'),
    config = require('../configs/config'),
    userModel = require('.././models/userModel'),
    siteModel = require('.././models/siteModel'),
    router = express.Router({ mergeParams: true });

function checkAuth(req, res, next) {
    userModel.verifySiteOwner(req.session.user.email, req.params.siteId)
        .then(function () {
            // This throws a warning : promise created but nothing returned from it
            // @TODO : Fix this
            next();
        })
        .catch(function () {
            if (req.session.partner === 'geniee') {
                req.session.destroy(function () {
                    return res.redirect('/403');
                });
            } else {
                next();
                // req.session.destroy(function () {
                //     return res.redirect('/login');
                // });
            }
        });
};

router
    .get('/:siteId/*', checkAuth)
    .get('/:siteId/settings', function (req, res) {
        return siteModel.getSiteById(req.params.siteId)
            .then(function (site) {
                return res.render('settings', {
                    pageGroups: site.data.cmsInfo.pageGroups,
                    patterns: site.data.apConfigs.pageGroupPattern ? site.data.apConfigs.pageGroupPattern : [],
                    siteId: req.params.siteId,
                    siteDomain: site.data.siteDomain
                });
            })
            .catch(function (err) {
                res.send('Some error occurred!');
            });
    })
    .post('/:siteId/saveSiteSettings', function (req, res) {
        var json = {
            settings: req.body,
            siteId: req.params.siteId
        };
        siteModel.saveSiteSettings(json)
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
        userModel.verifySiteOwner(req.session.user.email, req.params.siteId)
            .then(function(data) {
                return res.render('editor', {
                    isChrome: true,
                    domain: data.site.siteDomain,
                    siteId: data.site.siteId,
                    channels: data.site.channels,
                    environment: config.development.HOST_ENV,
                    currentSiteId: req.params.siteId
                });
            })
            .catch(function() {
                return res.redirect('/403');
            });
    })
    .get('/:siteId/createPagegroup', function(req, res) {
        if(req.session.user.userType !== 'partner') {
            siteModel.getSitePageGroups(req.params.siteId)
                .then(function(pageGroups) {
                    return res.render('createPageGroup', {
                        siteId: req.params.siteId,
                        error: req.session.pageGroupError ? req.session.pageGroupError : '' 
                    });
                })
                .catch(function(err) {
                    return res.send('Some error occurred!');
                });
        }
        else {
            return res.render('403');
        }
    })
    .get('/:siteId/pagegroups', function(req, res) {
        if(req.session.user.userType !== 'partner') {
            siteModel.getSitePageGroups(req.params.siteId)
                .then(function(pageGroups) {
                    return res.render('pageGroups', {
                        pageGroups: pageGroups,
                        siteId: req.params.siteId
                    });
                })
                .catch(function(err) {
                    return res.send('Some error occurred!');
                });
        }
        else {
            return res.render('403');
        }
    })
    .get('/:siteId/dashboard', function (req, res) {
        siteModel.getSitePageGroups(req.params.siteId)
            .then(function (pageGroups) {

                if(req.session.user.userType === 'partner') {
                    return res.render('geniee/dashboard', {
                        pageGroups: pageGroups,
                        siteId: req.params.siteId
                    });
                }
                else {
                    var allUserSites = req.session.user.sites;

                    function setEmailCookie() {
                        var cookieName = 'email',
                            // "Email" cookie has 1 year expiry and accessible through JavaScript
                            cookieOptions = { expires: new Date(Date.now() + (60 * 60 * 1000 * 24 * 365)), encode: String, httpOnly: false },
                            isCookieSet = (Object.keys(req.cookies).length > 0) && (typeof req.cookies[cookieName] !== 'undefined');

                        isCookieSet ? res.clearCookie(cookieName, cookieOptions) : '';
                        res.cookie(cookieName, req.session.user.email, cookieOptions);
                    }

                    function sitePromises() {
                        return _.map(allUserSites, function(obj) {
                            return siteModel.getSiteById(obj.siteId).then(function() {
                                return obj;
                            }).catch(function() {
                                return 'inValidSite';
                            });
                        });
                    }

                    return Promise.all(sitePromises()).then(function(validSites) {
                        var sites = _.difference(validSites, ['inValidSite']),
                            unSavedSite;

                        sites = (Array.isArray(sites) && (sites.length > 0)) ? sites : [];
                        /**
                         * unSavedSite, Current user site object entered during signup
                         *
                         * - Value is Truthy (all user site/sites) only if user has
                         * no saved any site through Visual Editor
                         * - Value is Falsy if user has atleast one saved site
                        */
                        unSavedSite = (sites.length === 0) ? allUserSites : null;
                        req.session.unSavedSite = unSavedSite;
                        setEmailCookie(req, res);

                        return res.render('dashboard', {
                            validSites: sites,
                            unSavedSite: unSavedSite
                        });
                    });
                }
            })
            .catch(function (err) {
                res.send('Site not found!');
            });
    });

module.exports = router;
