const path = require('path');
const Promise = require('bluebird');
const retry = require('bluebird-retry');
const _ = require('lodash');
const moment = require('moment');
const PromiseFtp = require('promise-ftp');

// const universalReportService = require('../../../reports/universal/index');
const { getReportData, getMediationData } = require('../../../reports/universal/index');
const mkdirpAsync = Promise.promisifyAll(require('mkdirp')).mkdirpAsync;
const fs = Promise.promisifyAll(require('fs'));
const AdPushupError = require('../../../helpers/AdPushupError');
const { isValidThirdPartyDFPAndCurrency } = require('../../../helpers/commonFunctions');
const CC = require('../../../configs/commonConsts');
const generateADPTagsConfig = require('./generateADPTagsConfig');
const generateAdPushupConfig = require('./generateAdPushupConfig');
const { getHbAdsApTag } = require('./generateAPTagConfig');
const siteModel = require('../../../models/siteModel');
const couchbase = require('../../../helpers/couchBaseService');
const config = require('../../../configs/config');
const generateStatusesAndConfig = require('./generateConfig');
const bundleGeneration = require('./bundleGeneration');

const prodEnv = config.environment.HOST_ENV === 'production';

module.exports = function(site, externalData = {}) {
	ftp = new PromiseFtp();

	var paramConfig = {
			siteId: site.get('siteId')
		},
		noop = 'function() {}',
		isExternalRequest = externalData && Object.keys(externalData).length && externalData.externalRequest,
		isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise),
		poweredByBanner = !!(site.get('apConfigs') && site.get('apConfigs').poweredByBanner),
		// jsTplPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'adpushup.min.js'),
		// uncompressedJsTplPath = path.join(
		// 	__dirname,
		// 	'..',
		// 	'..',
		// 	'..',
		// 	'public',
		// 	'assets',
		// 	'js',
		// 	'builds',
		// 	'adpushup.js'
		// ),
		// incontentAnalyserScriptPath = path.join(__dirname, '..', 'genieeAp', 'libs', 'aa.js'),
		// adpTagsScriptPath = path.join(
		// 	__dirname,
		// 	'..',
		// 	'..',
		// 	'..',
		// 	'public',
		// 	'assets',
		// 	'js',
		// 	'builds',
		// 	prodEnv ? 'adptags.min.js' : 'adptags.js'
		// ),
		// prebidScriptPath = path.join(__dirname, '..', '..', 'adpTags', 'Prebid.js', 'build', 'dist', 'prebid.js'),
		// innovativeAdsScript = path.join(
		// 	__dirname,
		// 	'..',
		// 	'..',
		// 	'..',
		// 	'public',
		// 	'assets',
		// 	'js',
		// 	'builds',
		// 	prodEnv ? 'adpInteractiveAds.min.js' : 'adpInteractiveAds.js'
		// ),
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
			let apConfigs = site.get('apConfigs');
			let isAdPartner = !!site.get('partner');
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

			apConfigs.manualModeActive ? (apConfigs.manualAds = manualAds || []) : null;
			apConfigs.innovativeModeActive ? (apConfigs.innovativeAds = innovativeAds || []) : null;

			apConfigs.experiment = experiment;
			delete apConfigs.pageGroupPattern;

			return { apConfigs, adpTagsConfig };
		},
		// getJsFile = fs.readFileAsync(jsTplPath, 'utf8'),
		// getUncompressedJsFile = fs.readFileAsync(uncompressedJsTplPath, 'utf8'),
		// getIncontentAnalyserScript = fs.readFileAsync(incontentAnalyserScriptPath, 'utf8'),
		// getAdpTagsScript = fs.readFileAsync(adpTagsScriptPath, 'utf8'),
		// getPrebidScript = fs.readFileAsync(prebidScriptPath, 'utf8'),
		// getInnovativeScript = fs.readFileAsync(innovativeAdsScript, 'utf-8'),
		// getHbConfig = couchbase
		// 	.connectToAppBucket()
		// 	.then(appBucket => appBucket.getAsync(`hbcf::${site.get('siteId')}`, {}))
		// 	.catch(err => Promise.resolve({})),
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
				addService: (serviceName, isActive, serviceConfig = {}) => {
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
							if (isActive) {
								jsFile = _.replace(jsFile, '__INVENTORY__', JSON.stringify(serviceConfig));
								jsFile = _.replace(jsFile, '__SITE_ID__', site.get('siteId'));

								uncompressedJsFile = _.replace(uncompressedJsFile, '__SITE_ID__', site.get('siteId'));
								uncompressedJsFile = _.replace(
									uncompressedJsFile,
									'__INVENTORY__',
									JSON.stringify(serviceConfig)
								);
							}
							return generateFinalInitScript(jsFile, uncompressedJsFile);

						case CC.SERVICES.HEADER_BIDDING:
							if (isActive) {
								let { deviceConfig = '', prebidCurrencyConfig = '' } = serviceConfig;

								jsFile = _.replace(jsFile, '__SIZE_CONFIG__', deviceConfig);
								jsFile = _.replace(jsFile, '__PREBID_CURRENCY_CONFIG__', prebidCurrencyConfig);

								uncompressedJsFile = _.replace(uncompressedJsFile, '__SIZE_CONFIG__', deviceConfig);
								uncompressedJsFile = _.replace(
									uncompressedJsFile,
									'__PREBID_CURRENCY_CONFIG__',
									prebidCurrencyConfig
								);
							}
							return generateFinalInitScript(jsFile, uncompressedJsFile);

						case CC.SERVICES.GDPR:
							var gdpr = serviceConfig;

							if (isActive && gdpr && gdpr.compliance) {
								var cookieControlConfig = gdpr.cookieControlConfig;

								if (cookieControlConfig) {
									jsFile = _.replace(
										jsFile,
										'__COOKIE_CONTROL_CONFIG__',
										JSON.stringify(cookieControlConfig)
									);
									uncompressedJsFile = _.replace(
										uncompressedJsFile,
										'__COOKIE_CONTROL_CONFIG__',
										JSON.stringify(cookieControlConfig)
									);
								}
							}
							return generateFinalInitScript(jsFile, uncompressedJsFile);

						case CC.SERVICES.INNOVATIVE_ADS:
							if (serviceConfig) {
								jsFile = `${jsFile};${serviceScript}`;
								uncompressedJsFile = `${uncompressedJsFile};${serviceScript}`;
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
		getConfigWrapper = site => {
			return getComputedConfig().then(computedConfig => generateStatusesAndConfig(site, computedConfig));
		},
		// getFinalConfig = Promise.join(
		// 	getConfigWrapper(site),
		// getJsFile,
		// getUncompressedJsFile,
		// siteModel.getIncontentAndHbAds(site.get('siteId')),
		// getIncontentAnalyserScript,
		// getAdpTagsScript,
		// getHbConfig,
		// getPrebidScript,
		// getInnovativeScript,
		// getHbAdsApTag(site.get('siteId'), site.get('isManual')),
		// function(
		// 	generatedConfig,
		// jsFile,
		// uncompressedJsFile,
		// incontentAndHbAds,
		// incontentAnalyserScript,
		// adpTagsScript,
		// hbcf,
		// prebidScript,
		// innovativeAdsScript,
		// hbAdsApTag
		// ) {
		// let { apConfigs, adpTagsConfig, finalConfig } = generatedConfig;
		// let { apConfigs, adpTagsConfig } = finalConfig;
		// let	gdpr = site.get('gdpr');
		// let	{ incontentAds, hbAds } = incontentAndHbAds;
		// let	isValidCurrencyConfig = isValidThirdPartyDFPAndCurrency(apConfigs);
		// let	computedPrebidCurrencyConfig = {};

		// if (isValidCurrencyConfig) {
		// 	computedPrebidCurrencyConfig = {
		// 		adServerCurrency: apConfigs.activeDFPCurrencyCode,
		// 		granularityMultiplier: Number(apConfigs.prebidGranularityMultiplier),
		// 		rates: {
		// 			USD: {
		// 				[apConfigs.activeDFPCurrencyCode]: Number(apConfigs.activeDFPCurrencyExchangeRate)
		// 			}
		// 		}
		// 	};
		// }

		// if (site.get('ampSettings')) apConfigs.ampSettings = {
		// 	samplingPercent: site.get('ampSettings').samplingPercent,
		// 	blockList: site.get('ampSettings').blockList,
		// 	isEnabled: site.get('ampSettings').isEnabled
		// }
		// if (site.get('medianetId')) apConfigs.medianetId = site.get('medianetId');

		// jsFile = _.replace(jsFile, '__AP_CONFIG__', JSON.stringify(apConfigs));
		// jsFile = _.replace(jsFile, /__SITE_ID__/g, site.get('siteId'));
		// jsFile = _.replace(jsFile, '__COUNTRY__', false);
		// uncompressedJsFile = _.replace(uncompressedJsFile, '__AP_CONFIG__', JSON.stringify(apConfigs));
		// uncompressedJsFile = _.replace(uncompressedJsFile, /__SITE_ID__/g, site.get('siteId'));
		// uncompressedJsFile = _.replace(uncompressedJsFile, '__COUNTRY__', false);

		// // Generate final init script based on the services that are enabled
		// var scripts = generateFinalInitScript(jsFile, uncompressedJsFile)
		// 	.addService(CC.SERVICES.INCONTENT_ANALYSER, incontentAds, incontentAnalyserScript)
		// 	.addService(CC.SERVICES.ADPTAGS, adpTagsConfig, adpTagsScript)
		// 	.addService(
		// 		CC.SERVICES.HEADER_BIDDING,
		// 		{ hbcf, hbAds: hbAds.concat(hbAdsApTag), currency: computedPrebidCurrencyConfig },
		// 		prebidScript
		// 	)
		// 	.addService(CC.SERVICES.GDPR, gdpr)
		// 	.addService(CC.SERVICES.INNOVATIVE_ADS, apConfigs.innovativeAds, innovativeAdsScript)
		// 	.done();

		// return { default: scripts.jsFile, uncompressed: scripts.uncompressedJsFile };
		// 	}
		// ) ,
		getFinalConfig = () => {
			return getConfigWrapper(site)
				.then(generatedConfig => bundleGeneration(site, generatedConfig))
				.spread((generatedConfig, bundles) => {
					let { apConfigs, adpTagsConfig, statusesAndAds: finalConfig } = generatedConfig;
					let { uncompressed, compressed } = bundles;

					if (site.get('medianetId')) apConfigs.medianetId = site.get('medianetId');

					compressed = _.replace(compressed, '__AP_CONFIG__', JSON.stringify(apConfigs));
					compressed = _.replace(compressed, /__SITE_ID__/g, site.get('siteId'));
					compressed = _.replace(compressed, '__COUNTRY__', false);
					uncompressed = _.replace(uncompressed, '__AP_CONFIG__', JSON.stringify(apConfigs));
					uncompressed = _.replace(uncompressed, /__SITE_ID__/g, site.get('siteId'));
					uncompressed = _.replace(uncompressed, '__COUNTRY__', false);

					// Generate final init script based on the services that are enabled
					var scripts = generateFinalInitScript(compressed, uncompressed)
						.addService(CC.SERVICES.ADPTAGS, finalConfig.statuses.ADPTAG_ACTIVE, adpTagsConfig)
						.addService(CC.SERVICES.HEADER_BIDDING, finalConfig.statuses.HB_ACTIVE, {
							deviceConfig: config.deviceConfig,
							prebidCurrencyConfig: config.prebidCurrencyConfig
						})
						.addService(CC.SERVICES.GDPR, finalConfig.statuses.GDPR_ACTIVE, finalConfig.config.gdpr)
						.done();

					return {
						default: scripts.jsFile,
						uncompressed: scripts.uncompressedJsFile
					};
				});
		},
		writeTempFile = function(jsFile, name = 'adpushup.js') {
			return mkdirpAsync(tempDestPath)
				.then(function() {
					return fs.writeFileAsync(path.join(tempDestPath, name), jsFile);
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
			if (prodEnv) {
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
		getFinalConfigWrapper = () => getFinalConfig().then(fileConfig => fileConfig);

	return Promise.join(getFinalConfigWrapper(), fileConfig => {
		function processing() {
			return isExternalRequest ? Promise.resolve(fileConfig.uncompressed) : uploadJS(fileConfig);
		}
		return processing()
			.then(writeTempFile)
			.then(() => writeTempFile(fileConfig.default, 'adpushup.min.js'))
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
