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
	CC = require('../../../configs/commonConsts'),
	generateADPTagsConfig = require('./generateADPTagsConfig'),
	generateAdPushupConfig = require('./generateAdPushupConfig'),
	siteModel = require('../../../models/siteModel'),
	couchbase = require('../../../helpers/couchBaseService'),
	config = require('../../../configs/config');

module.exports = function(site, externalData = {}) {
	ftp = new PromiseFtp();

	var paramConfig = {
			siteId: site.get('siteId')
		},
		noop = 'function() {}',
		isExternalRequest = externalData && Object.keys(externalData).length && externalData.externalRequest,
		isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise),
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
			'adptags.min.js'
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
			let { experiment, adpTagsConfig, manualAds } = combinedConfig;

			isAdPartner ? (apConfigs.partner = site.get('partner')) : null;
			apConfigs.autoOptimise = isAutoOptimise ? true : false;
			apConfigs.siteDomain = site.get('siteDomain');
			apConfigs.activeDFPNetwork = apConfigs.activeDFPNetwork ? apConfigs.activeDFPNetwork : null;
			apConfigs.manualModeActive = site.get('isManual') ? site.get('isManual') : false;
			// Default 'draft' mode is selected if config mode is not present
			apConfigs.mode = !apConfigs.mode ? 2 : apConfigs.mode;
			apConfigs.manualAds = manualAds || [];
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
		generateCombinedJson = (experiment, adpTags, manualAds) => {
			if (!(Array.isArray(adpTags) && adpTags.length)) {
				return { experiment, adpTagsConfig: false, manualAds };
			}
			return generateADPTagsConfig(adpTags, site.get('siteId')).then(adpTagsConfig => ({
				adpTagsConfig,
				experiment,
				manualAds
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

							if (
								serviceConfig &&
								serviceConfig.hbcf.value &&
								serviceConfig.hbcf.value.hbConfig &&
								serviceConfig.hbAds.length
							) {
								jsFile = _.replace(jsFile, '__PREBID_SCRIPT__', serviceScript);
								uncompressedJsFile = _.replace(uncompressedJsFile, '__PREBID_SCRIPT__', serviceScript);
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
			function(
				finalConfig,
				jsFile,
				uncompressedJsFile,
				incontentAndHbAds,
				incontentAnalyserScript,
				adpTagsScript,
				hbcf,
				prebidScript
			) {
				let { apConfigs, adpTagsConfig } = finalConfig,
					gdpr = site.get('gdpr'),
					{ incontentAds, hbAds } = incontentAndHbAds;
				if (site.get('ampSettings')) apConfigs.ampSettings = site.get('ampSettings');
				if (site.get('medianetId')) apConfigs.medianetId = site.get('medianetId');
				jsFile = _.replace(jsFile, '__AP_CONFIG__', JSON.stringify(apConfigs));
				jsFile = _.replace(jsFile, /__SITE_ID__/g, site.get('siteId'));
				uncompressedJsFile = _.replace(uncompressedJsFile, '__AP_CONFIG__', JSON.stringify(apConfigs));
				uncompressedJsFile = _.replace(uncompressedJsFile, /__SITE_ID__/g, site.get('siteId'));

				// Generate final init script based on the services that are enabled
				var scripts = generateFinalInitScript(jsFile, uncompressedJsFile)
					.addService(CC.SERVICES.INCONTENT_ANALYSER, incontentAds, incontentAnalyserScript)
					.addService(CC.SERVICES.ADPTAGS, adpTagsConfig, adpTagsScript)
					.addService(CC.SERVICES.HEADER_BIDDING, { hbcf, hbAds }, prebidScript)
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
			return connectToServer()
				.then(cwd)
				.then(function() {
					return ftp.put(fileConfig.default, 'adpushup.js');
				})
				.then(function() {
					return Promise.resolve(fileConfig.uncompressed);
				});
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
