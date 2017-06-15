var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	channelModel = require('../models/channelModel'),
	AdPushupError = require('../helpers/AdPushupError'),
	genieeService = require('../reports/partners/geniee/service'),
	genieeFilterDates = require('../reports/partners/geniee/modules/filters/date/index'),
	adsenseReportModel = require('../models/adsenseModel'),
	adxReportModel = require('../models/adxModel'),
	apexReportService = require('../reports/default/apex/ctrPerformanceInTabularData/service'),
	apexVariationReportService = require('../reports/default/apex/service'),
	universalReportService = require('../reports/universal/index'),
	Promise = require('bluebird'),
	lodash = require('lodash'),
	moment = require('moment'),
	utils = require('../helpers/utils'),
	{ languageMapping } = require('../i18n/language-mapping'),
	reportsLocalizedObject = require('../i18n/reports/geniee/constants'),
	{ fileLogger } = require('../helpers/logger/file/index'),
	// eslint-disable-next-line new-cap
	router = express.Router({ mergeParams: true }),
	reports = require('../models/reportsModel');

router
	// .get('/performance', function(req, res) {
	// 	var siteId = req.params.siteId,
	// 		url = '/user/site/' + siteId + '/reports/performanceReport?siteId=' + siteId;

	// 	res.render('pageLoader', {
	// 		loaderText: 'Please wait while we fetch Geniee reports...',
	// 		title: 'Geniee Report',
	// 		pageUrl: url
	// 	});
	// })
	.get('/performance', function(req, res) {
		var	siteId = req.params.siteId,
			paramConfig = {
				siteId: siteId,
				dateFrom: moment().subtract(7, 'days').format('YYYY-MM-DD'),
				dateTo: moment().subtract(1, 'days').format('YYYY-MM-DD')
			},
			siteDomainName,
			filterDates = genieeFilterDates.getFilterDates(),
			localeCode = utils.getLanguageLocale(languageMapping, req.locale),
			localeData = reportsLocalizedObject[localeCode];

		fileLogger.info('/*****Geniee Reports: Performance request*****/');
		fileLogger.info(`Locale supported: ${req.locale}`);

		return siteModel.getSiteById(paramConfig.siteId)
			.then(function(site) {
				siteDomainName = utils.domanize(site.get('siteDomain'));
				// paramConfig.mediaId = 920;
				paramConfig.mediaId = site.get('genieeMediaId');

				return genieeService.getReport(paramConfig)
					.then(function(data) {
						return res.render('performanceReport', {
							reportingData: data,
							siteId,
							siteDomain: siteDomainName,
							paramConfig,
							filterDates,
							localeData,
							localeCode
						});
					})
					.catch(function(err) {
						var textConfig = {
							"error": localeData.ERROR.REPORT_EXCEPTION,
							"emptyData": localeData.ERROR.REPORT_DATA_NOT_AVAILABLE
						}, errorText;

						if (err instanceof AdPushupError) {
							errorText = textConfig.emptyData;
						} else {
							errorText = textConfig.error;
						}

						return res.render('performanceReport', {
							siteId,
							errorText,
							siteDomain: siteDomainName,
							paramConfig,
							filterDates,
							localeData,
							localeCode
						});
					});
			});
	})
	.get('/getPerformanceData', function(req, res) {
		var	paramConfig = {
			siteId: req.params.siteId,
			dateFrom: ((req.query && req.query.dateFrom) || moment().subtract(7, 'days').format('YYYY-MM-DD')),
			dateTo: ((req.query && req.query.dateTo) || moment().subtract(1, 'days').format('YYYY-MM-DD'))
		};

		return siteModel.getSiteById(paramConfig.siteId)
			.then(function(site) {
				paramConfig.mediaId = site.get('genieeMediaId');

				return genieeService.getReport(paramConfig)
					.then(function(reportData) {
						return res.json({
							success: 1,
							data: reportData
						});
					})
					.catch(function(err) {
						return res.json({
							success: 0,
							error: err
						});
					});
			});
	})
	.get('/adsense', function(req, res) {
		var getUser = userModel.getUserByEmail(req.session.user.email),
			getNetworkData = getUser.then(function(user) {
				return user.getNetworkData('ADSENSE');
			}),
			getAdsense = getUser.then(adsenseReportModel.getAdsense),
			getAdsenseDomains = getAdsense.then(function(adsense) {
				return adsense.getDomains();
			}),
			getQueryDomainInfo = getAdsenseDomains.then(function(adsenseDomains) {
				return Promise.resolve(getQueryDomain(req.query.siteId, adsenseDomains.rows));
			});

		// Get queried domain info by matching that particular site domain
		// against all AdSense domains
		function getQueryDomain(siteId, domains) {
			if (!siteId) { return null;}
			var domainIndex = -1, domainValue;

			return siteModel.getSiteById(siteId).then(function(site) {
				var queryDomain = utils.domanize(site.get('siteDomain'));

				domains.map(function(arr, idx) {
					if (utils.domanize(arr[0]) === queryDomain) {
						domainIndex = idx;
						domainValue = utils.domanize(arr[0]);
					}
				});

				return ((domainIndex !== -1) && domainValue) ? [domainIndex, domainValue] : null;
			});
		}

		Promise.join(getUser, getNetworkData, getAdsense, getAdsenseDomains, getQueryDomainInfo, function(user, networkData, adsense, adsenseDomains, domainInfo) {
			if (!networkData) {
				throw new AdPushupError('Adsense account not connected');
			}
			var paramConfig = {
				siteId: req.query.siteId,
				sites: JSON.stringify(adsenseDomains.rows),
				pubId: networkData.pubId,
				isSuperUser: req.session.isSuperUser,
				startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
				endDate: moment().subtract(1, 'days').format('YYYY-MM-DD')
			};

			if (domainInfo && Array.isArray(domainInfo)) {
				paramConfig.domainInfo = domainInfo;
			}

			return res.render('adsenseReports', paramConfig);
		}).catch(function(err) {
			res.render('adsenseReports', {
				err: err
			});
		});
	})
	.get('/adx', function(req, res) {
		res.render('pageLoader', {
			loaderText: 'Fetching AdX reports...',
			title: 'AdX Report',
			pageUrl: '/user/reports/adxReport'
		});
	})
	.get('/adxReport', function(req, res) {
		var getUser = userModel.getUserByEmail(req.session.user.email),
			getUserDomains = getUser.then(getAllUserDomains),
			getNetworkData = getUser.then(function(user) {
				return user.getNetworkData('ADSENSE');
			}),
			getAdsense = getUser.then(adsenseReportModel.getAdsense),
			getAdxDomains = adxReportModel.getDomains(),
			getAdsenseDomains = getAdsense.then(function(adsense) {
				return adsense.getDomains();
			}),
			paramConfig = {
				siteId: req.query.siteId,
				isSuperUser: req.session.isSuperUser,
				startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
				endDate: moment().subtract(1, 'days').format('YYYY-MM-DD')
			};

		/**
		 * Get a site domain list extracted from user object
		 * @param {object} user, user model {}
		 * @returns {array} site domain list
		 */
		function getAllUserDomains(user) {
			return Promise.resolve(user.get('sites'))
				.then(function(sitesArr) {
					if (sitesArr.length > 0) {
						return sitesArr.map(function(val) {
							return val.domain;
						});
					}
					return [];
				});
		}

		/**
		 * Compute valid site domains by an intersection between user custom domains and
		 * AdX domains followed by a match of every intersected domain with AdX domains
		 * @param {array} customDomains, user custom (AdPushup sites/AdSense) domains []
		 * @param {array} adxDomains, all adx domains []
		 * @returns {array} validSiteDomains, valid site domains
		 */
		function getValidDomains(customDomains, adxDomains) {
			var siteDomains = lodash.intersectionBy(adxDomains, customDomains, utils.domanize),
				validSiteDomains = getMatchedDomains(siteDomains, adxDomains);

			return validSiteDomains;
		}

		/**
		 * Compute site domains with a match of every intersected
		 * domain against all possible AdX listed domains
		 * @param {array} intersectedSiteDomains, intersected site domains []
		 * @param {array} adxDomains, all adx domains []
		 * @returns {array} Filtered site domains
		 */
		function getMatchedDomains(intersectedSiteDomains, adxDomains) {
			var computedSiteDomains = [];

			intersectedSiteDomains.forEach(function(siteDomainVal) {
				adxDomains.forEach(function(adxDomainsVal, idx) {
					if (utils.domanize(siteDomainVal) === utils.domanize(adxDomainsVal)) {
						computedSiteDomains.push(adxDomains[idx]);
					}
				});
			});

			return computedSiteDomains;
		}

		/**
		 * Show Adx report of valid domains extracted
		 * by an intersection of user AdSense & Adx domains
		 * @param {null} no parameter
		 * @returns {html} Render adxReport jade page
		 */
		function showAdxReportWithAdSenseDomainFilter() {
			return Promise.join(getUser, getNetworkData, getAdsense, getAdsenseDomains, getAdxDomains, function(user, networkData, adsense, adsenseDomains, adxDomains) {
				if (!networkData) {throw new AdPushupError('Adsense account not connected');}
				adsenseDomains = adsenseDomains.rows && Array.isArray(adsenseDomains.rows) ? adsenseDomains.rows.map(function(val) { return utils.domanize(val[0]); }) : [];

				var validSiteDomains = getValidDomains(adsenseDomains, adxDomains);

				paramConfig.sites = validSiteDomains && validSiteDomains.length ? JSON.stringify(validSiteDomains) : null;
				return res.render('adxReports', paramConfig);
			}).catch(function(err) {
				if (err instanceof AdPushupError) {
					return showAdxReportWithUserDomainFilter();
				}

				res.render('adxReports', {
					err: err
				});
			});
		}

		/**
		 * Show Adx report of valid domains extracted
		 * by an intersection of user Custom (added in adpushup app) & Adx domains
		 * @param {null} no parameter
		 * @returns {html} Render adxReport jade page
		 */
		function showAdxReportWithUserDomainFilter() {
			return Promise.join(getUser, getUserDomains, getAdxDomains, function(user, userDomains, adxDomains) {
				var validSiteDomains = getValidDomains(userDomains, adxDomains);

				paramConfig.sites = validSiteDomains && validSiteDomains.length ? JSON.stringify(validSiteDomains) : null;
				return res.render('adxReports', paramConfig);
			}).catch(function(e) {
				res.render('adxReports', {
					err: e
				});
			});
		}

		return showAdxReportWithAdSenseDomainFilter();
	})
	.get('/apexReport', function(req, res) {
		var getUser = userModel.getUserByEmail(req.session.user.email),
			getSiteData = getUser.then(getUserSiteData),
			paramConfig = {
				siteId: req.query.siteId,
				isSuperUser: req.session.isSuperUser,
				startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
				endDate: moment().subtract(1, 'days').format('YYYY-MM-DD')
			};

		/**
		 * Get apex domains from all user site objects
		 * @param {Object} allSites, user sites {}
		 * @returns {array} apex sites data list
		 */
		function getFilteredDomains(allSites) {
			var filteredDomains;

			if (allSites && allSites.length && Array.isArray(allSites)) {
				filteredDomains = allSites.map(function(siteObj) {
					return siteModel.getSiteById(siteObj.siteId)
						.then(function(site) {
							return {
								'domain': site.get('siteDomain'),
								'siteId': site.get('siteId')
							};
						})
						.catch(function() {
							return false;
						});
				});

				return Promise.all(filteredDomains).then(function(domains) {
					return lodash.compact(domains);
				});
			}
			return [];
		}

		/**
		 * Get all sites data list extracted from user object
		 * @param {object} user, user model {}
		 * @returns {array} site data list
		 */
		function getUserSiteData(user) {
			return Promise.resolve(user.get('sites'))
				.then(getFilteredDomains);
		}

		/**
		 * Show Apex report of user site domains
		 * @param {null} no parameter
		 * @returns {html} Render apexReport jade page
		 */
		function showApexReport() {
			return Promise.join(getUser, getSiteData, function(user, siteData) {
				paramConfig.sites = siteData;
				return res.render('apexReports', paramConfig);
			}).catch(function(e) {
				res.render('apexReports', {
					err: e
				});
			});
		}

		return showApexReport();
	})
	.get('/ControlVsAdpushupCtr', function(req, res) {
		var currentSiteId = req.query.siteId ? req.query.siteId : '';

		return res.render('adpushupVsControlReports', {
			'currentSiteId': currentSiteId,
			'startDate': moment().subtract(7, 'days').format('YYYY-MM-DD'),
			'endDate': moment().subtract(1, 'days').format('YYYY-MM-DD')
		});
	})
	.get('/adxData', function(req, res) {
		adxReportModel.getReport(req.query)
			.then(function(data) {
				return res.json({ success: true, data: data });
			}).catch(function(err) {
				return res.json({ success: false, err: err });
			});
	})
	.get('/AdsenseData', function(req, res, next) {
		var getUser = userModel.getUserByEmail(req.session.user.email),
			getAdsense = getUser.then(adsenseReportModel.getAdsense),
			prepareConfig = adsenseReportModel.prepareQuery(req.query);

		Promise.join(getUser, getAdsense, prepareConfig, function(user, adsense, config) {
			return adsense.getReport(config)
				.then(function(report) {
					return res.json({ success: true, data: report });
				});
		}).catch(function(err) {
			next(err);
		});
	})

	.get('/apexData', function(req, res, next) {
		return userModel.verifySiteOwner(req.session.user.email, req.query.siteId).then(function() {
			return apexReportService.getReportData(req.query).then(function(reportData) {
				return res.json(reportData);
			});
		}).catch(function(err) {
			if (err instanceof AdPushupError) {
				return res.json(err.message);
			}
			next(err);
		});
	})

	.get('/controlVsAdpushupCtrData', function(req, res, next) {
		return userModel.verifySiteOwner(req.session.user.email, req.query.siteId).then(function() {
			// cleaning config
			var config = req.query;
			config.siteId = parseInt(config.siteId, 10);
			config.platform = (config.platform) ? config.platform.substring(0, 7) : null;
			config.pageGroup = (config.pageGroup) ? config.pageGroup.substring(0, 30) : null;
			config.step = (config.step) ? config.step.substring(0, 10) : null;
			config.startDate = (config.startDate) ? parseInt(config.startDate, 10) : 1448928000000;
			config.endDate = (config.endDate) ? parseInt(config.endDate, 10) : Date.now();

			return Promise.resolve(reports.controlVsAdpushupCtrReport(config)).then(function(report) {
				return res.json(report);
			});
		}).catch(function(err) {
			if (err instanceof AdPushupError) {
				return res.json(err.message);
			}
			next(err);
		});
	})

	.get('/controlVsAdpushupPageviewsData', function(req, res, next) {
		return userModel.verifySiteOwner(req.session.user.email, req.query.siteId).then(function() {
			// cleaning config
			var config = req.query;
			config.siteId = parseInt(config.siteId, 10);
			config.platform = (config.platform) ? config.platform.substring(0, 7) : null;
			config.pageGroup = (config.pageGroup) ? config.pageGroup.substring(0, 30) : null;
			config.step = (config.step) ? config.step.substring(0, 10) : null;
			config.startDate = (config.startDate) ? parseInt(config.startDate, 10) : 1448928000000;
			config.endDate = (config.endDate) ? parseInt(config.endDate, 10) : Date.now();

			return Promise.resolve(reports.controlVsAdpushupPageviewsReport(config)).then(function(report) {
				return res.json(report);
			});
		}).catch(function(err) {
			if (err instanceof AdPushupError) {
				return res.json(err.message);
			}
			next(err);
		});
	})

	.get('/editorStatsData', function(req, res, next) {
		return userModel.verifySiteOwner(req.session.user.email, req.query.siteId).then(function() {
			// cleaning config
			var config = req.query;
			config.siteId = parseInt(config.siteId, 10);
			config.platform = (config.platform) ? config.platform.substring(0, 7) : null;
			config.pageGroup = (config.pageGroup) ? config.pageGroup.substring(0, 30) : null;
			config.startDate = (config.startDate) ? parseInt(config.startDate, 10) : 1448928000000;
			config.endDate = (config.endDate) ? parseInt(config.endDate, 10) : Date.now();

			return Promise.resolve(reports.editorStatsReport(config)).then(function(report) {
				return res.json(report);
			});
		}).catch(function(err) {
			if (err instanceof AdPushupError) {
				return res.json(err.message);
			}
			next(err);
		});
	})

	.get('/getApexVariationData', function(req, res) {
		const queryData = req.query,
			config = {
				siteId: queryData.siteId,
				startDate: queryData.startDate,
				endDate: queryData.endDate,
				currencyCode: queryData.currencyCode,
				queryString: 'mode:1'
			};

		return apexVariationReportService.getReportData(config)
			.then(function(reportData) {
				return res.json(reportData);
			});
	})

	.get('/getUniversalReportData', function(req, res) {
		var siteId = req.query.siteId,
			startDate = req.query.startDate,
			endDate = req.query.endDate;

		return siteModel.getSiteById(siteId)
			.then(function(site) {
				return universalReportService.getReportData(site, startDate, endDate)
					.then(function(reportData) {
						return res.json(reportData);
					});
			})
	})

	.get('/performESSearch', function(req, res) {
		var startDate = req.query.startDate ? req.query.startDate : moment().subtract(13, 'hours').valueOf(),
			endDate = req.query.endDate ? req.query.endDate : moment().subtract(1, 'hours').valueOf(),
			config = {
			indexes: 'ex_stats_new',
			logName: 'exlg',
			queryBody: {"query":{"bool":{"filter":[{"bool":{"must":[{"range":{"createdTs":{"gte":startDate,"lte":endDate}}}],"should":[],"must_not":[]}}],"must":{"query_string":{"analyze_wildcard":true,"query":"mode:1 AND variationId:6ae3b7e1_d246_462d_ba48_949051885435 AND pageGroup:POST AND userAnalytics.platform:MOBILE AND siteId:25005"}}}},"aggs":{"PLATFORM":{"terms":{"field":"userAnalytics.platform","size":5,"order":{"_term":"desc"}},"aggs":{"CHOSEN_VARIATION":{"terms":{"field":"variationId","size":2},"aggs":{"ADS_CLICKED":{"terms":{"field":"ads.clicked","size":5}}}}}}}},
			// queryBody: {"size":0,"query":{"bool":{"must":[{"query_string":{"analyze_wildcard":true,"query":"tracking:true AND mode:1 AND pageGroup:POST AND userAnalytics.platform:DESKTOP AND siteId:25005"}},{"range":{"createdTs":{"gte":startDate,"lte":endDate,"format":"epoch_millis"}}}],"must_not":[]}},"aggs":{"PLATFORM":{"terms":{"field":"userAnalytics.platform","size":5,"order":{"_term":"desc"}},"aggs":{"CHOSEN_VARIATION":{"terms":{"field":"variationId","size":1000,"order":{"_term":"desc"}},"aggs":{"ADS_CLICKED":{"terms":{"field":"ads.clicked","size":5,"order":{"_term":"desc"}}}}}}}}}
		};

		return reports.doESSearch(config).then(function(result) {
			return res.json(result);
		});
	});


module.exports = router;
