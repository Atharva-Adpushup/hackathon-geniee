var config = require('../../../configs/config'),
	channelModel = require('../../../models/channelModel'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	rp = require('request-promise'),
	ouathNonce = require('oauth_nonce'),
	processBatches = require('process-batches'),
	oauthSignature = require('oauth-signature'),
	crypto = require('crypto-js'),
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
		syncChannelZones = function (pageGroupId, zonesToSync) {
			var zones = _.map(zonesToSync, function (zone) {
				return {
					zoneName: "test zone api0" /*zone.zoneName*/, sizeWidth: parseInt(zone.sizeWidth, 10), sizeHeight: parseInt(zone.sizeHeight, 10),
					zoneType: parseInt(zone.zoneType, 10), zonePosition: parseInt(zone.zonePosition, 10), firstView: parseInt(zone.firstView, 10),
					useFriendlyIFrameFlag: parseInt(zone.useFriendlyIFrameFlag, 10)
				}
			});
			return processBatches.fromArray(zones, 5, function (batch) {
				var json = {
					pageGroupId: 52,
					zones: JSON.stringify([
						{ zoneName: "test zone api1", sizeWidth: 300, sizeHeight: 250, zoneType: 1, zonePosition: 0, firstView: 1, useFriendlyIFrameFlag: 0 },
						{ zoneName: "test zone api2", sizeWidth: 300, sizeHeight: 250, zoneType: 1, zonePosition: 0, firstView: 1, useFriendlyIFrameFlag: 0 }
					])
				}, httpMethod = 'POST',
					url = 'https://beta-aladdin.geniee.jp/beta2/aladdin/adpushup/zone/create/',
					nounce = "57ff01d3e4c68"/*ouathNonce()*/,
					parameters = {
						oauth_consumer_key: "NDJiOGRmYTJmMGVhMzU1ZQ==",
						oauth_nonce: '57ff01d3e4c68',
						oauth_signature_method: "HMAC-SHA1",
						oauth_timestamp: "1476329939",
						oauth_version: "1.0"
					},
					consumerSecret = 'MDc0N2MzMDYzYTQ2NDk5MDUzNzQ0YjIwMTJkY2UzZDA=';
				var signatureBaseString = new oauthSignature.SignatureBaseString(httpMethod, url, _.extend(parameters, json)).generate(),
					signature = crypto.HmacSHA1(signatureBaseString, consumerSecret + '&').toString(crypto.enc.Base64);

				baseString = 'POST&http%3A%2F%2Fbeta-aladdin.geniee.jp%2Fbeta2%2Faladdin%2Fadpushup%2Fzone%2Fcreate%2F&oauth_consumer_key%3DNDJiOGRmYTJmMGVhMzU1ZQ%3D%3D%26oauth_nonce%3D57ff01d3e4c68%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1476329939%26oauth_version%3D1.0%26pageGroupId%3D52%26zones%3D%5B%7B%22zoneName%22%3A%22test%20zone%20api0%22%2C%22sizeWidth%22%3A300%2C%22sizeHeight%22%3A250%2C%22zoneType%22%3A1%2C%22zonePosition%22%3A0%2C%22firstView%22%3A1%2C%22useFriendlyIFrameFlag%22%3A0%7D%2C%7B%22zoneName%22%3A%22test%20zone%20api1%22%2C%22sizeWidth%22%3A300%2C%22sizeHeight%22%3A250%2C%22zoneType%22%3A1%2C%22zonePosition%22%3A0%2C%22firstView%22%3A1%2C%22useFriendlyIFrameFlag%22%3A0%7D%5D';

				signature = crypto.HmacSHA1(baseString, consumerSecret + '&').toString(crypto.enc.Base64);
				//signature = "ew8j+JzW3BUkx/0hzFvumEpIVOE="


				//json = { "pageGroupId": 52, "zones": [{ "zoneName": "test zone api0", "sizeWidth": 300, "sizeHeight": 250, "zoneType": 1, "zonePosition": 0, "firstView": 1, "useFriendlyIFrameFlag": 0 }, { "zoneName": "test zone api1", "sizeWidth": 300, "sizeHeight": 250, "zoneType": 1, "zonePosition": 0, "firstView": 1, "useFriendlyIFrameFlag": 0 }] };
				return rp({
					method: 'POST',
					uri: 'https://beta-aladdin.geniee.jp/beta2/aladdin/adpushup/zone/create/',
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