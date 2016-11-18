module.exports = apiModule();

var model = require('../helpers/model'),
	couchbase = require('../helpers/couchBaseService'),
	siteModel = require('../models/siteModel'),
	sectionModel = require('./subClasses/channel/section'),
	_ = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	schema = require('../helpers/schema'),
	FormValidator = require('../helpers/FormValidator'),
	uuid = require('uuid'),
	utils = require('../helpers/utils'),
	Promise = require('bluebird'),
	ViewQuery = require('couchbase-promises').ViewQuery,
	Channel = model.extend(function() {
		this.keys = [
			'id',
			'siteId',
			'channelName',
			'pageGroup',
			'platform',
			'tags',
			'siteDomain',
			'sampleUrl',
			'variations',
			'contentSelector',
			'contentSelectorMissing',
			'activeVariation',
			'dateCreated',
			'dateModified',
			'genieePageGroupId'
		];
		this.clientKeys = [
			'id', 'siteDomain', 'channelName', 'platform', 'pageGroup', 'variations', 'sampleUrl',
			'contentSelector', 'contentSelectorMissing', 'activeVariation', 'genieePageGroupId'
		];
		this.validations = {
			'required': []
		};
		this.defaults = { variations: {}, contentSelector: '', activeVariation: '' };
		// this.classMap = { 'structuredSections': sectionModel };
		this.constructor = function(data, cas) {
			if (!(data.siteId && data.platform && data.pageGroup)) {
				throw new Error('siteId, platform and pageGroup required for channel');
			}
			this.key = 'chnl::' + data.siteId + ':' + data.platform + ':' + data.pageGroup;
			this.super(data, cas ? true : false);
			this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
		};
	});

function apiModule() {
	var API = {
		createPageGroup: function(json) {
			return siteModel.getSiteById(json.siteId)
			.then(function(site) {
			return FormValidator.validate({sampleUrl: json.sampleUrl}, schema.api.validations, site.data.siteDomain)
				.then(function(data) {
					var channel = json.device.toUpperCase() + ':' + json.pageGroupName.toUpperCase(), channelData, channels = site.get('channels');
					if(_.includes(channels, channel)) {
						throw new AdPushupError([{"status": 403, "message": "This pagegroup type already exists"}]);
					}
					channels.push(channel);

					if(!site.get('cmsInfo')) {
						site.set('cmsInfo', {"cmsName": "", "pageGroups": []});
					}
					if(!_.find(site.get('cmsInfo').pageGroups, ['sampleUrl', json.sampleUrl])) { 
						site.get('cmsInfo').pageGroups.push({ sampleUrl: json.sampleUrl, pageGroup: json.pageGroupName.toUpperCase() });
					}
					channelData = { siteDomain: site.data.siteDomain, siteId: site.data.siteId, sampleUrl: json.sampleUrl, platform: json.device.toUpperCase(), pageGroup: json.pageGroupName.toUpperCase(), id: uuid.v4(), channelName: json.pageGroupName.toUpperCase()+'_'+json.device.toUpperCase(), genieePageGroupId: json.pageGroupId };
					return API.saveChannel(json.siteId, json.device, json.pageGroupName, channelData)
					.then(function(res) {
						site.save();
						return res.data;
					});
				})
			});
		},	
		getPageGroupById: function(pageGroupId, extendedParams) {
			var query = ViewQuery.from('app', 'channelById').stale(1).range(pageGroupId, pageGroupId, true);
			return couchbase.connectToAppBucket()
				.then(function(appBucket) {
					return new Promise(function(resolve, reject) {
						appBucket.query(query, {}, function(err, result) {
							if(result.length === 0) {
								return reject(new AdPushupError([{"status": 404, "message": "Pagegroup does not exist"}]));
							}
							var data = result[0].value;
							if(extendedParams && extendedParams.getExtendedParams) {
								return resolve({
									pageGroupId: data.id,
									sampleUrl: data.sampleUrl,
									pageGroup: data.pageGroup,
									device: data.platform,
									variations: data.variations,
									channelName: data.channelName
								});
							}

							return resolve({
								pageGroupId: data.id,
								sampleUrl: data.sampleUrl,
								pageGroup: data.pageGroup,
								device: data.platform
							});
						});
					});
				});
		},
		updatePagegroup: function(json) {
			var query = ViewQuery.from('app', 'channelById').stale(1).range(json.pageGroupId, json.pageGroupId, true);
			return couchbase.connectToAppBucket()
				.then(function(appBucket) {
					return new Promise(function(resolve, reject) {
						appBucket.query(query, {}, function(err, result) {
							if(result.length === 0) {
								return reject(new AdPushupError([{"status": 404, "message": "Pagegroup does not exist"}]));
							}
							if(utils.getSiteDomain(json.sampleUrl) !== utils.getSiteDomain(result[0].value.siteDomain)) {
								return reject(new AdPushupError([{"status": 403, "message": "The Sample URL should be from your website only"}]));
							}

							return API.getChannelByDocId(result[0].id)
							.then(function(channel) {
								channel.set('sampleUrl', json.sampleUrl);
								return resolve(channel.save());
							});					
						});
					});
				});
		},
		deletePagegroupById: function(pageGroupId) {
			var query = ViewQuery.from('app', 'channelById').stale(1).range(pageGroupId, pageGroupId, true);
			return couchbase.connectToAppBucket()
				.then(function(appBucket) {
					return new Promise(function(resolve, reject) {
						appBucket.query(query, {}, function(err, result) {
							if(result.length === 0) {
								return reject(new AdPushupError([{"status": 404, "message": "Pagegroup does not exist"}]));
							}

							var data = result[0].value;
							return API.deleteChannel(data.siteId, data.platform, data.pageGroup)
							.then(function(data) {
								return resolve();
							})
						});
					});
				})
		},
		getChannelByDocId: function(id) {
			return couchbase.connectToAppBucket().then(function(appBucket) {
				return appBucket.getAsync(id, {});
			}).then(function(json) {
				return new Channel(json.value, json.cas);
			});
		},
		getChannel: function(siteId, platform, pageGroup) {
			return couchbase.connectToAppBucket().then(function(appBucket) {
				return appBucket.getAsync('chnl::' + siteId + ':' + platform + ':' + pageGroup, {});
			}).then(function(json) {
				return new Channel(json.value, json.cas);
			});
		},
		saveChannel: function(siteId, platform, pageGroup, channelData) {
			return API.getChannel(siteId, platform, pageGroup).then(function(channel) {
				channel.setAll(channelData);
				return channel;
			}, function() {
				return new Channel(channelData);
			}).then(function(channel) {
				return channel.save();
			});
		},
		saveChannels: function(siteId, channels) {
			var updatedChannels = _.map(channels, function(channel) {
				channel.siteId = siteId;
				return API.saveChannel(siteId, channel.platform, channel.pageGroup, channel);
			});
			return Promise.all(updatedChannels);
		},
		deleteChannel: function(siteId, platform, pageGroup) {
			var appBucketConnect = couchbase.connectToAppBucket(),
				getChannel = appBucketConnect.then(function() {
					return API.getChannel(siteId, platform, pageGroup);
				}),
				getSite = getChannel.then(function() {
					return siteModel.getSiteById(siteId);
				});

			return Promise.join(appBucketConnect, getChannel, getSite, function(appBucket, channel, site) {
				return site.deleteChannel(platform, pageGroup).then(function() {
					return appBucket.upsertAsync('_chnl::' + siteId + ':' + platform + ':' + pageGroup, channel.toJSON(), {}).then(function() {
						return appBucket.removeAsync('chnl::' + siteId + ':' + platform + ':' + pageGroup, {});
					});
				});
			});
		}
	};

	return API;
}
