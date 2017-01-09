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
    config = require('../configs/config'),
    Mailer = require('../helpers/Mailer'),
    // Create mailer config
    mailConfig = {
        MAIL_FROM: config.email.MAIL_FROM,
        MAIL_FROM_NAME: config.email.MAIL_FROM_NAME,
        SMTP_SERVER: config.email.SMTP_SERVER,
        SMTP_USERNAME: config.email.SMTP_USERNAME,
        SMTP_PASSWORD: config.email.SMTP_PASSWORD,
    },
    // Instantiate mailer
    mailer = new Mailer(mailConfig, 'text');

function dashboardRedirection(req, res, allUserSites, type) {
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

        if(type == 'onboarding') {
            if(sites.length >= 1) {
                var hasStep = 'step' in sites[0] ? true : false;
                if(hasStep && sites[0].step == 6) {
                    return res.redirect('/user/dashboard');
                }
            }
        }

        switch(type) {
            case 'dashboard':
            case 'default':
                return res.render('dashboard', {
                    validSites: sites,
                    unSavedSite: unSavedSite,
                    hasStep: sites.length ? ('step' in sites[0] ? true : false) : false,
                    requestDemo: req.session.user.requestDemo
                });
            break;
            case 'onboarding': 
                return res.render('onboarding', {
                    validSites: sites,
                    unSavedSite: unSavedSite,
                    hasStep: sites.length ? ('step' in sites[0] ? true : false) : false,
                    requestDemo: req.session.user.requestDemo,
                    analyticsObj: JSON.stringify(req.session.analyticsObj)
                });
            break;
        };
    });
};

router
    .get('/dashboard', function (req, res) {
        return userModel.getAllUserSites(req.session.user.email)
            .then(function (sites) {
                var allUserSites = sites;
                return dashboardRedirection(req, res, allUserSites, 'dashboard');
            })
            .catch(function (err) {
                var allUserSites = req.session.user.sites;
                return dashboardRedirection(req, res, allUserSites, 'dashboard');
            });
    })
    .get('/onboarding', function (req, res) {
        var allUserSites = req.session.user.sites;
        return dashboardRedirection(req, res, allUserSites, 'onboarding');
    })
    .post('/setSiteStep', function (req, res) {
        siteModel.setSiteStep(req.body.siteId, req.body.step)
            .then(function () { return userModel.setSitePageGroups(req.session.user.email) })
            .then(function (user) {
                req.session.user = user;

                if (req.body.completeOnboarding) {
                    user.set('requestDemo', true);
                }

                user.save();
                return res.send({ success: 1 });
            })
            .catch(function () {
                return res.send({ success: 0 });
            });
    })
    .post('/setSiteServices', function (req, res) {
        if (req.body && req.body.servicesString) {
            userModel.getUserByEmail(req.session.user.email).then(function (user) {
                var userSites = user.get('sites');
                user.set('preferredModeOfReach', req.body.modeOfReach);
                for (var i in userSites) {
                    if (userSites[i].domain === req.body.newSiteUnSavedDomain) {
                        userSites[i].services = req.body.servicesString;
                        userSites[i].step = 1;
                        user.set('sites', userSites);
                        req.session.user = user;
                        user.save();
                        return res.send({ success: 1 });
                    } else {
                        return res.send({ success: 0 });
                    }
                }
            }).catch(function (err) {
                console.log(err);
                return res.send({ success: 0 });
            });
        } else {
            return res.send({ success: 0 });
        }
    })
    .post('/sendCode', function (req, res) {
        var json = {
            email: req.body.developerEmail,
            code: req.body.headerCode
        };
        userModel.sendCodeToDev(json).then(function () {
            res.send({ success: 1 });
        })
            .catch(function (e) {
                res.send({ success: 0 });
            });
    })
    .get('/billing', function (req, res) {
        res.render('billing', {
            user: req.session.user,
            isSuperUser: true
        });
    })
    .get('/connectGoogle', function (req, res) {
        return userModel.getUserByEmail(req.session.user.email)
            .then(function (user) {
                var adSenseData = _.find(user.get('adNetworkSettings'), {'networkName': 'ADSENSE'});
                return res.render('connectGoogle', {
                    adNetworkSettings: !_.isEmpty(user.get('adNetworkSettings')) ? { 
                        pubId: adSenseData.adsenseAccounts[0].id,
                        email: adSenseData.userInfo.email
                    } : false
                });
            })
            .catch(function (err) {
                res.redirect('/404');
            });
    })
    .get('/addSite', function (req, res) {
        if(req.session.isSuperUser) {
            var allUserSites = req.session.user.sites,
                params = {};
            _.map(allUserSites, function (site) {
                if (site.step < 6) {
                    params = {
                        siteDomain: site.domain,
                        siteId: site.siteId,
                        step: site.step
                    }
                }
            });

            res.render('addSite', params);
        } else {
            res.redirect('/403');
        }
    })
    .post('/addSite', function (req, res) {
        var site = (req.body.site) ? utils.getSafeUrl(req.body.site) : req.body.site;

        userModel.addSite(req.session.user.email, site).spread(function (user, siteId) {
            var userSites = user.get('sites');
            for (var i in userSites) {
                if (userSites[i].siteId === siteId) {
                    userSites[i].step = 2;
                    user.set('sites', userSites);
                    req.session.user = user;
                    user.save();
                    return res.send({ success: 1, siteId: siteId });
                }
            }
            return res.send({ success: 0 });
        }).catch(function (err) {
            return res.send({ success: 0 });
        });
    })
    .get('/logout', function (req, res) {
        req.session.destroy(function () {
            return res.redirect('/');
        });
    })
    .post('/deleteSite', function (req, res) {
        userModel.verifySiteOwner(req.session.user.email, req.body.siteId)
            .then(function () {
                return siteModel.deleteSite(req.body.siteId);
            })
            .then(function () {
                return res.redirect('dashboard');
            }).catch(function (err) {
                console.log(err);
                return res.redirect('dashboard');
            });
    })
    .post('/switchTo', function (req, res) {
        var email = (req.body.email) ? utils.sanitiseString(req.body.email) : req.body.email;

        if (req.session.isSuperUser === true) {
            userModel.setSitePageGroups(email).then(function (user) {
                req.session.user = user;
                var allUserSites = user.get('sites');

                function sitePromises() {
                    return _.map(allUserSites, function(obj) {
                        return siteModel.getSiteById(obj.siteId).then(function() {
                            return obj;
                    }).catch(function(err) {
                            return 'inValidSite';
                        });
                    });
                }
                
                return Promise.all(sitePromises()).then(function(validSites) {
                    var sites = _.difference(validSites, ['inValidSite']);
                    if (Array.isArray(sites) && sites.length > 0) {
                        if (sites.length == 1) {
                            var step = sites[0].step;
                            if(step && step < 6) {
                                return res.redirect('/user/onboarding');
                            }
                            if(!user.get('requestDemo')) {
                                return res.redirect('/user/dashboard');
                            } else {
                                return res.redirect('/thankyou');
                            }
                        } else {
                            return res.redirect('/user/dashboard');
                        }
                    } else {
                        return res.redirect('/user/onboarding');
                    }
                });
                // return res.redirect('/');
            }, function () {
                return res.redirect('/');
            });
        } else {
            return res.redirect('/');
        }
    })
    .get('/requestOauth', function (req, res) {
        req.session.state = uuid.v1();
        return res.redirect(oauthHelper.getRedirectUrl(req.session.state));
    })
    .get('/oauth2callback', function (req, res) {
        if (req.session.state !== req.query.state) {
            res.status(500);
            res.send('Fake Request');
        } else if (req.query.error === 'access_denied') {
            res.status(500);
            res.send('Seems you denied request, if done accidently please press back button to retry again.');
        } else {
            var getAccessToken = oauthHelper.getAccessTokens(req.query.code),
                getAdsenseAccounts = getAccessToken.then(function (token) {
                    return request({
                        strictSSL: false,
                        uri: 'https://www.googleapis.com/adsense/v1.4/accounts?access_token=' + token.access_token,
                        json: true
                    }).then(function (adsenseInfo) {
                        return adsenseInfo.items;
                    }).catch(function (err) {
                        if (err.error && err.error.error && err.error.error.message.indexOf('User does not have an AdSense account') === 0) {
                            throw new Error('No adsense account');
                        }
                        throw err;
                    });
                }),
                getUserInfo = getAccessToken.then(function (token) {
                    return request({
                        strictSSL: false,
                        uri: 'https://www.googleapis.com/oauth2/v2/userinfo?access_token=' + token.access_token,
                        json: true
                    });
                }),
                getUser = userModel.getUserByEmail(req.session.user.email);

            Promise.join(getUser, getAccessToken, getAdsenseAccounts, getUserInfo, function (user, token, adsenseAccounts, userInfo) {
                user.addNetworkData({
                    'networkName': 'ADSENSE',
                    'refreshToken': token.refresh_token,
                    'accessToken': token.access_token,
                    'expiresIn': token.expires_in,
                    'pubId': adsenseAccounts[0].id,
                    'adsenseEmail': userInfo.email,
                    'userInfo': userInfo,
                    'adsenseAccounts': adsenseAccounts
                }).then(function () {
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
            }).catch(function (err) {
                res.status(500);
                err.message === 'No adsense account' ? res.send('Sorry but it seems you have no AdSense account linked to your Google account.' +
                    'If this is a recently verified/created account, it might take upto 24 hours to come in effect.' +
                    'Please try again after sometime or contact support.') : res.send(err);
            });
        }
    })
    .get('/profile', function (req, res) {
        userModel.getUserByEmail(req.session.user.email).then(function (user) {
            var formData = {
                'firstName': user.get('firstName'),
                'lastName': user.get('lastName'),
                'email': user.get('email')
            };

            res.render('profile', {
                formData: formData
            });
        }, function () {
            return res.redirect('/');
        });
    })
    .post('/profile', function (req, res) {
        req.body.firstName = (req.body.firstName) ? utils.trimString(req.body.firstName) : req.body.firstName;
        req.body.lastName = (req.body.lastName) ? utils.trimString(req.body.lastName) : req.body.lastName;

        userModel.saveProfile(req.body, req.session.user.email)
            .then(function () {
				/**
				 * TODO: Fix user.save() to return updated user object
				 * and remove below hack
				 * File name: model.js
				 */
                var user = Array.prototype.slice.call(arguments)[0];

                console.log(user);

                req.session.user = user;
                return res.render('profile', { profileSaved: true, formData: req.body });
            })
            .catch(function (e) {
                if (e instanceof AdPushupError) {
                    res.render('profile', { profileError: e.message, formData: req.body });
                } else if (e.name && e.name === 'CouchbaseError') {
                    res.render('profile', { userNotFound: true, formData: req.body });
                }
            });
    })
    .get('/updateUserStatus', function (req, res) {
        if (req.session.isSuperUser) {
            return res.render('updateUserStatus', {
                currentStatus: req.session.user.requestDemo,
                email: req.session.user.email,
                websiteRevenue: req.session.user.websiteRevenue
            });
        } else {
            return res.redirect('/user/dashboard');
        }
    })
    .post('/updateUserStatus', function (req, res) {
        if (req.session.isSuperUser) {
            var email = req.session.user.email,
                websiteRevenue = req.session.user.websiteRevenue,
                revenueUpperLimit = null;

            if(req.body.websiteRevenue.trim()) {
                websiteRevenue = req.body.websiteRevenue;
            }

            if (email.trim() && req.body.status) {
                var status = true; // By default user would be inactive
                /* 
                    By Default requestDemo would be True | User is inactive
                    To make user active | Need to set requestDemo False
                    If value in request is 0 | User should be active | Set requestDemo to be False
                    If value in request is 1 | User should be inactive | Set requestDemo to be True
                */
                if (req.body.status == 0) {
                    status = false;
                }

                var revenueArray = websiteRevenue.split('-');
                if(revenueArray.length > 1) {
                    revenueUpperLimit = revenueArray[1];
                } else {
                    revenueUpperLimit = revenueArray[0];		
                }

                return userModel.setUserStatus({
                    status: status,
                    websiteRevenue: websiteRevenue,
                    revenueUpperLimit: revenueUpperLimit
                    }, email.trim()).then(function (user) {
                    var currentStatus = user.get('requestDemo'),
                        websiteRevenue = user.get('websiteRevenue');

                    req.session.user = user;

                    return res.render('updateUserStatus', {
                        status: 'success',
                        message: 'User updated successfully',
                        currentStatus: currentStatus,
                        email: email,
                        websiteRevenue: websiteRevenue
                    });
                })
                .catch(function (err) {
                    if (err) {
                        return res.render('updateUserStatus', {
                            status: 'failure',
                            message: 'Some error occured',
                            currentStatus: req.session.user.requestDemo,
                            email: email,
                            websiteRevenue: websiteRevenue
                        })
                    }
                });
            } else {
                return res.render('updateUserStatus', {
                    status: 'failure',
                    message: 'Incomplete values'
                });
            }
        } else {
            return res.redirect('/user/dashboard');
        }
    });

module.exports = router;
