module.exports = apiModule();

var model = require('../helpers/model'),
	couchbase = require('../helpers/couchBaseService'),
	globalModel = require('../models/globalModel'),
	AdPushupError = require('../helpers/AdPushupError'),
	channelModel = require('../models/channelModel'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	Site = model.extend(function () {
		this.keys = [
			'siteId',
			'siteName',
			'siteDomain',
			'audiences',
			'ownerEmail',
			'channels',
			'cmsInfo',
			'actions',
			'templates',
			'adNetworks',
			'apConfigs',
			'partner',
			'genieeMediaId',
			'dateCreated',
			'dateModified',
			'step'
		];
		this.clientKeys = ['siteId', 'siteName', 'siteDomain', 'adNetworks', 'actions', 'audiences', 'channels', 'cmsInfo', 'templates', 'apConfigs', 'partner', 'genieeMediaId'];
		this.validations = {
			'required': []
		};
		this.defaults = { apConfigs: {}, channels: [], cmsInfo: { cmsName: '', pageGroups: [] } };
		this.ignore = [];

		this.constructor = function (data, cas) {
			if (!data.siteId) {
				throw new Error('Site model need siteId');
			}

			this.super(data, cas ? true : false);
			this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
			this.key = 'site::' + this.data.siteId;
		};


		this.getNetwork = function (networkName) {
			return Promise.resolve(_.find(this.get('adNetworks'), { 'name': networkName }));
		};

		this.deleteChannel = function (platform, pageGroup) {
			return new Promise(function (resolve) {
				var channels = _.filter(this.get('channels'), function (chnl) {
					return (chnl !== platform + ':' + pageGroup);
				});
				this.set('channels', channels);
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
		setPagegroupPattern: function (json) {
			return API.getSiteById(json.siteId)
				.then(function (site) {
					var existingPatterns = site.get('apConfigs').pageGroupPattern, pattern = {};
					pattern[json.pageGroupName] = json.pageGroupPattern;

					if (!existingPatterns) {
						site.set('apConfigs', { pageGroupPattern: new Array(pattern) });
					}
					else {
						var p = _.find(existingPatterns, function (p) { return _.has(p, json.pageGroupName); });
						p ? p[json.pageGroupName] = json.pageGroupPattern : existingPatterns.push(pattern);
					}
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
					var pageGroupPromises = _.map(site.data.channels, function (channel) {
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
		setCms: function(siteId, cmsName, pageGroups) {
			return API.getSiteById(siteId)
				.then(function(site) {
					var cmsInfo = {
						cmsName: cmsName,
						pageGroups: pageGroups
					};
					site.set('cmsInfo', cmsInfo);
					return site.save();
				})
				.catch(function(err) {
					throw new AdPushupError('Cannot set cms');
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
