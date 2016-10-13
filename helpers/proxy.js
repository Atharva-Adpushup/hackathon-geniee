var request = require('request-promise'),
	utils = require('../helpers/utils'),
	_ = require('lodash'),
	cheerio = require('cheerio'),
	API = {
		load: function(url, userAgent, fullResponse) {
			userAgent = userAgent ? userAgent : 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
			return request({
				uri: url,
				jar: true,
				strictSSL: false,
				resolveWithFullResponse: fullResponse ? true : false,
				headers: {
					'User-Agent': userAgent,
					'Accept-Encoding': 'identity'
				}
			});
		},
		detectWp: function(url) {
			return API.load(utils.rightTrim(url, '/') + '/wp-trackback.php').then(function(body) {
				if (body.indexOf('I really need an ID for this to work') === -1) {
					return false;
				}
				return true;
			}, function(err) {
				if (err.message.indexOf('I really need an ID for this to work') === -1) {
					return false;
				}
				return true;
			});
		},
		detectCustomAp: function(url) {
			return API.load(url).then(function(body) {
				return body.match('//optimize.adpushup.com') ? true : false;
			});
		},
		detectAdPushup: function(url) {
			return API.load(url).then(function(body) {
				var $ = cheerio.load(body), json = null, finalData;
				$('noscript').each(function(index, el) {
					var html = $(el).text().trim();
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
				Object.keys(json.urls).forEach(function(key) {
					finalData.pageGroups.push({ pageGroup: key.toUpperCase(), sampleUrl: json.urls[key] });
				});
				return finalData;
			});
		}
	};

module.exports = API;
