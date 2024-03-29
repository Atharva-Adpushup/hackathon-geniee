var request = require('request-promise'),
	utils = require('../helpers/utils'),
	{ getGoogleDoc, getDocumentDataAsTextValues } = require('./googleDocs'),
	_ = require('lodash'),
	fetch = require('node-fetch'),
	crypto = require('crypto'),
	Promise = require('bluebird'),
	soap = require('strong-soap').soap,
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
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
	{ getMandatoryAdsTxtEntrySnippet, createSellerId } = require('../helpers/commonFunctions'),
	API = {
		load(url, userAgent, fullResponse) {
			userAgent =
				userAgent ||
				'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
			//migrated to node-fetch because some sites send gzip encoded response which axios and requests dont parse automatically
			//added promise.any with null user-agent for makemytrip, for whom the api call freezes unless null is passed
			return Promise.any([
				fetch(url, {
					headers: { 'User-Agent': userAgent }
				}),
				fetch(url, {
					headers: { 'User-Agent': null }
				})
			])
				.then(res => res.text())
				.catch(async err => {
					const emailRecepient = config.adsTxtSupportEmail.join(',');
					const emailParams = {
						queue: 'MAILER',
						data: {
							to: emailRecepient,
							body: err.message,
							subject: `Error in ads.txt verification for ${url}`
						}
					};
					try {
						await fetch(config.mailerQueueUrl, {
							method: 'POST',
							body: emailParams
						});
					} catch (error) {
						console.error(error.message);
					}
					if (err && err.message.indexOf('I really need an ID for this to work') === -1) {
						return false;
					}
					return true;
					//add alert main incase ads.txt fails
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
			return new Promise(async (resolve, reject) => {
				try {
					const googleDocResponse = await getGoogleDoc(commonConst.onboarding.adsTxtDocId);
					const documentData = getDocumentDataAsTextValues(googleDocResponse)
					return resolve(documentData);
				} catch (error) {
					console.error(error);
					return reject(error);
				}
			});
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

		getMandatoryAdsTxtEntry({ email, siteId }) {
			if (email) {
				return API.getMandatoryAdsTxtEntryByUserEmail(email);
			}
			return API.getMandatoryAdsTxtEntryBySite(siteId);
		},

		getMandatoryAdsTxtEntryBySite(siteId) {
			return siteModel.getSiteById(siteId).then(function(site) {
				if (site) {
					let ownerEmail = site.get('ownerEmail');
					return API.getMandatoryAdsTxtEntryByUserEmail(ownerEmail);
				}
				return null;
			});
		},

		getMandatoryAdsTxtEntryByUserEmail(email) {
			return userModel.getUserByEmail(email).then(function(user) {
				let sellerId = user.get('sellerId');
				if (!sellerId) {
					sellerId = createSellerId(email);
				}
				const domainNameSellersJson = user.get('domainNameSellersJson');
				const sites = user.get('sites');
				if (sellerId && sites?.length > 0) {
					return getMandatoryAdsTxtEntrySnippet(domainNameSellersJson, sites, sellerId);
				}
				return null;
			});
		},
		checkMandatoryAdsTxtEntry(mandatoryAdsTxtEntry, existingAdsTxtArr) {
			let hasMandatoryAdsTxtEntryLine = false;
			let hasMandatoryAdsTxtManagerDomain = false;
			let hasMandatoryAdsTxtOwnerDomain = false;

			if (mandatoryAdsTxtEntry) {
				const mandatoryAdsTxtEntryArr = mandatoryAdsTxtEntry.split('\n');
				const mandatoryAdsTxtLine = mandatoryAdsTxtEntryArr[0];
				const mandatoryAdsTxtManagerDomain = mandatoryAdsTxtEntryArr[1]?.toLowerCase();
				const mandatoryAdsTxtOwnerDomain = mandatoryAdsTxtEntryArr[2]?.toLowerCase();

				for (let i = 0; i < existingAdsTxtArr.length; i++) {
					const { domain, pubId, relation, authorityId } = existingAdsTxtArr[i];

					if (`${domain}, ${pubId}, ${relation}, ${authorityId}` === mandatoryAdsTxtLine) {
						hasMandatoryAdsTxtEntryLine = true;
					}
					// domain will contain mandatoryAdsTxtManagerDomain and mandatoryAdsTxtOwnerDomain
					// as entry is not seperated by comma
					if (mandatoryAdsTxtManagerDomain && domain === mandatoryAdsTxtManagerDomain) {
						hasMandatoryAdsTxtManagerDomain = true;
					}
					if (mandatoryAdsTxtOwnerDomain && domain === mandatoryAdsTxtOwnerDomain) {
						hasMandatoryAdsTxtOwnerDomain = true;
					}
				}
			}

			return {
				hasMandatoryAdsTxtEntryLine,
				hasMandatoryAdsTxtManagerDomain,
				hasMandatoryAdsTxtOwnerDomain
			};
		},
		verifyMandatoryAdsTxtEntry(mandatoryAdsTxtEntry, existingAdsTxtArr) {
			const {
				hasMandatoryAdsTxtEntryLine,
				hasMandatoryAdsTxtManagerDomain,
				hasMandatoryAdsTxtOwnerDomain
			} = API.checkMandatoryAdsTxtEntry(mandatoryAdsTxtEntry, existingAdsTxtArr);
			const hasCompleteMandatoryAdsTxtEntry =
				hasMandatoryAdsTxtEntryLine &&
				hasMandatoryAdsTxtManagerDomain &&
				hasMandatoryAdsTxtOwnerDomain;

			if (!hasCompleteMandatoryAdsTxtEntry) {
				const error = hasMandatoryAdsTxtEntryLine
					? 'Manager and Owner Domain Missing in Mandatory Entry'
					: 'Mandatory entry Missing';
				throw new AdPushupError({
					httpCode: 204,
					error: error,
					type: 'mandatoryAdsTxtEntry',
					data: { mandatoryAdsTxtEntry }
				});
			}

			return mandatoryAdsTxtEntry;
		},

		commonVerifyAdsTxt(ourAdsTxt, existingAdsTxtArr) {
			let entriesNotFound = [],
				entriesFound = [];
			const ourAdsTxtArr = API.parseAdsTxtEntries(ourAdsTxt);

			function getSnippet({ domain, pubId, relation, authorityId }) {
				return `${domain}, ${pubId}, ${relation}${authorityId ? `, ${authorityId}` : ''}`;
			}

			ourAdsTxtArr.forEach(({ domain, pubId, relation, authorityId }) =>
				existingAdsTxtArr.findIndex(
					({ domain: domain1, pubId: pubId1, relation: relation1 }) =>
						domain === domain1 && pubId === pubId1 && relation === relation1
				) === -1
					? entriesNotFound.push(getSnippet({ domain, pubId, relation, authorityId }))
					: entriesFound.push(getSnippet({ domain, pubId, relation, authorityId }))
			);

			if (entriesFound.length === ourAdsTxtArr.length) {
				return Promise.resolve(entriesFound);
			}

			if (entriesNotFound.length) {
				if (entriesNotFound.length === ourAdsTxtArr.length) {
					throw new AdPushupError({
						httpCode: 204,
						error: 'Our Ads.txt entries not found',
						type: 'ourAdsTxt',
						data: {
							ourAdsTxt: entriesNotFound.join('\n')
						}
					});
				} else {
					throw new AdPushupError({
						httpCode: 206,
						error: 'Few of our Ads.txt entries not found',
						type: 'ourAdsTxt',
						data: {
							ourAdsTxt: entriesNotFound.join('\n'),
							presentEntries: entriesFound.join('\n')
						}
					});
				}
			}
		},
		verifyAdsTxt(url, ourAdsTxt, mandatoryAdsTxtEntry = null) {
			let tempUrl = url;
			if (tempUrl.indexOf('http://') == -1 && tempUrl.indexOf('https://') == -1) {
				tempUrl = `http://${tempUrl}`;
			}

			return API.load(`${utils.rightTrim(tempUrl, '/')}/ads.txt`).then(existingAdsTxt => {
				if (typeof existingAdsTxt === 'string') {
					let errors = [];

					const existingAdsTxtArr = API.parseAdsTxtEntries(existingAdsTxt);

					try {
						API.verifyMandatoryAdsTxtEntry(mandatoryAdsTxtEntry, existingAdsTxtArr);
					} catch (error) {
						errors.push(error);
					}

					try {
						API.commonVerifyAdsTxt(ourAdsTxt, existingAdsTxtArr);
					} catch (error) {
						errors.push(error);
					}

					if (errors.length) {
						let data = {};
						let errorResponse = [];

						errors.forEach(({ message }) => {
							if (message.data) {
								data = {
									...data,
									...message.data
								};
							}
							errorResponse.push({
								code: message.httpCode,
								type: message.type,
								error: message.error
							});
						});

						if (!data.ourAdsTxt) {
							data.ourAdsTxt = ourAdsTxt;
						}
						if (!data.mandatoryAdsTxtEntry) {
							data.mandatoryAdsTxtEntry = mandatoryAdsTxtEntry;
						}

						throw new AdPushupError({
							httpCode: 400,
							error: errorResponse,
							data
						});
					}
				} else {
					throw new AdPushupError({
						httpCode: 404,
						error: {
							ourAdsTxt: 'No Ads.txt Found',
							mandatoryAdsTxtEntry: 'Mandatory Entry Missing'
						},
						data: { ourAdsTxt, mandatoryAdsTxtEntry }
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

		verifyMandatoryAdsTxtFetchedFromDb(mandatoryAdsTxtEntry, existingAdsTxtArr) {
			if (existingAdsTxtArr.length) {
				return API.verifyMandatoryAdsTxtEntry(mandatoryAdsTxtEntry, existingAdsTxtArr);
			}

			throw new AdPushupError({
				httpCode: 404,
				error: 'ads.txt file not found on your site. Please upload our ads.txt file on your site.',
				data: { mandatoryAdsTxtEntry }
			});
		},

		verifyAdsTxtFetchedFromDb(ourAdsTxt, existingAdsTxtArr) {
			if (existingAdsTxtArr.length) {
				return API.commonVerifyAdsTxt(ourAdsTxt, existingAdsTxtArr);
			}

			throw new AdPushupError({
				httpCode: 404,
				error: 'ads.txt file not found on your site. Please upload our ads.txt file on your site.',
				data: { ourAdsTxt }
			});
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
