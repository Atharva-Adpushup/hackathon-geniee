module.exports = apiModule();

var model = require('../helpers/model'),
	couchbase = require('../helpers/couchBaseService'),
	siteModel = require('../models/siteModel'),
	sectionModel = require('./subClasses/channel/section'),
	_ = require('lodash'),
	Promise = require('bluebird'),
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
			'dateModified'
		];
		this.clientKeys = [
			'id', 'siteDomain', 'channelName', 'platform', 'pageGroup', 'variations', 'sampleUrl',
			'contentSelector', 'contentSelectorMissing', 'activeVariation'
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

		// this.getNetworkSettings = function() {
		// 	return Promise.resolve(this.get('adNetworkSettings'));
		// };
	});

function apiModule() {
	var API = {
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
