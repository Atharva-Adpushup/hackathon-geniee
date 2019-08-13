var request = require('request-promise'),
	utils = require('../helpers/utils'),
	_ = require('lodash'),
	crypto = require('crypto'),
	Promise = require('bluebird'),
	soap = require('strong-soap').soap,
	cheerio = require('cheerio'),
	commonConst = require('../configs/commonConsts'),
	config = require('../configs/config'),
	AdPushupError = require('../helpers/AdPushupError'),
	API = {
		load(url, userAgent, fullResponse) {
			userAgent =
				userAgent ||
				'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
			return request({
				uri: url,
				jar: true,
				strictSSL: false,
				resolveWithFullResponse: !!fullResponse,
				headers: {
					'User-Agent': userAgent,
					'Accept-Encoding': 'identity'
				}
			}).catch(err => {
				if (err && err.message.indexOf('I really need an ID for this to work') === -1) {
					return false;
				}
				return true;
			});
		},
		detectCustomAp(url, siteId) {
			return API.load(url).then(body => {
				const apCodeDetected = body.match(`//.+.adpushup.com/${siteId}/adpushup.js`);
				return !!apCodeDetected;
			});
		},
		detectAdPushup(url) {
			return API.load(url).then(body => {
				const $ = cheerio.load(body);

				let json = null;

				let finalData;
				$('noscript').each((index, el) => {
					let html = $(el)
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
				let normalizedEntry = '';
				for (let i = 0; i < arr.length; i++) {
					if (arr[i] && arr[i][0] !== '#') {
						normalizedEntry += arr[i].trim().toLowerCase();
						if (i !== arr.length - 1) normalizedEntry += ',';
					}
				}
				// const normalizedEntry = `${
				// 	arr[0] && arr[0][0] !== '#' ? arr[0].trim().toLowerCase() : ''
				// },${arr[1] && arr[1][0] !== '#' ? arr[1].trim().toLowerCase() : ''},${
				// 	arr[2] && arr[2][0] !== '#' ? arr[2].trim().toUpperCase() : ''
				// }`;

				return normalizedEntry;
			});

			// filter out duplicate entries
			normalizedEntries = normalizedEntries.filter(
				(item, pos, currArray) => currArray.indexOf(item) === pos
			);

			return normalizedEntries;
		},
		verifyAdsTxt(url, ourAdsTxt) {
			let tempUrl=url;
			if(tempUrl.indexOf('http://')==-1&&tempUrl.indexOf('https://')==-1){
				tempUrl=`http://${tempUrl}`;
			}
			return API.load(`${utils.rightTrim(tempUrl, '/')}/ads.txt`).then(existingAdsTxt => {
				if (typeof existingAdsTxt === 'string') {
					const existingAdsTxtArr = API.normalizeAdsTxtEntries(existingAdsTxt);
					const ourAdsTxtArr = API.normalizeAdsTxtEntries(ourAdsTxt);

					const entriesNotFound = ourAdsTxtArr.filter(
						value => existingAdsTxtArr.indexOf(value) === -1
					);

					if (entriesNotFound.length) {
						if (entriesNotFound.length == ourAdsTxtArr.length) {
							throw new AdPushupError({
								httpCode: 204,
								error: 'Our Ads.txt entries not found.',
								ourAdsTxt: entriesNotFound.join('\n')
							});
						} else {
							throw new AdPushupError({
								httpCode: 206,
								error: 'Few of our Ads.txt entries not found',
								ourAdsTxt: entriesNotFound.join('\n')
							});
						}
					}
				} else {
					throw new AdPushupError({
						httpCode: 404,
						error:
							'ads.txt file not found on your site. Please upload our ads.txt file on your site.',
						ourAdsTxt
					});
				}
			});
		},
		checkIfBillingProfileComplete(email) {
			var tipaltiConfig = config.tipalti,
				url = tipaltiConfig.soapUrl,
				payeeId = encodeURIComponent(
					crypto
						.createHash('md5')
						.update(email)
						.digest('hex')
						.substr(0, 64)
				),
				payer = tipaltiConfig.payerName,
				date = Math.floor(+new Date() / 1000),
				paramsStr = payer + payeeId + date + '100',
				key = tipaltiConfig.key,
				hash = crypto
					.createHmac('sha256', key)
					.update(paramsStr.toString('utf-8'))
					.digest('hex'),
				requestArgs = {
					payerName: payer,
					idap: payeeId,
					timestamp: date,
					key: hash,
					amount: '100'
				},
				createClient = Promise.promisify(soap.createClient);

			return createClient(url)
				.then(function(client) {
					var method = client['PayeePayable'];
					method = Promise.promisify(method);
					return method(requestArgs);
				})
				.then(function(result) {
					return result.PayeePayableResult && result.PayeePayableResult.b;
				})
				.catch(function() {
					return 'some error occured';
				});
		}
	};

module.exports = API;
