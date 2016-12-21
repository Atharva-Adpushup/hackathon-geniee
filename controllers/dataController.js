var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	channelModel = require('../models/channelModel'),
	Promise = require('bluebird'),
	lodash = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
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
			var audienceId = utils.getRandomNumber();
			var siteData = {
				'siteDomain': data.site,
				'siteId': siteId,
				'ownerEmail': req.session.user.email,
				'step': parseInt(data.step),
				'ads': [],
				'channels': [],
				'templates': [],
				'apConfigs': {}
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
	.get('/getPageGroupVariationRPM', function(req, res) {
		var queryConfig = req.query,
			siteId = queryConfig.siteId,
			platform = queryConfig.platform,
			pageGroup = queryConfig.pageGroup,
			variationKey = queryConfig.variationKey,
			dataConfig = {
				endDate: queryConfig.endDate,
				pageGroup: pageGroup,
				platform: platform,
				reportType: queryConfig.reportType,
				siteId: siteId,
				startDate: queryConfig.startDate,
				step: queryConfig.step
			};

		function calculateRPM(pageViews, earnings) {
			var rpm = ((earnings / pageViews) * 1000);

			rpm = Number(rpm.toFixed(2));
			return Promise.resolve(rpm);
		}

		function getTotalPageViews() {
			var config = lodash.assign({}, dataConfig);

			config.queryString = 'mode:1 AND chosenVariation:' + variationKey;

			return Promise.resolve(reports.apexReport(config))
				.then(function(report) {
					var pageViews = Number(report.data.tracked.totalPageViews);

					return Promise.resolve(pageViews);
				});
		}

		function getFullAdsenseData(config, adSlotsArr) {
			var adSlotEarningsPromises = adSlotsArr.map(function(adSlotNum) {
				var adSenseConfig = lodash.assign({}, config);

				adSenseConfig.adCodeSlot = adSlotNum;

				return getAdSenseData(adSenseConfig)
					.then(getAdSlotTotalEarnings);
			});

			return Promise.all(adSlotEarningsPromises)
				.then(function(earningsArr) {
					var earnings = 0;

					lodash.forEach(earningsArr, function(value) {
						earnings += Number(value);
					});

					return Promise.resolve(earnings);
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
					},
					'15314': {
						domain: 'http://www.recruitment.guru/',
						userEmail: 'lic24.in@gmail.com'
					},
					'14952': {
						domain: 'http://www.pentapostagma.gr/',
						userEmail: 'pentapostagma@gmail.com'
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

				base64DecodedAdCode = new Buffer(section.get('adCode'), 'base64').toString('ascii');
				isAdSlotPresent = (base64DecodedAdCode.match(/data-ad-slot="\d*"/));

				if (isAdSlotPresent) {
					adCodeSlot = (base64DecodedAdCode.match(/data-ad-slot="\d*"/)[0]).replace('data-ad-slot="', '').replace('"', '');
					return adCodeSlot;
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
				return getFullAdsenseData(dataConfig, adSlotsArr)
					.then(function(adSlotsEarnings) {
						return getTotalPageViews()
							.then(function(pageViews) {
								return calculateRPM(pageViews, adSlotsEarnings)
									.then(function(rpm) {
										res.json({
											success: true,
											rpm: rpm,
											pageViews: pageViews,
											earnings: adSlotsEarnings
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
