var path = require('path'),
    Promise = require('bluebird'),
    retry = require('bluebird-retry'),
    _ = require('lodash'),
	moment = require('moment'),
    PromiseFtp = require('promise-ftp'),
    genieeReportService = require('../../../reports/partners/geniee/service'),
	apexVariationReportService = require('../../../reports/default/apex/service'),
    ftp = new PromiseFtp(),
    mkdirpAsync = Promise.promisifyAll(require('mkdirp')).mkdirpAsync,
    fs = Promise.promisifyAll(require('fs')),
	AdPushupError = require('../../../helpers/AdPushupError'),
    CC = require('../../../configs/commonConsts'),
    config = require('../../../configs/config');

module.exports = function (site) {
    var jsTplPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'adpushup.js'),
        tempDestPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'geniee', site.get('siteId').toString()),
        isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise),
        isGenieePartner = (!!(site.get('partner') && (site.get('partner') === CC.partners.geniee.name) && site.get('genieeMediaId') && isAutoOptimise)),
		paramConfig = {
			siteId: site.get('siteId'),
            mediaId: site.get('genieeMediaId'),
			dateFrom: moment().subtract(31, 'days').format('YYYY-MM-DD'),
			dateTo: moment().subtract(1, 'days').format('YYYY-MM-DD')
		},
        getAdsPayload = function (variationSections) {
            var ads = [], ad = null, json, unsyncedAds = false;
            _.each(variationSections, function (section, sectionId) {
                if (!Object.keys(section.ads).length) {
                    return true;
                }
                ad = section.ads[Object.keys(section.ads)[0]]; // for now we have only one ad inside a section

                //In case if even one ad inside variation is unsynced then we don't serve this variation'
                // check to find if ad is synced or not, for genieee if networkData present then adSynced and for custom network 
                // if adcode present then ad synced
                if ((ad.network == 'geniee' && !ad.networkData && !ad.adCode) || (ad.network == 'custom' && !ad.adCode)) {
                    unsyncedAds = true;
                    return false; //break loop when ad is unsynced
                }

                json = { id: sectionId, network: ad.network, css: ad.css, height: parseInt(ad.height, 10), width: parseInt(ad.width, 10) };
                if (section.isIncontent) {
                    _.extend(json, {
                        isIncontent: true, float: section.float, minDistanceFromPrevAd: section.minDistanceFromPrevAd,
                        ignoreXpaths: section.ignoreXpaths || [], section: parseInt(section.sectionNo, 10)
                    });
                    if (ad.secondaryCss) {
                        json.secondaryCss = ad.secondaryCss;
                    }
                    if (section.notNear) {
                        json.notNear = section.notNear;
                    }
                } else {
                    _.extend(json, {
                        xpath: section.xpath, operation: section.operation
                    });
                }
                //for geniee provide networkData
                if ((ad.network == 'geniee' && ad.networkData)) {
                    json.networkData = ad.networkData;
                } else { //for custom network provide adcode to replay
                    json.adCode = ad.adCode;
                }

                ads.push(json);
            });
            return !unsyncedAds ? ads : [];
        },
        getVariationsPayload = function (site, reportData) {
            var finalJson = {};

            return site.getAllChannels().then(function (allChannels) {
                _.each(allChannels, function (channel) {
                    var platform, pageGroup, channelKey, pageGroupData,
                        pageGroupId, isReportData, isGenieeReportData;

                    platform = channel.platform; // last element is platform
                    pageGroup = channel.pageGroup; // join remaing to form pageGroup
                    // channelKey sample name HOME_DESKTOP
                    channelKey = pageGroup + '_' + platform;
                    isReportData = !!(reportData && _.isObject(reportData));
                    isGenieeReportData = !!(isReportData && channel.genieePageGroupId);

                    //TODO: Move below partner specific logic in universal app service
                    if (isGenieeReportData) {
                        pageGroupId = channel.genieePageGroupId;
                    } else if (isReportData) {
                        pageGroupId = channelKey;
                    }

                    pageGroupData = reportData.pageGroups[pageGroupId];

                    if (!finalJson[platform]) {
                        finalJson[platform] = {};
                    }

                    finalJson[platform][pageGroup] = {
                        variations: [],
                        contentSelector: channel.contentSelector
                    };

                    _.each(channel.variations, function (variation, id) {
                        var ads = getAdsPayload(variation.sections),
                            variationData = (pageGroupData && _.isObject(pageGroupData)) ? pageGroupData.variations[id] : null,
                            isVariationData = !!(variationData && _.isObject(variationData)),
                            computedVariationObj;

                        if (!ads.length) {
                            return true;
                        }

                        computedVariationObj = {
                            id: variation.id,
                            name: variation.name,
                            traffic: variation.trafficDistribution,
                            customJs: variation.customJs,
                            ads: ads,
                            // Data required for auto optimiser model
                            // Click is mapped as sum
                            sum: ((isVariationData && parseInt(variationData.click, 10) > -1) ? variationData.click : 1),
                            // Data required for auto optimiser model
                            // Page view is mapped as count
                            count: ((isVariationData && parseInt(variationData.pageViews, 10) > -1) ? variationData.pageViews : 1)
                        };

                        finalJson[platform][pageGroup].variations.push(computedVariationObj);
                    });

                    finalJson[platform][pageGroup].variations.sort(function (a, b) {
                        return a.traffic - b.traffic;
                    })

                });
                return finalJson;
            });
        },
        setAllConfigs = function (allVariations) {
            var apConfigs = site.get('apConfigs'),
                isAdPartner = !!(site.get('partner'));

            isAdPartner ? (apConfigs.partner = site.get('partner')) : null;
            apConfigs.autoOptimise = (isAutoOptimise ? true : false);
            // Default 'draft' mode is selected if config mode is not present
            apConfigs.mode = !apConfigs.mode ? 2 : apConfigs.mode;
            apConfigs.experiment = allVariations;
            return apConfigs;
        },
        getJsFile = fs.readFileAsync(jsTplPath, 'utf8'),
        getReportData = function(paramConfig) {
            return apexVariationReportService.getReportData(paramConfig.siteId)
                .then(function(reportData) {
                    return getVariationsPayload(site, reportData).then(setAllConfigs);
                }).catch(function(e) {
                    /**********NOTE: SPECIAL CONDITION (APEX REPORTS)**********/
                    // Only return variations payload without apex reports data when
                    // Apex reports return an empty report for any variation
                    // & consequently throws below exception message
                    if (e && (e instanceof AdPushupError) && e.message && e.message === CC.exceptions.str.apexServiceDataEmpty) {
                        return getVariationsPayload(site).then(setAllConfigs);
                    }

                    throw e;
                });
        },
        getGenieeReportData = function(paramConfig) {
            return genieeReportService.getReport(paramConfig).then(function(reportData) {
                return getVariationsPayload(site, reportData).then(setAllConfigs);
            }).catch(function(e) {
                /**********NOTE: SPECIAL CONDITION (GENIEE REPORTS)**********/
                // Only return variations payload without geniee reports data when
                // Geniee reports return an empty Array [] & consequently throws below exception message
                if (e && (e instanceof AdPushupError) && e.message && e.message === CC.partners.geniee.exceptions.str.zonesEmpty) {
                    return getVariationsPayload(site).then(setAllConfigs);
                }

                throw e;
            });
        },
        getComputedConfig = Promise.resolve(true).then(function() {
            if (isGenieePartner) {
                return getGenieeReportData(paramConfig);
            } else {
                return getReportData(paramConfig);
            }
        }),
        getFinalConfig = Promise.join(getComputedConfig, getJsFile, function (finalConfig, jsFile) {
            jsFile = _.replace(jsFile, '___abpConfig___', JSON.stringify(finalConfig));
            jsFile = _.replace(jsFile, /_xxxxx_/g, site.get('siteId'));
            return jsFile;
        }),
        writeTempFile = function (jsFile) {
            return mkdirpAsync(tempDestPath).then(function () {
                return fs.writeFileAsync(path.join(tempDestPath, 'adpushup.js'), jsFile);
            })
        },
        cwd = function () {
            return ftp.cwd('/' + site.get('siteId')).catch(function () {
                return ftp.mkdir(site.get('siteId')).then(function () {
                    return ftp.cwd('/' + site.get('siteId'));
                });
            });
        },
        connectToServer = function () {
            if (ftp.getConnectionStatus() === 'connected') {
                return true;
            }
            return ftp.connect({ host: config.cacheFlyFtp.HOST, user: config.cacheFlyFtp.USERNAME, password: config.cacheFlyFtp.PASSWORD });
        },
        uploadJS = function (js) {
            return connectToServer()
                .then(cwd)
                .then(function () {
                    return ftp.put(js, 'adpushup.js');
                })
                .then(function() {
                    return js;
                });
        };

    return getFinalConfig
        .then(uploadJS)
        .then(writeTempFile)
        .finally(function () {
            if (ftp.getConnectionStatus() === 'connected') {
                ftp.end();
            }
        });
}	