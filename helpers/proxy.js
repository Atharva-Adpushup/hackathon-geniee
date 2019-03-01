var request = require('request-promise'),
	utils = require('../helpers/utils'),
	_ = require('lodash'),
	cheerio = require('cheerio'),
	commonConst = require('../configs/commonConsts'),
	AdPushupError = require('../helpers/AdPushupError'),
	API = {
		load: function(url, userAgent, fullResponse) {
			userAgent = userAgent
				? userAgent
				: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
			return request({
					uri: url,
					jar: true,
					strictSSL: false,
					resolveWithFullResponse: fullResponse ? true : false,
					headers: {
						'User-Agent': userAgent,
						'Accept-Encoding': 'identity'
					}
				},
				err => {
					if (err.message.indexOf('I really need an ID for this to work') === -1) {
						return false;
					}
					return true;
				}
			);
		},
		detectCustomAp(url, siteId) {
			return API.load(url).then(body => {
				const apCodeDetected = body.match(`//.+.adpushup.com/${siteId}/adpushup.js`);
				return !!apCodeDetected;
			});
		},
		detectAdPushup: function (url) {
			return API.load(url).then(function (body) {
				var $ = cheerio.load(body),
					json = null,
					finalData;
				$('noscript').each(function (index, el) {
					var html = $(el)
						.text()
						.trim();
					if (html.indexOf('_ap_ufes') === -1) {
						return true;
					}
					html = _.trimStart(html, '_ap_ufes');
					html = _.trimEnd(html, '_ap_ufee');
					json = JSON.parse(html);
					return false;
				});
				if (!json) {
					return false;
				}
				finalData = { cmsName: 'wordpress', pageGroups: [] };
				Object.keys(json.urls).forEach(function (key) {
					finalData.pageGroups.push({ pageGroup: key.toUpperCase(), sampleUrl: json.urls[key] });
				});
				return finalData;
			});
		},
		detectCustomAp: function(url, siteId) {
			return API.load(url).then(function(body) {
				// var apCodeDetected = body.match(`//.+.adpushup.com/${siteId}/adpushup.js`);
				var apCodeDetected = body.match(`//.+.adpushup.com/`);
				return !!apCodeDetected;
			});
			if (!json) {
				return false;
			}
			finalData = { cmsName: 'wordpress', pageGroups: [] };
			Object.keys(json.urls).forEach(key => {
				finalData.pageGroups.push({ pageGroup: key.toUpperCase(), sampleUrl: json.urls[key] });
			});
			return finalData;
		});
	},
	fetchOurAdsTxt() {
		return API.load(commonConst.onboarding.adsTxtDocUrl);
	},
	normalizeAdsTxtEntries: text => {
		let normalizedText = text.replace(/[, \t]+/g, ',');

					return true;
				})
				.catch(err => {
					if (!(err instanceof AdPushupError) && err.statusCode === 404) {
						throw new AdPushupError({
							httpCode: 404,
							error:
								'ads.txt file not found on your site. Please upload our ads.txt file on your site.',
							ourAdsTxt
						});
					}

					if (!(err instanceof AdPushupError) && err.error.code === 'ENOTFOUND') {
						throw new AdPushupError({
							httpCode: 404,
							error: 'Unable to reach your site!',
							ourAdsTxt
						});
					}

					throw err;
				});
		},


};

module.exports = API;
