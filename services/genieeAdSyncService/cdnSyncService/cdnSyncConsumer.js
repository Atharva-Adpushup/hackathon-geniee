var path = require('path'),
	Promise = require('bluebird'),
	retry = require('bluebird-retry'),
	_ = require('lodash'),
	moment = require('moment'),
	PromiseFtp = require('promise-ftp'),
	// universalReportService = require('../../../reports/universal/index'),
	{ getReportData } = require('../../../reports/universal/index'),
	mkdirpAsync = Promise.promisifyAll(require('mkdirp')).mkdirpAsync,
	fs = Promise.promisifyAll(require('fs')),
	AdPushupError = require('../../../helpers/AdPushupError'),
	CC = require('../../../configs/commonConsts'),
	generateADPTagsConfig = require('./generateADPTagsConfig'),
	generateAdPushupConfig = require('./generateAdPushupConfig'),
	siteModel = require('../../../models/siteModel'),
	config = require('../../../configs/config');

module.exports = function(site) {
	ftp = new PromiseFtp();

	var paramConfig = {
			siteId: site.get('siteId')
		},
		noop = 'function() {}',
		isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise),
		jsTplPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'adpushup.min.js'),
		adpTagsTplPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'adptags.min.js'),
		incontentAnalyserScriptPath = path.join(__dirname, '..', 'genieeAp', 'libs', 'aa.js'),
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
			apConfigs.manualModeActive = site.get('isManual') ? site.get('isManual') : false;
			// Default 'draft' mode is selected if config mode is not present
			apConfigs.mode = !apConfigs.mode ? 2 : apConfigs.mode;
			apConfigs.manualAds = manualAds || [];
			apConfigs.experiment = experiment;
			delete apConfigs.pageGroupPattern;
			return { apConfigs, adpTagsConfig };
		},
		getJsFile = fs.readFileAsync(jsTplPath, 'utf8'),
		getAdpTagsJsFile = fs.readFileAsync(adpTagsTplPath, 'utf8'),
		getIncontentAnalyserScript = fs.readFileSync(incontentAnalyserScriptPath, 'utf8'),
		getUncompressedJsFile = fs.readFileAsync(uncompressedJsTplPath, 'utf8'),
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
						case CC.SERVICES.ADPTAGS:
							var adpTagsConfig = serviceConfig,
								adpTagsFile = serviceScript;
							if (adpTagsConfig) {
								adpTagsFile = _.replace(adpTagsFile, '__INVENTORY__', JSON.stringify(adpTagsConfig));
								adpTagsFile = _.replace(adpTagsFile, '__SITE_ID__', site.get('siteId'));
								jsFile = `${jsFile};${adpTagsFile}`;
								uncompressedJsFile = `${uncompressedJsFile};${adpTagsFile}`;
							}
							return generateFinalInitScript(jsFile, uncompressedJsFile);
						case CC.SERVICES.INCONTENT_ANALYSER:
							var incontentAds = serviceConfig,
								incontentAdsScript = serviceScript,
								incontentAdsScript = incontentAdsScript.substring(
									0,
									incontentAdsScript.trim().length - 1
								);
							if (incontentAds.length) {
								jsFile = _.replace(jsFile, '__IN_CONTENT_ANALYSER_SCRIPT__', incontentAdsScript);
								uncompressedJsFile = _.replace(
									uncompressedJsFile,
									'__IN_CONTENT_ANALYSER_SCRIPT__',
									incontentAdsScript
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
					}
				},
				done: () => {
					return { jsFile, uncompressedJsFile };
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
		getFinalConfig = Promise.join(
			getComputedConfig(),
			getJsFile,
			getUncompressedJsFile,
			getAdpTagsJsFile,
			siteModel.getIncontentAds(site.get('siteId')),
			getIncontentAnalyserScript,
			function(finalConfig, jsFile, uncompressedJsFile, adpTagsFile, incontentAds, incontentAnalyserScript) {
				let { apConfigs, adpTagsConfig } = finalConfig,
					gdpr = site.get('gdpr');
				if (site.get('ampSettings')) apConfigs.ampSettings = site.get('ampSettings');
				jsFile = _.replace(jsFile, '__AP_CONFIG__', JSON.stringify(apConfigs));
				jsFile = _.replace(jsFile, /__SITE_ID__/g, site.get('siteId'));
				uncompressedJsFile = _.replace(uncompressedJsFile, '__AP_CONFIG__', JSON.stringify(apConfigs));
				uncompressedJsFile = _.replace(uncompressedJsFile, /__SITE_ID__/g, site.get('siteId'));

				// Generate final init script based on the services to be added
				var scripts = generateFinalInitScript(jsFile, uncompressedJsFile)
					.addService(CC.SERVICES.INCONTENT_ANALYSER, incontentAds, incontentAnalyserScript)
					.addService(CC.SERVICES.ADPTAGS, adpTagsConfig, adpTagsFile)
					.addService(CC.SERVICES.GDPR, gdpr)
					.done();

				return { default: scripts.jsFile, uncompressed: scripts.uncompressedJsFile };
			}
		),
		writeTempFile = function(jsFile) {
			return mkdirpAsync(tempDestPath).then(function() {
				return fs.writeFileAsync(path.join(tempDestPath, 'adpushup.js'), jsFile);
			});
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
					return fileConfig.uncompressed;
				});
		};

	return getFinalConfig
		.then(uploadJS)
		.then(writeTempFile)
		.finally(function() {
			if (ftp.getConnectionStatus() === 'connected') {
				ftp.end();
			}
		});
};
