var express = require('express'),
	userModel = require('../models/userModel'),
	siteModel = require('../models/siteModel'),
	channelModel = require('../models/channelModel'),
	adsenseReportModel = require('../models/adsenseModel'),
	reportsModel = require('../models/reportsModel'),
	apexVariationRpmService = require('../reports/default/apex/pageGroupVariationRPM/service'),
	Promise = require('bluebird'),
	extend = require('extend'),
	CC = require('../configs/commonConsts'),
	lodash = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
	pipeDrive = require('../misc/vendors/pipedrive'),
	pipeDriveObject = new pipeDrive();
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
		return apexVariationRpmService.getReportData(req.query, req.session.user.email)
			.then(function(reportData) {
				return res.json(extend(true, {success: true}, reportData));
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
	})
	// .post('/crmSupportIntegration', function(req, res) {
	// 		var searchPhrase = req.body.freshdesk_webhook.ticket_requester_email || null,
	// 			pipeDriveObject = new pipeDrive(),
	// 			freshDeskObject = new freshDesk(),
	// 			pipeDriveFilteredData = null,
	// 			pipeDriveCheckUserDetails = pipeDriveObject.apiCall('isUserPresent', searchPhrase);
		
	// 	freshDeskObject.init('yomesh.gupta@adpushup.com', 'hsemoyatpug');
	// 	pipeDriveCheckUserDetails.then(function(data) {
	// 		var flag = 0,
	// 			parsedData = null,
	// 			parsedContent = JSON.parse(data);
	// 		if (parsedContent.data) {
	// 			parsedData = parsedContent.data[0] || null;
	// 		}
	// 		if (parsedData && parsedData != 'null' && parsedData != null) {
	// 			flag = 1;
	// 			var userId = parsedData.id;
	// 			return pipeDriveObject.apiCall('fetchUserDetails', userId);
	// 		} else {
	// 			return new Promise(function(resolve, reject) {
	// 				resolve(flag);
	// 			});
	// 		}
	// 	}).then(function(data) {
	// 		if (data && data != 0) {
	// 			var flag = 0,
	// 				pipeDriveUserData = JSON.parse(data);
	// 			if (pipeDriveUserData && pipeDriveUserData != '') {
	// 				flag = 1;
	// 				pipeDriveFilteredData = {
	// 					'name' : pipeDriveUserData.data.name,
	// 					'email' : pipeDriveUserData.data.email[0].value,
	// 					'phone' : pipeDriveUserData.data.phone[0].value,
	// 					// 'job_title' : pipeDriveUserData.contacts[0].job_title,

	// 					// Custom Fields
	// 					'owner_name' : pipeDriveUserData.data.owner_id.name,
	// 					'owner_email' : pipeDriveUserData.data.owner_id.email,
	// 					// 'organization_name' : pipeDriveUserData.data.org_id.name,
	// 					'open_deals_count' : pipeDriveUserData.data.open_deals_count,
	// 					'related_open_deals_count' : pipeDriveUserData.data.related_open_deals_count,
	// 					'closed_deals_count' : pipeDriveUserData.data.closed_deals_count,
	// 					'related_closed_deals_count' : pipeDriveUserData.data.related_closed_deals_count,
	// 					'participant_open_deals_count' : pipeDriveUserData.data.participant_open_deals_count,
	// 					'participant_closed_deals_count' : pipeDriveUserData.data.participant_closed_deals_count,
	// 					'email_messages_count' : pipeDriveUserData.data.email_messages_count,
	// 					'activities_count' : pipeDriveUserData.data.activities_count,
	// 					'done_activities_count' : pipeDriveUserData.data.done_activities_count,
	// 					'undone_activities_count' : pipeDriveUserData.data.undone_activities_count,
	// 					'reference_activities_count' : pipeDriveUserData.data.reference_activities_count,
	// 					'files_count' : pipeDriveUserData.data.files_count,
	// 					'notes_count' : pipeDriveUserData.data.notes_count,
	// 					'followers_count' : pipeDriveUserData.data.followers_count,
	// 					'won_deals_count' : pipeDriveUserData.data.won_deals_count,
	// 					'related_won_deals_count' : pipeDriveUserData.data.related_won_deals_count,
	// 					'lost_deals_count' : pipeDriveUserData.data.lost_deals_count,
	// 					'related_lost_deals_count' : pipeDriveUserData.data.related_lost_deals_count,
	// 					'add_time' : pipeDriveUserData.data.add_time,
	// 					'update_time' : pipeDriveUserData.data.update_time,
	// 					'next_activity_date' : pipeDriveUserData.data.next_activity_date,
	// 					'next_activity_time' : pipeDriveUserData.data.next_activity_time,
	// 					'next_activity_id' : pipeDriveUserData.data.next_activity_id,
	// 					'last_activity_id' : pipeDriveUserData.data.last_activity_id,
	// 					'last_activity_date' : pipeDriveUserData.data.last_activity_date,
	// 					'last_incoming_mail_time' : pipeDriveUserData.data.last_incoming_mail_time,
	// 					'last_outgoing_mail_time' : pipeDriveUserData.data.last_outgoing_mail_time,
	// 				}
	// 			} else {
	// 				pipeDriveFilteredData = null;
	// 			}
	// 			if (flag == 1) {
	// 				return freshDeskObject.apiCall('isUserPresent', searchPhrase);
	// 			} else {
	// 				return new Promise(function(resolve, reject) {
	// 					resolve(flag);
	// 				});
	// 			}
	// 		} else {
	// 			return new Promise(function(resolve, reject) {
	// 				var flag = 0;
	// 				resolve(flag);
	// 			});
	// 		}
	// 	}).then(function(data) {
	// 		if (data != 0) {
	// 			var userFreshDeskDetails = JSON.parse(data),
	// 				flag = 0,
	// 				freshSaleskeys = Object.keys(pipeDriveFilteredData),
	// 				finalDeskFields = ['name', 'email', 'phone', 'mobile', 'avatar', 'job_title'],
	// 				finalData = {
	// 					"custom_fields" : {}
	// 				};
	// 			if (!userFreshDeskDetails || userFreshDeskDetails == '' || userFreshDeskDetails == null) {
	// 				flag = 1; // Not present in FreshDesk
	// 			} else {
	// 				flag = 2; // Present in FreshDesk
	// 			}
	// 			if(flag == 1) {
	// 				freshSaleskeys.forEach(function(prop) {
	// 					if (prop != 'avatar') {
	// 						if(finalDeskFields.indexOf(prop) > -1) {
	// 							finalData[prop] = String(pipeDriveFilteredData[prop]) || null;
	// 						} else {
	// 							finalData.custom_fields[prop] = String(pipeDriveFilteredData[prop]) || null;
	// 						}
	// 					}
	// 				});
	// 				return freshDeskObject.apiCall('addUser', null, finalData);           
	// 			} else if (flag == 2) {
	// 				freshSaleskeys.forEach(function(prop) {
	// 					if (prop != 'avatar') {
	// 						if(finalDeskFields.indexOf(prop) > -1) {
	// 							if(userFreshDeskDetails) {
	// 								if (!userFreshDeskDetails[0][prop] || userFreshDeskDetails[0][prop] == 'null' || userFreshDeskDetails[0][prop] == '') {
	// 									finalData[prop] = String(pipeDriveFilteredData[prop]) || null; 
	// 								} else {
	// 									finalData[prop] = String(userFreshDeskDetails[0][prop]) || null;
	// 								}
	// 							}
	// 						} else {
	// 							finalData.custom_fields[prop] = String(pipeDriveFilteredData[prop]) || null;
	// 						}
	// 					}
	// 				});
	// 				var userId = userFreshDeskDetails[0].id;
	// 				return freshDeskObject.apiCall('updateUser', null, finalData, userId);   
	// 			}
	// 		}
	// 	}).then(function(data) {
	// 		console.log("Done : " + data);    
	// 	}).catch(function(err) {
	// 		console.log(err);
	// 	});	
	// })

	/*
	* Deal Status Updation in pipeDrive
	* Request Params
	* 64 : Deal Created
	* 71 : Deal Qualified
	* 65 : Services Selected
	* 66 : Site Added
	* 67 : AP code added & verified
	* 68 : Google Adsense Connected
	* 69 : Non admin access
	* 64 : Passback
	*/
	.post('/updateCrmDealStatus', function(req, res) {
			var dealStatus = req.body.status;

            userModel.getUserByEmail(req.session.user.email).then(function(user) {
				var pipeDriveParams = {
					"searchText": user.data.crmDealId,
					"dataToSend": {
						"stage_id": dealStatus
					}
				}
				return pipeDriveObject.apiCall('updateDealStatus', pipeDriveParams);
			}).then(function(data) {
				return res.send({success: 1});
			}).catch(function(err) {
				console.log(err);
				return res.send({success: 0});
			});	
	})
	.post('/updateCrmDeal', function(req, res) {
			var dataToSend = null;

            userModel.getUserByEmail(req.session.user.email).then(function(user) {
				switch (req.body.type) {
					case 'services':
						dataToSend = {
							"98d03ae31d14653dcc142c912a1f0faee3f1a088": req.body['data[servicesString]'],
							"02921da334ea34a050d3b7ed7de2ef51ebce9fe5": req.body['data[pwc]']
						}
						break;
				}
				var pipeDriveParams = {
					"searchText": user.data.crmDealId,
					"dataToSend": dataToSend
				}
				return pipeDriveObject.apiCall('updateDeal', pipeDriveParams);
			}).then(function(data) {
				return res.send({success: 1});
			}).catch(function(err) {
				console.log(err);
				return res.send({success: 0});
			});	
	});

module.exports = router;
