var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	channelModel = require('../models/channelModel'),
	adsenseReportModel = require('../models/adsenseModel'),
	apexVariationRpmService = require('../reports/default/apex/pageGroupVariationRPM/service'),
	apexParameterModule = require('../reports/default/apex/modules/params/index'),
	sqlQueryModule = require('../reports/default/common/mssql/queryHelpers/fullSiteData'),
	apexSingleChannelVariationModule = require('../reports/default/apex/modules/mssql/singleChannelVariationData'),
	singleChannelVariationQueryHelper = require('../reports/default/common/mssql/queryHelpers/singleChannelVariationData'),
	liveSitesService = require('../services/liveSites/index'),
	Promise = require('bluebird'),
	extend = require('extend'),
	CC = require('../configs/commonConsts'),
	config = require('../configs/config'),
	lodash = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
	pipedriveAPI = require('../misc/vendors/pipedrive'),
	sqlReporting = require('../reports/default/adpTags/index'),
	router = express.Router(),
	couchbase = require('../helpers/couchBaseService'),
	N1qlQuery = require('couchbase-promises').N1qlQuery;

function createAggregateNonAggregateObjects(dataset, key, container) {
	let innerObj = {};
	lodash.forEach(dataset, (nonAggregateDataset, identifier) => {
		innerObj[identifier] = {
			aggregate: {
				total_xpath_miss: 0,
				total_impressions: 0,
				total_revenue: 0, // change this to -1
				total_cpm: 0 // change this to -1
			},
			nonAggregate: nonAggregateDataset
		};
		nonAggregateDataset.forEach(row => {
			innerObj[identifier].aggregate.total_xpath_miss += parseInt(row['total_xpath_miss']);
			innerObj[identifier].aggregate.total_impressions += parseInt(row['total_impressions']);
			innerObj[identifier].aggregate.total_revenue += parseFloat(row['total_revenue']);
		});
		// CPM = Revenue * 1000 / Impressions --> rounding off to 2 decimal places
		innerObj[identifier].aggregate.total_cpm = Number(
			innerObj[identifier].aggregate.total_revenue * 1000 / innerObj[identifier].aggregate.total_impressions
		).toFixed(2);
	});
	container[key] = innerObj;
}

function queryResultProcessing(resultset) {
	let pageGroupWiseResult = lodash.groupBy(resultset, 'name');
	let variationWiseResult = lodash.groupBy(resultset, 'variation_id');
	let sectionWiseResult = lodash.groupBy(resultset, 'section_md5');
	let reporting = {
		pagegroups: {},
		variations: {},
		sections: {}
	};
	createAggregateNonAggregateObjects(pageGroupWiseResult, 'pagegroups', reporting);
	createAggregateNonAggregateObjects(variationWiseResult, 'variations', reporting);
	createAggregateNonAggregateObjects(sectionWiseResult, 'sections', reporting);
	return Promise.resolve(reporting);
}

function getReportingData(channels, siteId) {
	if (config && config.hasOwnProperty('reporting') && !config.reporting.activated) {
		return Promise.resolve({});
	}
	let channelNames = lodash.map(channels, 'pageGroup');
	let variationNames = lodash.flatten(lodash.map(channels, channel => Object.keys(channel.variations)));
	let reportingParams = {
		select: ['total_xpath_miss', 'total_impressions', 'total_revenue', 'report_date', 'siteid'],
		where: {
			siteid: siteId,
			pagegroup: channelNames,
			variation: variationNames
		},
		groupBy: ['section']
	};
	return sqlReporting
		.generate(reportingParams)
		.then(queryResultProcessing)
		.catch(err => {
			console.log(err);
			return {};
		});
}

router
	.get('/getData', function(req, res) {
		var siteId = req.query.siteId,
			computedJSON = {};

		return siteModel
			.getSiteById(siteId, 'GET')
			.then(
				function(site) {
					return site.getAllChannels().then(function(channels) {
						computedJSON.siteId = siteId;
						computedJSON.channels = channels;
						computedJSON.site = site.toClientJSON();
						return getReportingData(channels, siteId).then(reporting => {
							computedJSON.reporting = reporting;
							return res.json(computedJSON);
						});
					});
				},
				function() {
					computedJSON.channels = [];
					computedJSON.site = {};
					computedJSON.reporting = {};
					return res.json(computedJSON);
				}
			)
			.catch(function(err) {
				res.json(computedJSON);
			});
	})
	.post('/saveSite', function(req, res) {
		var data = req.body,
			siteId = parseInt(req.body.siteId, 10);
		userModel
			.verifySiteOwner(req.session.user.email, siteId)
			.then(function() {
				var audienceId = utils.getRandomNumber();
				var siteData = {
					siteDomain: data.site,
					siteId: siteId,
					ownerEmail: req.session.user.email,
					step: parseInt(data.step),
					ads: [],
					channels: [],
					templates: [],
					apConfigs: {
						mode: CC.site.mode.DRAFT,
						isAdPushupControlWithPartnerSSP: CC.apConfigDefaults.isAdPushupControlWithPartnerSSP
					}
				};
				return siteData;
			})
			.then(siteModel.saveSiteData.bind(null, siteId, 'POST'))
			.then(function() {
				return userModel
					.setSitePageGroups(req.session.user.email)
					.then(function(user) {
						req.session.user = user;
						res.send({ success: 1, url: data.site, siteId: siteId });
					})
					.catch(function() {
						res.send({ success: 0 });
					});
			})
			.catch(function(err) {
				res.send({ success: 0 });
			});
	})
	.get('/getVariations', (req, res) => {
		const { siteId, platform, pageGroup } = req.query;

		return channelModel
			.getVariations(siteId, platform, pageGroup)
			.then(variationsData => {
				let variations = [];
				for (v in variationsData.variations) {
					variations.push({
						name: variationsData.variations[v].name,
						id: variationsData.variations[v].id
					});
				}

				res.send({ error: false, data: variations });
			})
			.catch(err => res.send({ error: true, message: 'Error while fetching result. Please try later.' }));
	})
	.get('/getPageGroupVariationRPM', function(req, res) {
		const reportConfig = extend(true, {}, req.query),
			email = req.session.user.email,
			parameterConfig = apexParameterModule.getParameterConfig(reportConfig),
			apexConfig = extend(true, {}, extend(true, {}, parameterConfig.apex), {
				platform: reportConfig.platform,
				variationKey: reportConfig.variationKey,
				pageGroup: reportConfig.pageGroup,
				channelName: `${reportConfig.pageGroup}_${reportConfig.platform}`
			}),
			sqlReportConfig = parameterConfig.sql;

		const getSqlReportData = sqlQueryModule.getMetricsData(sqlReportConfig),
			getTabularMetricsData = getSqlReportData.then(sqlReportData => {
				return singleChannelVariationQueryHelper
					.getMatchedVariations(apexConfig.siteId, apexConfig.channelName, sqlReportData)
					.then(apexSingleChannelVariationModule.transformData);
			}),
			getVariationRPMData = getTabularMetricsData.then(tableFormatReportData => {
				return apexVariationRpmService.getReportData(apexConfig, email, tableFormatReportData);
			});

		return getVariationRPMData
			.then(function(reportData) {
				return res.json(extend(true, { success: true }, reportData));
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
			var variationsObj = channel.get('variations') ? channel.get('variations') : {},
				computedObj = extend(true, {}, variationsObj),
				clientKey = data.variationKey,
				finalVariationObj;

			lodash.forOwn(computedObj, function(variationObj, variationKey) {
				if (clientKey === variationKey && computedObj[variationKey]) {
					computedObj[variationKey].trafficDistribution = data.trafficDistribution;
				}
			});

			if (!computedObj[clientKey]) {
				throw new AdPushupError('Traffic Distribution value not saved');
			} else {
				finalVariationObj = {
					variations: extend(true, {}, computedObj)
				};
			}

			return finalVariationObj;
		}

		userModel
			.verifySiteOwner(req.session.user.email, data.siteId)
			.then(function() {
				return siteModel.getSiteById(data.siteId).then(function(site) {
					return channelModel
						.getChannel(data.siteId, data.platform, data.pageGroup)
						.then(getTrafficDistribution)
						.then(saveChannelData)
						.then(function() {
							return res.json({
								success: true,
								siteId: data.siteId,
								variationName: data.variationName
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
	.post('/saveData', function(req, res) {
		var parsedData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data,
			siteData = {
				apConfigs: { mode: parsedData.siteMode },
				siteId: parsedData.siteId,
				siteDomain: parsedData.siteDomain,
				customSizes: parsedData.customSizes || [],
				channels: lodash.map(parsedData.channels, function(channel) {
					return channel.platform + ':' + channel.pageGroup;
				})
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
				var channelKey = 'chnl::' + siteId + ':' + channelNameVal;

				return channelModel.isChannelExist(channelKey).then(function(isExist) {
					return !isExist ? channelNameVal : false;
				});
			});

			return Promise.all(deletedChannelsArr).then(function(channelsArr) {
				var compactedArr = lodash.compact(channelsArr);

				if (compactedArr && compactedArr.length) {
					throw new AdPushupError('One or more channels are deleted. Site will not be saved!');
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
		userModel
			.getUserByEmail(req.query.email)
			.then(function(user) {
				return user.getUnsyncedAd();
			})
			.then(function(json) {
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

		siteModel
			.getSiteById(req.query.site_id)
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
		userModel
			.getUserByEmail(req.query.email)
			.then(function(user) {
				var networkData = user.getNetworkDataSync('ADSENSE');
				return user.getPendingAdsCount().then(function(pendingAds) {
					res.json({
						success: 1,
						pendingAds: pendingAds,
						pubid: networkData.pubId,
						adsense_email: networkData.adsenseEmail
					});
				});
			})
			.catch(function(err) {
				res.json({ success: 0, message: err.toString() });
			});
	})
	.post('/deleteChannel', function(req, res) {
		userModel
			.verifySiteOwner(req.session.user.email, req.query.siteId)
			.then(function() {
				return channelModel
					.deleteChannel(req.query.siteId, req.body.platform, req.body.pageGroup)
					.then(function() {
						res.json({ success: 1 });
					});
			})
			.catch(function(err) {
				res.json({ success: 0, message: err.toString() });
			});
	})
	.post('/updateCrmDealStatus', function(req, res) {
		return userModel
			.getUserByEmail(req.session.user.email)
			.then(user => {
				if (!user || !user.get('data') || !user.get('data').crmDealId) {
					return Promise.reject('No CRM deal id found');
				}
				return pipedriveAPI('updateDeal', {
					deal_id: user.data.crmDealId,
					stage_id: req.body.status
				});
			})
			.then(() => res.send({ success: 1 }))
			.catch(err => {
				console.log(err);
				return res.send({ success: 0 });
			});
	})
	.get('/generateLiveSitesScripts', function(req, res) {
		const message =
			'Scripts for all live websites will be generated now. Please check the server logs for confirmation';

		liveSitesService.init();
		return res.json({ message });
	});

module.exports = router;
