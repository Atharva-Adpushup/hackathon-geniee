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
		fetchOurAdsTxt() {
			return API.load(commonConst.onboarding.adsTxtDocUrl);
		},
		normalizeAdsTxtEntries: text => {
			let normalizedText = text.replace(/[, \t]+/g, ',');

			// trim Byte Order Mark
			if (normalizedText.charCodeAt(0) === 65279) {
				normalizedText = normalizedText.substr(1);
			}

			// split new lines
			let stringArr = normalizedText.split(/[\n\r]+/);

			// Filter out comments and empty lines
			stringArr = stringArr.filter(string => string[0] !== '#' && string !== '' && string !== ',');

			let normalizedEntries = stringArr.map(str => {
				const arr = str.trim().split(',');

				const normalizedEntry = `${arr[0] && arr[0][0] !== '#' ? arr[0].trim().toLowerCase() : ''},${
					arr[1] && arr[1][0] !== '#' ? arr[1].trim().toLowerCase() : ''
					},${arr[2] && arr[2][0] !== '#' ? arr[2].trim().toUpperCase() : ''}`;

				return normalizedEntry;
			});

			// filter out duplicate entries
			normalizedEntries = normalizedEntries.filter(
				(item, pos, currArray) => currArray.indexOf(item) === pos
			);

			return normalizedEntries;
		},
		verifyAdsTxt(url, ourAdsTxt) {
			return API.load(`${utils.rightTrim(url, '/')}/ads.txt`)
				.then(existingAdsTxt => {
					const existingAdsTxtArr = API.normalizeAdsTxtEntries(existingAdsTxt);
					const ourAdsTxtArr = API.normalizeAdsTxtEntries(ourAdsTxt);

					const entriesNotFound = ourAdsTxtArr.filter(
						value => existingAdsTxtArr.indexOf(value) === -1
					);

					if (entriesNotFound.length) {
						throw new AdPushupError({
							httpCode: 404,
							error:
								'Few ads.txt entries not found on your site. Please include these ads.txt entries in your ads.txt file.',
							ourAdsTxt: entriesNotFound.join('\n')
						});
					}

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
