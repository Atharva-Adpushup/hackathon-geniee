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
	getTipaltiKey = function(key, params) {
		return crypto
			.createHmac('sha256', key)
			.update(params.toString('utf-8'))
			.digest('hex');
	},
	getUserIDAP = function(email) {
		return encodeURIComponent(
			crypto
				.createHash('md5')
				.update(email)
				.digest('hex')
				.substr(0, 64)
		);
	},
	getTipaltiConfig = function() {
		const tipaltiConfig = config.tipalti;
		const { key: configKey, payerName, soapUrl: url } = tipaltiConfig;
		const timestamp = Math.floor(+new Date() / 1000);

		return {
			url,
			configKey,
			payerName,
			timestamp
		};
	},
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
				const apCodeDetected = body && body.match(`//.+.adpushup.com/${siteId}/adpushup.js`);
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
		parseAdsTxtEntries: text => {
			let normalizedText = text.replace(/[, \t]+/g, ',');

			// trim Byte Order Mark
			if (normalizedText.charCodeAt(0) === 65279) {
				normalizedText = normalizedText.substr(1);
			}

			// split new lines
			let stringArr = normalizedText.split(/[\n\r]+/);

			// Filter out comments and empty lines
			stringArr = stringArr.filter(string => string[0] !== '#' && string !== '' && string !== ',');

			let parsedEntries = stringArr.map(str => {
				const arr = str.trim().split(',');
				const normalizedArray = [];

				for (let i = 0; i < arr.length; i++) {
					if (arr[i] && arr[i][0] !== '#') {
						normalizedArray.push(arr[i].trim().toLowerCase());
					}
				}

				const [domain = '', pubId = '', relation = '', authorityId = ''] = normalizedArray;

				const parsedEntry = { domain, pubId, relation, authorityId };
				parsedEntry.relation = parsedEntry.relation.toUpperCase();

				return parsedEntry;
			});

			// filter out duplicate entries
			parsedEntries = parsedEntries.filter(
				({ domain, pubId, relation, authorityId }, index, self) =>
					self.findIndex(
						({ domain: domain1, pubId: pubId1, relation: relation1, authorityId: authorityId1 }) =>
							domain === domain1 &&
							pubId === pubId1 &&
							relation === relation1 &&
							authorityId === authorityId1
					) === index
			);

			return parsedEntries;
		},

		commonVerifyAdsTxt(ourAdsTxt, existingAdsTxtArr) {
			let entriesNotFound = [],
				entriesFound = [];
			const ourAdsTxtArr = API.parseAdsTxtEntries(ourAdsTxt);

			ourAdsTxtArr.forEach(({ domain, pubId, relation }) =>
				existingAdsTxtArr.findIndex(
					({ domain: domain1, pubId: pubId1, relation: relation1 }) =>
						domain === domain1 && pubId === pubId1 && relation === relation1
				) === -1
					? entriesNotFound.push({ domain, pubId, relation })
					: entriesFound.push({ domain, pubId, relation })
			);
			entriesFound = entriesFound.map(
				({ domain, pubId, relation, authorityId }) =>
					`${domain}, ${pubId}, ${relation}${authorityId ? `, ${authorityId}` : ''}`
			);
			if (entriesFound.length === ourAdsTxtArr.length) {
				return Promise.resolve(entriesFound.join('\n'));
			}

			if (entriesNotFound.length) {
				entriesNotFound = entriesNotFound.map(
					({ domain, pubId, relation, authorityId }) =>
						`${domain}, ${pubId}, ${relation}${authorityId ? `, ${authorityId}` : ''}`
				);

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
						ourAdsTxt: entriesNotFound.join('\n'),
						presentEntries: entriesFound.join('\n')
					});
				}
			}
		},
		verifyAdsTxt(url, ourAdsTxt) {
			let tempUrl = url;
			if (tempUrl.indexOf('http://') == -1 && tempUrl.indexOf('https://') == -1) {
				tempUrl = `http://${tempUrl}`;
			}
			return API.load(`${utils.rightTrim(tempUrl, '/')}/ads.txt`).then(existingAdsTxt => {
				if (typeof existingAdsTxt === 'string') {
					const existingAdsTxtArr = API.parseAdsTxtEntries(existingAdsTxt);

					return API.commonVerifyAdsTxt(ourAdsTxt, existingAdsTxtArr);
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

		getAdsTxtFromDbAndVerify(ourAdsTxt, existingAdsTxtArr) {
			if (existingAdsTxtArr.length) return API.commonVerifyAdsTxt(ourAdsTxt, existingAdsTxtArr);
			else {
				throw new AdPushupError({
					httpCode: 404,
					error:
						'ads.txt file not found on your site. Please upload our ads.txt file on your site.',
					ourAdsTxt
				});
			}
		},

		checkIfBillingProfileComplete(email) {
			const idap = getUserIDAP(email);
			const { url, payerName, configKey, timestamp } = getTipaltiConfig(email);

			const amount = commonConst.USER_PAYABLE_VERIFICATION_AMOUNT;
			const params = payerName + idap + timestamp + amount;
			const key = getTipaltiKey(configKey, params);

			const requestArgs = {
				key,
				idap,
				amount,
				payerName,
				timestamp
			};

			const createClient = Promise.promisify(soap.createClient);

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
		},

		getBasicDetailsFromTipalti(email) {
			const idap = getUserIDAP(email);
			const { url, payerName, timestamp, configKey } = getTipaltiConfig(email);

			const params = payerName + idap + timestamp;
			const key = getTipaltiKey(configKey, params);

			const requestArgs = {
				key,
				idap,
				payerName,
				timestamp
			};
			const createClient = Promise.promisify(soap.createClient);

			return createClient(url)
				.then(function(client) {
					var method = client['GetPayeeDetails'];
					method = Promise.promisify(method);
					return method(requestArgs);
				})
				.then(function(result) {
					return result.GetPayeeDetailsResult;
				})
				.catch(function(error) {
					return `FAILED TO FETCH DATA FROM TIPALTI: ${error}`;
				});
		},

		getPaymentDetailsForRangeFromTipalti(email, from, to) {
			// from and to are to be unix timestamp in SECONDS, not MILLISECONDS

			const idap = getUserIDAP(email);
			const { url, configKey, payerName, timestamp } = getTipaltiConfig(email);
			const params = payerName + idap + Math.floor(+new Date() / 1000) + from;
			const key = getTipaltiKey(configKey, params);

			const requestArgs = {
				key,
				idap,
				from,
				to,
				payerName,
				timestamp
			};

			const createClient = Promise.promisify(soap.createClient);

			return createClient(url)
				.then(function(client) {
					var method = client['PaymentsBetweenDates'];
					method = Promise.promisify(method);
					return method(requestArgs);
				})
				.then(function(result) {
					const { errorCode } = result.PaymentsBetweenDatesResult;
					if (errorCode !== 'OK') {
						throw new Error(errorCode);
					}
					return result.PaymentsBetweenDatesResult;
				})
				.catch(function(error) {
					return `FAILED TO FETCH DATA FROM TIPALTI: ${error}`;
				});
		}
	};

module.exports = API;
