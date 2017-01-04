var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	channelModel = require('../models/channelModel'),
	adsenseReportModel = require('../models/adsenseModel'),
	reportsModel = require('../models/reportsModel'),
	Promise = require('bluebird'),
	extend = require('extend'),
	CC = require('../configs/commonConsts'),
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
			siteId = parseInt(req.body.siteId, 10);
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
				'apConfigs': { 'mode': CC.site.mode.DRAFT }
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
			channelKey = (platform + ":" + pageGroup),
			clientVariationKey = queryConfig.variationKey,
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
			var config = lodash.assign({}, dataConfig),
				esSpecificVariationKey = clientVariationKey.replace(/-/g, '_');

			config.queryString = 'mode:1 AND variationId:' + esSpecificVariationKey;

			return Promise.resolve(reportsModel.apexReport(config))
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
			var channelJSON = extend(true, {}, channel.toJSON()),
				adCodeArr = [], adCodeSlotArr;

			lodash.forOwn(channelJSON.variations, function(variationObj, variationKey) {
				if (clientVariationKey === variationKey.toString()) {
					lodash.forOwn(variationObj.sections, function(sectionObj, sectionKey) {
						lodash.forOwn(sectionObj.ads, function(adObj, adKey) {
							adCodeArr.push(adObj.adCode);
						});
					});
				}
			});

			adCodeSlotArr = lodash.uniq(lodash.compact(lodash.map(adCodeArr, function(adCode) {
				var adCodeSlot, base64DecodedAdCode, isAdSlotPresent;

				base64DecodedAdCode = new Buffer(adCode, 'base64').toString('ascii');
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
				isChannelPresent = (channelList.indexOf(channelKey) > -1);

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
										return res.json({
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
				return res.json({
					success: false,
					message: err.toString()
				});
			});
	})
	.post('/saveTrafficDistribution', function(req, res) {
		var data = JSON.parse(req.body.data);

		function saveChannelData(variationObj) {
			return channelModel.saveChannel(data.siteId, data.platform, data.pageGroup, variationObj);
		}

		function getTrafficDistribution(channel) {
			var variationsObj = (channel.get('variations') ? channel.get('variations') : {}),
				computedObj = extend(true, {}, variationsObj),
				clientKey = data.variationKey, finalVariationObj;

			lodash.forOwn(computedObj, function(variationObj, variationKey) {
				if ((clientKey === variationKey) && computedObj[variationKey]) {
					computedObj[variationKey].trafficDistribution = data.trafficDistribution;
				}
			});

			if (!computedObj[clientKey]) {
				throw new AdPushupError('Traffic Distribution value not saved');
			} else {
				finalVariationObj = {
					'variations': extend(true, {}, computedObj)
				};
			}

			return finalVariationObj;
		}

		userModel.verifySiteOwner(req.session.user.email, data.siteId)
			.then(function() {
				return siteModel.getSiteById(data.siteId).then(function(site) {
					return channelModel.getChannel(data.siteId, data.platform, data.pageGroup)
						.then(getTrafficDistribution)
						.then(saveChannelData)
						.then(function() {
							return res.json({
								success: true,
								siteId: data.siteId,
								variationName: data.variationName
							});
						})
				})
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
		
		/**
		 * OBJECTIVE: To check whether there is any channel already deleted in database
		 * IMPLEMENTATION: Compute deleted channels, if any exist, throw an error
		 * @param {siteId} siteId site document id
		 * @param {channelNames} channel names array
		 * @returns {boolean} When there is no deleted array
		 */
		function checkChannelsExistence(siteId, channelNames) {
			var deletedChannelsArr = lodash.map(channelNames, function(channelNameVal, key) {
				var channelKey = "chnl::" + siteId + ":" + channelNameVal;

				return channelModel.isChannelExist(channelKey)
					.then(function(isExist) {
						return (!isExist ? channelNameVal : false);
					});
			});

			return Promise.all(deletedChannelsArr).then(function(channelsArr) {
				var compactedArr = lodash.compact(channelsArr);

				if (compactedArr && compactedArr.length) {
					throw new AdPushupError('One or more channels are deleted. Site will not be saved!')
				}

				return Promise.resolve(true);
			});
		}

		return checkChannelsExistence(siteData.siteId, siteData.channels)
			.then(siteModel.saveSiteData.bind(null, siteData.siteId, 'POST', siteData))
			.then(channelModel.saveChannels.bind(null, parsedData.siteId, parsedData.channels))
			.then(function() {
				return res.json({
					success: 1,
					siteId: parsedData.siteId,
					siteDomain: parsedData.siteDomain
				});
			})
			.catch(function(err) {
				return res.json({
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
