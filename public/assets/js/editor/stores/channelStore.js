var _ = require("libs/third-party/underscore"),
    $ = window.jQuery,
    Fluxxor = require("libs/third-party/fluxxor"),
    CommonConsts = require("../commonConsts"),
    Stores = CommonConsts.enums.stores,
    Utils = require("libs/custom/utils"),
    Notification = require("libs/custom/notification"),
    Messenger = require("libs/custom/messenger"),
    LocalStore = require("../localStore");

module.exports = (function (_, Notification, CommonConsts, Fluxxor, Utils, Messenger, LocalStore) {
    var Channel = function (config) {
        this.id = config.id || 'temp_' + Utils.getRandomNumber();
        this.channelName = config.channelName;
        this.siteDomain = window.ADP_SITE_DOMAIN;
        this.platform = config.platform;
        this.pageGroup = config.pageGroup;
        this.tags = {
            "pageGroup": config.pageGroup
        };
        this.adNetworkSettings = config.adNetworkSettings || [];
        this.sampleUrl = config.sampleUrl;
        this.useAlternateProxy = config.useAlternateProxy || false;
        this.forceSampleUrl = config.forceSampleUrl || false;
        this.isAdRecover = config.isAdRecover || false;
        this.createTs = config.createTs || Math.floor(Date.now() / 1000);
        this.updateTs = Math.floor(Date.now() / 1000);
        this.currentUrlCount = 0;
        this.customJs = config.customJs || {
            beforeAp: null,
            afterAp: null
        };
        this.unsavedChanges = false;
        this.loading = true;
        this.defaultIncontentSettings = {
            ads: [],
            adAwareness: false,
            equidistantPointers: false,
            imageCheck: true,
            maxOffset: 2000,
            maxPlacements: 5,
            minPlacements: 3,
            minDistance: 400,
            blackListFloat: [],
            ignoreRanges: [],
            ignoreXpath: [],
            pointerSelectors: ["p", "*:block:height(>70):width(>70)"],
            contentSelector: "[id^=_ap_wp_content_start]",
            sizes: [],
            margins: {
                "left": {"margin-top": "8", "margin-right": "8", "margin-bottom": "8", "margin-left": "0"},
                "center": {"margin-top": "8", "margin-right": "auto", "margin-bottom": "8", "margin-left": "auto"},
                "right": {"margin-top": "8", "margin-right": "0", "margin-bottom": "8", "margin-left": "8"}
            },
            customJs: ""
        };
        this.incontentSettings = $.extend(true, this.defaultIncontentSettings, config.incontentSettings);

        if(!Array.isArray(this.incontentSettings.ads)){//due to a bug we changed ads in to object which caused error in e3 so this check it to convert all the docs back into array
            this.incontentSettings.ads = []
        }
        if(Array.isArray(this.incontentSettings.adSettings)){//due to a bug we changed ads in to object which caused error in e3 so this check it to convert all the docs back into array
            if(this.incontentSettings.adSettings.length){
                this.incontentSettings.ads = this.incontentSettings.adSettings[0].ads || [];
                delete this.incontentSettings.adSettings;
            }
        }

        this.notifications = [];
        this.statsStatus = CommonConsts.enums.status.NOT_LOADED;
    };

    Channel.prototype.populate = function (payload) {
        var props;
        for (props in this) {
            if (this.hasOwnProperty(props) && typeof payload[props] != 'undefined') {
                this[props] = payload[props];
            }
        }
        return this;
    };

    Channel.prototype.getNetworkSettings = function (network) {
        return _(this.adNetworkSettings).findWhere({networkName: network});
    }

    Channel.prototype.setNetworkSettings = function (network, settings) {
        var obj = this.getNetworkSettings(network);
        if (!settings.hasOwnProperty("networkName")) {
            settings.networkName = network;
        }
        if (obj) {
            obj = settings;
        } else {
            this.adNetworkSettings.push(settings);
        }
    }

    Channel.prototype.toJSON = function (flux) {
        var incontentServerActions = LocalStore.loadServerChannel(this.id),
            json = {
                id: this.id,
                siteDomain: this.siteDomain,
                channelName: this.channelName,
                platform: this.platform.toUpperCase(),
                pageGroup: this.pageGroup.toUpperCase(),
                tags: this.tags,
                sampleUrl: this.sampleUrl,
                useAlternateProxy: this.useAlternateProxy,
                forceSampleUrl: this.forceSampleUrl,
                isAdRecover: this.isAdRecover,
                createTs: this.createTs,
                updateTs: this.updateTs,
                customJs: this.customJs,
                adNetworkSettings: this.adNetworkSettings,
                reTriggerAutoAnalysis: false,
                actions: flux.store(Stores.ACTION_STORE).channelActionsToJSON(this.id),
                sections: flux.store(Stores.SECTION_STORE).channelSectionsToJSON(this.id),
                incontentActions: flux.store(Stores.ACTION_STORE).channelIncontentSectionActionsToJSON(this.id),
                incontentSettings: this.incontentSettings
            };
        json.incontentSettings.ads = flux.store(Stores.ACTION_STORE).getChannelIncontentSectionAds(this.id);
        return json;
    },

    Channel.prototype.toCleanJSON = function (flux) {//This method provides a stable state of JSON as we discard the variable which changes due to trickling from site level

        var sections = _(flux.store(Stores.SECTION_STORE).channelSectionsToJSON(this.id)).map(function (section) {
            delete section['ads']; //this is product and doesn't indicate that we have changes at channel or section end, even site level change can make changes to this variable hence delete it
            return section;
        });

        if (this.incontentSettings.ads) {
            delete this.incontentSettings.ads;
        }

        return {
            id: this.id,
            siteDomain: this.siteDomain,
            channelName: this.channelName,
            platform: this.platform.toUpperCase(),
            pageGroup: this.pageGroup.toUpperCase(),
            tags: this.tags,
            sampleUrl: this.sampleUrl,
            useAlternateProxy: this.useAlternateProxy,
            forceSampleUrl: this.forceSampleUrl,
            isAdRecover: this.isAdRecover,
            createTs: this.createTs,
            updateTs: this.updateTs,
            customJs: this.customJs,
            adNetworkSettings: this.adNetworkSettings,
            actions: flux.store(Stores.ACTION_STORE).channelActionsToJSON(this.id),
            sections: sections || [],
            incontentActions: flux.store(Stores.ACTION_STORE).channelIncontentSectionActionsToJSON(this.id),
            incontentSettings: this.incontentSettings
        }
    }

    Channel.prototype.getPersonalMessanger = function () {
        var channelFrame = $('iframe[data-adpid="iframe' + this.id + '"]').get(0);
        if (!channelFrame)
            return false;
        if (!this.messenger) {
            this.messenger = new Messenger();
        }
        this.messenger.setTarget(channelFrame.contentWindow);
        return this.messenger;
    }

    var channelStore = Fluxxor.createStore({
        initialize: function (config) {
            var CM = CommonConsts.enums.actions.channelManager;

            this.channels = [];
            this.openChannels = [];
            this.activeChannel = null;
            this.loading = false;
            this.notifications = [];
            this.debugCounter = 0;
            this.messenger = config.messenger;

            this.bindActions(
                CommonConsts.enums.actions.siteManager.LOAD_SITE, this.loadChannels,
                CommonConsts.enums.actions.siteManager.CREATE_DEFAULTS, this.createDefaults,

                CM.LOAD_CHANNEL, this.loadChannel,
                CM.UNLOAD_CHANNEL, this.unLoadChannel,
                CM.UNLOAD_CHANNELS_SUCCESS, this.unLoadChannelSuccess,

                CM.LOAD_STATS, this.loadStats,
                CM.STATS_FAILED, this.onStatsFailed,
                CM.STATS_LOADED, this.onStatsSuccess,

                CM.DELETE_CHANNEL, this.onDeleteChannel,
                CM.DELETE_CHANNEL_SUCCESS, this.onDeleteChannelSuccess,
                CM.DELETE_CHANNEL_FAIL, this.onDeleteChannelFail,

                CM.CREATE_CHANNEL, this.createChannel,
                CM.UPDATE_CHANNEL, this.onUpdateChannel,

                CM.SAVE_CHANNEL, this.onSaveChannel,
                CM.SAVE_CHANNEL_SUCCESS, this.onSaveChannelSuccess,
                CM.SAVE_CHANNEL_FAIL, this.onSaveChannelFail,

                CM.OPEN_CHANNEL, this.onOpenChannel,
                CM.OPEN_CHANNEL_SUCCESS, this.onOpenChannelSuccess,
                CM.OPEN_CHANNEL_FAIL, this.onOpenChannelFail,

                CM.CLOSE_CHANNEL, this.onCloseChannel,
                CM.SET_ACTIVE_CHANNEL, this.setActiveChannel,

                CM.SET_NETWORK_DEFAULT_SETTINGS, this.setNetworkDefaultSettings,
                CM.SET_NETWORK_DEFAULT_SETTINGS_ALL_CHANNEL, this.setNetworkDefaultSettingsForAllChannels,
                CM.SET_NETWORK_SETTINGS, this.setDefaultNetworkSettingsForChannel,

                CM.EDIT_SAMPLE_URL, this.changeSampleUrl,
                CM.CHANGE_CONTENT_SELECTOR, this.changeContentSelector,

                CM.SAVE_BEFORE_AFTER_JS, this.saveBeforeAfterJs,
                CM.SAVE_AUTO_ANALYSIS_SETTINGS, this.saveAutoAnalysisSettings,

                CM.SHOW_LOADER, this.showLoader,
                CM.HIDE_LOADER, this.hideLoader,

                CM.SET_INCONTENT_CUSTOM_JS, this.setIncontentCustomJs
            );
        },

        emitChange: function (debug) {
            if (this.debugCounter) {
                debug = debug || {"breakpoint": false, "payload": null};
                if (debug.breakpoint) {
                    debugger;
                }
                console.log({
                    "Id": this.debugCounter,
                    "Component": "CM",
                    "State": this.getState(),
                    "Payload": debug.payload,
                    "Emitter": arguments.callee.caller.prototype
                });
                this.debugCounter++;
            }

            this.emit("change");
        },
        setDefaultNetworkSettingsForChannel: function (payload) {
            var allNetworks = this.flux.store(Stores.ACTION_STORE).getSiteLevelAdnetworks(),
                networkProps;

            _(allNetworks).each(function (network) {
                networkProps = this.flux.store(Stores.SITE_STORE).getAdNetworkByName(network.key);
                if (networkProps && !payload.channel.getNetworkSettings(networkProps.name))
                    payload.channel.setNetworkSettings(networkProps.name, {adLimit: networkProps.maxAdsToDisplay});
            }.bind(this))
        },

        setNetworkDefaultSettingsForAllChannels: function (payload) {
            var network = this.flux.store(Stores.SITE_STORE).getAdNetworkByName(payload.network);
            if (!network)
                return false;

            _(this.channels).each(function (channel) {
                this.setNetworkDefaultSettings({network: payload.network, channel: channel})
            }.bind(this))
        },


        setNetworkDefaultSettings: function (payload) {
            var network = this.flux.store(Stores.SITE_STORE).getAdNetworkByName(payload.network),
                channel = payload.channel || this.getChannelById(payload.channelId);

            if (!network || !channel)
                return false;

            var settings = channel.getNetworkSettings(payload);
            if (!settings)
                channel.setNetworkSettings(network.name, {adLimit: network.maxAdsToDisplay});
            else if (!settings.adLimit) {
                settings.adLimit = network.maxAdsToDisplay;
            }

        },

        getChannelById: function (id) {
            return (_(this.channels).findWhere({id: id}));
        },
        getChannelByPlatformAndPageGroup: function (platform,pageGroup) {
            return (_(this.channels).findWhere({platform: platform.toUpperCase(),pageGroup: pageGroup.toUpperCase()}));
        },
        createDefaults: function () {
            this.waitFor([Stores.SITE_STORE, Stores.ACTION_STORE], function (SiteStore, ActionsStore) {
                var network = SiteStore.getAdNetworkByName("ADSENSE");
                if (!network)
                    return false;

                _(this.channels).each(function (channel) {
                    this.setNetworkDefaultSettings({network: network, channel: channel});
                }.bind(this));

            }.bind(this))
        },
        loadChannels: function (payload) {
            this.waitFor([Stores.SITE_STORE], function (SiteStore) {
                _(payload.channels).each(function (channelJSON) {
                    this.createChannel(channelJSON, false)
                }.bind(this))

            }.bind(this))
        },

        loadChannel: function (payload) {//called when we need to load channel individually, like when we want to discard changes in channel and load channel previous state from local storage
            this.createChannel(payload.channelJSON, false)
        },

        unLoadChannel: function (payload) {
            this.channels = _(this.channels).reject({id: payload.channel.id});
            this.emitChange(payload);
        },
        unLoadChannelSuccess: function (payload) {

        },

        onDeleteChannel: function (payload) {
            payload.channel.loading = true;
            this.emitChange({"payload": payload});
        },

        onDeleteChannelSuccess: function (payload) {
            if (this.openChannels.length) {
                this.setActiveChannel({"channel": this.openChannels[this.openChannels.length - 1]});
            }
            this.emitChange({"payload": payload});
        },

        onDeleteChannelFail: function (payload) {
            payload.channel.loading = false;
            payload.channel.notifications.push(new Notification("Error", "Unable to delete channel.", "error"));
            this.emitChange({"payload": payload});
        },

        createChannel: function (payload, misc) {
            if (!payload.channelName) {
                //this.notifications.push(new Notification("Empty Channel Name", "Channel name cannot be empty.", "error"));
                this.emitChange({"payload": payload});
                return false;
            }

            if (!this.channels.length && !payload.id) { //when new channel is created (not loaded) then show guider
                setTimeout(function () {
                    this.flux.actions.showComponent(CommonConsts.enums.components.AD_INSERTION_GUIDER);
                }.bind(this), 0)
            }

            if (_(this.channels).findWhere({channelName: payload.channelName})) {
                this.notifications.push(new Notification("Duplicate Channel Name", "Please enter another channel name.", "error"));
                this.emitChange({"payload": payload});
                return false;
            }

            var channel = new Channel(payload);
            this.channels.push(channel);
            if (misc !== false) {
                this.openChannels.push(channel);
                this.setActiveChannel({"channel": channel})
            }

            if (!payload.id)//if new channel then set network default for that channel
                this.setDefaultNetworkSettingsForChannel({channel: channel});

            this.emitChange({"payload": payload});
        },

        onUpdateChannel: function (payload) {
            payload.channel.populate(payload.updates);

            //ToDo-Diff the changes.
            payload.channel.unsavedChanges = true;
            this.emitChange({"payload": payload});
        },

        onSaveChannel: function (payload) {
            payload.channel.loading = true;
            this.emitChange({"payload": payload});
        },

        onSaveChannelSuccess: function (payload) {
            payload.channel.loading = false;
            payload.channel.unsavedChanges = false;
            payload.channel.notifications.push(new Notification("Success", "Channel saved successfully.", "success"));
            this.emitChange({"payload": payload});
        },

        onSaveChannelFail: function (payload) {
            payload.channel.loading = false;
            payload.channel.notifications.push(new Notification("Error", "Unable to save channel.", "error"));
            this.emitChange({"payload": payload});
        },

        onOpenChannel: function (payload) {
            var channel = payload.channel;
            if (this.openChannels.indexOf(channel) === -1) {
                channel.loading = true;
                this.openChannels.push(channel);
                this.setActiveChannel({"channel": channel});
                this.emitChange({"payload": payload});
            } else {
                this.setActiveChannel({"channel": channel});
            }
        },

        showLoader: function (payload) {
            var channel = this.getChannelById(payload.channelId);
            if (!channel)
                return false;

            channel.loading = true;
            this.emit("change");
        },

        hideLoader: function (channel) {
            var channel = this.getChannelById(payload.channelId);
            if (!channel)
                return false;

            channel.loading = false;
            this.emit("change");
        },

        onOpenChannelSuccess: function (payload) { //when document ready is called from iframe then this call back is called
            var channel = _(this.channels).findWhere({id: payload.channel})
            if (!channel)
                return false;

            if (this.activeChannel == channel) {
                this.setMessengerTarget(channel);
            }
            this.setUpChannel(channel);
            channel.loading = false;
            this.emitChange({"payload": payload});
        },

        setUpChannel: function (channel) {
            var sections = this.flux.store(Stores.SECTION_STORE).getChannelSection(channel.id);
            _(sections).each(function (section) {
                var sectionActions = this.flux.store(Stores.ACTION_STORE).getSectionActions(section.id),
                    sizeActions = _(sectionActions).filter({key: CommonConsts.enums.actionManager.actions.SIZES});
                _(sizeActions).each(function (action) {
                    _(action.value).each(function (props) {
                        channel.getPersonalMessanger().sendMessage(ADP.enums.messenger.INSERT_AD, {
                            operation: section.operation,
                            selector: section.xpath,
                            sectionData: section.sectionData,
                            sectionId: section.id,
                            adSize: props.data,
                            audienceId: action.audienceId
                        });
                    }.bind(this))
                }.bind(this))
            }.bind(this));

            //Setup Incontent Area
            channel.getPersonalMessanger().sendMessage(ADP.enums.messenger.PREPARE_IN_CONTENT_AREA, {
                selector: channel.incontentSettings.contentSelector
            })

            if (channel.isAdRecover) {
                //Inject Ad Recover JS
                channel.getPersonalMessanger().sendMessage(ADP.enums.messenger.INJECT_ADRECOVERJS, {});
            }
        },

        onOpenChannelFail: function (payload) {
            payload.channel.loading = false;
            payload.channel.notifications.push(new Notification("Error", "Unable to open channel.", "error"));
            this.emitChange({"payload": payload});
        },

        setMessengerTarget: function (channel) {
            var channelFrame = $('iframe[data-adpid="iframe' + channel.id + '"]').get(0);
            if (channelFrame) {
                this.messenger.setTarget(channelFrame.contentWindow);
            }
        },

        onCloseChannel: function (payload) {
            if (payload.channel.unsavedChanges) {
                payload.channel.notifications.push(new Notification("Warning", "You have unsaved changes.", "warning"));
                return false;
            }
            this.openChannels.splice(this.openChannels.indexOf(payload.channel), 1);
            if (this.openChannels.length) {
                this.setActiveChannel({"channel": this.openChannels[this.openChannels.length - 1]});
            } else {
                this.setActiveChannel({"channel": null});
            }
            this.emitChange({"payload": payload});
        },

        setActiveChannel: function (payload) {
            if (!payload.channel)
                return false;

            this.activeChannel = payload.channel;
            this.setMessengerTarget(payload.channel);
            this.emitChange({"payload": payload});
        },

        toJSON: function () {
            var json = [];
            this.channels.forEach(function (channel) {
                json.push(channel.toJSON(this.flux))
            }.bind(this))
            return json;

        },

        toCleanJSON: function () { //this method provides predictable json and contains no such variable which can be changed due to trickling at any level
            var json = [];
            this.channels.forEach(function (channel) {
                json.push(channel.toCleanJSON(this.flux))
            }.bind(this))
            return json;

        },
        changeSampleUrl: function (payload) {
            payload.channel.sampleUrl = payload.sampleUrl;
            payload.channel.useAlternateProxy = payload.useAlternateProxy;
            payload.channel.forceSampleUrl = payload.forceSampleUrl;
            this.emitChange(payload);
        },
        changeContentSelector: function (payload) {
            payload.channel.incontentSettings.contentSelector = payload.selector;
            payload.channel.getPersonalMessanger().sendMessage(ADP.enums.messenger.PREPARE_IN_CONTENT_AREA, {
                selector: payload.selector
            })
            this.emitChange(payload)
        },
        setIncontentCustomJs: function (payload) {
            var channel = this.getChannelById(payload.channelId)
            if(!channel)
                return false;
            if(payload.code)
                channel.incontentSettings.customJs = payload.code
        },
        saveBeforeAfterJs: function(payload){
            var channel = this.getChannelById(payload.channelId)
            if(!channel)
                return false;
            if(payload.type == "beforeAp")
                channel.customJs.beforeAp = payload.code;
            else
                channel.customJs.afterAp = payload.code;

        },
        saveAutoAnalysisSettings: function(payload) {
            payload.channel.incontentSettings = $.extend(true, {}, payload.model);
            payload.channel.getPersonalMessanger().sendMessage(ADP.enums.messenger.PREPARE_IN_CONTENT_AREA, {
                selector: payload.model.contentSelector
            });
            
            this.emit("change");
        },
        loadStats: function (payload) {
            var channel = this.getChannelById(payload.channelId);
            if(channel){
                channel.statsStatus = CommonConsts.enums.status.LOADING;
                this.emitChange(payload);
            }
        },
        onStatsFailed: function (payload) {
            var channel = this.getChannelById(payload.channelId);
            if(channel){
                channel.statsStatus = CommonConsts.enums.status.FAILED;
                this.emitChange(payload);
            }
        },
        onStatsSuccess: function (payload) {
            var channel = this.getChannelById(payload.channelId);
            if(channel && channel.statsStatus == CommonConsts.enums.status.LOADING){
                channel.statsStatus = CommonConsts.enums.status.LOADED;
            }else{
                channel.statsStatus = CommonConsts.enums.status.FAILED;
            }
        },
        getState: function () {
            return {
                channels: this.channels,
                openChannels: this.openChannels,
                activeChannel: this.activeChannel,
                loading: this.loading,
                notifications: this.notifications
            };
        }

    });

    return channelStore;
})
(_, Notification, CommonConsts, Fluxxor, Utils, Messenger, LocalStore);
