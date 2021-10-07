const express = require('express');
const atob = require('atob');
const moment = require('moment');
const request = require('request-promise');
const _ = require('lodash');

const { couchBase } = require('../configs/config');
const HTTP_STATUSES = require('../configs/httpStatusConsts');
const {
	GET_SITES_STATS_API,
	EMAIL_REGEX,
	AUDIT_LOGS_ACTIONS: { OPS_PANEL },
	docKeys: { networkWideHBRules }
} = require('../configs/commonConsts');
const {
	sendSuccessResponse,
	sendErrorResponse,
	getPageGroupNameAndPlatformFromChannelDoc
} = require('../helpers/commonFunctions');
const {
	appBucket,
	errorHandler,
	sendDataToAuditLogService,
	getAllAds,
	updateApTagAd,
	updateInnovativeAd,
	updateApLiteAd
} = require('../helpers/routeHelpers');
const opsModel = require('../models/opsModel');
const apLiteModel = require('../models/apLiteModel');
const pnpModel = require('../models/pnpRefreshModel');
const opsService = require('../apiServices/opsService');
const ObjectValidator = require('../helpers/ObjectValidator');
const opsValidations = require('../validations/opsValidations');
const FormValidator = require('../helpers/FormValidator');
const schema = require('../helpers/schema');
const AdPushupError = require('../helpers/AdPushupError');
const channelModel = require('../models/channelModel');

const router = express.Router();

const helpers = {
	getAllSitesFromCouchbase: () => {
		const query = `select a.siteId, a.siteDomain, a.adNetworkSettings, a.ownerEmail, a.step, a.channels, a.apConfigs, a.dateCreated, b.adNetworkSettings[0].pubId, b.adNetworkSettings[0].adsenseEmail from ${
			couchBase.DEFAULT_BUCKET
		} a join ${
			couchBase.DEFAULT_BUCKET
		} b on keys 'user::' || a.ownerEmail where meta(a).id like 'site::%'`;
		return appBucket.queryDB(query);
	},
	makeAPIRequest: options => {
		const DEFAULT_OPTIONS = {
			method: 'GET',
			json: true
		};
		return request({
			...DEFAULT_OPTIONS,
			...options
		});
	},
	directDBUpdate: (key, value, cas) => appBucket.updateDoc(key, value, cas)
};

router
	.get('/getAllSites', (req, res) =>
		helpers
			.getAllSitesFromCouchbase()
			.then(sites => sendSuccessResponse(sites, res))
			.catch(err => errorHandler(err, res, HTTP_STATUSES.INTERNAL_SERVER_ERROR))
	)
	.get('/getSiteStats', (req, res) => {
		if (!req.user.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request',
					code: HTTP_STATUSES.UNAUTHORIZED
				},
				res
			);
		}
		const { params } = req.query;
		let parsedData;
		try {
			parsedData = JSON.parse(atob(params));
		} catch (e) {
			return sendErrorResponse(
				{
					message: 'Invalid Params Received',
					code: HTTP_STATUSES.BAD_REQUEST
				},
				res
			);
		}
		const DEFAULT_OPERATION = {
			operation: 'subtract',
			unit: 'days'
		};
		function isValidDate(value = null) {
			const date = moment(value);
			return !!date.isValid();
		}
		function getDate(value = null, options = null) {
			const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
			let date = moment();
			if (value) {
				date = moment(value);
				date = date.isValid() ? date : moment();
			}
			if (options) {
				const { operation, value: number, unit } = options;
				date = date[operation](number, unit);
			}
			return date.format(DEFAULT_DATE_FORMAT);
		}
		function processDate(date, reference, value) {
			return date && isValidDate(date)
				? getDate(date)
				: getDate(reference, {
						...DEFAULT_OPERATION,
						value
				  });
		}
		function makeAPIRequestWrapper(qs) {
			return helpers.makeAPIRequest({
				uri: GET_SITES_STATS_API,
				qs
			});
		}

		function cleanData(array) {
			return array.map(element => ({
				site: element.site,
				siteid: element.siteid
			}));
		}

		function uniqueData(arr) {
			return _.uniqBy(arr, 'siteid').filter(value => value.adpushup_count >= 10000);
		}

		return new Promise((resolve, reject) => {
			if (!parsedData.current) {
				return reject(
					new Error({
						message: 'Missing Params',
						code: HTTP_STATUSES.BAD_REQUEST
					})
				);
			}
			return resolve();
		})
			.then(() => {
				const { current = {} } = parsedData;

				const numberOfDays = Math.ceil(moment(current.to).diff(moment(current.from), 'days', true));
				const currentTo = processDate(current.to, moment(), 1);
				const currentFrom = processDate(current.from, currentTo, numberOfDays);

				const lastTo = processDate(null, currentFrom, 1);
				const lastFrom = processDate(null, lastTo, numberOfDays);

				const promises = [
					makeAPIRequestWrapper({
						fromDate: lastFrom,
						toDate: lastTo,
						report_name: 'get_stats_by_custom',
						isSuperUser: true,
						dimension: 'siteid,mode'
					}),
					makeAPIRequestWrapper({
						fromDate: currentFrom,
						toDate: currentTo,
						report_name: 'get_stats_by_custom',
						isSuperUser: true,
						dimension: 'siteid,mode'
					})
				];
				return Promise.all(promises);
			})
			.then(([lastWeekData, currentWeekData]) => {
				if (lastWeekData.code !== 1 || currentWeekData.code !== 1) {
					return Promise.reject(new Error('Invalid Data Found in either of the date rangers'));
				}

				const { data: { result: lastWeekSites = [] } = {} } = lastWeekData;
				const { data: { result: currentWeekSites = [] } = {} } = currentWeekData;

				let lastWeekEntries = uniqueData(lastWeekSites);
				let currentWeekEntries = uniqueData(currentWeekSites);

				lastWeekEntries = cleanData(lastWeekEntries);
				currentWeekEntries = cleanData(currentWeekEntries);

				const lastSiteIds = _.map(lastWeekEntries, 'siteid');
				const currentSiteIds = _.map(currentWeekEntries, 'siteid');

				const lostIds = _.difference(lastSiteIds, currentSiteIds);
				const wonIds = _.difference(currentSiteIds, lastSiteIds);
				const rententionIds = _.intersection(lastSiteIds, currentSiteIds);

				const won = currentWeekEntries.filter(site => wonIds.indexOf(site.siteid) !== -1);
				const lost = lastWeekEntries.filter(site => lostIds.indexOf(site.siteid) !== -1);
				const rentention = lastWeekEntries.filter(
					site => rententionIds.indexOf(site.siteid) !== -1
				);

				return sendSuccessResponse(
					{
						won,
						lost,
						rentention
					},
					res
				);
			})
			.catch(err => errorHandler(err, res));
	})

	.post('/xpathEmailNotifier', (req, res) => {
		if (!req.user.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request',
					code: HTTP_STATUSES.UNAUTHORIZED
				},
				res
			);
		}
		const {
			siteId,
			topURLCount,
			emailId,
			pageGroups,
			currentSelectedDevice,
			currentSelectedMode,
			orderBy,
			errorCode,
			startDate,
			endDate
		} = req.body;

		const isDataValid = !!(
			siteId &&
			topURLCount &&
			startDate &&
			endDate &&
			EMAIL_REGEX.test(emailId)
		);

		if (isDataValid === false) {
			return sendErrorResponse(
				{
					message: 'Missing or Inavalid params.'
				},
				res
			);
		}

		const qs = {
			siteid: siteId,
			urlCount: topURLCount,
			email: emailId,
			page_group: pageGroups,
			device_type: currentSelectedDevice,
			orderBy,
			mode: currentSelectedMode,
			error_code: errorCode,
			fromDate: startDate,
			toDate: endDate
		};

		return helpers
			.makeAPIRequest({
				uri: GET_SITES_STATS_API,
				qs: { ...qs, report_name: 'get_url_count' }
			})
			.then(response => {
				const { code = -1 } = response;
				if (code !== 1) return Promise.reject(new Error(response.data));
				return sendSuccessResponse(response, res);
			})
			.catch(err => errorHandler(err, res));
	})

	.get('/allSitesStats', (req, res) => {
		if (!req.user.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request',
					code: HTTP_STATUSES.UNAUTHORIZED
				},
				res
			);
		}

		return opsModel
			.getAllSitesStats()
			.then(sitesData => sendSuccessResponse(sitesData, res))
			.catch(err => errorHandler(err, res));
	})

	.put('/ap-lite/:siteId', (req, res) => {
		const { siteId } = req.params;

		if (!siteId) {
			return sendErrorResponse(
				{
					message: 'Site Id is necessary'
				},
				res,
				HTTP_STATUSES.BAD_REQUEST
			);
		}

		const { adUnits, dataForAuditLogs } = req.body;
		const json = { siteId: parseInt(siteId, 10), adUnits };
		const { email, originalEmail } = req.user;
		// log config changes
		const { siteDomain, appName } = dataForAuditLogs;

		let prevConfig = {};
		return apLiteModel
			.getAPLiteModelBySite(json.siteId)
			.catch(err => {
				if (err && err.code === 13) {
					// doc doesn't exist. proceed with saving config
					return apLiteModel.saveAdUnits(json)
				}

				throw err;
			})
			.then(apLiteSite => {
				prevConfig = !!apLiteSite ? apLiteSite.data || {} : {};
			})
			.then(() => apLiteModel.saveAdUnits(json))
			.then(() => apLiteModel.getAPLiteModelBySite(json.siteId))
			.then(doc => {
				// log config changes
				sendDataToAuditLogService({
					siteId,
					siteDomain,
					appName,
					type: 'site',
					impersonateId: email,
					userId: originalEmail,
					prevConfig,
					currentConfig: json,
					action: {
						name: OPS_PANEL.SITES_SETTING,
						data: `Sites Setting AP-Lite`
					}
				});

				sendSuccessResponse(doc, res);
			})
			.catch(err => errorHandler(err));
	})

	.get('/ap-lite/:siteId', (req, res) => {
		const { siteId } = req.params;

		if (!siteId) {
			return sendErrorResponse(
				{
					message: 'Site Id is necessary'
				},
				res,
				HTTP_STATUSES.BAD_REQUEST
			);
		}

		return apLiteModel
			.getAPLiteModelBySite(parseInt(siteId, 10))
			.then(docData => sendSuccessResponse(docData, res))
			.catch(err => errorHandler(err, res, 404));
	})
	.post('/sendNotification', (req, res) => {
		if (!req.user.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request',
					code: HTTP_STATUSES.UNAUTHORIZED
				},
				res
			);
		}
		const { notificationData } = req.body;
		return opsModel
			.sendNotification(notificationData)
			.then(message => sendSuccessResponse(message, res))
			.catch(err => errorHandler(err, res));
	})
	.get('/getAllNotifications', (req, res) =>
		opsModel
			.getAllNotifications()
			.then(message => sendSuccessResponse(message, res))
			.catch(err => errorHandler(err, res))
	)
	.get('/rules', (req, res) => {
		if (!req.user.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request'
				},
				res,
				HTTP_STATUSES.UNAUTHORIZED
			);
		}

		return appBucket
			.getDoc(networkWideHBRules)
			.then(doc => {
				const {
					value: { rules = [] }
				} = doc;
				return rules;
			})
			.then(rules => res.status(HTTP_STATUSES.OK).json(rules))
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);
				res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' });
			});
	})

	.post('/rules', (req, res) => {
		const { email, originalEmail, isSuperUser } = req.user;

		if (!isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request'
				},
				res,
				HTTP_STATUSES.UNAUTHORIZED
			);
		}

		const { hbRule, dataForAuditLogs } = req.body;
		const { rule } = hbRule;

		const newRule = { ...rule, createdAt: new Date().getTime() };

		return FormValidator.validate(rule, schema.hbRules.rule)
			.then(() => appBucket.getDoc(networkWideHBRules))
			.then(doc => {
				const { value, cas } = doc;
				const prevRules = [...value.rules] || [];

				value.rules = [...prevRules, newRule] || [];
				const newRules = value.rules || [];

				// log config changes
				const { siteDomain, appName } = dataForAuditLogs;
				sendDataToAuditLogService({
					siteId: '',
					siteDomain,
					appName,
					type: 'account',
					impersonateId: email,
					userId: originalEmail,
					prevConfig: prevRules,
					currentConfig: newRules,
					action: {
						name: OPS_PANEL.TOOLS,
						data: `Network Wide HB Rules`
					}
				});
				return appBucket.updateDoc(networkWideHBRules, value, cas) && value;
			})
			.then(data => {
				const { rules = [] } = data;
				return res.status(HTTP_STATUSES.OK).json(rules);
			})
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);

				if (err.code && err.code === 13 && err.message.includes('key does not exist')) {
					const rules = [];
					rules.push(newRule);

					return appBucket.createDoc(networkWideHBRules, { rules }, {}).then(() => {
						res.status(HTTP_STATUSES.OK).json(rules);
					});
				}

				if (err instanceof AdPushupError) {
					return res.status(HTTP_STATUSES.BAD_REQUEST).json({ error: err.message });
				}

				return res
					.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR)
					.json({ error: 'Internal Server Error!' });
			});
	})

	.put('/rules', (req, res) => {
		const { email, originalEmail, isSuperUser } = req.user;

		if (!isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request'
				},
				res,
				HTTP_STATUSES.UNAUTHORIZED
			);
		}

		const { hbRuleData, dataForAuditLogs } = req.body;
		const { rule, ruleIndex } = hbRuleData;

		return FormValidator.validate(rule, schema.hbRules.rule)
			.then(() => {
				const parsedRuleIndex = parseInt(ruleIndex, 10);
				if (Number.isNaN(parsedRuleIndex)) {
					throw new AdPushupError('Invalid data given to edit rule');
				}
			})
			.then(() => appBucket.getDoc(networkWideHBRules))
			.then(doc => {
				const { value, cas } = doc;

				const prevRules = [...value.rules] || [];

				if (value.rules.length <= ruleIndex) {
					throw new AdPushupError('Invalid data given to edit rule');
				}

				value.rules[ruleIndex] = { ...prevRules[ruleIndex], ...rule };

				const newRules = value.rules || [];

				// log config changes
				const { siteDomain, appName } = dataForAuditLogs;
				sendDataToAuditLogService({
					siteId: '',
					siteDomain,
					appName,
					type: 'account',
					impersonateId: email,
					userId: originalEmail,
					prevConfig: prevRules,
					currentConfig: newRules,
					action: {
						name: OPS_PANEL.TOOLS,
						data: `Network Wide HB Rules`
					}
				});
				return appBucket.updateDoc(networkWideHBRules, value, cas) && value;
			})
			.then(data => {
				const { rules = [] } = data;
				return res.status(HTTP_STATUSES.OK).json(rules);
			})
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);

				if (err instanceof AdPushupError) {
					return res.status(HTTP_STATUSES.BAD_REQUEST).json({ error: err.message });
				}

				return res
					.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR)
					.json({ error: 'Internal Server Error!' });
			});
	})

	.get('/getAdUnitMapping', (req, res) =>
		getAllAds()
			.then(data => {
				const ads = [];

				data.forEach(adData => {
					const { key: docId, value: ad } = adData;
					const docType = docId.substr(0, 4);
					const { siteId, siteDomain, networkData, sizeFilters, height, width } = ad;

					let { adId, collapseUnfilled, downwardSizesDisabled, dfpAdunitCode, dfpAdunit } = ad;

					let adObj = { docId };

					// transform the data to display in inventory tab
					switch (docType) {
						case 'chnl':
							if (!networkData) {
								return;
							}
							dfpAdunitCode = networkData.dfpAdunitCode;
							dfpAdunit = networkData.dfpAdunit;

							if (!dfpAdunitCode) {
								return;
							}

							collapseUnfilled = !!collapseUnfilled;
							downwardSizesDisabled = !!downwardSizesDisabled;

							adObj = {
								...adObj,
								siteId,
								siteDomain,
								dfpAdunitCode,
								dfpAdunit,
								adId,
								collapseUnfilled,
								downwardSizesDisabled,
								sizeFilters,
								height,
								width
							};

							ads.push(adObj);
							break;
						case 'fmrt':
						case 'tgmr':
							adId = ad.id;
							if (!networkData) {
								return;
							}

							dfpAdunitCode = networkData.dfpAdunitCode;
							dfpAdunit = networkData.dfpAdunit;
							if (!dfpAdunitCode) {
								return;
							}

							collapseUnfilled = !!ad.collapseUnfilled;
							downwardSizesDisabled = !!ad.downwardSizesDisabled;
							adObj = {
								...adObj,
								siteId,
								siteDomain,
								dfpAdunitCode,
								dfpAdunit,
								adId,
								collapseUnfilled,
								downwardSizesDisabled,
								sizeFilters,
								height,
								width
							};
							ads.push(adObj);
							break;

						case 'aplt':
							collapseUnfilled = !!ad.collapseUnfilled;
							downwardSizesDisabled = !!ad.downwardSizesDisabled;
							dfpAdunit = ad.dfpAdUnit;
							adObj = {
								...adObj,
								siteId,
								siteDomain,
								dfpAdunitCode,
								dfpAdunit,
								adId: dfpAdunit,
								collapseUnfilled,
								downwardSizesDisabled,
								sizeFilters
							};
							ads.push(adObj);
							break;
						default:
							break;
					}
				});

				return sendSuccessResponse(ads, res);
			})
			.catch(err => errorHandler(err, res, HTTP_STATUSES.INTERNAL_SERVER_ERROR))
	)
	.get('/getSiteMapping', (req, res) => {
		if (!req.user.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request',
					code: HTTP_STATUSES.UNAUTHORIZED
				},
				res
			);
		}
		opsModel
			.getAllSiteMapping()
			.then(message => sendSuccessResponse(message, res))
			.catch(err => errorHandler(err, res));
	})
	.post('/updateAdUnitData/:siteId', (req, res) => {
		if (!req.user.isSuperUser) {
			return sendErrorResponse(
				{
					message: 'Unauthorized Request',
					code: HTTP_STATUSES.UNAUTHORIZED
				},
				res
			);
		}
		const { adUnitData } = req.body;
		const {
			docId,
			adId,
			collapseUnfilled,
			sizeFilters,
			downwardSizesDisabled,
			siteDomain
		} = adUnitData;

		const docType = docId.substr(0, 4);
		let newData = {};
		let adData = {};

		const { siteId } = req.params;

		switch (docType) {
			case 'chnl':
				const { pageGroup, platform } = getPageGroupNameAndPlatformFromChannelDoc(docId);
				// updateLayoutAd
				return channelModel
					.getChannel(siteId, platform, pageGroup)
					.then(({ data: channelData }) => {
						let prevConfig = {};
						let currentConfig = {};
						const { variations, siteDomain } = channelData;
						for (const key in variations) {
							const { sections } = variations[key];
							for (const section in sections) {
								const { ads } = sections[section];
								if (ads[adId]) {
									prevConfig = { ...ads[adId] };
									ads[adId] = {
										...ads[adId],
										downwardSizesDisabled,
										collapseUnfilled,
										sizeFilters
									};
									currentConfig = {
										...ads[adId],
										downwardSizesDisabled,
										collapseUnfilled,
										sizeFilters
									};
									break;
								}
							}
						}

						const appName = 'Ad Unit Inventory';
						const { email, originalEmail } = req.user;

						// log config changes
						sendDataToAuditLogService({
							siteId,
							siteDomain,
							appName,
							type: 'app',
							impersonateId: email,
							userId: originalEmail,
							prevConfig,
							currentConfig,
							action: {
								name: OPS_PANEL.TOOLS,
								data: `Ad Inventory Change - Channel Doc Updated`
							}
						});

						return channelModel.saveChannel(siteId, platform, pageGroup, channelData);
					})
					.then(chnlData => sendSuccessResponse(chnlData, res))
					.catch(err => errorHandler(err, res, HTTP_STATUSES.INTERNAL_SERVER_ERROR));
			case 'tgmr':
				newData = { collapseUnfilled, downwardSizesDisabled, sizeFilters };
				adData = { adUnitId: adId, newData, docId, siteDomain };
				return updateApTagAd(req, res, adData);
			case 'fmrt':
				newData = { collapseUnfilled, downwardSizesDisabled, sizeFilters };
				adData = { adUnitId: adId, newData, docId, siteDomain };
				return updateInnovativeAd(req, res, adData);
			case 'aplt':
				newData = { collapseUnfilled, downwardSizesDisabled, sizeFilters };
				adData = { adUnitId: adId, adUnitData: newData, docId, siteDomain };
				return updateApLiteAd(req, res, adData);

			default:
				return sendErrorResponse(
					{
						message: 'Unauthorized Request',
						code: HTTP_STATUSES.UNAUTHORIZED
					},
					res
				);
		}
	})
	.put('/pnp-refresh/:siteId', async (req, res) => {
		const pnpConfig = _.cloneDeep(req.body);
		const { siteId } = req.params;

		try {
			await ObjectValidator(opsValidations.pnpConfigValidation, pnpConfig);
			await opsService.updateExistingApTags(pnpConfig);
			const { pnpSiteId } = pnpConfig;
			const pnpSiteOwnerEmail = await opsService.getOwnerEmail(pnpSiteId);
			const updatedConfig = await opsService.updatePnPConfig(siteId, pnpSiteOwnerEmail, pnpConfig);
			await opsService.initScriptSync(updatedConfig.get('pnpSiteId'));
			await opsService.initScriptSync(siteId);

			return sendSuccessResponse(updatedConfig.toClientJSON(), res, HTTP_STATUSES.OK);
		} catch (err) {
			const { message } = err || {};
			let errorMessage = message;
			if (Array.isArray(message)) {
				errorMessage = message[0].message;
			}
			if (!errorMessage) errorMessage = 'Something went wrong';
			return sendErrorResponse({ message: errorMessage }, res, HTTP_STATUSES.BAD_REQUEST);
		}
	})
	.get('/pnp-refresh/:siteId', (req, res) => {
		const { siteId } = req.params;
		return pnpModel
			.getPnPConfig(siteId)
			.then(config => sendSuccessResponse(config, res, HTTP_STATUSES.OK))
			.catch(err => {
				if (err && err.code === 13) return sendSuccessResponse({}, res, HTTP_STATUSES.OK);
				return sendErrorResponse(err, res, HTTP_STATUSES.BAD_REQUEST);
			});
	});
module.exports = router;
