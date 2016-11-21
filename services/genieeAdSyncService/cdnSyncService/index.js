var path = require('path'),
	Promise = require('bluebird'),
	retry = require('bluebird-retry'),
	_ = require('lodash'),
	PromiseFtp = require('promise-ftp'),
	ftp = new PromiseFtp(),
	fs = Promise.promisifyAll(require('fs')),
	config = require('../../../configs/config');

module.exports = function (site) {
	var jsTplPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'genieeAp.js'),
		tempDestPath = path.join(__dirname, '..', '..', '..', 'public'),
		getAdsPayload = function (variationSections) {
			var ads = [], ad = null, json;
			_.each(variationSections, function (section, sectionId) {
				if (!Object.keys(section.ads).length) {
					return true;
				}
				ad = section.ads[Object.keys(section.ads)[0]]; // for now we have only one ad inside a section
				json = {};
				if (section.isIncontent) {
					json = {
						id: sectionId, isIncontent: true, height: parseInt(ad.height, 10), width: parseInt(ad.width, 10),
						adCode: new Buffer("adcode").toString('base64') /*ad.adCode*/, float: section.float, css: ad.css, minDistanceFromPrevAd: section.minDistanceFromPrevAd,
						ignoreXpaths: section.ignoreXpaths || [], section: parseInt(section.sectionNo, 10)
					}
					if (ad.secondaryCss) {
						json.secondaryCss = ad.secondaryCss
					}
				} else {
					json = {
						id: sectionId, xpath: section.xpath, operation: section.operation, css: ad.css, height: parseInt(ad.height, 10),
						width: parseInt(ad.width, 10), adCode: new Buffer("adcode").toString('base64') /*ad.adCode*/
					}
				}
				ads.push(json);
			});
			return ads;
		},
		getVariationsPayload = function (site) {
			var finalJson = {}, temp, platform, pageGroup, variation;
			return site.getAllChannels().then(function (allChannels) {
				_.each(allChannels, function (channel) {
					// sample name HOME_DESKTOP
					platform = channel.platform; // last element is platform
					pageGroup = channel.pageGroup; // join remaing to form pageGroup

					if (!finalJson[platform]) {
						finalJson[platform] = {};
					}

					finalJson[platform][pageGroup] = {
						variations: [],
						contentSelector: '.post-content' //channel.contentSelector
					};

					_.each(channel.variations, function (variation, id) {
						var ads = getAdsPayload(variation.sections);
						if (!ads.length) {
							return true;
						}
						finalJson[platform][pageGroup].variations.push({
							id: variation.id,
							traffic: variation.trafficDistribution,
							customJs: variation.customJs,
							ads: ads
						});
					});

					finalJson[platform][pageGroup].variations.sort(function (a, b) {
						return a.traffic - b.traffic;
					})

				});
				return finalJson;
			});
		},
		getJsFile = fs.readFileAsync(jsTplPath, 'utf8'),
		getConfig = getVariationsPayload(site).then(function (allVariations) {
			var apConfigs = site.get('apConfigs');
			/* Temp Fields */
			apConfigs.mode = 1;
			//apConfigs.pageGroupPattern = [{ HOME: 'components' }];
			/* Temp Fields End */
			apConfigs.experiment = allVariations;
			return apConfigs;
		}),
		getFinalConfig = Promise.join(getConfig, getJsFile, function (finalConfig, jsFile) {
			jsFile = _.replace(jsFile, '___abpConfig___', JSON.stringify(finalConfig));
			jsFile = _.replace(jsFile, /_xxxxx_/g, site.get('siteId'));
			return jsFile;
		}),
		writeTempFile = function (jsFile) {
			console.log('file written');
			return fs.writeFileAsync(path.join(tempDestPath, 'genieeAp.js'), jsFile);
		},
		cwd = function () {
			return ftp.cwd('/' + site.get('siteId')).catch(function () {
				return ftp.mkdir(site.get('siteId')).then(function () {
					return ftp.cwd('/' + site.get('siteId'));
				});
			});
		},
		connectToServer = function () {
			if (ftp.getConnectionStatus() === 'connected') {
				return true;
			}
			return ftp.connect({ host: config.cacheFlyFtp.HOST, user: config.cacheFlyFtp.USERNAME, password: config.cacheFlyFtp.PASSWORD });
		},
		uploadJS = function (js) {
			return connectToServer()
				.then(cwd)
				.then(function () {
					return ftp.put(js, 'apex.js');
				});
		};

	return getFinalConfig
		//.then(uploadJS)
		.then(writeTempFile)
		.catch(function (err) {
			console.log(err);
			throw err;
		})
		.finally(function () {
			if (ftp.getConnectionStatus() === 'connected') {
				ftp.end();
			}
		});


}	