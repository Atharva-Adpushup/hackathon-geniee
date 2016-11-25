var config = require('../../../configs/config'),
    channelModel = require('../../../models/channelModel'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    rp = require('request-promise'),
    processBatches = require('process-batches'),
    signatureGenerator = require('./signatureGenerator'),
    crypto = require('crypto'),
    retry = require('bluebird-retry');

module.exports = function (site) {
    var getVariationUnsyncedZones = function (variationId, variationSections) {
        // Sample json for geniee zone
        // {"zoneName":"test zone api0","sizeWidth":300,"sizeHeight":250,"zoneType":1,"zonePosition":0,"firstView":1,"useFriendlyIFrameFlag":0}
        var unsyncedZones = [];
        _.each(variationSections, function (section, sectionId) {
            _.each(section.ads, function (ad) {
                if (ad.network === 'geniee' && !ad.networkData) {
                    unsyncedZones.push({
                        zoneName: ad.id, sizeWidth: parseInt(ad.width, 10), sizeHeight: parseInt(ad.height, 10),
                        zoneType: 1, zonePosition: 0, firstView: 1, useFriendlyIFrameFlag: 0
                    })
                }
            })
        });
        return unsyncedZones;
    },
        getAllUnsyncedZones = function (site) {
            var finalZones = [], channelUnsyncedZones = [];
            return site.getAllChannels().then(function (allChannels) {
                _.each(allChannels, function (channel) {
                    channelUnsyncedZones = [];
                    _.each(channel.variations, function (variation, id) {
                        channelUnsyncedZones = _.concat(channelUnsyncedZones, getVariationUnsyncedZones(id, variation.sections));
                    });
                    finalZones.push({ channel: channel, unsyncedZones: channelUnsyncedZones });
                });
                return finalZones;
            });
        },
        getNonce = function () {
            return crypto.randomBytes(32).toString('base64').replace(/[^\w]/g, '');
        },
        syncChannelZones = function (pageGroupId, zonesToSync) {
            var zonesWithId = [];
            return processBatches.fromArray(zonesToSync, 5, function (batch) {
                var json = { "pageGroupId": pageGroupId || 52, "zones": batch },
                    httpMethod = 'POST',
                    url = 'https://beta-aladdin.geniee.jp/beta2/aladdin/adpushup/zone/create/',
                    nounce = getNonce(),
                    ts = new Date().getTime(),
                    parameters = {
                        oauth_consumer_key: "NDJiOGRmYTJmMGVhMzU1ZQ==",
                        oauth_nonce: nounce,
                        oauth_signature_method: "HMAC-SHA1",
                        oauth_timestamp: ts,
                        oauth_version: "1.0",
                        pageGroupId: json.pageGroupId,
                        zones: json.zones
                    },
                    consumerSecret = 'MDc0N2MzMDYzYTQ2NDk5MDUzNzQ0YjIwMTJkY2UzZDA=',
                    signature = signatureGenerator(httpMethod, url, parameters, consumerSecret);

                return rp({
                    method: httpMethod,
                    uri: url,
                    body: json,
                    json: true,
                    headers: {
                        Authorization: 'oauth_consumer_key="NDJiOGRmYTJmMGVhMzU1ZQ==", oauth_nonce="' + nounce + '", oauth_signature="' + signature + '", oauth_signature_method="HMAC-SHA1", oauth_timestamp="' + ts + '", oauth_version="1.0"',
                        'content-type': 'application/json'
                    }
                }).then(function (zonesResult) {
                    zonesWithId = zonesWithId.concat(zonesResult.zones);
                    return true;
                })
            }).then(function () {
                return zonesWithId;
            })
        },
        syncAndSaveChannelZones = function (site, channelJson, zonesToSync) {
            return syncChannelZones(channelJson.genieePageGroupId, zonesToSync).then(function (zonesResult) {
                return channelModel.getChannel(site.get('siteId'), channelJson.platform, channelJson.pageGroup)
                    .then(function (channel) {
                        var variations = channel.get('variations');
                        _.each(variations, function (variation) {
                            _.each(zonesResult, function (zone) {
                                _.each(variation.sections, function (section) {
                                    if (section.ads[zone.zoneName]) {
                                        section.ads[zone.zoneName].networkData = { zoneId: zone.zoneId }
                                    }
                                })
                            })
                        });
                        channel.set('variations', variations, true);
                        return channel.save();
                    });
            })
        };

    return function () {
        return getAllUnsyncedZones(site)
            .then(function (unsyncedZones) {
                return _.map(unsyncedZones, function (json) {
                    return syncAndSaveChannelZones(site, json.channel, json.unsyncedZones);
                })
            })
            .then(function (allChannelsSyncPromises) {
                return Promise.all(allChannelsSyncPromises)
            })
    }

}