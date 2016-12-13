var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	AdPushupError = require('../helpers/AdPushupError'),
	genieeService = require('../reports/service'),
	adsenseReportModel = require('../models/adsenseModel'),
	adxReportModel = require('../models/adxModel'),
	Promise = require('bluebird'),
	lodash = require('lodash'),
	moment = require('moment'),
	utils = require('../helpers/utils'),
	// eslint-disable-next-line new-cap
	router = express.Router({ mergeParams: true }),
	reports = require('../models/reportsModel');

router
	.get('/performance', function(req, res) {
		var	paramConfig = {
			siteId: req.params.siteId,
			dateFrom: moment().subtract(7, 'days').format('YYYY-MM-DD'),
			dateTo: moment().subtract(1, 'days').format('YYYY-MM-DD')
		}, siteDomainName;

		return siteModel.getSiteById(paramConfig.siteId)
			.then(function(site) {
				siteDomainName = utils.domanize(site.get('siteDomain'));

				paramConfig.mediaId = 920; //site.get('genieeMediaId');
				return genieeService.getReport(paramConfig)
					.then(function(data) {
						return res.render('performanceReport', {
							reportingData: data,
							siteId: req.params.siteId,
							siteDomain: siteDomainName
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
	.get('/performanceData', function(req, res) {
		var	paramConfig = {
			siteId: req.params.siteId,
			dateFrom: ((req.query && req.query.dateFrom) || moment().subtract(7, 'days').format('YYYY-MM-DD')),
			dateTo: ((req.query && req.query.dateTo) || moment().subtract(1, 'days').format('YYYY-MM-DD'))
		};

		return siteModel.getSiteById(paramConfig.siteId)
			.then(function(site) {
				paramConfig.mediaId = 920; //site.get('genieeMediaId');
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
							if (site.isApex()) {
								return {
									'domain': site.get('siteDomain'),
									'siteId': site.get('siteId')
								};
							}
							return false;
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
		function getVariationTrafficDistribution(config) {
			return siteModel.getSiteById(config.siteId).then(function(site) {
				var variationName, apConfigs, trafficDistributionObj, computedObj = {};

				if (site.isApex()) {
					apConfigs = site.get('apConfigs');
					trafficDistributionObj = (typeof apConfigs.trafficDistribution !== 'undefined') ? apConfigs.trafficDistribution : null;

					if (!!trafficDistributionObj) {
						config.variations.forEach(function(variationKey) {
							variationName = ([config.pageGroup.toUpperCase(), variationKey, config.platform.toUpperCase()]).join('_');

							if (trafficDistributionObj.hasOwnProperty(variationName) && trafficDistributionObj[variationName]) {
								computedObj[variationKey] = {
									'name': variationName,
									'value': trafficDistributionObj[variationName]
								};
							}
						});

						return computedObj;
					}
					return computedObj;
				}

				return computedObj;
			});
		}

		function getTrafficDistributionConfig(config, report) {
			var computedConfig = lodash.assign({}, config), rows = report.data.rows,
				variationKey;

			computedConfig.variations = [];
			rows.forEach(function(row) {
				variationKey = row[0];
				computedConfig.variations.push(variationKey);
			});

			return computedConfig;
		}

		function setTrafficDistribution(report, trafficDistributionData) {
			var computedReport = lodash.assign({}, report), variationKey, variationObj;

			computedReport.data.rows.forEach(function(row, idx) {
				variationKey = row[0];
				variationObj = trafficDistributionData[variationKey];

				if (trafficDistributionData.hasOwnProperty(variationKey) && variationObj) {
					// Set variation traffic distribution value
					computedReport.data.rows[idx][1] = variationObj.value;
				}
			});

			// Set traffic distribution data in computed report
			computedReport.data.trafficDistribution = trafficDistributionData;
			return Promise.resolve(computedReport);
		}

		function getPerformanceData(rows) {
			var ctrArr = rows.map(function(row) {
					return row[4];
				}),
				controlCtr = lodash.min(ctrArr),
				performanceArr = ctrArr.map(function(ctr) {
					return lodash.round(((ctr - controlCtr) / controlCtr) * 100);
				});

			return performanceArr;
		}

		function setCTRPerformanceData(reportData) {
			var computedReport = lodash.assign({}, reportData),
				rows = computedReport.data.rows,
				performanceArr = getPerformanceData(rows);

			rows.forEach(function(row, idx) {
				// Added number placeholder for input selection
				computedReport.data.rows[idx].unshift(idx);
				// Added performance item
				computedReport.data.rows[idx].push(performanceArr[idx]);
				// Added RPM item
				computedReport.data.rows[idx].push(idx);
			});

			computedReport.data.header.unshift(' ');
			computedReport.data.header.push('Performance (%)');
			computedReport.data.header.push('RPM');
			computedReport.data.header[2] = 'Traffic (%)';

			computedReport.data.footer.unshift('-');
			computedReport.data.footer.push('-');
			computedReport.data.footer.push('-');
			computedReport.data.performance = performanceArr;

			return Promise.resolve(computedReport);
		}

		return userModel.verifySiteOwner(req.session.user.email, req.query.siteId).then(function() {
			// TD = TrafficDistribution, FR = FinalReport
			var config = req.query, getReport, getTDConfig, getVariationTD;
			config.siteId = parseInt(config.siteId, 10);
			config.platform = (config.platform) ? config.platform.substring(0, 7) : null;
			config.pageGroup = (config.pageGroup) ? config.pageGroup.substring(0, 30) : null;
			config.startDate = (config.startDate) ? parseInt(config.startDate, 10) : 1448928000000;
			config.endDate = (config.endDate) ? parseInt(config.endDate, 10) : Date.now();

			getReport = Promise.resolve(reports.apexReport(config));
			getTDConfig = getReport.then(function(report) {
				return getTrafficDistributionConfig(config, report);
			});
			getVariationTD = getTDConfig.then(function(trafficDistributionConfig) {
				return getVariationTrafficDistribution(trafficDistributionConfig);
			});

			return Promise.join(getReport, getTDConfig, getVariationTD, function(report, trafficDistributionConfig, trafficDistributionData) {
				return setTrafficDistribution(report, trafficDistributionData).then(function(reportWithTD) {
					return setCTRPerformanceData(reportWithTD).then(function(reportWithCTRPerformance) {
						return res.json(reportWithCTRPerformance);
					});
				});
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
	});



module.exports = router;
