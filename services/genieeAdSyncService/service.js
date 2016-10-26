var adpushup = require('../../helpers/adpushupEvent'),
	path = require('path'),
	config = require('../../configs/config'),
	Promise = require('bluebird'),
	retry = require('bluebird-retry'),
	PromiseFtp = require('promise-ftp'),
	ftp = new PromiseFtp(),
	fs = Promise.promisifyAll(require('fs')),
	_ = require('lodash');

function getApexAds(sections) {
	var ics, actionVal, json;
	return _.map(sections, function(section) {
		json = {
			sectionMd5: section.sectionMd5,
			adCode: section.adCode
		};
		if (section.isIncontent) {
			ics = section.inContentSettings;
			json.isIncontent = true;
			json.css = ics.css;

			if (ics.secondaryCss) {
				json.secondaryCss = ics.secondaryCss;
			}

			json.height = ics.height;
			json.width = ics.width;
			json.section = ics.section;
			json.minDistanceFromPrevAd = ics.minDistanceFromPrevAd;
			json.ignoreXpaths = ics.ignoreXpaths;
		} else {
			actionVal = section.actions[0].value[0].data;
			json.css = actionVal.css;
			json.height = actionVal.height;
			json.width = actionVal.width;
			json.xpath = section.xpath;
			json.operation = section.operation;
		}
		return json;
	});
}

function getApexVariations(site) {
	var finalJson = {},
		temp, platform, pageGroup, variation;
	return site.getAllChannels().then(function(allChannels) {
		_.each(allChannels, function(channel) {
			// sample name HOME_APEX_1_DESKTOP
			temp = channel.channelName.split('_'); // split via _
			if (temp.length < 4) {
				console.log('Apex channel name corrupt');
				return true;
			}
			platform = temp[temp.length - 1]; // last element is platform
			variation = temp[temp.length - 2]; // second last is variation
			temp.splice(temp.length - 2, 2); // remove last 2
			pageGroup = temp.join('_'); // join remaing to form pageGroup

			if (!finalJson[platform]) {
				finalJson[platform] = {};
			}

			if (!finalJson[platform][pageGroup]) {
				finalJson[platform][pageGroup] = {};
			}

			if (!finalJson[platform][pageGroup][variation]) {
				finalJson[platform][pageGroup][variation] = {};
			}
			if (site.get('apConfigs').trafficDistribution && site.get('apConfigs').trafficDistribution[pageGroup + '_' + variation + '_' + platform]) {
				finalJson[platform][pageGroup][variation].ads = getApexAds(channel.structuredSections);
				finalJson[platform][pageGroup][variation].traffic = parseInt(site.get('apConfigs').trafficDistribution[pageGroup + '_' + variation + '_' + platform], 10);
				if (channel.incontentSettings.contentSelector) {
					finalJson[platform][pageGroup][variation].contentSelector = channel.incontentSettings.contentSelector;
				}
				finalJson[platform][pageGroup][variation].customJs = channel.customJs;
			}
		});
		return finalJson;
	});
}

adpushup.on('siteSaved', function(site) {
	if (!site.isApex()) {
		return false;
	}

	function doIt() {
		var apexTplPath = path.join(__dirname, 'ap', 'build', 'apex-min.js'),
			tempDestPath = path.join(__dirname, '..', '..', 'public'),
			getApexJs = fs.readFileAsync(apexTplPath, 'utf8'),
			getConfig = getApexVariations(site).then(function(allVariations) {
				var apConfigs = site.get('apConfigs');
				apConfigs.variations = allVariations;
				return apConfigs;
			}),
			getFinalConfig = Promise.join(getConfig, getApexJs, function(finalConfig, apexJs) {
				delete finalConfig.adRecover;
				delete finalConfig.trafficDistribution;
				apexJs = _.replace(apexJs, '___abpConfig___', JSON.stringify(finalConfig));
				apexJs = _.replace(apexJs, /_xxxxx_/g, site.get('siteId'));
				fs.writeFileAsync(path.join(tempDestPath, 'apex.js'), apexJs);
				return apexJs;
			}),
			cwd = function() {
				return ftp.cwd('/' + site.get('siteId')).catch(function() {
					return ftp.mkdir(site.get('siteId')).then(function() {
						return ftp.cwd('/' + site.get('siteId'));
					});
				});
			},
			connectToServer = function() {
				if (ftp.getConnectionStatus() === 'connected') {
					return true;
				}
				return ftp.connect({host: config.cacheFlyFtp.HOST, user: config.cacheFlyFtp.USERNAME, password: config.cacheFlyFtp.PASSWORD});
			},
			uploadJS = function(js) {
				return connectToServer()
				.then(cwd)
				.then(function() {
					return ftp.put(js, 'apex.js');
				});
			};

		return getFinalConfig
			.then(uploadJS)
			.catch(function(err) {
				console.log(err);
				throw err;
			})
			.finally(function() {
				if (ftp.getConnectionStatus() === 'connected') {
					ftp.end();
				}
			});
	}

	// save only after 5 second of siteSaved event as still channels are not saved as siteSaved called first and then channel data is saved.
	// so to roughly bypassing this situation run the generator only after 5 seconds, assuming all is saved in 5 seconds

	setTimeout(function() {
		retry(doIt, { max_tries: 3, interval: 3000 }).then(function() {
			console.log('Apex.js generated successfully');
		}).catch(function(err) {
			console.log('Apex.js generation failed', err);
		});
	}, 5000);
});
