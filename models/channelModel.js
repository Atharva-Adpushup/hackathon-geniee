module.exports = apiModule();

var model = require('../helpers/model'),
	couchbase = require('../helpers/couchBaseService'),
	siteModel = require('../models/siteModel'),
	variationModel = require('./subClasses/channel/variation'),
	networkDataModel = require('./subClasses/channel/networkData'),
	_ = require('lodash'),
	AdPushupError = require('../helpers/AdPushupError'),
	schema = require('../helpers/schema'),
	FormValidator = require('../helpers/FormValidator'),
	uuid = require('uuid'),
	extend = require('extend'),
	utils = require('../helpers/utils'),
	Promise = require('bluebird'),
	ViewQuery = require('couchbase-promises').ViewQuery,
	N1qlQuery = require('couchbase-promises').N1qlQuery,
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
			'genieePageGroupId',
			'ampSettings'
		];
		this.clientKeys = [
			'id',
			'siteDomain',
			'channelName',
			'platform',
			'pageGroup',
			'variations',
			'sampleUrl',
			'contentSelector',
			'contentSelectorMissing',
			'activeVariation',
			'genieePageGroupId',
			'ampSettings'
		];
		this.validations = {
			required: []
		};
		this.classMap = { variations: variationModel, networkData: networkDataModel };
		this.defaults = { variations: {}, contentSelector: '', activeVariation: '' };
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
			return siteModel.getSiteById(json.siteId).then(function(site) {
				var sampleUrlForced = _.has(json, 'forceSampleUrl');
				return FormValidator.validate(
					{ sampleUrl: json.sampleUrl, sampleUrlForced: sampleUrlForced },
					schema.api.validations,
					site.data.siteDomain
				).then(function(data) {
					var channel = json.device.toUpperCase() + ':' + json.pageGroupName.toUpperCase(),
						channelData,
						channels = site.get('channels');

					console.log('createPageGroup JSON: ', JSON.stringify(json));
					console.log('siteJSON before createPageGroup: ', JSON.stringify(site.toJSON()));
					if (!site.get('cmsInfo')) {
						site.set('cmsInfo', { cmsName: '', pageGroups: [] });
					}

					if (!_.find(site.get('cmsInfo').pageGroups, ['sampleUrl', json.sampleUrl])) {
						site.get('cmsInfo').pageGroups.push({
							sampleUrl: json.sampleUrl,
							pageGroup: json.pageGroupName.toUpperCase()
						});
					} else {
						var existingPageGroup = _.find(site.get('cmsInfo').pageGroups, ['sampleUrl', json.sampleUrl])
							.pageGroup,
							existingChannel = json.device.toUpperCase() + ':' + existingPageGroup;

						if (_.includes(channels, existingChannel)) {
							throw new AdPushupError([
								{ status: 403, message: 'A pagegroup with this Sample URL and device already exists.' }
							]);
						}
					}

					if (_.includes(channels, channel)) {
						throw new AdPushupError([{ status: 403, message: 'This pagegroup type already exists' }]);
					}
					channels.push(channel);
					site.set('channels', channels);
					console.log('siteJSON after createPageGroup before db save: ', JSON.stringify(site.toJSON()));

					channelData = {
						siteDomain: site.data.siteDomain,
						siteId: site.data.siteId,
						sampleUrl: json.sampleUrl,
						platform: json.device.toUpperCase(),
						pageGroup: json.pageGroupName.toUpperCase(),
						id: uuid.v4(),
						channelName: json.pageGroupName.toUpperCase() + '_' + json.device.toUpperCase(),
						genieePageGroupId: json.pageGroupId,
						variations: {}
					};
					return site
						.save()
						.then(() => {
							return siteModel.getSiteById(json.siteId).then(site => {
								console.log(
									'siteJSON loaded from db after createPageGroup: ',
									JSON.stringify(site.toJSON())
								);
								return true;
							});
						})
						.then(() => API.saveChannel(json.siteId, json.device, json.pageGroupName, channelData))
						.then(res => res.data);
				});
			});
		},
		getPageGroupById: function(paramsObj) {
			var query = ViewQuery.from('app', paramsObj.viewName).stale(1).range(paramsObj.id, paramsObj.id, true);
			return couchbase.connectToAppBucket().then(function(appBucket) {
				return new Promise(function(resolve, reject) {
					appBucket.query(query, {}, function(err, result) {
						if (result.length === 0) {
							return reject(new AdPushupError([{ status: 404, message: 'Pagegroup does not exist' }]));
						}
						var data = result[0].value;
						if (paramsObj && paramsObj.isExtendedParams) {
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
			return couchbase.connectToAppBucket().then(function(appBucket) {
				return new Promise(function(resolve, reject) {
					appBucket.query(query, {}, function(err, result) {
						if (result.length === 0) {
							return reject(new AdPushupError([{ status: 404, message: 'Pagegroup does not exist' }]));
						}
						if (utils.getSiteDomain(json.sampleUrl) !== utils.getSiteDomain(result[0].value.siteDomain)) {
							return reject(
								new AdPushupError([
									{ status: 403, message: 'The Sample URL should be from your website only' }
								])
							);
						}

						return API.getChannelByDocId(result[0].id).then(function(channel) {
							channel.set('sampleUrl', json.sampleUrl);
							return resolve(channel.save());
						});
					});
				});
			});
		},
		deletePagegroupById: function(pageGroupId) {
			var query = ViewQuery.from('app', 'channelById').stale(1).range(pageGroupId, pageGroupId, true);
			return couchbase.connectToAppBucket().then(function(appBucket) {
				return new Promise(function(resolve, reject) {
					appBucket.query(query, {}, function(err, result) {
						if (result.length === 0) {
							return reject(new AdPushupError([{ status: 404, message: 'Pagegroup does not exist' }]));
						}

						var data = result[0].value;

						return API.deleteChannel(data.siteId, data.platform, data.pageGroup)
							.then(function() {
								return siteModel.getSitePageGroups(data.siteId);
							})
							.then(function(pageGroups) {
								var selectedPagegroups = _.filter(pageGroups, { pageGroup: data.pageGroup });

								return selectedPagegroups.length === 0 ? siteModel.getSiteById(data.siteId) : resolve();
							})
							.then(function(site) {
								var cmsPageGroups = site.get('cmsInfo').pageGroups;
								_.remove(cmsPageGroups, function(p) {
									return p.pageGroup === data.pageGroup;
								});

								site.set('cmsInfo', { cmsName: '', pageGroups: cmsPageGroups });
								site.save();
								return resolve();
							});
					});
				});
			});
		},
		getChannelByDocId: function(id) {
			return couchbase
				.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.getAsync(id, {});
				})
				.then(function(json) {
					return new Channel(json.value, json.cas);
				});
		},
		isChannelExist: function(id) {
			return couchbase
				.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.getAsync(id, {});
				})
				.then(function() {
					return true;
				})
				.catch(function(e) {
					if (e.name && e.name === 'CouchbaseError') {
						return false;
					}

					return true;
				});
		},
		getChannel: function(siteId, platform, pageGroup) {
			return couchbase
				.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.getAsync('chnl::' + siteId + ':' + platform + ':' + pageGroup, {});
				})
				.then(function(json) {
					return new Channel(json.value, json.cas);
				});
		},
		saveChannel: function(siteId, platform, pageGroup, channelData) {
			return API.getChannel(siteId, platform, pageGroup)
				.then(
					function(channel) {
						channel.setAll(channelData);
						return channel;
					},
					function() {
						return new Channel(channelData);
					}
				)
				.then(function(channel) {
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
		getVariations: function(siteId, platform, pageGroup) {
			return API.getChannel(siteId, platform, pageGroup).then(function(channel) {
				var computedData = {
					variations: extend(true, {}, channel.get('variations'))
				};

				computedData.count = Object.keys(computedData.variations).length;
				return Promise.resolve(computedData);
			});
		},
		getChannelSections: (siteId, platform, pageGroup) => {
			return API.getChannel(siteId, platform, pageGroup).then(function(channel) {
				let variations = channel.get('variations'), allSections = [];
				Object.keys(variations).forEach(i => {
					const sections = variations[i].sections;
					Object.keys(sections).forEach(j => {
						allSections.push(sections[j]);
					});
				});
				return allSections;
			});
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
					return appBucket
						.upsertAsync('_chnl::' + siteId + ':' + platform + ':' + pageGroup, channel.toJSON(), {})
						.then(function() {
							return appBucket.removeAsync('chnl::' + siteId + ':' + platform + ':' + pageGroup, {});
						});
				});
			});
		},
		getAmpSettings: function(siteId) {
			let query = N1qlQuery.fromString(
				`select ampSettings, pageGroup
			from AppBucket where meta().id like 'chnl::${siteId}:%' and platform ='MOBILE';`
			);
			return couchbase.connectToAppBucket().then(
				appBucket =>
					new Promise((resolve, reject) => {
						appBucket.query(query, {}, (err, result) => {
							if (err) {
								return reject(err);
							}
							return resolve(result);
						});
					})
			);
		}
	};

	return API;
}
