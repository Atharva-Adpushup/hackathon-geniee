module.exports = apiModule();

var model = require('../helpers/model'),
	couchbase = require('../helpers/couchBaseService'),
	globalModel = require('../models/globalModel'),
	AdPushupError = require('../helpers/AdPushupError'),
	channelModel = require('../models/channelModel'),
	apConfigSchema = require('./subClasses/site/apConfig'),
	Promise = require('bluebird'),
	commonConsts = require('../configs/commonConsts'),
	_ = require('lodash'),
	Site = model.extend(function () {
		this.keys = [
			'siteId',
			'siteName',
			'siteDomain',
			'ownerEmail',
			'channels',
			'cmsInfo',
			'apConfigs',
			'partner',
			'genieeMediaId',
			'dateCreated',
			'dateModified',
			'step',
			'websiteRevenue'
		];
		this.clientKeys = ['siteId', 'siteName', 'siteDomain', 'channels', 'cmsInfo', 'apConfigs', 'partner', 'genieeMediaId'];
		this.validations = {
			'required': []
		};
		this.defaults = { apConfigs: {}, channels: [], cmsInfo: { cmsName: '', pageGroups: [] } };
		this.ignore = [];
		this.classMap = { 'apConfigs': apConfigSchema };

		this.constructor = function (data, cas) {
			if (!data.siteId) {
				throw new Error('Site model need siteId');
			}

			this.super(data, cas ? true : false);
			this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
			this.key = 'site::' + this.data.siteId;
		};

		this.isApex = function() {
			return !!this.get('apex'); // forceful convert to bool
		};

		this.getNetwork = function (networkName) {
			return Promise.resolve(_.find(this.get('adNetworks'), { 'name': networkName }));
		};

		this.deleteChannel = function (platform, pageGroup) {
			return new Promise(function (resolve) {

				// Reset site channels and page group pattern
				var channels = _.filter(this.get('channels'), function (chnl) {
						return (chnl !== platform + ':' + pageGroup);
					}),
					apConfigs = this.get('apConfigs'),
					isPageGroupPattern = !!(apConfigs && apConfigs.pageGroupPattern && _.isArray(apConfigs.pageGroupPattern)),
					pageGroupPatterns = (isPageGroupPattern ? (_.filter(apConfigs.pageGroupPattern, function(patternObj) {
						var patternKey = Object.keys(patternObj)[0];

						return (patternKey !== pageGroup);
					})) : false),
					computedApConfig;

				this.set('channels', channels);

				if (pageGroupPatterns && _.isArray(pageGroupPatterns)) {
					computedApConfig = {'pageGroupPattern': pageGroupPatterns};
					this.set('apConfigs', computedApConfig);
				}

				this.save();
				resolve();
			}.bind(this));
		};

		this.getAllChannels = function () {
			var allChannels = _.map(this.get('channels'), function (channel) {
				var channelArr = channel.split(':');// channel[0] is platform and channel[1] is pagegroup
				return channelModel.getChannel(this.get('siteId'), channelArr[0], channelArr[1]);
			}.bind(this));
			return Promise.all(allChannels).then(function (data) {
				return _.map(data, function (channel) {
					return channel.toClientJSON();
				});
			});
		};

		this.getVariationConfig = function() {
			var computedConfig = {};

			return Promise.resolve(this.getAllChannels()).then(function(channelsArr) {
				if (Array.isArray(channelsArr) && channelsArr.length) {
					_.forEach(channelsArr, function(channelObj, channelKey) {
						if (channelObj.hasOwnProperty('variations') && channelObj.variations) {
							_.forOwn(channelObj.variations, function(variationObj, variationKey) {
								computedConfig[variationObj.id] = {
									id: variationObj.id,
									name: variationObj.name,
									trafficDistribution: variationObj.trafficDistribution
								};
							});
						}
					});
				}

				return computedConfig;
			});
		};

		this.areAdsSynced = function () {
			return _.find(this.get('ads'), function (ad) {
				if (ad.get('syncStatus') === true) {
					return true;
				}
			});
		};

		this.hasUnsyncedAds = function () {
			return _.find(this.get('ads'), function (ad) {
				if (ad.get('syncStatus') === false) {
					return true;
				}
			});
		};

		this.getUnsyncedAd = function () {
			return _.find(this.get('ads'), function (ad) {
				return !ad.get('syncStatus');// when ad is unsynced
			});
		};

		this.getUnsyncedAds = function (networkName) {
			return _.filter(this.get('ads'), function (ad) {
				return !ad.get('syncStatus') && (ad.get('network') === networkName);// when ad is unsynced
			});
		};

		this.getAdByVariationName = function (variationName) {
			return _.find(this.get('ads'), function (ad) {
				return variationName === ad.get('variationName');
			});
		};

		this.syncAdsenseAdslot = Promise.method(function (variationName, adslot) {
			var ad = this.getAdByVariationName(variationName);
			if (!ad) {
				throw new AdPushupError('No ad with variationName: ' + variationName);
			}
			ad.set('adslot', adslot.substr(0, 10), true);// bug in extension which sends adslot twice in a single string so substr it as length of adslot is 10
			ad.set('syncStatus', true, true);
			return this.save();
		}.bind(this));

		this.syncAdsenseAds = Promise.method(function (ads) {
			var ad = null, self = this;
			_.each(ads, function (adJson) {
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
		createSite: function (data) {
			var json = { siteName: data.siteName, siteDomain: data.siteDomain, apConfigs: data.apConfigs, genieeMediaId: data.genieeMediaId };
			if (data.partner) {
				json.partner = data.partner;
				json.ownerEmail = data.ownerEmail;
			}
			return globalModel.incrSiteId()
				.then(function (siteId) {
					json.siteId = siteId;
					return API.saveSiteData(siteId, 'POST', json);
				});
		},
		getSiteById: function (siteId, requestMethod) {
			return couchbase.connectToAppBucket()
				.then(function (appBucket) {
					return appBucket.getAsync('site::' + siteId, {});
				})
				.then(function (json) {
					return new Site(json.value, json.cas);
				})
				.catch(function (err) {
					if (err.code === 13) {
						throw new AdPushupError([{ "status": 404, "message": "Site does not exist" }]);
					}

					return false;
				});
		},
		updateSite: function (json) {
			return API.getSiteById(json.siteId)
				.then(function (site) {
					site.set('siteName', json.siteName);
					return site.save();
				})
				.catch(function (err) {
					if (err.message[0].status === 404) {
						throw new AdPushupError([{ "status": 404, "message": "Site does not exist" }]);
					}

					throw new AdPushupError([{ "status": 500, "message": "Some error occurred" }]);
				});
		},
		createSiteFromJson: function (json) {
			return Promise.resolve(new Site(json));
		},
		deleteSite: function (siteId) {
			/**
			 * delete all original Channel documents and creates archive documents with key _chnl
			 * @param {object} site site model {}
			 * @returns {array} deleted channels array
			 */
			function getDeleteChannelsPromises(site) {
				return _(site.get('channels')).map(function (channel) {
					var channelArr = channel.split(':'),
						platform = channelArr[0],
						pageGroup = channelArr[1];

					return channelModel.deleteChannel(siteId, platform, pageGroup)
						.then(function () {
							return (platform + ':' + pageGroup);
						}).catch(function () {
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
					.then(function (channelArr) {
						return channelArr;
					})
					.catch(function () {
						throw new AdPushupError('deleteAllChannels: Channels are not deleted');
					});
			}

			return Promise
				.all([API.getSiteById(siteId), couchbase.connectToAppBucket()])
				.spread(function (site, appBucket) {
					return Promise.resolve(deleteAllChannels(site))
						// .then(function(deleteChannelsArr) {
						// deletedChannelsArr argument can be used if required
						.then(function () {
							return Promise.all([appBucket.upsertAsync('_' + site.key, site.toJSON(), {}), appBucket.removeAsync(site.key, {})]);
						});
				});
		},
		saveSiteSettings: function (json) {
			var pageGroupPattern = JSON.parse(json.settings.pageGroupPattern),
				otherSettings = JSON.parse(json.settings.otherSettings),
				blocklist = JSON.parse(json.settings.blocklist);
			
			console.log(blocklist);
			return API.getSiteById(json.siteId)
				.then(function (site) {
					var siteConfig = {
						pageGroupPattern: pageGroupPattern,
						heartBeatMinInterval: otherSettings.heartBeatMinInterval ? parseInt(otherSettings.heartBeatMinInterval, 10) : commonConsts.apConfigDefaults.heartBeatMinInterval,
						heartBeatStartDelay: otherSettings.heartBeatStartDelay ? parseInt(otherSettings.heartBeatStartDelay, 10) : commonConsts.apConfigDefaults.heartBeatStartDelay,
						xpathWaitTimeout: otherSettings.xpathWaitTimeout ? parseInt(otherSettings.xpathWaitTimeout, 10) : commonConsts.apConfigDefaults.xpathWaitTimeout,
						adpushupPercentage: otherSettings.adpushupPercentage ? parseInt(otherSettings.adpushupPercentage, 10) : commonConsts.apConfigDefaults.adpushupPercentage,
						autoOptimise: ((json.settings.autoOptimise === 'false') ? false : true),
						blocklist: blocklist.length ? blocklist : ''
					};
					site.set('apConfigs', siteConfig);
					return site.save();
				})
		},
		getSetupStep: function(siteId) {
			return API.getSiteById(siteId)
				.then(function(site) {
					var step = site.get('step');
					return step;
				})
				.catch(function(err) {
					throw new AdPushupError('Cannot get setup step');
				});
		},
		getCmsData: function(siteId) {
			return API.getSiteById(siteId)
				.then(function(site) {
					var cms = site.get('cmsInfo');
					return cms;
				})
				.catch(function(err) {
					throw new AdPushupError('Cannot get cms data');
				});
		},
		setSiteStep: function(siteId, step) {
			return API.getSiteById(siteId)
				.then(function(site) {
					site.set('step', parseInt(step));
					return site.save();
				})
				.catch(function(err) {
					throw new AdPushupError('Cannot get setup step');
				});
		},
		getSitePageGroups: function (siteId) {
			return API.getSiteById(parseInt(siteId))
				.then(function (site) {
					var pageGroupPromises = _.map(site.get('channels'), function (channel) {
						var pageGroup = channel.split(':');
						return channelModel.getChannel(siteId, pageGroup[0], pageGroup[1])
							.then(function (channel) {
								return channel.data;
							})
					});

					return Promise.all(pageGroupPromises).then(function (pageGroups) {
						return pageGroups;
					});
				});
		},
		getUniquePageGroups: function (siteId) {
			function getVariationFreeApexPageGroup(pageGroup) {
				var arr = pageGroup.split('_');
				arr.splice(2, 1);
				return arr.join('_');
			}

			function getApexPageGroups(pageGroups) {
				var computedPageGroups = _.uniq(_.map(pageGroups, function (pageGroup) {
					return getVariationFreeApexPageGroup(pageGroup);
				})).sort();

				return computedPageGroups;
			}

			return API.getSiteById(siteId).then(function (site) {
				var pageGroups = _.uniq(_.map(site.get('channels'), function (val) {
					return val.split(':')[1];
				})).sort();

				if ('isApex' in site && site.isApex()) {
					pageGroups = getApexPageGroups(pageGroups);
				}

				return Promise.resolve(pageGroups);
			});
		},
		saveSiteData: function (siteId, requestMethod, siteData) {
			return API.getSiteById(siteId, requestMethod).then(function (site) {
				site.setAll(siteData);
				return site;
			}, function () {
				return API.createSiteFromJson(siteData);
			})
				.then(function (site) {
					return site.save();
				});
		}
	};

	return API;
}
