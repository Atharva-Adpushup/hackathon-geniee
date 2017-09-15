// Geniee-Ap REST API controller

var express = require('express'),
    siteModel = require('../models/siteModel'),
    _ = require('lodash'),
    urlModule = require('url'),
    AdPushupError = require('../helpers/AdPushupError'),
    reGenerator = require('../misc/tools/regexGenerator'),
    utils = require('../helpers/utils'),
    channelModel = require('../models/channelModel'),
    config = require('../configs/config'),
    userModel = require('.././models/userModel'),
    adpushupEvent = require('../helpers/adpushupEvent'),
    commonConsts = require('../configs/commonConsts'),
    couchbase = require('../helpers/couchBaseService'),
    countryData = require('country-data'),
    Promise = require('bluebird'),
    N1qlQuery = require('couchbase-promises').N1qlQuery,
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

router
    .get('/:siteId/*', checkAuth)
    .get('/:siteId/settings', (req, res) => {
        return siteModel.getSiteById(req.params.siteId)
            .then(site => [siteModel.getSitePageGroups(req.params.siteId), site])
            .spread((sitePageGroups, site) => {
                return res.render('settings', {
                    pageGroups: sitePageGroups,
                    patterns: site.get('apConfigs').pageGroupPattern || {},
                    apConfigs: site.get('apConfigs'),
                    blocklist: site.get('apConfigs').blocklist,
                    siteId: req.params.siteId,
                    siteDomain: site.get('siteDomain')
                });
            })
            .catch(err => {
                return res.send('Some error occurred!');
            });
    })
    .get('/:siteId/opsPanel', (req, res) => {
        const { session, params } = req;

        if (session.isSuperUser) {
            return res.render('opsPanel', { siteId: params.siteId });
        } else {
            return res.render('404');
        }
    })
	.get('/:siteId/opsPanel/hbConfig', (req, res) => {
		const { siteId } = req.params;
	
		return couchbase.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(`hbcf::${siteId}`, {}))
		.then(hbConfig => res.status(200).send({ success: 1, data: hbConfig.value, message: 'Header bidding config fetched' }))
		.catch(err => {
			const { code } = err;

			if (code === 13) {
				return res.status(404).send({ success: 0, data: null, message: `Header bidding config for siteId : ${siteId} not found` })
			} else {
				return res.status(500).send({ success: 0, data: null, message: 'Some error occurred! Please try again later' })
			}
		});
	})
	.post('/:siteId/opsPanel/hbConfig', (req, res) => {
		const { siteId } = req.params,
			sitePromise = siteModel.getSiteById(req.params.siteId),
			appBucketPromise = couchbase.connectToAppBucket(),
			{ hbConfig, editMode } = JSON.parse(req.body.data);

		return Promise.all([sitePromise, appBucketPromise])
		.spread((site, appBucket) => {
			const json = { hbConfig: { bidderAdUnits: hbConfig }, siteId: siteId, siteDomain: site.get('siteDomain'), email: site.get('ownerEmail') };
			
			return editMode === 'update' ? appBucket.replacePromise(`hbcf::${siteId}`, json) : appBucket.insertPromise(`hbcf::${siteId}`, json);
		})
		.then(data => res.status(200).send({ success: 1, data: null, message: `Header bidding config updated` }))
		.catch(err => {
			console.log(err);
			return res.status(500).send({ success: 0, data: null, message: 'Some error occurred! Please try again later' })
		});
	})
	.get('/:siteId/settings/regexVerifier', function (req, res) {
        return siteModel.getSiteById(req.params.siteId)
            .then(site => [siteModel.getSitePageGroups(req.params.siteId), site])
            .spread((sitePageGroups, site) => {
                return res.render('regExVerifier', {
                    pageGroups: sitePageGroups,
                    patterns: site.get('apConfigs').pageGroupPattern ? site.get('apConfigs').pageGroupPattern : [],
                    siteId: req.params.siteId,
                    siteDomain: site.get('siteDomain')
                });
            })
            .catch(function (err) {
                res.send('Some error occurred!');
            });
    })
    .get('/:siteId/settings/regexGenerator', function (req, res) {
        return res.render('regexGenerator', {
            ok: undefined,
            userInputs: []
        });
    })
    .post('/:siteId/settings/regexGenerator', function(req, res) {
        var userInputs = req.body.url.filter(Boolean);
        if (!userInputs.length) {
            return res.render('regexGenerator', {
                ok: undefined,
                userInputs: []
            });
        } else {
            var response = reGenerator.init(userInputs);
            // console.log(response);
            return res.render('regexGenerator', {
                ok: response.ok,
                msg: response.errorMessage,
                regexResult: response.regex,
                userInputs: userInputs
            });
        }
    })
    .post('/:siteId/saveSiteSettings', function (req, res) {
        var json = { settings: req.body, siteId: req.params.siteId };
        json.settings.pageGroupPattern = JSON.stringify(_.groupBy(JSON.parse(json.settings.pageGroupPattern), (pattern) => { 
            return pattern.platform 
        }));
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
                    environment: config.environment.HOST_ENV,
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
