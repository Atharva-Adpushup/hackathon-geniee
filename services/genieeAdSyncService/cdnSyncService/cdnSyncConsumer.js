const path = require('path');
const Promise = require('bluebird');
const PromiseFtp = require('promise-ftp');
const _ = require('lodash');
const uglifyJS = require('uglify-js');
const crypto = require('crypto');

const getReportData = require('../../../reports/universal/index');
const CC = require('../../../configs/commonConsts');
const { writeTempFiles, pushToCdnOriginQueue } = require('./commonFunctions');
const generatePrebidConfig = require('./generatePrebidConfig');
const generateApLiteConfig = require('./generateApLiteConfig');
const generateAdNetworkConfig = require('./generateAdNetworkConfig');
const generateAdPushupConfig = require('./generateAdPushupConfig');
const config = require('../../../configs/config');
const generateStatusesAndConfig = require('./generateConfig');
const bundleGeneration = require('./bundleGeneration');
const prebidGeneration = require('./prebidGeneration');
const request = require('request-promise');
const disableSiteCdnSyncList = [38333];
// NOTE: Above 'disableSiteCdnSyncList' array is added to prevent site specific JavaScript CDN sync
// as custom generated Javascript files will replace their existing live files for new feature testing purposes.
// Websites: autocarindia (38333, It is running adpushup lite for which script is uploaded to CDN manually, for now)
const ieTestingSiteList = [38903]; // iaai.com

module.exports = function(site, user, prebidBundleName) {
	var ftp = new PromiseFtp();

	var siteId = site.get('siteId'),
		apps = site.get('apps'),
		isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise),
		poweredByBanner = !!(site.get('apConfigs') && site.get('apConfigs').poweredByBanner),
		gptSraDisabled = !!(site.get('apConfigs') && site.get('apConfigs').gptSraDisabled),
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
			siteId.toString()
		),
		setAllConfigs = function(combinedConfig) {
			let apConfigs = site.get('apConfigs');
			const adServerSettings = user.get('adServerSettings');
			let isAdPartner = !!site.get('partner');
			let {
				experiment,
				prebidConfig,
				apLiteConfig,
				adNetworkConfig,
				manualAds,
				innovativeAds
			} = combinedConfig;

			isAdPartner ? (apConfigs.partner = site.get('partner')) : null;

			apConfigs.lineItems = (adNetworkConfig && adNetworkConfig.lineItems) || [];
			apConfigs.autoOptimise = isAutoOptimise ? true : false;
			apConfigs.poweredByBanner = poweredByBanner ? true : false;
			apConfigs.gptSraDisabled = !!gptSraDisabled;
			apConfigs.siteDomain = site.get('siteDomain');
			apConfigs.ownerEmailMD5 = crypto
				.createHash('md5')
				.update(site.get('ownerEmail'))
				.digest('hex')
				.substr(0, 64);
			apConfigs.isSPA = apConfigs.isSPA ? apConfigs.isSPA : false;
			apConfigs.spaButUsingHook = apConfigs.spaButUsingHook ? apConfigs.spaButUsingHook : false;
			apConfigs.spaPageTransitionTimeout = apConfigs.spaPageTransitionTimeout
				? apConfigs.spaPageTransitionTimeout
				: 0;
			apConfigs.activeDFPNetwork =
				(adServerSettings && adServerSettings.dfp && adServerSettings.dfp.activeDFPNetwork) || null;
			// apConfigs.isSeparatePrebidEnabled = config.separatePrebidEnabledSites.indexOf(siteId) !== -1;
			apConfigs.isSeparatePrebidEnabled = true;

			apConfigs.apLiteActive = !!apps.apLite;

			if (!apps.apLite) {
				apConfigs.manualModeActive = !!(apps.apTag && manualAds && manualAds.length);
				apConfigs.innovativeModeActive = !!(
					apps.innovativeAds &&
					innovativeAds &&
					innovativeAds.length
				);

				// Default 'draft' mode is selected if config mode is not present
				apConfigs.mode = apps.layout && apConfigs.mode ? apConfigs.mode : 2;

				apConfigs.manualModeActive ? (apConfigs.manualAds = manualAds || []) : null;
				apConfigs.innovativeModeActive ? (apConfigs.innovativeAds = innovativeAds || []) : null;

				apConfigs.experiment = experiment;
			}

			delete apConfigs.pageGroupPattern;

			const output = { apConfigs, prebidConfig };
			if (apps.apLite) output.apLiteConfig = apLiteConfig;

			return output;
		},
		generateCombinedJson = (experiment, adpTags, manualAds, innovativeAds) => {
			if (!(Array.isArray(adpTags) && adpTags.length)) {
				return {
					experiment,
					prebidConfig: false,
					manualAds,
					innovativeAds
				};
			}
			return generatePrebidConfig(siteId).then(prebidConfig => ({
				prebidConfig,
				experiment,
				manualAds,
				innovativeAds
			}));
		},
		setAdNetworkConfig = function(combinedConfig) {
			const adServerSettings = user.get('adServerSettings');
			const activeDFPNetwork =
				(adServerSettings && adServerSettings.dfp && adServerSettings.dfp.activeDFPNetwork) || null;

			if (activeDFPNetwork) {
				return generateAdNetworkConfig(activeDFPNetwork).then(adNetworkConfig => ({
					...combinedConfig,
					adNetworkConfig
				}));
			}

			return Promise.resolve(combinedConfig);
		},
		generateFinalInitScript = jsFile => {
			return {
				addService: (serviceName, isActive, serviceConfig = {}) => {
					switch (serviceName) {
						case CC.SERVICES.ADPTAGS:
							var prebidConfig = serviceConfig;
							if (isActive) {
								jsFile = _.replace(jsFile, '__PREBID_CONFIG__', JSON.stringify(prebidConfig));
								jsFile = _.replace(jsFile, '__SITE_ID__', siteId);
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

						case CC.SERVICES.AP_LITE:
							var apLiteConfig = serviceConfig;
							if (isActive) {
								jsFile = _.replace(jsFile, '__AP_LITE_CONFIG__', JSON.stringify(apLiteConfig));
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
			return (() => {
				if (apps.apLite) {
					return Promise.join(generatePrebidConfig(siteId), generateApLiteConfig(siteId)).then(
						([prebidConfig, apLiteConfig]) => ({ prebidConfig, apLiteConfig })
					);
				}

				return getReportData(site)
					.then(reportData => {
						if (reportData.status && reportData.data) {
							return generateAdPushupConfig(site, reportData.data);
						}
						return generateAdPushupConfig(site);
					})
					.spread(generateCombinedJson);
			})()
				.then(setAdNetworkConfig)
				.then(setAllConfigs);
		},
		getConfigWrapper = site => {
			return getComputedConfig().then(computedConfig =>
				generateStatusesAndConfig(site, computedConfig)
			);
		},
		getFinalConfig = () => {
			return getConfigWrapper(site)
				.then(generatedConfig => {
					const {
						statusesAndAds: { statuses = {}, config = {} } = {},
						apConfigs = {}
					} = generatedConfig;

					if (apConfigs.isSeparatePrebidEnabled || !statuses.HB_ACTIVE) {
						return generatedConfig;
					}

					return prebidGeneration(config.prebidAdapters).then(() => generatedConfig);
				})
				.then(generatedConfig => bundleGeneration(site, generatedConfig))
				.spread((generatedConfig, bundle) => {
					let {
						apConfigs,
						prebidConfig,
						apLiteConfig,
						statusesAndAds: finalConfig,
						sizeMappingConfig
					} = generatedConfig;

					if (site.get('medianetId')) apConfigs.medianetId = site.get('medianetId');
					const isUrlReportingEnabled =
						Array.isArray(config.urlReportingEnabledSites) &&
						config.urlReportingEnabledSites.indexOf(parseInt(siteId, 10)) !== -1;
					const prebidBundleUrl = config.prebidBundleUrl.replace(
						'__FILE_NAME__',
						prebidBundleName || config.prebidBundleDefaultName
					);
					const isPerformanceLoggingEnabled =
						Array.isArray(config.performanceLoggingEnabledSites) &&
						config.performanceLoggingEnabledSites.indexOf(parseInt(siteId, 10)) !== -1;
					const isVideoWaitLimitDisabled =
						Array.isArray(config.sitesToDisableVideoWaitLimit) &&
						config.sitesToDisableVideoWaitLimit.indexOf(parseInt(siteId, 10)) !== -1;

					// temp flag for temp change that has multiformat on for all the sites
					const isAutoAddMultiformatDisabled =
						Array.isArray(config.disableAutoAddMultiformatForSites) &&
						config.disableAutoAddMultiformatForSites.includes(parseInt(siteId, 10));

					bundle = _.replace(bundle, '__AP_CONFIG__', JSON.stringify(apConfigs));
					bundle = _.replace(bundle, /__SITE_ID__/g, siteId);
					//bundle = _.replace(bundle, '__COUNTRY__', false);
					bundle = _.replace(bundle, '__SIZE_MAPPING__', JSON.stringify(sizeMappingConfig));
					bundle = _.replace(bundle, '__WEB_S2S_STATUS__', finalConfig.config.isS2SActive);
					bundle = _.replace(bundle, '__URL_REPORTING_ENABLED__', isUrlReportingEnabled);
					bundle = _.replace(bundle, '__PREBID_BUNDLE_URL__', prebidBundleUrl);
					bundle = _.replace(bundle, '__PERFORMANCE_LOGGING_ENABLED__', isPerformanceLoggingEnabled);
					bundle = _.replace(bundle, '__VIDEO_WAIT_LIMIT_DISABLED__', isVideoWaitLimitDisabled);
					bundle = _.replace(bundle, '__AUTO_ADD_MULTIFORMAT_DISABLED__', isAutoAddMultiformatDisabled);

					// Generate final init script based on the services that are enabled
					var uncompressed = generateFinalInitScript(bundle)
						.addService(CC.SERVICES.ADPTAGS, finalConfig.statuses.ADPTAG_ACTIVE, prebidConfig)
						.addService(CC.SERVICES.HEADER_BIDDING, finalConfig.statuses.HB_ACTIVE, {
							deviceConfig: finalConfig.config.deviceConfig,
							prebidCurrencyConfig: finalConfig.config.prebidCurrencyConfig
						})
						.addService(CC.SERVICES.GDPR, finalConfig.statuses.GDPR_ACTIVE, finalConfig.config.gdpr)
						.addService(CC.SERVICES.AP_LITE, finalConfig.statuses.AP_LITE_ACTIVE, apLiteConfig)
						.done();
					var compressed = '';

					try {
						var output = uglifyJS.minify(uncompressed, {
							compress: true,
							mangle: true,
							sourceMap: true
						});
						if (output.error) throw output.error;
						compressed = output.code;
					} catch (e) {
						return Promise.reject(new Error('CDN Sync failed while compressing the file'));
					}

					return {
						default: compressed,
						uncompressed
					};
				});
		},
		startIETesting = uncompressedFile => {
			const enableIETesting = !!(ieTestingSiteList.indexOf(siteId) > -1);

			return enableIETesting
				? request
						.get(CC.IE_TESTING_ENDPOINT)
						.then(() => uncompressedFile)
						.catch(() => uncompressedFile)
				: Promise.resolve(uncompressedFile);
		},
		cwd = function() {
			return ftp.cwd('/' + siteId).catch(function() {
				return ftp.mkdir(siteId).then(function() {
					return ftp.cwd('/' + siteId);
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
		getFinalConfigWrapper = () => getFinalConfig().then(fileConfig => fileConfig);

	return Promise.join(getFinalConfigWrapper(), fileConfig => {
		return writeTempFiles([
			{
				content: fileConfig.uncompressed.replace(/[\"\']__COUNTRY__[\"\']/g, false),
				path: tempDestPath,
				name: 'adpushup.js'
			},
			{
				content: fileConfig.default.replace(/[\"\']__COUNTRY__[\"\']/g, false),
				path: tempDestPath,
				name: 'adpushup.min.js'
			}
		])
			.then(startIETesting)
			.then(() => {
				const shouldJSCdnSyncBeDisabled = disableSiteCdnSyncList.indexOf(siteId) > -1;

				if (shouldJSCdnSyncBeDisabled) {
					console.log("Current site's cdn generation is disabled. Skipping CDN syncing.");
					return Promise.resolve(fileConfig);
				}

				return pushToCdnOriginQueue({ ...fileConfig, name: 'adpushup.js' }, siteId);
			})
			.catch(err => {
				return Promise.reject(err);
			});
	});
};
