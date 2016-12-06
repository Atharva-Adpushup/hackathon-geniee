var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	channelModel = require('../models/channelModel'),
	Promise = require('bluebird'),
	lodash = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	router = express.Router();

router
	.get('/getData', function(req, res) {
		var siteId = req.query.siteId,
			computedJSON = {};

		return siteModel.getSiteById(siteId, 'GET').then(function(site) {
			return site.getAllChannels().then(function(channels) {
				computedJSON.siteId = siteId;
				computedJSON.channels = channels;
				computedJSON.site = site.toClientJSON();
				return res.json(computedJSON);
			});
		}, function() {
			computedJSON.channels = []; computedJSON.site = {};
			return res.json(computedJSON);
		})
		.catch(function(err) {
			res.json(computedJSON);
		});
	})
	.post('/saveSite', function(req, res) {
		var data = req.body,
			siteId = parseInt(req.body.siteId);
		userModel.verifySiteOwner(req.session.user.email, siteId).then(function() {
			var siteData = {
				'siteDomain': data.site,
				'siteId': siteId,
				'ownerEmail': req.session.user.email,
				'step': parseInt(data.step)
			};
			
			return siteData;
		})
		.then(siteModel.saveSiteData.bind(null, siteId, 'POST'))
		.then(function() {
			return userModel.setSitePageGroups(req.session.user.email)
				.then(function(user) {
					req.session.user = user;
					res.send({success: 1, url: data.site, siteId: siteId});
				})
				.catch(function() {
					res.send({success: 0});
				});
		})
		.catch(function(err) {
			res.send({success: 0});
		});
	})
	.post('/saveCms', function(req, res) {
		var pageGroups = JSON.parse(req.body.pageGroups);
		
		siteModel.setCms(parseInt(req.body.siteId), req.body.cmsName, pageGroups)
			.then(function() {
				res.send({success: 1});
			})
			.catch(function(err) {
				res.send({success: 0});
			});
	})
	.get('/getPageGroupVariationRPM', function(req, res) {
		var channelName = req.query.channelName,
			siteId = req.query.siteId,
			platform = channelName.split(':')[0],
			pageGroup = channelName.split(':')[1],
			dataConfig = {
				endDate: req.query.endDate,
				pageGroup: pageGroup,
				platform: platform,
				reportType: req.query.reportType,
				siteId: siteId,
				startDate: req.query.startDate,
				step: req.query.step
			};

		function calculateRPM(pageViews, earnings) {
			var rpm = ((earnings / pageViews) * 1000);

			rpm = Number(rpm.toFixed(2));
			return Promise.resolve(rpm);
		}

		function getTotalPageViews() {
			var config = lodash.assign({}, dataConfig),
				arr = pageGroup.split('_'),
				origPageGroup = [arr[0], arr[1]].join('_'),
				variationName = arr[2];

			config.pageGroup = origPageGroup;
			config.queryString = 'mode:1 AND chosenVariation:' + variationName;

			return Promise.resolve(reports.apexReport(config))
				.then(function(report) {
					var pageViews = Number(report.data.rows[0][2]);

					return Promise.resolve(pageViews);
				});
		}

		function getAdSlotTotalEarnings(data) {
			var totalEarnings = 0;

			lodash.forEach(data.rows, function(row) {
				var earningsItem = Number(row[(row.length - 1)]);
				totalEarnings += earningsItem;
			});

			totalEarnings = Math.round(totalEarnings);
			return Promise.resolve(totalEarnings);
		}

		function getAdSenseData(config) {
			var tempConfig = {
					'15052': {
						domain: 'https://www.indiacarnews.com/',
						userEmail: 'yogi.vikas08@gmail.com'
					},
					'15184': {
						domain: 'http://www.jobrecruitment2016.com/',
						userEmail: 'vibhugoelofficial@gmail.com'
					},
					'15256': {
						domain: 'http://www.dekhnews.com/',
						userEmail: 'sahilsaini.in@gmail.com'
					}
				},
				// tempdataConfig = {
				// 	'dimension': 'DATE',
				// 	'endDate': '2016-10-04',
				// 	'filter': [
				// 		'PLATFORM_TYPE_CODE==Desktop',
				// 		'AD_UNIT_CODE==8443584851'
				// 	],
				// 	'metric': [
				// 		'AD_REQUESTS',
				// 		'CLICKS',
				// 		'AD_REQUESTS_CTR',
				// 		'COST_PER_CLICK',
				// 		'AD_REQUESTS_RPM',
				// 		'EARNINGS'
				// 	],
				// 	'startDate': '2016-09-27',
				// 	'useTimezoneReporting': true
				// },
				userEmail = (typeof tempConfig[config.siteId.toString()] === 'object') ? tempConfig[config.siteId.toString()].userEmail : req.session.user.email,
				getUser = userModel.getUserByEmail(userEmail),
				getAdsense = getUser.then(adsenseReportModel.getAdsense),
				prepareConfig = adsenseReportModel.prepareQuery(config);
				// prepareConfig = Promise.resolve(tempdataConfig);

			return Promise.join(getUser, getAdsense, prepareConfig, function(user, adsense, queryConfig) {
				return adsense.getReport(queryConfig)
					.then(function(report) {
						return Promise.resolve(report);
					});
			});
		}

		function extractCodeSlots(channel) {
			var adCodeSlotArr = lodash.uniq(lodash.compact(lodash.map(channel.get('structuredSections'), function(section) {
				var adCodeSlot, base64DecodedAdCode, isAdSlotPresent;

				if (section.get('isIncontent')) {
					base64DecodedAdCode = new Buffer(section.get('adCode'), 'base64').toString('ascii');
					isAdSlotPresent = (base64DecodedAdCode.match(/data-ad-slot="\d*"/));

					if (isAdSlotPresent) {
						adCodeSlot = (base64DecodedAdCode.match(/data-ad-slot="\d*"/)[0]).replace('data-ad-slot="', '').replace('"', '');
						return adCodeSlot;
					}
					return false;
				}
				return false;
			})));

			return Promise.resolve(adCodeSlotArr);
		}

		function getAdcodeSlots(site) {
			var channelList = site.get('channels'),
				isChannelPresent = (channelList.indexOf(channelName) > -1);

			if (isChannelPresent) {
				return channelModel.getChannel(siteId, platform, pageGroup)
					.then(extractCodeSlots);
			}
		}

		return siteModel.getSiteById(siteId)
			.then(getAdcodeSlots)
			.then(function(adSlotsArr) {
				// dataConfig.siteId = '15052';
				dataConfig.adCodeSlot = adSlotsArr[0];

				return getAdSenseData(dataConfig)
					.then(getAdSlotTotalEarnings)
					.then(function(adSlotsEarnings) {
						return getTotalPageViews()
							.then(function(pageViews) {
								return calculateRPM(pageViews, adSlotsEarnings)
									.then(function(rpm) {
										res.json({
											success: true,
											rpm: rpm
										});
									});
							});
					});
			})
			.catch(function(err) {
				res.json({
					success: false,
					message: err.toString()
				});
			});
	})
	.post('/saveTrafficDistribution', function(req, res) {
		var data = JSON.parse(req.body.data);

		function saveTrafficDistribution(site) {
			var apConfigs, trafficDistributionObj, computedObj,
				value = data.trafficDistribution;

			if (site.isApex()) {
				apConfigs = site.get('apConfigs');
				trafficDistributionObj = (typeof apConfigs.trafficDistribution !== 'undefined') ? apConfigs.trafficDistribution : null;

				if (!!trafficDistributionObj && trafficDistributionObj[data.variationName]) {
					apConfigs.trafficDistribution[data.variationName] = value;
					computedObj = {
						'apConfigs': apConfigs
					};

					return computedObj;
				}
				throw new AdPushupError('Traffic Distribution value not saved');
			}
			throw new AdPushupError('Traffic Distribution value not saved');
		}

		userModel.verifySiteOwner(req.session.user.email, data.siteId)
			.then(function() {
				return siteModel.getSiteById(data.siteId);
			})
			.then(saveTrafficDistribution)
			.then(siteModel.saveSiteData.bind(null, data.siteId, 'POST'))
			.then(function() {
				res.json({
					success: true,
					siteId: data.siteId,
					variationName: data.variationName
				});
			})
			.catch(function(err) {
				res.json({
					success: false,
					message: err.toString()
				});
			});
	})
	.post('/saveData', function(req, res) {
		var parsedData = (typeof req.body.data === 'string') ? JSON.parse(req.body.data) : req.body.data,
			siteData = {
				'apConfigs': {mode: parsedData.siteMode},
				'siteId': parsedData.siteId,
				'siteDomain': parsedData.siteDomain,
				'channels': (lodash.map(parsedData.channels, function(channel) {
					return (channel.platform + ':' + channel.pageGroup);
				}))
			};

		return siteModel.saveSiteData(siteData.siteId, 'POST', siteData)
			.then(function() {
				return channelModel.saveChannels(parsedData.siteId, parsedData.channels)
				.then(function() {
					return res.json({
						success: 1,
						siteId: parsedData.siteId,
						siteDomain: parsedData.siteDomain
					});
				})
			})
			.catch(function(err) {
				res.json({
					success: 0,
					message: err.toString()
				});
			});
	})
	.get('/getUnsyncedAd', function(req, res) {
		userModel.getUserByEmail(req.query.email)
			.then(function(user) {
				return user.getUnsyncedAd();
			}).then(function(json) {
				if (!json) {
					res.json({ success: 2 });
				}
				var ad = json.ad,
					site = json.site;

				res.json({
					success: 1,
					ad: {
						site_id: site.get('siteId'),
						width: ad.get('width'),
						height: ad.get('height'),
						type: ad.get('adType'),
						tplName: ad.get('tplName'),
						bordercolor: ad.get('borderColor').replace('#', ''),
						bgcolor: ad.get('backgroundColor').replace('#', ''),
						textcolor: ad.get('textColor').replace('#', ''),
						urlcolor: ad.get('urlColor').replace('#', ''),
						titlecolor: ad.get('titleColor').replace('#', ''),
						name: ad.get('variationName')
					}
				});
			})
			.catch(function(err) {
				res.json({
					success: 0,
					message: err
				});
			});
	})

	.get('/syncAdsenseAd', function(req, res) {
		if (!req.query.adslot || req.query.adslot.length < 10) {
			res.json({ success: 0, message: 'Illegal Adslot' });
			return;
		}

		siteModel.getSiteById(req.query.site_id)
			.then(function(site) {
				return site.syncAdsenseAdslot(req.query.adname, req.query.adslot);
			})
			.then(function() {
				res.json({ success: 1, message: 'Adslot Synced' });
			})
			.catch(function(err) {
				res.json({ success: 0, message: err.toString() });
			});
	})
	.get('/getPendingAds', function(req, res) {
		userModel.getUserByEmail(req.query.email)
			.then(function(user) {
				var networkData = user.getNetworkDataSync('ADSENSE');
				return user.getPendingAdsCount()
					.then(function(pendingAds) {
						res.json({ success: 1, pendingAds: pendingAds, pubid: networkData.pubId, adsense_email: networkData.adsenseEmail });
					});
			})
			.catch(function(err) {
				res.json({ success: 0, message: err.toString() });
			});
	})
	.post('/deleteChannel', function(req, res) {
		userModel.verifySiteOwner(req.session.user.email, req.query.siteId).then(function() {
			return channelModel.deleteChannel(req.query.siteId, req.body.platform, req.body.pageGroup).then(function() {
				res.json({ success: 1 });
			});
		})
			.catch(function(err) {
				res.json({ success: 0, message: err.toString() });
			});
	});

module.exports = router;
