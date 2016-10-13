var _ = require('libs/third-party/underscore'),
	$ = window.jQuery,
	CommonConsts = require('../commonConsts'),
	Stores = CommonConsts.enums.stores,
	Fluxxor = require('libs/third-party/fluxxor'),
	Condition = require('../condition'),
	Utils = require('libs/custom/utils'),
	LocalStore = require('../localStore'),
	NetworkSettings = require('../adNetworkSettings');

module.exports = (function() {
	var Audience, SiteStore;
	Audience = function(name, rootCondition, id) {
		this.id = id || Utils.getRandomNumber();
		this.name = name;
		this.rootCondition = rootCondition;
	};

	Audience.prototype.setName = function(name) {
		this.name = name;
	};

	Audience.prototype.setRootCondition = function(str) {
		this.rootCondition = Condition.parseFromString(str);
	};

	Audience.prototype.toJSON = function() {
		return {
			id: this.id,
			name: this.name,
			defination: this.rootCondition.toSTRING(),
			rootCondition: this.rootCondition.toJSON()
		};
	};

	Audience.parseFromString = function(name, conditionString, id) {
		var c = Condition.parseFromString(conditionString);
		return new Audience(name, c, id);
	};

	Audience.parseFromJson = function(name, conditionjson) {
		var c = Condition.parseFromJson(conditionjson);
		return new Audience(name, c);
	};


	SiteStore = Fluxxor.createStore({

		initialize: function() {
			this.savingStatus = null;
			this.loadingStatus = null;
			this.apex = false;
			this.audiences = [];
			this.adNetworks = [];
			this.availableAccounts = [];
			this.ads = [];
			this.adRecover = false;
			this.apConfigs = {
				engineRequestTimeout: 4000,
				xpathWaitTimeout: 5000,
				mode: CommonConsts.enums.site.modes.DRAFT,
				adpushupPercentage: 90,
				displayMethod: CommonConsts.enums.site.displayMethod.ASYNC,
				explicitPlatform: true,
				blocklist: [],
				adRecover: {
					mode: CommonConsts.enums.site.modes.DRAFT,
					pageGroupPattern: []
				}
			};
			this.cmsInfo = {
				cmsName: '',
				pageGroups: []
			}; // {cmsName:"Wordpress",pageGroups:[{pageGroup:"Post",sampleUrl:"http://www.goole.com"}]}
			this.activeAudience = null;

			var SM = CommonConsts.enums.actions.siteManager;
			this.bindActions(
				SM.LOAD_SITE_START, this.onSiteLoadStart,
				SM.LOAD_SITE, this.loadSite,
				SM.LOAD_SITE_SUCCESS, this.onSiteLoad,
				SM.LOAD_SITE_FAILURE, this.onSiteLoadFail,

				SM.ADD_AUDIENCE, this.addAudience,
				SM.SET_ACTIVE_AUDIENCE, this.setActiveAudience,
				SM.MODIFY_AUDIENCE, this.modifyAudience,
				SM.MASTER_SAVE, this.masterSave,
				SM.MASTER_SAVE_SUCCESS, this.masterSaveSuccess,
				SM.MASTER_SAVE_FAIL, this.masterSaveFailure,
				SM.RESET_SAVE_STATUS, this.resetSaveStatus,
				SM.LOAD_AUDIENCES, this.loadAudiences,
				SM.LOAD_CMS_INFO, this.loadCmsInfo,
				SM.LOAD_ADNETWORKS, this.loadAdNetworks,
				SM.CREATE_DEFAULTS, this.createDefaults,
				SM.ADD_CUSTOM_NETWORK, this.addCustomAdNetwork,
				SM.ADD_SIZE_TO_ADSENSE, this.addSizeToAdsense,
				SM.ADD_ADSENSE_NETWORK, this.addDefaultAdsense,
				SM.ADD_VARIATION_TO_NETWORK, this.addVariationsToNetwork,
				SM.EDIT_NETWORK, this.editAdNetwork,
				SM.SAVE_ADSENSE_ESSENTIALS, this.saveAdsenseSettings,
				SM.CHANGE_SITE_MODE, this.changeSiteMode,
				SM.CHANGE_AP_CONFIGS, this.changeApConfigs,
				SM.CHANGE_ADRECOVER_CONFIGS, this.changeApConfigs,
				CommonConsts.enums.actions.channelManager.CREATE_CHANNEL, this.savePageGroup,
				CommonConsts.enums.actions.channelManager.EDIT_SAMPLE_URL, this.savePageGroup
			);
		},
		onSiteLoadStart: function() {
			this.loadingStatus = CommonConsts.enums.status.LOADING;
			this.emit('change');
		},
		onSiteLoad: function() {
			LocalStore.saveLoadedData(this.toJSONClean());
			this.loadingStatus = CommonConsts.enums.status.SUCCESS;
			this.emit('change');
		},
		onSiteLoadFail: function() {
			this.loadingStatus = CommonConsts.enums.status.FAILED;
			this.emit('change');
		},
		createDefaults: function() {
			this.addAudience({ name: 'Default', defination: '(* = *)' });
			this.addDefaultAdsense();
		},
		addDefaultAdsense: function() {
			this.adNetworks.push(new NetworkSettings.Adsense());
		},
		addCustomAdNetwork: function(payload) {
			this.adNetworks.push(new NetworkSettings.CustomAdNetwork({ name: payload.name, displayType: payload.displayType, revenueType: payload.revenueType, supportedAdTypes: payload.adTypes }));
		},
		addSizeToAdsense: function(payload) {
			var adsense = this.getAdNetworkByName(CommonConsts.enums.adNetworks.integratedNetworks.ADSENSE);
			if (!adsense) {
				return false;
			}
			if (adsense.addSize(payload.layout, payload.width, payload.height)) {
				this.emit('change');
			}
		},
		addVariationsToNetwork: function(payload) {
			if (!payload.json) {
				return false;
			}
			var t = new NetworkSettings.CustomAdVariation(payload.network.name, payload.json);
			payload.network.addVariation(t, payload.json.layoutType);
			this.emit('change');
		},
		editAdNetwork: function() {
			debugger;
		},
		getAdNetworkByName: function(name) {
			return _(this.adNetworks).findWhere({ name: name });
		},
		saveAdsenseSettings: function(payload) {
			var adsense = this.getAdNetworkByName('ADSENSE');
			if (!adsense) {
				return false;
			}

			adsense.pubId = payload.pubId;
			adsense.email = payload.email;
			adsense.maxAdsToDisplay = payload.noOfAds ? parseInt(payload.noOfAds, 10) : 3;
			this.emit('change');
		},
		isSizeSupportedInNetwork: function(size, adnetwork) {
			adnetwork = this.getAdNetworkByName(adnetwork);
			if (!adnetwork) {
				return false;
			}

			return adnetwork.sizeExists(size.width, size.height);
		},
		loadSite: function(payload) {
			var site = payload.site, adsense;

			if (site.audiences && Utils.isArray(site.audiences)) {
				this.loadAudiences(site.audiences);
			}

			if (site.adNetworks && Utils.isArray(site.adNetworks)) {
				this.loadAdNetworks(site.adNetworks);
			}

			if (payload.adsenseAccount) {
				adsense = this.getAdNetworkByName('ADSENSE');
				if (adsense) {
					adsense.pubId = payload.adsenseAccount.pubId;
					adsense.email = payload.adsenseAccount.adsenseEmail;
				}
			}

			if (site.cmsInfo) {
				this.loadCmsInfo(site.cmsInfo);
			}

			if (site.apConfigs) {
				this.apConfigs = site.apConfigs;
			} else if (typeof site.adpushupPercentage !== 'undefined' && typeof site.adpushupMode !== 'undefined') {// this is for migrating old sites to new
				this.apConfigs.adpushupPercentage = site.adpushupPercentage;
				this.apConfigs.mode = site.adpushupMode;
			}

			if (site.adRecover && (typeof site.adRecover === 'object') && Boolean(site.adRecover.monetize)) {
				this.loadAdRecover(site.adRecover);

				if (typeof site.apConfigs !== 'undefined') {
					this.loadAdRecoverApConfigs(site.apConfigs);
				}
			}

			if (site.apex) {
				this.apex = true;
			}

			this.emit('change');
		},
		loadAdNetworks: function(adNetworks) {
			_(adNetworks).each(function(adNetwork) {
				(adNetwork.name === 'ADSENSE') ? this.adNetworks.push(NetworkSettings.Adsense.loadAdFromJson(adNetwork)) : this.adNetworks.push(NetworkSettings.CustomAdNetwork.loadAdFromJson(adNetwork));
			}.bind(this));
		},
		loadAdRecover: function(adRecover) {
			this.adRecover = _.extend(adRecover, {});
		},
		loadAdRecoverApConfigs: function(apConfigs) {
			var isAdRecover = (typeof apConfigs.adRecover !== 'undefined');

			if (typeof this.apConfigs.adRecover === 'undefined') {
				this.apConfigs.adRecover = {};
			}

			this.apConfigs.adRecover.mode = (isAdRecover && apConfigs.adRecover.mode) ? apConfigs.adRecover.mode : CommonConsts.enums.site.modes.DRAFT;
			this.apConfigs.adRecover.pageGroupPattern = (isAdRecover && apConfigs.adRecover.pageGroupPattern) ? apConfigs.adRecover.pageGroupPattern : [];
		},
		loadAudiences: function(audiences) {
			_(audiences).each(function(audience) {
				this.audiences.push(Audience.parseFromString(audience.name, audience.defination, audience.id));
			}.bind(this));
		},
		loadCmsInfo: function(info) {
			if (info.cmsName) {
				this.cmsInfo.cmsName = info.cmsName;
			}
			_(info.pageGroups).map(function(props) {
				this.cmsInfo.pageGroups.push({ pageGroup: props.pageGroup, sampleUrl: props.sampleUrl });
			}.bind(this));
			this.emit('change');
		},
		savePageGroup: function(payload) {
			var pg = _(this.cmsInfo.pageGroups).findWhere({ pageGroup: payload.pageGroup });
			if (!pg) {
				this.cmsInfo.pageGroups.push({ pageGroup: payload.pageGroup, sampleUrl: payload.sampleUrl });
				this.emit('change');
			} else if (pg.sampleUrl !== payload.sampleUrl) {
				pg.sampleUrl = payload.sampleUrl;
				this.emit('change');
			}
		},
		getAudienceById: function(id) {
			return _.find(this.audiences, function(audience) { return id === audience.id; });
		},
		getAudienceByName: function(name) {
			return _.find(this.audiences, function(audience) { return name === audience.name; });
		},

		addAudience: function(payload) {
			if (this.getAudienceByName(payload.name)) {
				return true;
			}
			var a = Audience.parseFromString(payload.name, payload.defination);
			this.audiences.push(a);
			this.emit('change');
		},
		setActiveAudience: function(payload) {
			this.activeAudience = this.getAudienceById(payload.id);
			this.emit('change');
		},
		modifyAudience: function(payload) {
			var audience = this.getAudienceById(payload.id);
			if (!audience) {
				return false;
			}
			audience.setName(payload.name);
			audience.setRootCondition(payload.defination);
			this.activeAudience = null;
			this.emit('change');
		},

		onRemoveAudience: function(payload) {
			this.audiences = _.reject(this.audiences, { id: payload.audienceId });
			this.emit('change');
		},
		getAvailableAdSizes: function() {
			var adSizes = [], existingRec = null, test = null;
			function uniqueMerge(sizes1, sizes2) {
				_.each(sizes2, function(sizeProps) {
					test = { width: sizeProps.width, height: sizeProps.height };
					if (!_(sizes1).findWhere(test)) {
						sizes1.push(test);
					}
				});
			}
			_(this.adNetworks).map(function(network) {
				_(network.supportedSizes).map(function(rec) {
					existingRec = _(adSizes).findWhere({ layoutType: rec.layoutType });
					existingRec ? uniqueMerge(existingRec.sizes, rec.sizes) : adSizes.push($.extend(true, [], rec)/* Store copy of data not reference,  otherwise modification will lead to change in main data*/);
				});
			});
			return adSizes;
		},
		changeSiteMode: function(payload) {
			this.apConfigs.mode = payload.mode;
			this.emit('change');
		},
		changeApConfigs: function(payload) {
			if (payload.configs.trafficDistribution && (Object.keys(payload.configs.trafficDistribution).length > 0)) {
				this.apConfigs.trafficDistribution = $.extend(true, {}, payload.configs.trafficDistribution);
			}

			$.extend(true, this.apConfigs, payload.configs);
			this.emit('change');
		},
		changeAdpushupPercentage: function(payload) {
			this.apConfigs.adpushupPercentage = payload.adpushupPercentage;
			this.emit('change');
		},
		masterSave: function() {
			this.savingStatus = CommonConsts.enums.status.PENDING;
			this.emit('change');
		},
		masterSaveSuccess: function() {
			this.savingStatus = CommonConsts.enums.status.SUCCESS;
			this.emit('change');
		},
		masterSaveFailure: function() {
			this.savingStatus = CommonConsts.enums.status.FAILED;
			this.emit('change');
		},
		resetSaveStatus: function() {
			this.savingStatus = null;
			this.emit('change');
		},
		getState: function() {
			return {
				loadingStatus: this.loadingStatus,
				apConfigs: this.apConfigs,
				audiences: this.audiences,
				adNetworks: this.adNetworks,
				adRecover: this.adRecover,
				account: this.account,
				adSizes: this.getAvailableAdSizes(),
				savingStatus: this.savingStatus,
				cmsInfo: this.cmsInfo,
				apex: this.apex
			};
		},
		toJSONClean: function() {
			var audiences = [], channels = [], adNetworks = [];

			// adudiences
			this.audiences.forEach(function(audience) {
				audiences.push(audience.toJSON());
			});

			// adNetworks
			this.adNetworks.forEach(function(network) {
				adNetworks.push(network.toJSON());
			});


			// clean channels before we compare them to earlier saved json as many things can be different due to tricking
			channels = this.flux.store(Stores.CHANNEL_STORE).toCleanJSON();


			return {
				siteDomain: window.ADP_SITE_DOMAIN,
				audiences: audiences,
				adNetworks: adNetworks,
				apConfigs: this.apConfigs,
				actions: this.flux.store(Stores.ACTION_STORE).siteActionsToJSON(),
				channels: channels
			};
		},
		toJSON: function() {
			var audiences = [], channels = [], channelList = [], ads = [], adNetworks = [];

			// adudiences
			this.audiences.forEach(function(audience) {
				audiences.push(audience.toJSON());
			});

			// adNetworks
			this.adNetworks.forEach(function(network) {
				var json = (network.toServerJSON) ? network.toServerJSON() : network.toJSON();
				adNetworks.push(json);
			});


			// channels
			channels = this.flux.store(Stores.CHANNEL_STORE).toJSON();

			// ads
			_(channels).each(function(channel) {
				channelList.push(channel.platform + ':' + channel.pageGroup);

				_(channel.sections).each(function(section) {
					ads = ads.concat(section.ads);
					section.ads = Utils.pluckMany(section.ads, 'variationName', 'css');
				});

				if (!Array.isArray(channel.incontentSettings.ads)) {
					return true;
				}

				ads = ads.concat(channel.incontentSettings.ads);
				channel.incontentSettings.ads = _.map(channel.incontentSettings.ads, function(ad) {
					return { width: parseInt(ad.width, 10), height: parseInt(ad.height, 10), variationName: ad.variationName };
				});
			});

			ads = _.flatten(ads);
			this.ads = []; // make sure to empty this, other wise saving again and again will only add things inside this array.
			_(ads).each(function(Ad) {
				if (typeof Ad.variationName !== 'undefined') {
					if (!(_(this.ads).findWhere({ variationName: Ad.variationName }))) {
						if (Ad.css) delete (Ad.css);// these ads are meant for main repository and hence we don't need section css to be there..

						/**
						 * TODO: Remove all (size.height & size.width) occurrences and add height
						 * and width properties at root 'ad' object level inside 'ads' array
						 * Refer site couchbase document, key = site::<num>
						 */
						if (Ad.hasOwnProperty('size')) {
							delete (Ad.size);
						}

						this.ads.push(Ad);
					}
				}
			}.bind(this));

			return {
				siteId: window.ADP_SITE_ID,
				siteDomain: window.ADP_SITE_DOMAIN,
				apConfigs: this.apConfigs,
				cmsInfo: this.cmsInfo,
				audiences: audiences,
				adNetworks: adNetworks,
				channelList: channelList,
				ads: this.ads,
				actions: this.flux.store(Stores.ACTION_STORE).siteActionsToJSON(),
				channels: channels
			};
		}
	});

	return SiteStore;
})();
