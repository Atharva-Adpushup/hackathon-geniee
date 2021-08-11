module.exports = apiModule();

var model = require('../helpers/model'),
	couchbase = require('../helpers/couchBaseService'),
	couchbaseModule = require('couchbase'),
	N1qlQuery = couchbaseModule.N1qlQuery,
	globalModel = require('../models/globalModel'),
	AdPushupError = require('../helpers/AdPushupError'),
	utils = require('../helpers/utils'),
	channelModel = require('../models/channelModel'),
	apConfigSchema = require('./subClasses/site/apConfig'),
	Promise = require('bluebird'),
	commonConsts = require('../configs/commonConsts'),
	adSizeMappingConsts = require('../helpers/adSizeMappingConsts'),
	_ = require('lodash'),
	{ N1qlQuery } = require('couchbase'),
	{ appBucket } = require('../helpers/routeHelpers'),
	Site = model.extend(function() {
		this.keys = [
			'siteId',
			'customSizes',
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
			'onboardingStage',
			'step',
			'websiteRevenue',
			'adsensePublisherId',
			'adNetworkSettings',
			'isManual',
			'isInnovative',
			'gdpr',
			'ampSettings',
			'apps',
			'adServerSetupStatus',
			'dataFeedActive',
			'prebidBundleName',
			'activeBidderAdaptersListAsc',
			'coreWebVitalsData'
		];
		this.clientKeys = [
			'siteId',
			'customSizes',
			'siteName',
			'siteDomain',
			'channels',
			'cmsInfo',
			'apConfigs',
			'partner',
			'genieeMediaId',
			'adsensePublisherId',
			'isManual',
			'isInnovative',
			'gdpr',
			'ampSettings',
			'apps',
			'adServerSetupStatus',
			'dataFeedActive',
			'prebidBundleName',
			'activeBidderAdaptersListAsc',
			'coreWebVitalsData'
		];
		this.validations = {
			required: []
		};
		this.defaults = {
			gdpr: commonConsts.GDPR,
			apConfigs: {
				// 'isAdPushupControlWithPartnerSSP', checks whether AdPushup control will be triggered
				// on any SSP partner website
				// Manually update it without any UI incase this condition gets true
				// NOTE: AdPushup does not recommend this use case but we have to support it to complete
				// our SSP integrations
				isAdPushupControlWithPartnerSSP: false,
				isSelectiveRolloutEnabled: true
			},
			channels: [],
			cmsInfo: {
				cmsName: '',
				pageGroups: []
			},
			adNetworkSettings: commonConsts.DEFAULT_AD_NETWORK_SETTINGS,
			apps: {
				layout: true,
				apTag: true,
				innovativeAds: true,
				headerBidding: true,
				consentManagement: false
			},
			adServerSetupStatus: 0
		};
		this.ignore = [];
		this.classMap = { apConfigs: apConfigSchema };

		this.constructor = function(data, cas) {
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

		this.getNetwork = function(networkName) {
			return Promise.resolve(_.find(this.get('adNetworks'), { name: networkName }));
		};

		this.deleteChannel = function(platform, pageGroup) {
			return new Promise(
				function(resolve) {
					// Reset site channels and page group pattern
					var channels = _.filter(this.get('channels'), function(chnl) {
							return chnl !== platform + ':' + pageGroup;
						}),
						apConfigs = this.get('apConfigs'),
						isPageGroupPattern = !!(
							apConfigs &&
							apConfigs.pageGroupPattern &&
							_.isArray(apConfigs.pageGroupPattern)
						),
						pageGroupPatterns = isPageGroupPattern
							? _.filter(apConfigs.pageGroupPattern, function(patternObj) {
									var patternKey = Object.keys(patternObj)[0];

									return patternKey !== pageGroup;
							  })
							: false,
						computedApConfig;

					this.set('channels', channels);

					if (pageGroupPatterns && _.isArray(pageGroupPatterns)) {
						computedApConfig = { pageGroupPattern: pageGroupPatterns };
						this.set('apConfigs', computedApConfig);
					}

					this.save();
					resolve();
				}.bind(this)
			);
		};

		this.getAllChannels = function() {
			var allChannels = _.map(
				this.get('channels'),
				function(channel) {
					var channelArr = channel.split(':'); // channel[0] is platform and channel[1] is pagegroup
					return channelModel.getChannel(this.get('siteId'), channelArr[0], channelArr[1]);
				}.bind(this)
			);
			return Promise.all(allChannels).then(function(data) {
				return _.map(data, function(channel) {
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
				return !ad.get('syncStatus'); // when ad is unsynced
			});
		};

		this.getUnsyncedAds = function(networkName) {
			return _.filter(this.get('ads'), function(ad) {
				return !ad.get('syncStatus') && ad.get('network') === networkName; // when ad is unsynced
			});
		};

		this.getAdByVariationName = function(variationName) {
			return _.find(this.get('ads'), function(ad) {
				return variationName === ad.get('variationName');
			});
		};

		this.syncAdsenseAdslot = Promise.method(
			function(variationName, adslot) {
				var ad = this.getAdByVariationName(variationName);
				if (!ad) {
					throw new AdPushupError('No ad with variationName: ' + variationName);
				}
				ad.set('adslot', adslot.substr(0, 10), true); // bug in extension which sends adslot twice in a single string so substr it as length of adslot is 10
				ad.set('syncStatus', true, true);
				return this.save();
			}.bind(this)
		);

		this.syncAdsenseAds = Promise.method(
			function(ads) {
				var ad = null,
					self = this;
				_.each(ads, function(adJson) {
					if (!adJson.adslot) {
						return true;
					}
					ad = self.getAdByVariationName(adJson.variationName);
					if (ad) {
						ad.set('adslot', adJson.adslot.substr(0, 10), true); // bug in extension which sends adslot twice in a single string so substr it as length of adslot is 10
						ad.set('syncStatus', true, true);
					}
				});

				return this.save();
			}.bind(this)
		);

		this.getActiveBidderAdaptersList = function() {
			return this.get('activeBidderAdaptersListAsc') || '';
		};

		this.setActiveBidderAdaptersList = function(newActiveBiddersList) {
			const siteId = this.get('siteId');

			this.set('activeBidderAdaptersListAsc', newActiveBiddersList);
			this.set('prebidBundleName', getSiteSpecificPrebidBundleName(siteId));

			return this.save();
		};
	});

function getSiteSpecificPrebidBundleName(siteId) {
	var timestamp = Date.now();
	return `pb.${siteId}.${timestamp}.js`;
}

function apiModule() {
	function generateGetSitesQueryString(siteIds, keysToReturn) {
		const selectStatement = `SELECT ${
			Array.isArray(keysToReturn) && keysToReturn.length
				? keysToReturn.map(key => `_site.${key}`)
				: '*'
		}`;

		const whereStatement = `WHERE meta(_site).id ${
			Array.isArray(siteIds) && siteIds.length
				? `IN [${siteIds.map(siteId => `"site::${siteId}"`)}]`
				: `LIKE 'site::%' AND _site.dataFeedActive = true;`
		}`;

		const queryString = `${selectStatement} FROM AppBucket _site ${whereStatement};`;

		return queryString;
	}
	var API = {
		createSite: function(data) {
			var json = {
				siteName: data.siteName,
				siteDomain: data.siteDomain,
				apConfigs: data.apConfigs,
				genieeMediaId: data.genieeMediaId
			};

			if (data.partner) {
				json.partner = data.partner;
				json.ownerEmail = data.ownerEmail;
				json.isManual = data.isManual;
			}

			if (data.adsensePublisherId) {
				json.adsensePublisherId = data.adsensePublisherId;
			}

			if (!json.genieeMediaId) {
				throw new AdPushupError([
					{ status: 403, message: 'Please provide a valid Geniee Media id' }
				]);
			}

			if (!json.apConfigs.hasOwnProperty('isAdPushupControlWithPartnerSSP')) {
				json.apConfigs.isAdPushupControlWithPartnerSSP = false;
			}

			return globalModel.incrSiteIdInApAppBucket().then(function(siteId) {
				json.siteId = siteId;
				return API.saveSiteData(siteId, 'POST', json);
			});
		},
		getSiteById: function(siteId) {
			return couchbase
				.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.getAsync('site::' + siteId, {});
				})
				.then(function(json) {
					return new Site(json.value, json.cas);
				})
				.catch(function(err) {
					if (err.code === 13) {
						throw new AdPushupError([{ status: 404, message: 'Site does not exist' }]);
					}

					return false;
				});
		},

		getActiveSites: function() {
			const query = N1qlQuery.fromString(commonConsts.GET_ACTIVE_SITES_QUERY);

			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.queryAsync(query))
				.then(sites => {
					return sites;
				})
				.catch(err => console.log(err));
		},
		updateSite: function(json) {
			return API.getSiteById(json.siteId)
				.then(function(site) {
					// var isAdSensePublisherId = !!(json.publisherId && site.get('adsensePublisherId'));

					if (json.publisherId) {
						site.set('adsensePublisherId', json.publisherId);
					}
					if (json.name) {
						site.set('siteName', json.siteName);
					}

					return site.save();
				})
				.catch(function(err) {
					if (err.message[0].status === 404) {
						throw new AdPushupError([{ status: 404, message: 'Site does not exist' }]);
					}

					throw new AdPushupError([{ status: 500, message: 'Some error occurred' }]);
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

					return channelModel
						.deleteChannel(siteId, platform, pageGroup)
						.then(function() {
							return platform + ':' + pageGroup;
						})
						.catch(function() {
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

			return Promise.all([API.getSiteById(siteId), couchbase.connectToAppBucket()]).spread(function(
				site,
				appBucket
			) {
				return (
					Promise.resolve(deleteAllChannels(site))
						// .then(function(deleteChannelsArr) {
						// deletedChannelsArr argument can be used if required
						.then(function() {
							return Promise.all([
								appBucket.upsertAsync('_' + site.key, site.toJSON(), {}),
								appBucket.removeAsync(site.key, {})
							]);
						})
				);
			});
		},
		saveSiteSettings: function(json) {
			const setPagegroupPattern = patterns => {
				Object.keys(patterns).forEach(pattern => {
					patterns[pattern].forEach(p => {
						delete p.platform;
						p = utils.getHtmlEncodedJSON(p);
					});
				});
				return patterns;
			};

			const settings = json.settings,
				pageGroupPattern = setPagegroupPattern(JSON.parse(settings.pageGroupPattern)),
				blocklist = JSON.parse(settings.blocklist);
			let otherSettings = JSON.parse(settings.otherSettings),
				encodedOtherSettings = Object.assign({}, otherSettings);

			delete encodedOtherSettings.cookieControlConfig;
			encodedOtherSettings = utils.getHtmlEncodedJSON(encodedOtherSettings);
			otherSettings = Object.assign({}, otherSettings, encodedOtherSettings);

			return API.getSiteById(json.siteId).then(site => {
				var siteConfig = {
					pageGroupPattern: pageGroupPattern,
					heartBeatMinInterval: otherSettings.heartBeatMinInterval
						? parseInt(otherSettings.heartBeatMinInterval, 10)
						: commonConsts.apConfigDefaults.heartBeatMinInterval,
					heartBeatStartDelay: otherSettings.heartBeatStartDelay
						? parseInt(otherSettings.heartBeatStartDelay, 10)
						: commonConsts.apConfigDefaults.heartBeatStartDelay,
					xpathWaitTimeout: otherSettings.xpathWaitTimeout
						? parseInt(otherSettings.xpathWaitTimeout, 10)
						: commonConsts.apConfigDefaults.xpathWaitTimeout,
					adpushupPercentage: otherSettings.adpushupPercentage
						? parseInt(otherSettings.adpushupPercentage, 10)
						: commonConsts.apConfigDefaults.adpushupPercentage,
					autoOptimise: settings.autoOptimise === 'false' ? false : true,
					poweredByBanner: settings.poweredByBanner === 'false' ? false : true,
					activeDFPNetwork: settings.activeDFPNetwork ? settings.activeDFPNetwork : '',
					activeDFPParentId: settings.activeDFPParentId ? settings.activeDFPParentId : '',
					activeDFPCurrencyCode: settings.activeDFPCurrencyCode || '',
					blocklist: blocklist.length ? blocklist : [],
					isSPA: settings.isSPA === 'false' ? false : true,
					isThirdPartyAdx: settings.isThirdPartyAdx === 'false' ? false : true,
					spaPageTransitionTimeout: parseInt(settings.spaPageTransitionTimeout, 10),
					isAdPushupControlWithPartnerSSP: !!site.get('apConfigs').isAdPushupControlWithPartnerSSP
						? site.get('apConfigs').isAdPushupControlWithPartnerSSP
						: commonConsts.apConfigDefaults.isAdPushupControlWithPartnerSSP
				};

				site.set('apConfigs', siteConfig);
				return site.save();
			});
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
		getSetupStage: function(siteId) {
			return API.getSiteById(siteId)
				.then(function(site) {
					var onboardingStage = site.get('onboardingStage');
					return onboardingStage;
				})
				.catch(function(err) {
					throw new AdPushupError('Cannot get setup onboarding stage');
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
		getSiteChannels: siteId => API.getSiteById(siteId).then(site => site.get('channels')),
		isLayoutInventoryExist: siteId => {
			return API.getSiteById(siteId)
				.then(site => site.getAllChannels())
				.then(channels => {
					let inventoryFound = false;
					// eslint-disable-next-line no-restricted-syntax
					for (const channel of channels) {
						if (inventoryFound) break;
						// eslint-disable-next-line no-restricted-syntax
						if (channel.variations && Object.keys(channel.variations).length) {
							for (const variationKey in channel.variations) {
								if (inventoryFound) break;

								const variation = channel.variations[variationKey];

								if (variation.sections && Object.keys(variation.sections).length) {
									for (const sectionKey in variation.sections) {
										if (inventoryFound) break;

										const section = variation.sections[sectionKey];

										if (section.ads && Object.keys(section.ads).length) {
											for (const adKey in section.ads) {
												if (inventoryFound) break;

												const ad = section.ads[adKey];

												if (ad.network === 'adpTags') {
													inventoryFound = true;
													break;
												}
											}
										} else {
											continue;
										}
									}
								} else {
									continue;
								}
							}
						} else {
							continue;
						}
					}

					if (inventoryFound) return inventoryFound;
					throw new AdPushupError('Inventory Not Found');
				});
		},

		isApTagInventoryExist: siteId => {
			return couchbase
				.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.getAsync('tgmr::' + siteId, {});
				})
				.then(({ value }) => {
					let apTagInventoryFound = false;
					if (value.ads.length) {
						for (const ad of value.ads) {
							apTagInventoryFound = ad.network === 'adpTags';
							if (apTagInventoryFound) break;
						}
					}

					if (apTagInventoryFound) return apTagInventoryFound;
					throw new AdPushupError('Inventory Not Found');
				})
				.catch(err => {
					if (err.code === 13) {
						throw new AdPushupError('Inventory Not Found');
					}

					throw err;
				});
		},
		isInnovativeAdInventoryExist: siteId => {
			return couchbase
				.connectToAppBucket()
				.then(function(appBucket) {
					return appBucket.getAsync('fmrt::' + siteId, {});
				})
				.then(({ value }) => {
					let innovativeAdInventoryFound = false;
					if (value.ads.length) {
						for (const ad of value.ads) {
							innovativeAdInventoryFound = ad.network === 'adpTags';
							if (innovativeAdInventoryFound) break;
						}
					}

					if (innovativeAdInventoryFound) return innovativeAdInventoryFound;
					throw new AdPushupError('Inventory Not Found');
				})
				.catch(err => {
					if (err.code === 13) {
						throw new AdPushupError('Inventory Not Found');
					}

					throw err;
				});
		},
		isInventoryExist: siteId => {
			return API.isLayoutInventoryExist(siteId)
				.catch(() => API.isApTagInventoryExist(siteId))
				.catch(() => API.isInnovativeAdInventoryExist(siteId));
		},
		setSiteStep: function(siteId, onboardingStage, step) {
			return API.getSiteById(siteId)
				.then(function(site) {
					site.set('onboardingStage', onboardingStage);
					site.set('step', parseInt(step));
					return site.save();
				})
				.catch(function(err) {
					throw new AdPushupError('Cannot get setup step');
				});
		},
		getIncontentAndHbAds: function(siteId) {
			return API.getSiteChannels(siteId)
				.then(channelsList => {
					let sectionPromises = [];

					channelsList.forEach(channel => {
						const platform = channel.split(':')[0],
							pageGroup = channel.split(':')[1];
						sectionPromises.push(channelModel.getChannelSections(siteId, platform, pageGroup));
					});

					return Promise.all(sectionPromises);
				})
				.then(sections => {
					let allSections = [],
						incontentAds = [],
						hbAds = [];

					sections.forEach(sectionArr => {
						allSections = allSections.concat(sectionArr);
					});
					incontentAds = _.filter(allSections, section => section.isIncontent);
					hbAds = _.filter(allSections, section => {
						let adId = Object.keys(section.ads)[0],
							networkData = section.ads[adId].networkData;

						return (
							networkData.dfpAdunitCode &&
							networkData.dfpAdunit &&
							(networkData.headerBidding || networkData.dynamicAllocation)
						);
					});

					return { incontentAds, hbAds };
				});
		},
		getSitePageGroups: function(siteId) {
			return API.getSiteById(parseInt(siteId)).then(function(site) {
				var pageGroupPromises = _.map(site.get('channels'), function(channel) {
					var pageGroup = channel.split(':');
					return channelModel
						.getChannel(siteId, pageGroup[0], pageGroup[1])
						.then(function(channel) {
							return channel.data;
						});
				});

				return Promise.all(pageGroupPromises).then(function(pageGroups) {
					return pageGroups;
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
				var computedPageGroups = _.uniq(
					_.map(pageGroups, function(pageGroup) {
						return getVariationFreeApexPageGroup(pageGroup);
					})
				).sort();

				return computedPageGroups;
			}

			return API.getSiteById(siteId).then(function(site) {
				var pageGroups = _.uniq(
					_.map(site.get('channels'), function(val) {
						return val.split(':')[1];
					})
				).sort();

				if ('isApex' in site && site.isApex()) {
					pageGroups = getApexPageGroups(pageGroups);
				}

				return Promise.resolve(pageGroups);
			});
		},
		saveSiteData: function(siteId, requestMethod, siteData) {
			return API.getSiteById(siteId, requestMethod)
				.then(
					function(site) {
						site.setAll(siteData);
						return site;
					},
					function() {
						siteData = Object.assign(siteData, {
							isManual: false
						});
						return API.createSiteFromJson(siteData);
					}
				)
				.then(function(site) {
					return site.save();
				});
		},
		/**
		 * - If siteIds list is empty then return all active site docs
		 * - if keysToReturn list is emplty then return all site doc keys
		 *
		 * @param config:{siteIds:[], keysToReturn:[]}
		 * @returns
		 */
		getSites: function({ siteIds = [], keysToReturn = [] }) {
			const queryString = generateGetSitesQueryString(siteIds, keysToReturn);
			const query = N1qlQuery.fromString(queryString);

			return couchbase.connectToAppBucket().then(appBucket => appBucket.queryAsync(query));
		},
		getAllGaEnabledSites: function() {
			const queryString = `SELECT siteId FROM AppBucket WHERE apConfigs.enableGAAnalytics and meta().id like "site::%";`;
			return appBucket.queryDB(queryString);
		}
	};

	return API;
}
