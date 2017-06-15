var rp = require('request-promise'),
	Promise = require('bluebird'),
	AdPushupError = require('../../../helpers/AdPushupError'),
	oauthModule = require('./modules/oauth/index'),
	zoneModule = require('./modules/zone/index'),
	mediaModule = require('./modules/media/index'),
	pageGroupModule = require('./modules/pageGroup/index'),
	variationModule = require('./modules/variation/index'),
	_ = require('lodash'),
	signatureGenerator = require('../../../services/genieeAdSyncService/genieeZoneSyncService/signatureGenerator.js');
	const { defaultLanguageCode } = require('../../../i18n/language-mapping');

module.exports = (function(requestPromise, signatureGenerator, oauthModule, zoneModule, mediaModule, pageGroupModule, variationModule) {
	function getReportData(params) {
		var json = {
			"dateFrom": params.dateFrom, //"2016-11-01",
			"dateTo": params.dateTo, //"2016-12-04",
			"mediaId": params.mediaId, //920
			"pageGroupId": params.pageGroupId
		},
		localeCode = params.localeCode ? params.localeCode : defaultLanguageCode,
		httpMethod = 'GET',
		url = 'https://s.geniee.jp/aladdin/adpushup/report/',
		queryParams = _.compact(_.map(_.keys(json), function(key) {
			var value = json[key];

			return (value ? (key + '=' + value) : false);
		})).join("&"),
		nounce = oauthModule.getOauthNonce(),
		ts = new Date().getTime(),
		parameters = {
			dateFrom: json.dateFrom,
			dateTo: json.dateTo,
			oauth_consumer_key: "ZmJiMGZhNDUwOWI4ZjllOA==",
			oauth_nonce: nounce,
			oauth_signature_method: "HMAC-SHA1",
			oauth_timestamp: ts,
			oauth_version: "1.0",
			mediaId: json.mediaId
		},
		consumerSecret = 'M2IyNjc4ZGU1YWZkZTg2OTIyNzZkMTQyOTE0YmQ4Njk=',
		signature;

		url += '?' + queryParams;
		signature = signatureGenerator(httpMethod, url, parameters, consumerSecret);

		var getResponseData = requestPromise({
				uri: url,
				json: true,
				headers: {
					Authorization: 'oauth_consumer_key="ZmJiMGZhNDUwOWI4ZjllOA==", oauth_nonce="' + nounce + '", oauth_signature="' + signature + '", oauth_signature_method="HMAC-SHA1", oauth_timestamp="' + ts + '", oauth_version="1.0"',
					'content-type': 'application/json'
				}
			}),
			getFilteredZones = getResponseData.then(zoneModule.removeUnnecessaryZones),
			getSiteMetrics = getFilteredZones.then(mediaModule.getMediaMetrics),
			getChannelMetrics = getFilteredZones.then(pageGroupModule.getPageGroupMetrics),
			getChannelData = getChannelMetrics.then(pageGroupModule.getPageGroupDataById);

			return Promise.join(getResponseData, getFilteredZones, getSiteMetrics, getChannelMetrics, getChannelData, function(allZones, filteredZones, siteMetrics, pageGroupMetrics, pageGroupData) {
				var isInValidZonesData = !!(!allZones || !allZones.length),
					isInValidFilteredZonesData = !!(!filteredZones || !(Object.keys(filteredZones).length));

				if (isInValidZonesData || isInValidFilteredZonesData) {
					throw new AdPushupError('Zones should not be empty');
				}
				
				return pageGroupModule.updatePageGroupData(pageGroupData, pageGroupMetrics)
					.then(zoneModule.getZoneVariations)
					.then(variationModule.setVariationMetrics.bind(variationModule, params))
					.then(variationModule.removeRedundantVariationsObj)
					.then(variationModule.setVariationsTabularData.bind(null, localeCode))
					.then(variationModule.setVariationsHighChartsData)
					.then(function(updatedPageGroupsAndVariationsData) {
						var computedData = {media: siteMetrics, pageGroups: updatedPageGroupsAndVariationsData};

						return pageGroupModule.updateMetrics(computedData)
							.then(pageGroupModule.updateZones)
							.then(mediaModule.updateMetrics)
							.then(pageGroupModule.setPageGroupsTabularData.bind(null, localeCode))
							.then(pageGroupModule.setPageGroupsHighChartsData)
							.then(function(finalComputedData) {
								return Promise.resolve(finalComputedData);
							});
					});
			});
	}

	return {
		getReport: getReportData
	}
	//return getReportData({ dateFrom: '2016-11-01', dateTo: '2016-12-04', mediaId: 920 });

})(rp, signatureGenerator, oauthModule, zoneModule, mediaModule, pageGroupModule, variationModule);
