var path = require('path'),
	Promise = require('bluebird'),
	retry = require('bluebird-retry'),
	_ = require('lodash'),
	moment = require('moment'),
	PromiseFtp = require('promise-ftp'),
	universalReportService = require('../../../reports/universal/index'),
	mkdirpAsync = Promise.promisifyAll(require('mkdirp')).mkdirpAsync,
	fs = Promise.promisifyAll(require('fs')),
	AdPushupError = require('../../../helpers/AdPushupError'),
	CC = require('../../../configs/commonConsts'),
	config = require('../../../configs/config');

module.exports = function(site) {
	ftp = new PromiseFtp();

	var paramConfig = {
			siteId: site.get('siteId')
		},
		isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise),
		jsTplPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'adpushup.js'),
		uncompressedJsTplPath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'public',
			'assets',
			'js',
			'builds',
			'adpushup-debug.js'
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
		setAllConfigs = function(allVariations) {
			var apConfigs = site.get('apConfigs'),
				isAdPartner = !!site.get('partner');

			isAdPartner ? (apConfigs.partner = site.get('partner')) : null;
			apConfigs.autoOptimise = isAutoOptimise ? true : false;
			// Default 'draft' mode is selected if config mode is not present
			apConfigs.mode = !apConfigs.mode ? 2 : apConfigs.mode;
			apConfigs.experiment = allVariations;
			delete apConfigs.pageGroupPattern;
			return apConfigs;
		},
		getJsFile = fs.readFileAsync(jsTplPath, 'utf8'),
		getUncompressedJsFile = fs.readFileAsync(uncompressedJsTplPath, 'utf8'),
		getComputedConfig = Promise.resolve(true).then(function() {
			return universalReportService.getReportData(site).then(function(reportData) {
				if (reportData.status && reportData.data) {
					return getVariationsPayload(site, reportData.data).then(setAllConfigs);
				}
				return getVariationsPayload(site).then(setAllConfigs);
			});
		}),
		getFinalConfig = Promise.join(getComputedConfig, getJsFile, getUncompressedJsFile, function(
			finalConfig,
			jsFile,
			uncompressedJsFile
		) {
			jsFile = _.replace(jsFile, '___abpConfig___', JSON.stringify(finalConfig));
			jsFile = _.replace(jsFile, /_xxxxx_/g, site.get('siteId'));

			uncompressedJsFile = _.replace(uncompressedJsFile, '___abpConfig___', JSON.stringify(finalConfig));
			uncompressedJsFile = _.replace(uncompressedJsFile, /_xxxxx_/g, site.get('siteId'));

			return { default: jsFile, uncompressed: uncompressedJsFile };
		}),
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
