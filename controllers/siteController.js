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
    adpushupEvent = require('../helpers/adpushupEvent'),
    commonConsts = require('../configs/commonConsts'),
    couchbase = require('../helpers/couchBaseService'),
    countryData = require('country-data'),
    Promise = require('bluebird'),
    router = express.Router({ mergeParams: true });

// Function to authenticate user for proper access
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

// Function to render header bidding setup panel
function renderHbPanel(site, UiData, res, hbConfig) {
    var data = {
        siteDomain: site.get('siteDomain'),
        countries: JSON.stringify(UiData.countries),
        continents: JSON.stringify(commonConsts.hbContinents),
        adSizes: JSON.stringify(_.uniq(UiData.adSizes)),
        hbPartners: JSON.stringify(UiData.hbPartners),
        hbConfig: JSON.stringify(commonConsts.hbConfig)
    };

    if (hbConfig) {
        data.hbSetupData = JSON.stringify(hbConfig.value.hbConfig);
    }

    res.render('headerBidding', data);
};

// Function to populate data for header bidding panel UI
function getHbUiData() {
    var countries = _.map(countryData.lookup.countries(), function (country) {
        return {
            name: country.name,
            code: country.alpha2
        };
    }), adSizes = [], hbPartners = [];

    _.forIn(commonConsts.hbConfig, function (hbPartner) {
        hbPartner.isHb ? hbPartners.push(hbPartner.name) : null;
    });
    _.forEach(commonConsts.supportedAdSizes, function (layout) {
        _.forEach(layout.sizes, function (size) {
            adSizes.push(size.width + 'x' + size.height);
        });
    });

    return {
        countries: countries,
        hbPartners: hbPartners,
        adSizes: adSizes
    };
};

router
    .get('/:siteId/*', checkAuth)
    .get('/:siteId/settings', function (req, res) {
        return siteModel.getSiteById(req.params.siteId)
            .then(function (site) {
                return res.render('settings', {
                    pageGroups: site.get('cmsInfo').pageGroups,
                    patterns: site.get('apConfigs').pageGroupPattern ? site.get('apConfigs').pageGroupPattern : [],
                    apConfigs: site.get('apConfigs'),
                    blocklist: site.get('apConfigs').blocklist,
                    siteId: req.params.siteId,
                    siteDomain: site.get('siteDomain')
                });
            })
            .catch(function (err) {
                res.send('Some error occurred!');
            });
    })
    .get('/:siteId/headerBidding', function (req, res) {
        var sitePromise = siteModel.getSiteById(req.params.siteId),
            appBucketPromise = couchbase.connectToAppBucket(),
            UiData = getHbUiData();

        return Promise.all([sitePromise, appBucketPromise])
            .spread(function (site, appBucket) {
                var hbConfigPromise = appBucket.getAsync('hbcf::' + req.params.siteId, {});
                return Promise.all([site, hbConfigPromise]);
            })
            .spread(function (site, hbConfig) {
                return renderHbPanel(site, UiData, res, hbConfig);
            })
            .catch(function (err) {
                if (err.code === 13) {
                    return siteModel.getSiteById(req.params.siteId)
                        .then(function (site) {
                            return renderHbPanel(site, UiData, res);
                        });
                }
                else {
                    console.log(err);
                    res.send('Some error occurred!');
                }
            });
    })
    .post('/:siteId/saveHeaderBiddingSetup', function (req, res) {
        var siteId = req.params.siteId,
            hbConfig = JSON.parse(req.body.hbConfig),
            operation = req.body.op,
            sitePromise = siteModel.getSiteById(req.params.siteId),
            appBucketPromise = couchbase.connectToAppBucket(),
            hasGlobalConfig = _.find(hbConfig, function(config) { return config.type === 'all' });

        if(!hasGlobalConfig) {
            hbConfig.push({ 'type': 'all', info: {} });
        }

        return Promise.all([sitePromise, appBucketPromise])
            .spread(function(site, appBucket) {
                var json = {
                    hbConfig: hbConfig,
                    siteId: site.get('siteId'),
                    siteDomain: site.get('siteDomain'),
                    email: site.get('ownerEmail')
                };

                return operation === 'create' ? appBucket.insertPromise('hbcf::' + req.params.siteId, json) : appBucket.replacePromise('hbcf::' + req.params.siteId, json);
            })
            .then(function (data) {
                // Emit event to generate hbConfig file for siteId
                adpushupEvent.emit('hbSiteSaved', req.params.siteId);
                
                res.send({ success: 1 });
            })
            .catch(function (err) {
                console.log(err);
                res.send({ success: 0 });
            });
    })
    .post('/:siteId/saveSiteSettings', function (req, res) {
        var json = {
            settings: req.body,
            siteId: req.params.siteId
        };
        return siteModel.saveSiteSettings(json)
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
        userModel.verifySiteOwner(req.session.user.email, req.params.siteId, { fullSiteData: true })
            .then(function (data) {
                return res.render('editor', {
                    isChrome: true,
                    domain: data.site.get('siteDomain'),
                    siteId: data.site.get('siteId'),
                    channels: data.site.get('channels'),
                    environment: config.development.HOST_ENV,
                    currentSiteId: req.params.siteId
                });
            })
            .catch(function () {
                return res.redirect('/403');
            });
    })
    .get('/:siteId/createPagegroup', function (req, res) {
        if (req.session.user.userType !== 'partner') {
            return siteModel.getSiteById(req.params.siteId)
                .then(function (site) { return { siteDomain: site.get('siteDomain'), channels: site.get('channels') } })
                .then(function (data) {
                    var channels = _.map(data.channels, function (channel) {
                        return channel.split(':')[1];
                    });
                    return res.render('createPageGroup', {
                        siteId: req.params.siteId,
                        siteDomain: data.siteDomain,
                        channels: _.uniq(channels)
                    });
                })
                .catch(function (err) {
                    return res.send('Some error occurred!');
                });
        }
        else {
            return res.render('403');
        }
    })
    .post('/:siteId/createPagegroup', function (req, res) {
        var json = req.body;
        return channelModel.createPageGroup(json)
            .then(function (data) {
                // Reset session on addition of new pagegroup for non-partner
                var userSites = req.session.user.sites,
                    site = _.find(userSites, { 'siteId': parseInt(json.siteId) });

                var index = _.findIndex(userSites, { 'siteId': parseInt(json.siteId) });
                req.session.user.sites[index] = site;

                return res.redirect('/user/dashboard');
            })
            .catch(function (err) {
                var error = err.message[0].message ? err.message[0].message : 'Some error occurred!';

                return siteModel.getSiteById(req.params.siteId)
                    .then(function (site) { return { siteDomain: site.get('siteDomain'), channels: site.get('channels') } })
                    .then(function (data) {
                        var channels = _.map(data.channels, function (channel) {
                            return channel.split(':')[1];
                        });
                        return res.render('createPageGroup', {
                            siteId: req.params.siteId,
                            siteDomain: data.siteDomain,
                            channels: _.uniq(channels),
                            error: error
                        });
                    });
            });
    })
    .get('/:siteId/pagegroups', function (req, res) {
        if (req.session.user.userType !== 'partner') {
            siteModel.getSitePageGroups(req.params.siteId)
                .then(function (pageGroups) {
                    return res.render('pageGroups', {
                        pageGroups: pageGroups,
                        siteId: req.params.siteId
                    });
                })
                .catch(function (err) {
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

                if (req.session.user.userType === 'partner') {
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
                        return _.map(allUserSites, function (obj) {
                            return siteModel.getSiteById(obj.siteId).then(function () {
                                return obj;
                            }).catch(function () {
                                return 'inValidSite';
                            });
                        });
                    }

                    return Promise.all(sitePromises()).then(function (validSites) {
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
