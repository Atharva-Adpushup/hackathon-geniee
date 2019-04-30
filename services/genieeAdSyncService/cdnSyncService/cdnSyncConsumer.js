const path = require('path');
const Promise = require('bluebird');
const PromiseFtp = require('promise-ftp');

// const universalReportService = require('../../../reports/universal/index');
const { getReportData, getMediationData } = require('../../../reports/universal/index');
const mkdirpAsync = Promise.promisifyAll(require('mkdirp')).mkdirpAsync;
const fs = Promise.promisifyAll(require('fs'));
const CC = require('../../../configs/commonConsts');
const generateADPTagsConfig = require('./generateADPTagsConfig');
const generateAdPushupConfig = require('./generateAdPushupConfig');
const config = require('../../../configs/config');
const generateStatusesAndConfig = require('./generateConfig');
const bundleGeneration = require('./bundleGeneration');
const prebidGeneration = require('./prebidGeneration');

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
		getFinalConfig = () => {
			return getConfigWrapper(site)
				.then(generatedConfig => prebidGeneration(generatedConfig))
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
