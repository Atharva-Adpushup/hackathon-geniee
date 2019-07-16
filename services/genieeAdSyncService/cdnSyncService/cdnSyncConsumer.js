const path = require('path');
const Promise = require('bluebird');
const PromiseFtp = require('promise-ftp');
const _ = require('lodash');
const uglifyJS = require('uglify-js');
const getReportData = require('../../../reports/universal/index');
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
const request = require('request-promise');
const disableSiteCdnSyncList = [38333];
// NOTE: Above 'disableSiteCdnSyncList' array is added to prevent site specific JavaScript CDN sync
// as custom generated Javascript files will replace their existing live files for new feature testing purposes.
// Websites: autocarindia (38333, It is running adpushup lite for which script is uploaded to CDN manually, for now)
const ieTestingSiteList = [38903]; // iaai.com

module.exports = function(site) {
	ftp = new PromiseFtp();

	var paramConfig = {
			siteId: site.get('siteId')
		},
		noop = 'function() {}',
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
			let { experiment, adpTagsConfig, manualAds, innovativeAds, isLegacyInnovativeAds } = combinedConfig;

			isAdPartner ? (apConfigs.partner = site.get('partner')) : null;
			apConfigs.autoOptimise = isAutoOptimise ? true : false;
			apConfigs.poweredByBanner = poweredByBanner ? true : false;
			apConfigs.siteDomain = site.get('siteDomain');
			apConfigs.isSPA = apConfigs.isSPA ? apConfigs.isSPA : false;
			apConfigs.spaPageTransitionTimeout = apConfigs.spaPageTransitionTimeout
				? apConfigs.spaPageTransitionTimeout
				: 0;
			apConfigs.activeDFPNetwork = apConfigs.activeDFPNetwork ? apConfigs.activeDFPNetwork : null;
			apConfigs.manualModeActive = site.get('isManual') && manualAds && manualAds.length ? true : false;
			apConfigs.innovativeModeActive =
				(site.get('isInnovative') && innovativeAds && innovativeAds.length) || isLegacyInnovativeAds
					? true
					: false;
			// Default 'draft' mode is selected if config mode is not present
			apConfigs.mode = !apConfigs.mode ? 2 : apConfigs.mode;

			apConfigs.manualModeActive ? (apConfigs.manualAds = manualAds || []) : null;
			apConfigs.innovativeModeActive ? (apConfigs.innovativeAds = innovativeAds || []) : null;

			apConfigs.experiment = experiment;
			delete apConfigs.pageGroupPattern;

			return { apConfigs, adpTagsConfig };
		},
		generateCombinedJson = (experiment, adpTags, manualAds, innovativeAds, isLegacyInnovativeAds) => {
			if (!(Array.isArray(adpTags) && adpTags.length)) {
				return { experiment, adpTagsConfig: false, manualAds, innovativeAds, isLegacyInnovativeAds };
			}
			return generateADPTagsConfig(adpTags, site.get('siteId')).then(adpTagsConfig => ({
				adpTagsConfig,
				experiment,
				manualAds,
				innovativeAds,
				isLegacyInnovativeAds
			}));
		},
		generateFinalInitScript = jsFile => {
			return {
				addService: (serviceName, isActive, serviceConfig = {}) => {
					switch (serviceName) {
						case CC.SERVICES.ADPTAGS:
							if (isActive) {
								jsFile = _.replace(jsFile, '__INVENTORY__', JSON.stringify(serviceConfig));
								jsFile = _.replace(jsFile, '__SITE_ID__', site.get('siteId'));
							}
							return generateFinalInitScript(jsFile);

						case CC.SERVICES.HEADER_BIDDING:
							if (isActive) {
								let { deviceConfig = '', prebidCurrencyConfig = '' } = serviceConfig;

								jsFile = _.replace(jsFile, '__SIZE_CONFIG__', deviceConfig);
								jsFile = _.replace(jsFile, '__PREBID_CURRENCY_CONFIG__', prebidCurrencyConfig);
							}
							return generateFinalInitScript(jsFile);

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
								}
							}
							return generateFinalInitScript(jsFile);

						default:
							return generateFinalInitScript(jsFile);
					}
				},
				done: () => {
					return jsFile;
				}
			};
		},
		getComputedConfig = () => {
			return getReportData(site)
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
				.spread((generatedConfig, bundle) => {
					let { apConfigs, adpTagsConfig, statusesAndAds: finalConfig } = generatedConfig;

					if (site.get('medianetId')) apConfigs.medianetId = site.get('medianetId');

					bundle = _.replace(bundle, '__AP_CONFIG__', JSON.stringify(apConfigs));
					bundle = _.replace(bundle, /__SITE_ID__/g, site.get('siteId'));
					bundle = _.replace(bundle, '__COUNTRY__', false);

					// Generate final init script based on the services that are enabled
					var uncompressed = generateFinalInitScript(bundle)
						.addService(CC.SERVICES.ADPTAGS, finalConfig.statuses.ADPTAG_ACTIVE, adpTagsConfig)
						.addService(CC.SERVICES.HEADER_BIDDING, finalConfig.statuses.HB_ACTIVE, {
							deviceConfig: finalConfig.config.deviceConfig,
							prebidCurrencyConfig: finalConfig.config.prebidCurrencyConfig
						})
						.addService(CC.SERVICES.GDPR, finalConfig.statuses.GDPR_ACTIVE, finalConfig.config.gdpr)
						.done();
					var compressed = '';

					try {
						var output = uglifyJS.minify(uncompressed, {
							compress: true,
							mangle: false,
							sourceMap: true
						});
						if (output.error) throw output.error;
						compressed = output.code;
					} catch (e) {
						console.log(e);
						return Promise.reject(new Error('CDN Sync failed while compressing the file'));
					}

					return {
						default: compressed,
						uncompressed
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
		startIETesting = uncompressedFile => {
			const siteId = site.get('siteId');
			const enableIETesting = !!(ieTestingSiteList.indexOf(siteId) > -1);

			return enableIETesting
				? request
						.get(CC.IE_TESTING_ENDPOINT)
						.then(() => uncompressedFile)
						.catch(() => uncompressedFile)
				: Promise.resolve(uncompressedFile);
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
			const siteId = site.get('siteId'),
			 shouldJSCdnSyncBeDisabled = !!(disableSiteCdnSyncList.indexOf(siteId) > -1);

			 if (shouldJSCdnSyncBeDisabled || !prodEnv) {
				return Promise.resolve(fileConfig.uncompressed);
			}else{
				return connectToServer()
					.then(cwd)
					.then(function() {
						return ftp.put(fileConfig.default, 'adpushup.js');
					})
					.then(function() {
						return Promise.resolve(fileConfig.uncompressed);
					});
			}
		},
		getFinalConfigWrapper = () => getFinalConfig().then(fileConfig => fileConfig);

	return Promise.join(getFinalConfigWrapper(), fileConfig => {
		return uploadJS(fileConfig)
			.then(writeTempFile)
			.then(startIETesting)
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
