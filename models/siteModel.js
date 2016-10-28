module.exports = apiModule();

var model = require('../helpers/model'),
	couchbase = require('../helpers/couchBaseService'),
	ViewQuery = require('couchbase-promises').ViewQuery,
	globalModel = require('../models/globalModel'),
	AdPushupError = require('../helpers/AdPushupError'),
	channelModel = require('../models/channelModel'),
	Promise = require('bluebird'),
	adModel = require('../models/subClasses/site/ad'),
	_ = require('lodash'),
	utils = require('../helpers/utils'),
	uuid = require('uuid'),
	ViewQuery = require('couchbase-promises').ViewQuery,
	platforms = ['DESKTOP', 'TABLET', 'MOBILE'],
	Site = model.extend(function() {
		this.keys = [
			'siteId',
			'siteName',
			'siteDomain',
			'audiences',
			'ownerEmail',
			'channels',
			'cmsInfo',
			'ads',
			'actions',
			'templates',
			'adNetworks',
			'apConfigs',
			'dateCreated',
			'dateModified'
		];
		this.clientKeys = ['siteId', 'siteName', 'siteDomain', 'adNetworks', 'actions', 'audiences', 'channels', 'cmsInfo', 'templates', 'apConfigs'];
		this.validations = {
			'required': []
		};
		// this.classMap = { 'ads': adModel };
		this.defaults = { ads: [], apConfigs: {}, channels: [] };
		this.ignore = [];

		this.constructor = function(data, cas) {
			if (!data.siteId) {
				throw new Error('Site model need siteId');
			}

			this.super(data, cas ? true : false);
			this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
			this.key = 'site::' + this.data.siteId;
		};


		this.getNetwork = function(networkName) {
			return Promise.resolve(_.find(this.get('adNetworks'), { 'name': networkName }));
		};

		this.deleteChannel = function(platform, pageGroup) {
			return new Promise(function(resolve) {
				var channels = _.filter(this.get('channels'), function(chnl) {
					return (chnl !== platform + ':' + pageGroup);
				});
				this.set('channels', channels);
				this.save();
				resolve();
			}.bind(this));
		};

		this.getAllChannels = function() {
			var allChannels = _.map(this.get('channels'), function(channel) {
				var channelArr = channel.split(':');// channel[0] is platform and channel[1] is pagegroup
				return channelModel.getChannel(this.get('siteId'), channelArr[0], channelArr[1]);
			}.bind(this));
			return Promise.all(allChannels).then(function(data) {
				return _.map(data, function(channel) {
					return channel.toClientJSON();
				});
			});
		};

		this.areAdsSynced = function() {
			return _.find(this.get('ads'), function(ad) {
				if (ad.get('syncStatus') === true) {
					return true;
				}
			});
		};

		this.hasUnsyncedAds = function() {
			return _.find(this.get('ads'), function(ad) {
				if (ad.get('syncStatus') === false) {
					return true;
				}
			});
		};

		this.getUnsyncedAd = function() {
			return _.find(this.get('ads'), function(ad) {
				return !ad.get('syncStatus');// when ad is unsynced
			});
		};

		this.getUnsyncedAds = function(networkName) {
			return _.filter(this.get('ads'), function(ad) {
				return !ad.get('syncStatus') && (ad.get('network') === networkName);// when ad is unsynced
			});
		};

		this.getAdByVariationName = function(variationName) {
			return _.find(this.get('ads'), function(ad) {
				return variationName === ad.get('variationName');
			});
		};

		this.syncAdsenseAdslot = Promise.method(function(variationName, adslot) {
			var ad = this.getAdByVariationName(variationName);
			if (!ad) {
				throw new AdPushupError('No ad with variationName: ' + variationName);
			}
			ad.set('adslot', adslot.substr(0, 10), true);// bug in extension which sends adslot twice in a single string so substr it as length of adslot is 10
			ad.set('syncStatus', true, true);
			return this.save();
		}.bind(this));

		this.syncAdsenseAds = Promise.method(function(ads) {
			var ad = null, self = this;
			_.each(ads, function(adJson) {
				if (!adJson.adslot) {
					return true;
				}
				ad = self.getAdByVariationName(adJson.variationName);
				if (ad) {
					ad.set('adslot', adJson.adslot.substr(0, 10), true);// bug in extension which sends adslot twice in a single string so substr it as length of adslot is 10
					ad.set('syncStatus', true, true);
				}
			});

			return this.save();
		}.bind(this));
	});

function apiModule() {
	var API = {
		getSiteById: function(siteId, requestMethod) {
			return couchbase.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.getAsync('site::' + siteId, {});
				})
				.then(function(json) {
					// if ((!json.value.channels && !Array.isArray(json.value.channels)) && (!json.value.ads && !Array.isArray(json.value.ads)) && (requestMethod && requestMethod === 'GET')) {
					// 	json.value.channels = []; json.value.firstTime = true; json.value.site = {};
					// 	return json.value;
					// }
					return new Site(json.value, json.cas);
				});
		},
		createSite: function(data) {
			if(!data.siteDomain) {
				return Promise.reject(new AdPushupError({"status": 403, "message": "Required parameter not found"}));
			}

			if(!utils.validateUrl(data.siteDomain)) {
				return Promise.reject(new AdPushupError({"status": 403, "message": "Please provide a valid site domain, eg - http://sitename.com"}));
			}

			var json = {
				siteName: data.siteName,
				siteDomain: data.siteDomain,
				channels: []
			};

			return globalModel.incrSiteId()
				.then(function(siteId) {
					json.siteId = siteId;
					return API.saveSiteData(siteId, 'POST', json);
				});
		},
		updateSite: function(json) {
			if(!json.siteId || !json.siteName) {
				return Promise.reject(new AdPushupError({"status": 403, "message": "Required parameter not found"}));
			}	

			return API.getSiteById(json.siteId)
			.then(function(site) {
				site.set('siteName', json.siteName);
				return site.save();
			})
			.catch(function(err) {
				if(err.code === 13) {
					throw new AdPushupError({"status": 404, "message": "Site does not exist"});
				}

				throw new AdPushupError({"status": 500, "message": "Some error occurred"});
			});
		},
		saveChannelData: function(json) {
			return API.getSiteById(json.siteId)
			.then(function(site) {
				if(!json.siteId || !json.pageGroupName || !json.sampleUrl || !json.device) {
					throw new AdPushupError({"status": 403, "message": "Required parameter not found"});
				}

				if(!utils.validateUrl(json.sampleUrl)) {
					throw new AdPushupError({"status": 403, "message": "Please provide a valid sample URL, eg - http://sitename.com"});
				}

				if(!_.includes(platforms, json.device.toUpperCase())) {
					throw new AdPushupError({"status": 403, "message": "Please provide a valid device name. Supported values - DESKTOP, TABLET, MOBILE"});
				}

				if(utils.getSiteDomain(json.sampleUrl) !== utils.getSiteDomain(site.data.siteDomain)) {
					throw new AdPushupError({"status": 403, "message": "The sample URL should be from your website only"});
				}

				var channels = site.get('channels'),
					pageGroups = site.get('cmsInfo').pageGroups,
					channel = ':'+ json.device.toUpperCase() + ':' + json.pageGroupName.toUpperCase();

				if(_.includes(channels, channel)) {
					throw new AdPushupError({"status": 403, "message": "This pagegroup type already exists"});
				}

				channels.push(channel);

				if(!_.find(pageGroups, ['sampleUrl', json.sampleUrl])) {
					site.get('cmsInfo').pageGroups.push({
						sampleUrl: json.sampleUrl,
						pageGroup: json.pageGroupName.toUpperCase()
					});
				}

				return {json: json, site: site};
			})
			.then(function(data) {
				var site = data.site,
					userData = data.json;

				var channelData = {
					siteDomain: site.data.siteDomain,
					siteId: site.data.siteId,
					sampleUrl: userData.sampleUrl,
					platform: userData.device.toUpperCase(),
					pageGroup: userData.pageGroupName.toUpperCase(),
					id: uuid.v4(),
					channelName: userData.pageGroupName.toUpperCase()+'_'+userData.device.toUpperCase()
				};

				return channelModel.saveChannel(userData.siteId, userData.device, userData.pageGroupName, channelData)
					.then(function(res) {
						site.save();
						return res.data;
					})
			})
			.catch(function(err) {
				if(err.name !== 'AdPushupError') {
					if(err.code === 13) {
						throw new AdPushupError({"status": 404, "message": "Site does not exist"});
					}

					throw new AdPushupError({"status": 500, "message": "Some error occurred"});
				}

				var error = err.message;
				throw new AdPushupError({"status": error.status, "message": error.message});
			});
		},
		getPageGroupById: function(pageGroupId) {
			if(!pageGroupId) {
				return Promise.reject(new AdPushupError({"status": 404, "message": "Required parameter not found"}));
			}

			var query = ViewQuery.from('dev_app', 'channelById').key(pageGroupId);
			return couchbase.connectToAppBucket()
				.then(function(appBucket) {
					return new Promise(function(resolve, reject) {
						appBucket.query(query, {}, function(err, result) {
							
							if(err) {
								return reject(new AdPushupError({"status": 500, "message": "Some error occurred"}));
							}

							if(result.length === 0) {
								return reject(new AdPushupError({"status": 404, "message": "Pagegroup does not exist"}));
							}

							var data = result[0].value;
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
			if(!json.pageGroupId || !json.sampleUrl) {
				return Promise.reject(new AdPushupError({"status": 404, "message": "Required parameter not found"}));
			}

			if(!utils.validateUrl(json.sampleUrl)) {
				return Promise.reject(new AdPushupError({"status": 404, "message": "Please provide a valid sample URL, eg - http://sitename.com"}));
			}

			var query = ViewQuery.from('dev_app', 'channelById').key(json.pageGroupId);
			return couchbase.connectToAppBucket()
				.then(function(appBucket) {
					return new Promise(function(resolve, reject) {
						appBucket.query(query, {}, function(err, result) {
							
							if(err) {
								return reject(new AdPushupError({"status": 500, "message": "Some error occurred"}));
							}

							if(result.length === 0) {
								return reject(new AdPushupError({"status": 404, "message": "Pagegroup does not exist"}));
							}

							if(utils.getSiteDomain(json.sampleUrl) !== utils.getSiteDomain(result[0].value.siteDomain)) {
								return reject(new AdPushupError({"status": 403, "message": "The sample url should be from your website only"}));
							}

							return resolve({
								queryResult: result[0],
								userData: json
							});							
						});
					})
					.then(function(data) {
						return channelModel.getChannelByDocId(data.queryResult.id)
							.then(function(channel) {
								return {
									channelModel: channel,
									userData: data.userData
								};
							})
					})
					.then(function(channel) {
						var json = channel.userData,
							channel = channel.channelModel;

						channel.set('sampleUrl', json.sampleUrl);
						return channel.save();
					})
				})
				.catch(function(err) {
					if(err.name !== 'AdPushupError') {
						throw new Error('Some error occurred');
					}

					var error = err.message;
					throw new AdPushupError({"status": error.status, "message": error.message});
				});
		},
		deletePagegroupById: function(pageGroupId) {
			if(!pageGroupId) {
				return Promise.reject(new AdPushupError({"status": 404, "message": "Required parameter not found"}));
			}	

			var query = ViewQuery.from('dev_app', 'channelById').key(pageGroupId);
			return couchbase.connectToAppBucket()
				.then(function(appBucket) {
					return new Promise(function(resolve, reject) {
						appBucket.query(query, {}, function(err, result) {
							
							if(err) {
								return reject(new AdPushupError({"status": 500, "message": "Some error occurred"}));
							}

							if(result.length === 0) {
								return reject(new AdPushupError({"status": 404, "message": "Pagegroup does not exist"}));
							}

							var data = result[0].value;
							channelModel.deleteChannel(data.siteId, data.platform, data.pageGroup)
								.then(function(data) {
									return resolve({"status": 200, "message": "Pagegroup deleted successfully"});
								})
								.catch(function(err) {
									return reject(new AdPushupError({"status": 500, "message": "Some error occurred"}));
								});
						});
					});
				})
				.catch(function(err) {
					if(err.name !== 'AdPushupError') {
						throw new Error('Some error occurred');
					}

					var error = err.message;
					throw new AdPushupError({"status": error.status, "message": error.message});
				});
		},
		createSiteFromJson: function(json) {
			return Promise.resolve(new Site(json));
		},
		deleteSite: function(siteId) {
			/**
			 * delete all original Channel documents and creates archive documents with key _chnl
			 * @param {object} site site model {}
			 * @returns {array} deleted channels array
			 */
			function getDeleteChannelsPromises(site) {
				return _(site.get('channels')).map(function(channel) {
					var channelArr = channel.split(':'),
						platform = channelArr[0],
						pageGroup = channelArr[1];

					return channelModel.deleteChannel(siteId, platform, pageGroup)
						.then(function() {
							return (platform + ':' + pageGroup);
						}).catch(function() {
							throw new AdPushupError('getDeleteChannelsPromises: Channel is not deleted');
						});
				});
			}

			/**
			 * Resolves deleted channels promises
			 * @param {object} site site model {}
			 * @returns {array} deleted channels array
			 */
			function deleteAllChannels(site) {
				return Promise.all(getDeleteChannelsPromises(site))
					.then(function(channelArr) {
						return channelArr;
					})
					.catch(function() {
						throw new AdPushupError('deleteAllChannels: Channels are not deleted');
					});
			}

			return Promise
				.all([API.getSiteById(siteId), couchbase.connectToAppBucket()])
				.spread(function(site, appBucket) {
					return Promise.resolve(deleteAllChannels(site))
						// .then(function(deleteChannelsArr) {
						// deletedChannelsArr argument can be used if required
						.then(function() {
							return Promise.all([appBucket.upsertAsync('_' + site.key, site.toJSON(), {}), appBucket.removeAsync(site.key, {})]);
						});
				});
		},
		getUniquePageGroups: function(siteId) {
			function getVariationFreeApexPageGroup(pageGroup) {
				var arr = pageGroup.split('_');
				arr.splice(2, 1);
				return arr.join('_');
			}

			function getApexPageGroups(pageGroups) {
				var computedPageGroups = _.uniq(_.map(pageGroups, function(pageGroup) {
					return getVariationFreeApexPageGroup(pageGroup);
				})).sort();

				return computedPageGroups;
			}

			return API.getSiteById(siteId).then(function(site) {
				var pageGroups = _.uniq(_.map(site.get('channels'), function(val) {
					return val.split(':')[1];
				})).sort();

				if (site.isApex()) {
					pageGroups = getApexPageGroups(pageGroups);
				}

				return Promise.resolve(pageGroups);
			});
		},
		saveSiteData: function(siteId, requestMethod, siteData) {
			return API.getSiteById(siteId, requestMethod).then(function(site) {
				site.setAll(siteData);
				return site;
			}, function() {
				return API.createSiteFromJson(siteData);
			})
				.then(function(site) {
					return site.save();
				});
		}
	};

	return API;
}
