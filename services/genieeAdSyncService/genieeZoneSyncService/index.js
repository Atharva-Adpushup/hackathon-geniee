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
				if (!ad.adCode && !ad.networkParams) {
					unsyncedZones.push({
						variationId: variationId, adId: ad.id, sectionId: section.id, zoneName: section.name + '_' + ad.width + 'X' + ad.height,
						sizeWidth: ad.width, sizeHeight: ad.height, zoneType: 1, zonePosition: 0, firstView: 1, useFriendlyIFrameFlag: 0
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
			var zones = _.map(zonesToSync, function (zone) {
				return {
					zoneName: "test zone api0" /*zone.zoneName*/, sizeWidth: parseInt(zone.sizeWidth, 10), sizeHeight: parseInt(zone.sizeHeight, 10),
					zoneType: parseInt(zone.zoneType, 10), zonePosition: parseInt(zone.zonePosition, 10), firstView: parseInt(zone.firstView, 10),
					useFriendlyIFrameFlag: parseInt(zone.useFriendlyIFrameFlag, 10)
				}
			});
			return processBatches.fromArray(zones, 5, function (batch) {
				var json = { "pageGroupId": 52, "zones": [{ "zoneName": "test zone api0", "sizeWidth": 300, "sizeHeight": 250, "zoneType": 1, "zonePosition": 0, "firstView": 1, "useFriendlyIFrameFlag": 0 }, { "zoneName": "test zone api1", "sizeWidth": 300, "sizeHeight": 250, "zoneType": 1, "zonePosition": 0, "firstView": 1, "useFriendlyIFrameFlag": 0 }] },
					httpMethod = 'POST',
					url = 'https://beta-aladdin.geniee.jp/beta2/aladdin/adpushup/zone/create/',
					nounce = "57ff01d3e4c68"/*getNonce()*/,
					parameters = {
						oauth_consumer_key: "NDJiOGRmYTJmMGVhMzU1ZQ==",
						oauth_nonce: nounce,
						oauth_signature_method: "HMAC-SHA1",
						oauth_timestamp: "1476329939",
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
						Authorization: 'oauth_consumer_key="NDJiOGRmYTJmMGVhMzU1ZQ==", oauth_nonce="' + nounce + '", oauth_signature="' + signature + '", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1476329939", oauth_version="1.0"',
						'content-type': 'application/json'
					}
				}).then(function (zonesResult) {
					debugger;
					return true;
				})
			});
		},
		syncAndSaveChannelZones = function (channel, zonesToSync) {
			return syncChannelZones(channel.genieePageGroupId, zonesToSync).then(function (zonesResult) {
				debugger;
				return true;
			})
		};

	return getAllUnsyncedZones(site)
		.then(function (unsyncedZones) {
			return _.map(unsyncedZones, function (json) {
				return syncAndSaveChannelZones(json.channel, json.unsyncedZones);
			})
		})
		.then(function (allChannelsSyncPromises) {
			return Promise.all(allChannelsSyncPromises)
		})

}