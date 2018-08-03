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
	config = require('../../../configs/config');

module.exports = function(site, externalData = {}) {
	ftp = new PromiseFtp();

	var paramConfig = {
			siteId: site.get('siteId')
		},
		isExternalRequest = externalData && Object.keys(externalData).length && externalData.externalRequest,
		isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise),
		jsTplPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'adpushup.min.js'),
		adpTagsTplPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'adptags.min.js'),
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
		getFinalConfig = Promise.join(getComputedConfig(), getJsFile, getUncompressedJsFile, getAdpTagsJsFile, function(
			finalConfig,
			jsFile,
			uncompressedJsFile,
			adpTagsFile
		) {
			let { apConfigs, adpTagsConfig } = finalConfig,
				gdpr = site.get('gdpr');
			if (site.get('ampSettings')) apConfigs.ampSettings = site.get('ampSettings');
			jsFile = _.replace(jsFile, '___abpConfig___', JSON.stringify(apConfigs));
			jsFile = _.replace(jsFile, /_xxxxx_/g, site.get('siteId'));

			if (gdpr && gdpr.compliance) {
				const cookieControlConfig = gdpr.cookieControlConfig;

				if (cookieControlConfig) {
					let cookieScript = CC.COOKIE_CONTROL_SCRIPT_TMPL.replace(
						'__COOKIE_CONTROL_CONFIG__',
						JSON.stringify(cookieControlConfig)
					);
					jsFile = `${cookieScript}${jsFile}`;
					uncompressedJsFile = `${cookieScript}${uncompressedJsFile}`;
				}
			}

			uncompressedJsFile = _.replace(uncompressedJsFile, '___abpConfig___', JSON.stringify(apConfigs));
			uncompressedJsFile = _.replace(uncompressedJsFile, /_xxxxx_/g, site.get('siteId'));

			if (adpTagsConfig) {
				adpTagsFile = _.replace(adpTagsFile, '__INVENTORY__', JSON.stringify(adpTagsConfig));
				adpTagsFile = _.replace(adpTagsFile, '__SITE_ID__', site.get('siteId'));
				jsFile = `${jsFile};${adpTagsFile}`;
				uncompressedJsFile = `${uncompressedJsFile};${adpTagsFile}`;
			}

			return { default: jsFile, uncompressed: uncompressedJsFile };
		}),
		writeTempFile = function(jsFile) {
			return mkdirpAsync(tempDestPath)
				.then(function() {
					return fs.writeFileAsync(path.join(tempDestPath, 'adpushup.js'), jsFile);
				})
				.then(function() {
					return jsFile;
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
					return Promise.resolve(fileConfig.uncompressed);
				});
		};

	return getFinalConfig
		.then(function(fileConfig) {
			return isExternalRequest ? fileConfig.default : uploadJS(fileConfig);
		})
		.then(writeTempFile)
		.finally(function(jsFile) {
			if (ftp.getConnectionStatus() === 'connected') {
				ftp.end();
			} else {
				return jsFile;
			}
		});
};
