/* eslint-disable prefer-destructuring */
const express = require('express');
const atob = require('atob');
const moment = require('moment');
const request = require('request-promise');
const _ = require('lodash');
const { getAllUserSites } = require('../models/userModel');
const { couchBase } = require('../configs/config');
const HTTP_STATUSES = require('../configs/httpStatusConsts');
const {
	GET_SITES_STATS_API,
	EMAIL_REGEX,
	AUDIT_LOGS_ACTIONS: { OPS_PANEL },
	docKeys: { networkWideHBRules },
	AD_UNIT_TYPE_MAPPING
} = require('../configs/commonConsts');
const { RABBITMQ } = require('../configs/config');
const { sendSuccessResponse, sendErrorResponse } = require('../helpers/commonFunctions');
const {
	appBucket,
	errorHandler,
	sendDataToAuditLogService,
	updateAds,
	publishAdPushupBuild
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
const { publishToRabbitMqQueue } = require('../helpers/utils');
const siteModel = require('../models/siteModel');
const { makeReportingRequest } = require('../helpers/commonFunctions');

const router = express.Router();

const helpers = {
	getAllSitesFromCouchbase: () => {
		const query = `select a.siteId, a.siteDomain, a.adNetworkSettings, a.ownerEmail, a.step, a.channels, a.apConfigs, a.dateCreated, b.adNetworkSettings[0].pubId, b.adNetworkSettings[0].adsenseEmail from ${couchBase.DEFAULT_BUCKET} a join ${couchBase.DEFAULT_BUCKET} b on keys 'user::' || a.ownerEmail where meta(a).id like 'site::%'`;
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
			return makeReportingRequest({
				method: 'GET',
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
					message: 'Missing or Invalid params.'
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

		return makeReportingRequest({
			method: 'GET',
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

	.post('/xpathmissurl', (req, res) => {
		const data = req.body || {};
		const { siteId, startDate, endDate, requester, topUrlCount } = data;

		const isDataValid = !!(
			siteId &&
			topUrlCount &&
			startDate &&
			endDate &&
			EMAIL_REGEX.test(requester)
		);
		if (isDataValid === false) {
			return sendErrorResponse(
				{
					message: 'Missing or Invalid params.'
				},
				res
			);
		}
		const xpathMissQueue = RABBITMQ.XPATH_MISS_QUEUE;

		return publishToRabbitMqQueue(xpathMissQueue, data)
			.then(response => sendSuccessResponse(response, res))
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
					return apLiteModel.saveAdUnits(json);
				}

				throw err;
			})
			.then(apLiteSite => {
				prevConfig = apLiteSite ? apLiteSite.data || {} : {};
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

	// - headerBidding //found networkData->headerBidding
	// - refreshSlot   //found networkData->refreshSlot
	// - fluid         //found at root
	// - enableLazyLoading      //enableLazyLoading root level flag is used, found at root (check for chnl)
	// - isActive (Archived/deleted)  //found at root                             (check for chnl)
	// - disableReuseVacantAdSpace   //found root level of node                   (check for chnl)
	// - collapseUnfilled            //found root level of node                   (check for chnl)
	// - downwardSizesDisabled       //found root level of node                   (check for chnl)

	.get('/getAdUnitMapping', async (req, res) => {
		const allSites = await getAllUserSites(req.user.email).map(site => site.siteId.toString());
		const allAdUnitsPromise = allSites.map(siteId => opsModel.getSiteAllInventory(siteId));
		Promise.all(allAdUnitsPromise)
			.then(adUnitsForEverySite => {
				const allAdUnits = [];
				for (let index = 0; index < adUnitsForEverySite.length; index += 1) {
					allAdUnits.push(...adUnitsForEverySite[index]);
				}
				return allAdUnits;
			})
			.then(data => {
				const ads = [];
				data.forEach(adData => {
					const { key: docId, value: ad } = adData;
					const docType = docId.substr(0, 4);
					const { siteId, siteDomain, networkData, sizeFilters = {}, height, width } = ad;
					const {
						adId,
						collapseUnfilled,
						downwardSizesDisabled,
						fluid,
						enableLazyLoading,
						disableReuseVacantAdSpace,
						formatData
					} = ad;
					const sizeFilterKeys = Object.keys(sizeFilters);
					for (let index = 0; index < sizeFilterKeys.length; index += 1) {
						const key = sizeFilterKeys[index];
						if (sizeFilters[key] !== '') sizeFilters[key] = parseInt(sizeFilters[key], 10);
					}
					let { isActive } = ad;
					let adUnitType = 1;
					let { headerBidding, refreshSlot, dfpAdunitCode, dfpAdunit } = networkData || {};
					if (formatData && formatData.type) {
						const val = AD_UNIT_TYPE_MAPPING[formatData.type.toUpperCase()];
						if (val) {
							adUnitType = val;
						}
					}
					let adObj = {
						docId,
						adId,
						refreshSlot: !!refreshSlot,
						headerBidding: !!headerBidding,
						collapseUnfilled: !!collapseUnfilled,
						downwardSizesDisabled: !!downwardSizesDisabled,
						fluid: !!fluid,
						isActive: !!isActive,
						enableLazyLoading: !!enableLazyLoading,
						disableReuseVacantAdSpace: !!disableReuseVacantAdSpace,
						adUnitType
					};

					// transform the data to display in inventory tab
					switch (docType) {
						case 'chnl':
							if (!networkData) {
								return;
							}
							if (!dfpAdunitCode) {
								return;
							}
							adObj = {
								...adObj,
								siteId,
								siteDomain,
								dfpAdunitCode,
								dfpAdunit,
								sizeFilters,
								height: parseInt(height, 10),
								width: parseInt(width, 10)
							};

							ads.push(adObj);
							break;
						case 'ampd':
						case 'fmrt':
						case 'tgmr':
							if (!networkData) {
								return;
							}
							if (!dfpAdunitCode) {
								return;
							}

							adObj = {
								...adObj,
								siteId,
								siteDomain,
								dfpAdunitCode,
								dfpAdunit,
								sizeFilters,
								height: parseInt(height, 10),
								width: parseInt(width, 10)
							};
							ads.push(adObj);
							break;

						case 'aplt':
							dfpAdunit = ad.dfpAdUnit;
							dfpAdunitCode = ad.dfpAdunitCode;
							headerBidding = ad.headerBidding;
							refreshSlot = ad.refreshSlot;
							isActive = ad.isActive;
							adObj = {
								...adObj,
								siteId,
								siteDomain,
								dfpAdunitCode,
								dfpAdunit,
								adId: dfpAdunit,
								sizeFilters,
								headerBidding,
								refreshSlot,
								isActive
							};
							ads.push(adObj);
							break;

						default:
							break;
					}
				});

				return sendSuccessResponse(ads, res);
			})
			.catch(err => {
				errorHandler(err, res, HTTP_STATUSES.INTERNAL_SERVER_ERROR);
			});
	})

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
		return opsModel
			.getAllSiteMapping()
			.then(message => sendSuccessResponse(message, res))
			.catch(err => errorHandler(err, res));
	})
	.post('/updateInventories', async (req, res) => {
		try {
			if (!req.user.isSuperUser) {
				return sendErrorResponse(
					{
						message: 'Unauthorized Request',
						code: HTTP_STATUSES.UNAUTHORIZED
					},
					res
				);
			}
			const { seggragatedAds, dataForAuditLogs } = req.body;
			const docIds = Object.keys(seggragatedAds);
			const allAdsUpdatePromise = docIds.map(docId => updateAds(docId, seggragatedAds[docId]));
			const { email, originalEmail } = req.user;
			const { appName, type = 'app', newConfig, oldConfig, actionInfo } = dataForAuditLogs;
			await Promise.all(allAdsUpdatePromise);
			const allSiteIds = docIds.map(docId => docId.split(':')[2]);
			const uniqueSiteIds = [...new Set(allSiteIds)];
			uniqueSiteIds.forEach(siteId => publishAdPushupBuild(siteId));
			sendDataToAuditLogService({
				appName,
				impersonateId: email,
				userId: originalEmail,
				prevConfig: oldConfig,
				currentConfig: newConfig,
				action: {
					name: actionInfo,
					data: `Inventory Tab Updates`
				},
				type
			});
			return sendSuccessResponse({ message: 'Operation Successfull' }, res, HTTP_STATUSES.OK);
		} catch (error) {
			return sendErrorResponse({ message: error }, res, HTTP_STATUSES.BAD_REQUEST);
		}
	})

	.put('/pnp-refresh/:siteId', async (req, res) => {
		const { pnpConfig, isPnpSiteIdSynced = false, dataForAuditLogs = {} } = _.cloneDeep(req.body);
		const { siteId } = req.params;
		const { email, originalEmail } = req.user;
		const { siteDomain, appName, prevConfig } = dataForAuditLogs;
		try {
			await ObjectValidator(opsValidations.pnpConfigValidation, pnpConfig);
			await opsService.updateExistingApTags(pnpConfig);
			const { pnpSiteId } = pnpConfig;
			const pnpSiteOwnerEmail = await opsService.getOwnerEmail(pnpSiteId);
			const updatedConfig = await opsService.updatePnPConfig(siteId, pnpSiteOwnerEmail, pnpConfig);
			await opsService.initScriptSync(updatedConfig.get('pnpSiteId'));
			await opsService.initScriptSync(siteId);

			if (!isPnpSiteIdSynced) {
				//	setting isPnpSite in pnpSite if not set already
				sendDataToAuditLogService({
					siteDomain,
					appName,
					siteId: pnpSiteId,
					type: 'site',
					impersonateId: email,
					userId: originalEmail,
					action: {
						name: OPS_PANEL.SITES_SETTING,
						data: `SET isPnpSite flag to true in apConfigs`
					}
				});

				await siteModel.updateIsPnpSiteIdInPnpSite(pnpSiteId);
			}

			sendDataToAuditLogService({
				siteId,
				siteDomain,
				appName,
				type: 'site',
				impersonateId: email,
				userId: originalEmail,
				prevConfig,
				currentConfig: pnpConfig,
				action: {
					name: OPS_PANEL.SITES_SETTING,
					data: `Sites Setting PNP`
				}
			});
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
