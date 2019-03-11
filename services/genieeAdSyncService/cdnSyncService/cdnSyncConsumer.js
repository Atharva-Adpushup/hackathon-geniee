var path = require('path'),
	Promise = require('bluebird'),
	retry = require('bluebird-retry'),
	_ = require('lodash'),
	moment = require('moment'),
	PromiseFtp = require('promise-ftp'),
	// universalReportService = require('../../../reports/universal/index'),
	{ getReportData, getMediationData } = require('../../../reports/universal/index'),
	mkdirpAsync = Promise.promisifyAll(require('mkdirp')).mkdirpAsync,
	fs = Promise.promisifyAll(require('fs')),
	AdPushupError = require('../../../helpers/AdPushupError'),
	{ isValidThirdPartyDFPAndCurrency } = require('../../../helpers/commonFunctions'),
	CC = require('../../../configs/commonConsts'),
	generateADPTagsConfig = require('./generateADPTagsConfig'),
	generateAdPushupConfig = require('./generateAdPushupConfig'),
	{ getHbAdsApTag } = require('./generateAPTagConfig'),
	siteModel = require('../../../models/siteModel'),
	couchbase = require('../../../helpers/couchBaseService'),
	config = require('../../../configs/config'),
	prodEnv = config.environment.HOST_ENV === 'production';

module.exports = function(site, externalData = {}) {
	ftp = new PromiseFtp();

	var paramConfig = {
			siteId: site.get('siteId')
		},
		noop = 'function() {}',
		isExternalRequest = externalData && Object.keys(externalData).length && externalData.externalRequest,
		isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise),
		poweredByBanner = !!(site.get('apConfigs') && site.get('apConfigs').poweredByBanner),
		jsTplPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'adpushup.min.js'),
		uncompressedJsTplPath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'public',
			'assets',
			'js',
			'builds',
			'adpushup.js'
		),
		incontentAnalyserScriptPath = path.join(__dirname, '..', 'genieeAp', 'libs', 'aa.js'),
		adpTagsScriptPath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'public',
			'assets',
			'js',
			'builds',
			prodEnv ? 'adptags.min.js' : 'adptags.js'
		),
		prebidScriptPath = path.join(__dirname, '..', '..', 'adpTags', 'Prebid.js', 'build', 'dist', 'prebid.js'),
		tempDestPath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'public',
			'assets',
			'js',
			'builds',
			'geniee',
			site.get('siteId').toString()
		),
		setAllConfigs = function(combinedConfig) {
			var apConfigs = site.get('apConfigs'),
				isAdPartner = !!site.get('partner');
			let { experiment, adpTagsConfig, manualAds, innovativeAds } = combinedConfig;

			isAdPartner ? (apConfigs.partner = site.get('partner')) : null;
			apConfigs.autoOptimise = isAutoOptimise ? true : false;
			apConfigs.poweredByBanner = poweredByBanner ? true : false;
			apConfigs.siteDomain = site.get('siteDomain');
			apConfigs.isSPA = apConfigs.isSPA ? apConfigs.isSPA : false;
			apConfigs.spaPageTransitionTimeout = apConfigs.spaPageTransitionTimeout
				? apConfigs.spaPageTransitionTimeout
				: 0;
			apConfigs.activeDFPNetwork = apConfigs.activeDFPNetwork ? apConfigs.activeDFPNetwork : null;
			apConfigs.manualModeActive = site.get('isManual') ? site.get('isManual') : false;
			apConfigs.innovativeModeActive = site.get('isInnovative') ? site.get('isInnovative') : false;
			// Default 'draft' mode is selected if config mode is not present
			apConfigs.mode = !apConfigs.mode ? 2 : apConfigs.mode;
			apConfigs.manualAds = manualAds || [];
			apConfigs.innovativeAds = innovativeAds || [];
			apConfigs.experiment = experiment;
			delete apConfigs.pageGroupPattern;
			return { apConfigs, adpTagsConfig };
		},
		getJsFile = fs.readFileAsync(jsTplPath, 'utf8'),
		getUncompressedJsFile = fs.readFileAsync(uncompressedJsTplPath, 'utf8'),
		getIncontentAnalyserScript = fs.readFileAsync(incontentAnalyserScriptPath, 'utf8'),
		getAdpTagsScript = fs.readFileAsync(adpTagsScriptPath, 'utf8'),
		getPrebidScript = fs.readFileAsync(prebidScriptPath, 'utf8'),
		getHbConfig = couchbase
			.connectToAppBucket()
			.then(appBucket => appBucket.getAsync(`hbcf::${site.get('siteId')}`, {}))
			.catch(err => Promise.resolve({})),
		generateCombinedJson = (experiment, adpTags, manualAds, innovativeAds) => {
			if (!(Array.isArray(adpTags) && adpTags.length)) {
				return { experiment, adpTagsConfig: false, manualAds, innovativeAds };
			}
			return generateADPTagsConfig(adpTags, site.get('siteId')).then(adpTagsConfig => ({
				adpTagsConfig,
				experiment,
				manualAds,
				innovativeAds
			}));
		},
		generateFinalInitScript = (jsFile, uncompressedJsFile) => {
			return {
				addService: (serviceName, serviceConfig = {}, serviceScript = null) => {
					switch (serviceName) {
						case CC.SERVICES.INCONTENT_ANALYSER:
							serviceScript = serviceScript.substring(0, serviceScript.trim().length - 1);

							if (serviceConfig.length) {
								jsFile = _.replace(jsFile, '__IN_CONTENT_ANALYSER_SCRIPT__', serviceScript);
								uncompressedJsFile = _.replace(
									uncompressedJsFile,
									'__IN_CONTENT_ANALYSER_SCRIPT__',
									serviceScript
								);
							} else {
								jsFile = _.replace(jsFile, '__IN_CONTENT_ANALYSER_SCRIPT__', noop);
								uncompressedJsFile = _.replace(
									uncompressedJsFile,
									'__IN_CONTENT_ANALYSER_SCRIPT__',
									noop
								);
							}
							return generateFinalInitScript(jsFile, uncompressedJsFile);

						case CC.SERVICES.ADPTAGS:
							if (serviceConfig) {
								serviceScript = _.replace(
									serviceScript,
									'__INVENTORY__',
									JSON.stringify(serviceConfig)
								);
								serviceScript = _.replace(serviceScript, '__SITE_ID__', site.get('siteId'));
								jsFile = `${jsFile};${serviceScript}`;
								uncompressedJsFile = `${uncompressedJsFile};${serviceScript}`;
							}
							return generateFinalInitScript(jsFile, uncompressedJsFile);

						case CC.SERVICES.HEADER_BIDDING:
							serviceScript = serviceScript.substring(50, serviceScript.trim().length - 1);
							const isValidHBConfig = !!(
									serviceConfig &&
									serviceConfig.hbcf.value &&
									serviceConfig.hbcf.value.hbConfig &&
									serviceConfig.hbAds.length
								),
								isValidCurrencyConfig = !!(
									isValidHBConfig &&
									serviceConfig.currency &&
									Object.keys(serviceConfig.currency).length &&
									serviceConfig.currency.adServerCurrency &&
									serviceConfig.currency.granularityMultiplier &&
									serviceConfig.currency.rates
								);

							if (isValidHBConfig) {
								jsFile = _.replace(jsFile, '__PREBID_SCRIPT__', serviceScript);
								uncompressedJsFile = _.replace(uncompressedJsFile, '__PREBID_SCRIPT__', serviceScript);

								let { deviceConfig } = serviceConfig.hbcf.value;
								if (deviceConfig && deviceConfig.sizeConfig.length) {
									deviceConfig = ',sizeConfig: ' + JSON.stringify(deviceConfig.sizeConfig);
								} else {
									deviceConfig = '';
								}

								let prebidCurrencyConfig = serviceConfig.currency;
								if (isValidCurrencyConfig) {
									prebidCurrencyConfig = ',currency: ' + JSON.stringify(prebidCurrencyConfig);
								} else {
									prebidCurrencyConfig = '';
								}

								jsFile = _.replace(jsFile, '__SIZE_CONFIG__', deviceConfig);
								jsFile = _.replace(jsFile, '__PREBID_CURRENCY_CONFIG__', prebidCurrencyConfig);

								uncompressedJsFile = _.replace(uncompressedJsFile, '__SIZE_CONFIG__', deviceConfig);
								uncompressedJsFile = _.replace(
									uncompressedJsFile,
									'__PREBID_CURRENCY_CONFIG__',
									prebidCurrencyConfig
								);
							} else {
								jsFile = _.replace(jsFile, '__PREBID_SCRIPT__', '');
								uncompressedJsFile = _.replace(uncompressedJsFile, '__PREBID_SCRIPT__', '');
							}
							return generateFinalInitScript(jsFile, uncompressedJsFile);

						case CC.SERVICES.GDPR:
							var gdpr = serviceConfig;

							if (gdpr && gdpr.compliance) {
								var cookieControlConfig = gdpr.cookieControlConfig;

								if (cookieControlConfig) {
									var cookieScript = CC.COOKIE_CONTROL_SCRIPT_TMPL.replace(
										'__COOKIE_CONTROL_CONFIG__',
										JSON.stringify(cookieControlConfig)
									);
									jsFile = `${cookieScript}${jsFile}`;
									uncompressedJsFile = `${cookieScript}${uncompressedJsFile}`;
								}
							}
							return generateFinalInitScript(jsFile, uncompressedJsFile);

						default:
							return generateFinalInitScript(jsFile, uncompressedJsFile);
					}
				},
				done: () => {
					return { jsFile, uncompressedJsFile };
				}
			};
		},
		getComputedConfig = () => {
			function getData() {
				return isExternalRequest ? getMediationData(site, externalData) : getReportData(site);
			}
			return getData()
				.then(reportData => {
					if (reportData.status && reportData.data) {
						return generateAdPushupConfig(site, reportData.data);
					}
					return generateAdPushupConfig(site);
				})
				.spread(generateCombinedJson)
				.then(setAllConfigs);
		},
		getFinalConfig = Promise.join(
			getComputedConfig(),
			getJsFile,
			getUncompressedJsFile,
			siteModel.getIncontentAndHbAds(site.get('siteId')),
			getIncontentAnalyserScript,
			getAdpTagsScript,
			getHbConfig,
			getPrebidScript,
			getHbAdsApTag(site.get('siteId'), site.get('isManual')),
			function(
				finalConfig,
				jsFile,
				uncompressedJsFile,
				incontentAndHbAds,
				incontentAnalyserScript,
				adpTagsScript,
				hbcf,
				prebidScript,
				hbAdsApTag
			) {
				let { apConfigs, adpTagsConfig } = finalConfig,
					gdpr = site.get('gdpr'),
					{ incontentAds, hbAds } = incontentAndHbAds,
					isValidCurrencyConfig = isValidThirdPartyDFPAndCurrency(apConfigs),
					computedPrebidCurrencyConfig = {};

				if (isValidCurrencyConfig) {
					computedPrebidCurrencyConfig = {
						adServerCurrency: apConfigs.activeDFPCurrencyCode,
						granularityMultiplier: Number(apConfigs.prebidGranularityMultiplier),
						rates: {
							USD: {
								[apConfigs.activeDFPCurrencyCode]: Number(apConfigs.activeDFPCurrencyExchangeRate)
							}
						}
					};
				}

				if (site.get('ampSettings')) apConfigs.ampSettings = site.get('ampSettings');
				if (site.get('medianetId')) apConfigs.medianetId = site.get('medianetId');

				jsFile = _.replace(jsFile, '__AP_CONFIG__', JSON.stringify(apConfigs));
				jsFile = _.replace(jsFile, /__SITE_ID__/g, site.get('siteId'));
				jsFile = _.replace(jsFile, '__COUNTRY__', false);
				uncompressedJsFile = _.replace(uncompressedJsFile, '__AP_CONFIG__', JSON.stringify(apConfigs));
				uncompressedJsFile = _.replace(uncompressedJsFile, /__SITE_ID__/g, site.get('siteId'));
				uncompressedJsFile = _.replace(uncompressedJsFile, '__COUNTRY__', false);

				// Generate final init script based on the services that are enabled
				var scripts = generateFinalInitScript(jsFile, uncompressedJsFile)
					.addService(CC.SERVICES.INCONTENT_ANALYSER, incontentAds, incontentAnalyserScript)
					.addService(CC.SERVICES.ADPTAGS, adpTagsConfig, adpTagsScript)
					.addService(
						CC.SERVICES.HEADER_BIDDING,
						{ hbcf, hbAds: hbAds.concat(hbAdsApTag), currency: computedPrebidCurrencyConfig },
						prebidScript
					)
					.addService(CC.SERVICES.GDPR, gdpr)
					.done();

				return { default: scripts.jsFile, uncompressed: scripts.uncompressedJsFile };
			}
		),
		writeTempFile = function(jsFile) {
			return mkdirpAsync(tempDestPath)
				.then(function() {
					return fs.writeFileAsync(path.join(tempDestPath, 'adpushup.js'), jsFile);
				})
				.then(() => jsFile);
		},
		cwd = function() {
			return ftp.cwd('/' + site.get('siteId')).catch(function() {
				return ftp.mkdir(site.get('siteId')).then(function() {
					return ftp.cwd('/' + site.get('siteId'));
				});
			});
		},
		connectToServer = function() {
			if (ftp.getConnectionStatus() === 'connected') {
				return Promise.resolve(true);
			}
			return ftp.connect({
				host: config.cacheFlyFtp.HOST,
				user: config.cacheFlyFtp.USERNAME,
				password: config.cacheFlyFtp.PASSWORD
			});
		},
		uploadJS = function(fileConfig) {
			const shouldUpload = prodEnv && !config.environment.IS_STAGING;
			if (shouldUpload) {
				return connectToServer()
					.then(cwd)
					.then(function() {
						return ftp.put(fileConfig.default, 'adpushup.js');
					})
					.then(function() {
						return Promise.resolve(fileConfig.uncompressed);
					});
			}
			return Promise.resolve(fileConfig.uncompressed);
		},
		getFinalConfigWrapper = () => getFinalConfig.then(fileConfig => fileConfig);

	return Promise.join(getFinalConfigWrapper(), fileConfig => {
		function processing() {
			return isExternalRequest ? Promise.resolve(fileConfig.uncompressed) : uploadJS(fileConfig);
		}
		return processing()
			.then(writeTempFile)
			.then(() => {
				if (ftp.getConnectionStatus() === 'connected') {
					ftp.end();
				} else {
					return fileConfig.default;
				}
			})
			.catch(err => {
				if (ftp && ftp.getConnectionStatus() === 'connected') {
					ftp.end();
				}
				return Promise.reject(err);
			});
	});
};
