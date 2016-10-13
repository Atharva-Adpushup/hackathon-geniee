var CommonConsts = require('./commonConsts'),
	DataSyncService = require('./dataSyncService'),
	$ = window.jQuery,
	Utils = require('libs/custom/utils'),
	_ = require('libs/third-party/underscore'),
	LocalStore = require('./localStore');

module.exports = (function(CommonConsts, DataSyncService, $, Utils, _, LocalStore) {
	var a = CommonConsts.enums.actions,
		actions = {

			/* Site Actions */
			loadSite: function(messenger) {
				this.messenger = messenger;

				this.dispatch(a.siteManager.LOAD_SITE_START);


				DataSyncService.request([$.getJSON('/data/getData?siteId=' + window.ADP_SITE_ID)], function(data) {
					if (!data || typeof data !== 'object') { // some how some unexpected error
						this.dispatch(a.siteManager.LOAD_SITE_FAILURE);
					} else if (data.firstTime === true) {// Site Loading first time in editor
						this.dispatch(a.siteManager.CREATE_DEFAULTS); // create defaults
						this.dispatch(a.siteManager.LOAD_SITE, data);
						this.dispatch(a.siteManager.LOAD_SITE_SUCCESS); // site loading completed
					} else {// Load site in editor
						LocalStore.saveServerData(data).then(function() {// save data in localstorage
							if (data.site) {
								this.dispatch(a.siteManager.LOAD_SITE, data); // Dispatch command to load site
								this.dispatch(a.siteManager.LOAD_SITE_SUCCESS); // site loading completed
							} else {
								this.dispatch(a.siteManager.LOAD_SITE_FAILURE);
								console.log("server json doesn't contain site object", data);
							}
						}.bind(this), function() {
							this.dispatch(a.siteManager.LOAD_SITE_FAILURE);
							console.log('Error saving server data in localstorage', data);
						});
					}
				}.bind(this), function(data) {// failure in ajax due to some reason
					this.dispatch(a.siteManager.LOAD_SITE_FAILURE);
					console.log('error loading data', data);
				}.bind(this));
			},

			addAudience: function(name, defination) {
				this.dispatch(a.siteManager.ADD_AUDIENCE, { name: name, defination: defination });
			},
			modifyAudience: function(id, name, defination) {
				this.dispatch(a.siteManager.MODIFY_AUDIENCE, { id: id, name: name, defination: defination });
			},
			setActiveAudience: function(id) {
				this.dispatch(a.siteManager.SET_ACTIVE_AUDIENCE, { id: id });
			},
			resetSaveStatus: function() {
				this.dispatch(a.siteManager.RESET_SAVE_STATUS, {});
			},
			masterSave: function(viaMode, mode) {
				if (viaMode) {
					this.dispatch(a.siteManager.CHANGE_SITE_MODE, { mode: mode });
				}

				var site = this.flux.store('SiteStore');
				LocalStore.saveLoadedData(site.toJSONClean());// save data in local storage so that it can be used in future for comparison
				var json = site.toJSON();

				try {
					analytics.track('EDITOR_SavedSite', {
						siteDomain: window.ADP_SITE_DOMAIN,
						siteId: window.ADP_SITE_ID,
						mode: (json.apConfigs.mode === CommonConsts.enums.site.modes.PUBLISH) ? 'Publish' : 'Draft',
						channels: json.channels.length,
						adpushupPercentage: json.apConfigs.adpushupPercentage,
						uniqueAds: json.ads.length,
						IS_ADMIN: window.ADP_IS_ADMIN
					}, intercomObj);
				} catch (e) { }

				this.dispatch(a.siteManager.MASTER_SAVE, {});
				DataSyncService.masterSave(json).then(function(response) {
					response.success ? this.dispatch(a.siteManager.MASTER_SAVE_SUCCESS, {}) : this.dispatch(a.siteManager.MASTER_SAVE_FAIL, {});
				}.bind(this),
					function(response) {
						this.dispatch(a.siteManager.MASTER_SAVE_FAIL, {});
					}.bind(this));
			},
			changeMode: function(mode) {
				analytics.track('EDITOR_ModeChanged', {
					siteDomain: window.ADP_SITE_DOMAIN,
					mode: (mode === 1) ? 'Publish' : 'Draft',
					IS_ADMIN: window.ADP_IS_ADMIN
				}, intercomObj);

				this.flux.actions.masterSave(true, mode);
			},
			saveApConfigs: function(configs) {
				analytics.track('EDITOR_ChangedPercentage', {
					siteDomain: window.ADP_SITE_DOMAIN,
					percent: configs.adpushupPercentage,
					IS_ADMIN: window.ADP_IS_ADMIN
				}, intercomObj);
				this.dispatch(a.siteManager.CHANGE_AP_CONFIGS, { configs: configs });
			},
			updateApConfigs: function(configs) {
				this.dispatch(a.siteManager.CHANGE_ADRECOVER_CONFIGS, { configs: configs });
				this.flux.actions.masterSave(configs.adRecover.mode);
			},
			addCustomSizeToAdsense: function(width, height) {
				this.dispatch(a.siteManager.ADD_SIZE_TO_ADSENSE, { layout: CommonConsts.enums.adNetworks.adLayout.CUSTOM, width: width, height: height });
			},

			/** ****************************** AdNetwork Actions ***********************************/
			addCustomNetwork: function(payload) {
				this.dispatch(a.siteManager.ADD_CUSTOM_NETWORK, payload);
			},

			editNetwork: function(payload) {
				this.dispatch(a.siteManager.EDIT_NETWORK, payload);
			},

			addVariationsToNetwork: function(payload) {
				this.dispatch(a.siteManager.ADD_VARIATION_TO_NETWORK, payload);
			},

			addAdsense: function(payload) {
				this.dispatch(a.siteManager.ADD_ADSENSE_NETWORK, payload);
			},

			saveAdsenseSettings: function(payload) {
				this.dispatch(a.siteManager.SAVE_ADSENSE_ESSENTIALS, payload);
			},

			// ///////////////////////////////////// Channel Actions ///////////////////////////////////////

			setNetworkDefaultSettings: function(payload) {
				this.dispatch(a.channelManager.SET_NETWORK_DEFAULT_SETTINGS, payload);
			},

			setNetworkDefaultSettingsForAllChannels: function(payload) {
				this.dispatch(a.channelManager.SET_NETWORK_DEFAULT_SETTINGS_ALL_CHANNEL, payload);
			},
			discardChangesCloseChannel: function(channel) {
				this.dispatch(a.contextMenu.HIDE_COMPONENT);
				this.dispatch(a.channelManager.CLOSE_CHANNEL, { channel: channel });
				this.dispatch(a.channelManager.UNLOAD_CHANNEL, { channel: channel });
				var localChannelJSON = LocalStore.loadChannel(channel.id);
				if (localChannelJSON) {
					this.dispatch(a.channelManager.LOAD_CHANNEL, { channelJSON: localChannelJSON });
				}
			},
			deleteChannel: function(channel) {
				this.dispatch(a.contextMenu.HIDE_COMPONENT);
				this.dispatch(a.channelManager.DELETE_CHANNEL, { channel: channel });
				DataSyncService.deleteChannel(channel.platform, channel.pageGroup).then(
					function(response) {
						if (response.success) {
							analytics.track('EDITOR_DeleteChannel', {
								siteDomain: window.ADP_SITE_DOMAIN,
								IS_ADMIN: window.ADP_IS_ADMIN
							}, intercomObj);
							LocalStore.deleteChannel(channel.id);
							this.dispatch(a.channelManager.CLOSE_CHANNEL, { channel: channel });
							this.dispatch(a.channelManager.UNLOAD_CHANNEL, { channel: channel });
							this.dispatch(a.channelManager.DELETE_CHANNEL_SUCCESS, { channel: channel });
						} else {
							this.dispatch(a.channelManager.DELETE_CHANNEL_FAIL, { channel: channel });
						}
					}.bind(this),
					function() {
						this.dispatch(a.channelManager.DELETE_CHANNEL_FAIL, { channel: channel });
					}.bind(this)
				);
			},
			saveChangesCloseChannel: function(channel) {
				analytics.track('EDITOR_SavedClosedChannel', {
					siteDomain: window.ADP_SITE_DOMAIN,
					IS_ADMIN: window.ADP_IS_ADMIN
				}, intercomObj);
				var channelJSON = channel.toCleanJSON(this.flux);
				LocalStore.saveLoadedChannel(channelJSON);
				this.dispatch(a.contextMenu.HIDE_COMPONENT);
				this.dispatch(a.channelManager.CLOSE_CHANNEL, { channel: channel });
			},
			setActiveChannel: function(channel) {
				this.dispatch(a.channelManager.SET_ACTIVE_CHANNEL, { channel: channel });
			},
			saveChannel: function(channel) {
				DataSyncService.masterSave(channel, function(data) {
				}, function() {
				});
			},
			loadChannelStats: function(channelId, pageGroup, platform) {
				this.dispatch(a.channelManager.LOAD_STATS, { channelId: channelId });
				DataSyncService.loadChannelStats(pageGroup, platform).then(function(stats) {// load stats of channel
					this.dispatch(a.channelManager.STATS_LOADED, { channelId: channelId, stats: stats });
				}.bind(this), function() {
					this.dispatch(a.channelManager.STATS_FAILED, { channelId: channelId });
					console.log('Stats Loading Failed');
				}.bind(this));
			},
			createChannel: function(payload) {
				analytics.track('EDITOR_NewChannelCreated', {
					siteDomain: window.ADP_SITE_DOMAIN,
					pageGroup: payload.pageGroup,
					platform: payload.platform,
					sampleUrl: payload.sampleUrl,
					IS_ADMIN: window.ADP_IS_ADMIN
				}, intercomObj);
				this.dispatch(a.contextMenu.HIDE_COMPONENT);
				this.dispatch(a.channelManager.CREATE_CHANNEL, payload);
			},

			openChannel: function(channel) {
				this.dispatch(a.contextMenu.HIDE_COMPONENT);
				this.dispatch(a.channelManager.OPEN_CHANNEL, { channel: channel });
			},
			openChannelSuccess: function(channel) {
				// AD_JSON.channels
				this.dispatch(a.channelManager.OPEN_CHANNEL_SUCCESS, { channel: channel });
			},
			setChannelNetworkSettings: function(channel) {
				this.dispatch(a.channelManager.SET_NETWORK_SETTINGS, { 'channel': channel });
			},

			editSampleUrl: function(channel, sampleUrl, useAlternateProxy, forceSampleUrl) {
				this.dispatch(a.channelManager.EDIT_SAMPLE_URL, { 'channel': channel, pageGroup: channel.pageGroup, sampleUrl: sampleUrl, useAlternateProxy: useAlternateProxy, forceSampleUrl: forceSampleUrl });
				this.dispatch(a.contextMenu.HIDE_CONTEXTMENU);
			},

			saveAutoAnalysisSettings: function(channel, model) {
				this.dispatch(a.channelManager.SAVE_AUTO_ANALYSIS_SETTINGS, { 'channel': channel, model: model });
			},

			changeContentSelector: function(channel, selector) {
				this.dispatch(a.channelManager.CHANGE_CONTENT_SELECTOR, { 'channel': channel, selector: selector});
			},

			loadCmsInfo: function(cmsInfo) {
				this.dispatch(a.siteManager.LOAD_CMS_INFO, cmsInfo);
			},

			saveChannelBeforeAfterJs: function(channelId, type, code) {
				this.dispatch(a.channelManager.SAVE_BEFORE_AFTER_JS, { channelId: channelId, type: type, code: code });
			},
			saveIncontentCustomJs: function(channelId, code) {
				this.dispatch(a.channelManager.SET_INCONTENT_CUSTOM_JS, { channelId: channelId, code: code });
			},

			// ///////////////////////////////////// Section Actions /////////////////////////////////////////


			addSection: function(selector, operation, adSize, audienceId, adCode) {
				this.dispatch(a.sectionManager.CREATE_SECTION, {
					selector: selector,
					operation: operation,
					adSize: adSize,
					audienceId: audienceId,
					adCode: adCode
				});
				this.dispatch(a.contextMenu.HIDE_CONTEXTMENU);
			},
			createApexIncontentSection: function(payload) {
				this.dispatch(a.sectionManager.CREATE_APEX_INCONTENT_SECTION, payload);
				this.dispatch(a.contextMenu.HIDE_CONTEXTMENU);
			},

			setSectionStyle: function(selector, styleProps) {
				this.dispatch(a.sectionManager.SET_SECTION_STYLE, { selector: selector, styleProps: styleProps });
			},

			hideAd: function(payload) {
				this.dispatch(a.sectionManager.HIDE_AD, payload);
				this.dispatch(a.contextMenu.HIDE_CONTEXTMENU);
			},

			deleteSection: function(adBox) {
				this.dispatch(a.sectionManager.DELETE_SECTION, adBox);
				this.dispatch(a.contextMenu.HIDE_CONTEXTMENU);
			},

			deleteSectionById: function(id) {
				this.dispatch(a.sectionManager.DELETE_SECTION_BYID, {id: id});
				this.dispatch(a.contextMenu.HIDE_CONTEXTMENU);
			},

			getSection: function(channelId, sectionId) {
				this.dispatch(a.sectionManager.GET_SECTION, { channelId: channelId, sectionId: sectionId });
			},

			scrollSectionToScreen: function(section) {
				this.messenger.sendMessage(CommonConsts.enums.messenger.SCROLL_SECTION_TO_SCREEN, { sectionId: section.id });
			},
			updateSection: function(payload) {
				this.dispatch(a.sectionManager.UPDATE_SECTION, payload);
			},
			getSectionAlternateXpaths: function(sectionId) {
				this.messenger.sendMessage(CommonConsts.enums.messenger.GET_SECTION_ALTERNATE_XPATHS, { sectionId: sectionId });
			},
			tryEditingXpath: function(sectionId, xpath) {
				this.messenger.sendMessage(CommonConsts.enums.messenger.TRY_EDITING_XPATH, { sectionId: sectionId, newXpath: xpath });
			},

			/** ********************* Context Menu Settings ***************************/
			showComponent: function(menu, x, y, data) {
				this.dispatch(a.contextMenu.HIDE_COMPONENT);
				this.dispatch(a.contextMenu.SHOW_COMPONENT, { menu: menu, x: x, y: y, data: data });
			},
			hideMenu: function() {
				this.dispatch(a.contextMenu.HIDE_COMPONENT);
			},

			showContextMenu: function(menuType, menuData) {
				var CM = ADP.enums.components;

				if (menuType === CM.INSERT_CONTEXTMENU)
					this.dispatch(a.contextMenu.SHOW_INSERT_CONTEXTMENU, menuData);
				else
					this.dispatch(a.contextMenu.SHOW_EDIT_CONTEXTMENU, menuData);
			},

			hideContextMenu: function() {
				this.dispatch(a.contextMenu.HIDE_CONTEXTMENU);
			},

			highlightElement: function(selector) {
				this.dispatch(a.contextMenu.HIGHLIGHT_ELEMENT, selector);
			},
			highLightAdBox: function(payload) {
				this.dispatch(a.contextMenu.HIGHLIGHT_ADBOX, payload);
			},

			selectElement: function(selector) {
				this.dispatch(a.contextMenu.SELECT_ELEMENT, selector);
			}
			,
			changeEditorMode: function(mode) {
				this.dispatch(a.contextMenu.CHANGE_EDITOR_MODE, { mode: mode });
				this.dispatch(a.contextMenu.HIDE_CONTEXTMENU);
			},
			setDebugInfo: function(info) {
				this.dispatch(a.contextMenu.DEBUG_INFO, { info: info });
			},

			showAdRecoverPopup: function(data) {
				this.dispatch(a.contextMenu.SHOW_ADRECOVER_POPUP, data);
			},

			hideAdRecoverPopup: function(data) {
				this.dispatch(a.contextMenu.HIDE_ADRECOVER_POPUP, data);
			},

			/** ****************************** Template Actions ***********************************/
			createAdsenseTemplate: function(payload) {
				this.dispatch(a.templateManager.CREATE_ADSENSE_TEMPLATE, payload);
			},
			modifyAdsenseTemplate: function(payload) {
				this.dispatch(a.templateManager.MODIFY_ADSENSE_TEMPLATE, payload);
			},


			/** ****************************** Actions Actions ***********************************/
			createAction: function(payload) {
				this.dispatch(a.actionManager.CREATE_MODIFY_ACTION, payload);
				this.dispatch(a.contextMenu.HIDE_COMPONENT);
			},

			removeSizeFromSection: function(payload) {
				this.dispatch(a.actionManager.REMOVE_SIZE_FROM_SECTION, payload);
				this.dispatch(a.contextMenu.HIDE_COMPONENT);
			},

			saveStores: function() {
				DataSyncService.saveStores();
			}
		};
	return actions;
})(CommonConsts, DataSyncService, $, Utils, _, LocalStore);
