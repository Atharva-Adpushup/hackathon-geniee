var path = require('path'),
    Promise = require('bluebird'),
    retry = require('bluebird-retry'),
    _ = require('lodash'),
	moment = require('moment'),
    PromiseFtp = require('promise-ftp'),
    universalReportService = require('../../../reports/universal/index'),
    mkdirpAsync = Promise.promisifyAll(require('mkdirp')).mkdirpAsync,
    fs = Promise.promisifyAll(require('fs')),
	AdPushupError = require('../../../helpers/AdPushupError'),
    CC = require('../../../configs/commonConsts'),
    config = require('../../../configs/config');

module.exports = function (site) {
    ftp = new PromiseFtp();

    var paramConfig = {
            siteId: site.get('siteId')
        },
        isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise),
        jsTplPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'adpushup.js'),
        uncompressedJsTplPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'adpushup-debug.js'),
        tempDestPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'geniee', site.get('siteId').toString()),
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
                    json.networkData = {
                        zoneId: ad.networkData.zoneId
                    };
                } else { //for custom network provide adcode to replay
                    json.adCode = ad.adCode;
                }

                ads.push(json);
            });
            return !unsyncedAds ? ads : [];
        },
        getVariationsPayload = function (site, reportData) {
            var finalJson = {},
                pageGroupPattern = site.get('apConfigs').pageGroupPattern;

            return site.getAllChannels().then(function (allChannels) {
                _.each(allChannels, function (channel) {
                    var platform, pageGroup, channelKey, pageGroupData,
                        pageGroupId, isReportData, isGenieeReportData, isApexReportData;

                    platform = channel.platform; // last element is platform
                    pageGroup = channel.pageGroup; // join remaing to form pageGroup
                    // channelKey sample name HOME_DESKTOP
                    channelKey = pageGroup + '_' + platform;
                    isReportData = !!(reportData && _.isObject(reportData));
                    isGenieeReportData = !!(isReportData && channel.genieePageGroupId);
                    isApexReportData = !!(isReportData && channelKey && isAutoOptimise);

                    //TODO: Move below partner specific logic in universal app service
                    if (isGenieeReportData) {
                        pageGroupId = channel.genieePageGroupId;
                    } else if (isApexReportData) {
                        pageGroupId = channelKey;
                    }

                    pageGroupData = pageGroupId ? reportData.pageGroups[pageGroupId] : null;

                    if (!finalJson[platform]) {
                        finalJson[platform] = {};
                    }

                    function getPageGroupPattern(patterns) {
                        for(var i = 0; i < patterns.length; i ++) {
                            if(patterns[i].pageGroup === pageGroup) {
                                return patterns[i].pattern;
                            }
                        }
                        return null;
                    }

                    finalJson[platform][pageGroup] = {
                        variations: [],
                        contentSelector: channel.contentSelector,
                        pageGroupPattern: getPageGroupPattern(pageGroupPattern[platform])
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
                            // pageRPM is mapped as sum
                            sum: ((isVariationData && parseFloat(variationData.pageRPM) > -1) ? variationData.pageRPM : 1),
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
            delete apConfigs.pageGroupPattern;
            return apConfigs;
        },
        getJsFile = fs.readFileAsync(jsTplPath, 'utf8'),
        getUncompressedJsFile = fs.readFileAsync(uncompressedJsTplPath, 'utf8'),
        getComputedConfig = Promise.resolve(true).then(function() {
            return universalReportService.getReportData(site)
                .then(function(reportData) {
                    if (!reportData.status && !reportData.data) {
                        return getVariationsPayload(site).then(setAllConfigs);
                    } else if (reportData.status && reportData.data) {
                        return getVariationsPayload(site, reportData.data).then(setAllConfigs);
                    }
                });
        }),
        getFinalConfig = Promise.join(getComputedConfig, getJsFile, getUncompressedJsFile, function (finalConfig, jsFile, uncompressedJsFile) {
            jsFile = _.replace(jsFile, '___abpConfig___', JSON.stringify(finalConfig));
            jsFile = _.replace(jsFile, /_xxxxx_/g, site.get('siteId'));

            uncompressedJsFile = _.replace(uncompressedJsFile, '___abpConfig___', JSON.stringify(finalConfig));
            uncompressedJsFile = _.replace(uncompressedJsFile, /_xxxxx_/g, site.get('siteId'));

            return { default: jsFile, uncompressed: uncompressedJsFile };
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
                return Promise.resolve(true);
            }
            return ftp.connect({ host: config.cacheFlyFtp.HOST, user: config.cacheFlyFtp.USERNAME, password: config.cacheFlyFtp.PASSWORD });
        },
        uploadJS = function (fileConfig) {
            return connectToServer()
                .then(cwd)
                .then(function () {
                    return ftp.put(fileConfig.default, 'adpushup.js');
                })
                .then(function() {
                    return fileConfig.uncompressed;
                });
        };

    return getFinalConfig
        .then(uploadJS)
        .then(writeTempFile)
        .finally(function () {
            if (ftp.getConnectionStatus() === 'connected') {
                ftp.end();
            }
            return Promise.resolve();
        });
}	