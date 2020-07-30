const path = require('path');
const Promise = require('bluebird');
const PromiseFtp = require('promise-ftp');
const _ = require('lodash');
const uglifyJS = require('uglify-js');
const crypto = require('crypto');

const getReportData = require('../../../reports/universal/index');
const mkdirpAsync = Promise.promisifyAll(require('mkdirp')).mkdirpAsync;
const fs = Promise.promisifyAll(require('fs'));
const CC = require('../../../configs/commonConsts');
const generatePrebidConfig = require('./generatePrebidConfig');
const generateApLiteConfig = require('./generateApLiteConfig');
const generateAdNetworkConfig = require('./generateAdNetworkConfig');
const generateAdPushupConfig = require('./generateAdPushupConfig');
const config = require('../../../configs/config');
const generateStatusesAndConfig = require('./generateConfig');
const bundleGeneration = require('./bundleGeneration');
const prebidGeneration = require('./prebidGeneration');
const helperUtils = require('../../../helpers/utils');
const isNotProduction =
	config.environment.HOST_ENV === 'development' || config.environment.HOST_ENV === 'staging';
const request = require('request-promise');
const disableSiteCdnSyncList = [38333];
// NOTE: Above 'disableSiteCdnSyncList' array is added to prevent site specific JavaScript CDN sync
// as custom generated Javascript files will replace their existing live files for new feature testing purposes.
// Websites: autocarindia (38333, It is running adpushup lite for which script is uploaded to CDN manually, for now)
const ieTestingSiteList = [38903]; // iaai.com

module.exports = function(site, user) {
	ftp = new PromiseFtp();

	var siteId = site.get('siteId'),
		apps = site.get('apps'),
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
					return Promise.join(generatePrebidConfig(siteId), generateApLiteConfig(siteId))
						.then(([prebidConfig, apLiteConfig]) => ({ prebidConfig, apLiteConfig }))
						.then(combinedConfig => {
							const adServerSettings = user.get('adServerSettings');
							const activeDFPNetwork =
								(adServerSettings &&
									adServerSettings.dfp &&
									adServerSettings.dfp.activeDFPNetwork) ||
								null;

							if (activeDFPNetwork) {
								return generateAdNetworkConfig(activeDFPNetwork).then(adNetworkConfig => ({
									adNetworkConfig,
									...combinedConfig
								}));
							}

							return combinedConfig;
						});
				}

				return getReportData(site)
					.then(reportData => {
						if (reportData.status && reportData.data) {
							return generateAdPushupConfig(site, reportData.data);
						}
						return generateAdPushupConfig(site);
					})
					.spread(generateCombinedJson);
			})().then(setAllConfigs);
		},
		getConfigWrapper = site => {
			return getComputedConfig().then(computedConfig =>
				generateStatusesAndConfig(site, computedConfig)
			);
		},
		getFinalConfig = () => {
			return getConfigWrapper(site)
				.then(generatedConfig => prebidGeneration(generatedConfig))
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

					bundle = _.replace(bundle, '__AP_CONFIG__', JSON.stringify(apConfigs));
					bundle = _.replace(bundle, /__SITE_ID__/g, siteId);
					//bundle = _.replace(bundle, '__COUNTRY__', false);
					bundle = _.replace(bundle, '__SIZE_MAPPING__', JSON.stringify(sizeMappingConfig));
					bundle = _.replace(bundle, '__WEB_S2S_STATUS__', finalConfig.config.isS2SActive);

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
						console.log(e);
						return Promise.reject(new Error('CDN Sync failed while compressing the file'));
					}

					return {
						default: compressed,
						uncompressed
					};
				});
		},
		writeTempFiles = function(fileConfigs) {
			const fsWriteFilePromises = fileConfigs.map(file => {
				return mkdirpAsync(tempDestPath).then(function() {
					console.log('in writeTempFiles');
					return fs.writeFileAsync(path.join(tempDestPath, file.name), file.content);
				});
			});

			return Promise.join(fsWriteFilePromises, () => {
				return fileConfigs;
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
		pushToCdnOriginQueue = function(fileConfig) {
			console.log('in pushToCdnOriginQueue');
			const shouldJSCdnSyncBeDisabled = !!(disableSiteCdnSyncList.indexOf(siteId) > -1);

			if (shouldJSCdnSyncBeDisabled || !isNotProduction) {
				console.log(
					"Either current site's cdn generation is disabled or environment is development/staging. Skipping CDN syncing."
				);
				return Promise.resolve(fileConfig.uncompressed);
			} else {
				console.log('========before pushing to cdn======');
				let content = Buffer.from(fileConfig.default).toString('base64');
				console.log(typeof content);

				content = content.toString();
				console.log(typeof content);
				return helperUtils.publishToRabbitMqQueue('CDN_ORIGIN', {
					filePath: `${siteId}/adpushup.js`,
					content: Buffer.from(fileConfig.default).toString('base64')
				});
			}
		},
		getFinalConfigWrapper = () => getFinalConfig().then(fileConfig => fileConfig);

	return Promise.join(getFinalConfigWrapper(), fileConfig => {
		console.log('in main');
		return writeTempFiles([
			{ content: fileConfig.uncompressed, name: 'adpushup.js' },
			{ content: fileConfig.default, name: 'adpushup.min.js' }
		])
			.then(startIETesting)
			.then(() => pushToCdnOriginQueue(fileConfig))
			.catch(err => {
				console.log('====error====', err);
				return Promise.reject(err);
			});
	});
};
