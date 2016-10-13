var _ = require("libs/third-party/underscore"),
    Fluxxor = require("libs/third-party/fluxxor"),
    $ = window.jQuery,
    CommonConsts = require("../commonConsts"),
    Stores = CommonConsts.enums.stores,
    Utils = require("libs/custom/utils"),
    NetworkSettings = require("../adNetworkSettings");


module.exports = (function (_, CommonConsts, Fluxxor, Utils, $, NetworkSettings) {

    var privateCmds = CommonConsts.enums.actionManager.privateCommands,
        publicCmds = CommonConsts.enums.actionManager.publicCommands,
        actionLevels = CommonConsts.enums.actionManager.levels,
        actionDataTypes = CommonConsts.enums.actionManager.datatypes,
        actionStatus = CommonConsts.enums.actionManager.status,
        actionMangerActions = CommonConsts.enums.actionManager.actions;

    var Action = function (key, val, datatype, owner, ownerId, audienceId, id) {
        this.id = id || Utils.getRandomNumber();
        this.key = key;
        this.dataType = datatype;
        this.isDisabled = false;
        this.owner = owner;
        this.ownerId = (typeof ownerId == "undefined") ? null : ownerId;
        this.audienceId = parseInt(audienceId);

        switch (this.dataType) {
            case actionDataTypes.ARRAY:
                this.value = [];
                this.pushValue = function (value, status, meta) {
                    this.value.push({
                        status: status || actionStatus.APPEND,
                        data: value,
                        meta: meta || {owner: this.owner}
                    })
                }

                this.changeStatus = function (obj, status) {
                    var obj = _.find(this.value, function (val) {
                        return _.isEqual(obj, val.data);
                    });
                    if (obj) {
                        obj.status = status;
                        return true;
                    }
                    return false;
                }

                this.removeValue = function (value) {
                    this.value = _.reject(this.value, function (obj) {
                        return _.isEqual(obj.data, value);
                    });
                }

                this.getValue = function (value) {
                    return _.find(this.value, function (obj) {
                        return _.isEqual(obj.data, value);
                    });
                }
                if (Utils.isArray(val)) {
                    _(val).each(function (props) {
                        (props.status && props.data) ? this.pushValue(props.data, props.status) : this.pushValue(props);
                    }.bind(this))
                } else if (val) {
                    (val.status && val.data) ? this.pushValue(val.data, val.status) : this.pushValue(val);
                }


                break;

            case actionDataTypes.GROUP:
            case actionDataTypes.ADNETWORK:
                this.value = [];
                var checkInstance = function (obj) {
                    return (obj instanceof Action);
                }

                this.getAllActionKeys = function () {
                    return _.pluck(this.value, 'key')
                }

                this.getActionByKey = function (key) {
                    return _.find(this.value, function (action) {
                        return action.key == key
                    });
                }

                this.addAction = function (action) {
                    if (checkInstance(action) && this.value.indexOf(action) == -1 && this.getAllActionKeys().indexOf(action.key) == -1) {
                        this.value.push(action);
                        return true;
                    }
                    return false;
                }

                this.removeAction = function (action) {
                    if (this.value.indexOf(action) != -1) {
                        this.value.splice(this.value.indexOf(action), 1);
                        return true;
                    }
                    return false;
                }

                if (!val)
                    return false;

                if (val instanceof Array) {
                    for (var i = 0; i < val.length; i++) {
                        if (checkInstance(val[i]))
                            this.value.push(val[i]);
                        else {
                            this.value = null;
                            throw new Error("Only Action Type is accepted in group and Adnetwork.")
                        }
                    }
                } else if (checkInstance(val)) {
                    this.value.push(val);
                } else {
                    throw new Error("Only Action Type is accepted in group and Adnetwork")
                }

                break;

            default :
                this.value = val;

        }
    }

    Action.prototype.toggleDisable = function () {
        this.isDisabled = !this.isDisabled
    }

    Action.prototype.merge = function (anotherAction1) {
        var temp = null;
        if (!(anotherAction1 instanceof Action) || anotherAction1.key != this.key) {
            throw new Error("Merge Function Accept Same type of object in parameter");
        }
        //Use jquery extend method not clone of underscore as jquery provide deep cloning
        var anotherAction = $.extend(true, {}, anotherAction1);
        switch (this.dataType) {
            case actionDataTypes.ARRAY:
                var data = $.extend(true, [], (this.value));
                _.each(data, function (val) {
                    temp = _.find(anotherAction.value, function (valInside) {
                        return _.isEqual(valInside.data, val.data);
                    })
                    if (temp)
                        anotherAction.removeValue(temp.data);
                });
                if (anotherAction.value.length) {
                    _.each(anotherAction.value, function (val) {
                        data.push(val);
                    })
                }
                temp = new Action(this.key, [], this.dataType, this.owner, this.ownerId, this.audienceId)
                temp.value = data;
                return temp;

                break;

            case actionDataTypes.GROUP:
            case actionDataTypes.ADNETWORK:
                var data = [];
                _.each(this.value, function (action) {
                    temp = _.find(anotherAction.value, function (actionInside) {
                        return actionInside.key == action.key;
                    })
                    if (temp) {
                        data.push(action.merge(temp))
                        anotherAction.removeAction(temp);
                    } else {
                        data.push(action);
                    }
                });
                if (anotherAction.value.length) {
                    _.each(anotherAction.value, function (action) {
                        data.push(action);
                    })
                }
                return new Action(this.key, data, this.dataType, this.owner, this.ownerId, this.audienceId);
                break;

            default :
                return this;


        }
    }

    Action.prototype.toJSON = function () {
        var json = {
            id: this.id,
            key: this.key,
            dataType: this.dataType,
            isDisabled: this.isDisabled,
            owner: this.owner,
            ownerId: this.ownerId,
            audienceId: this.audienceId
        }
        if (this.dataType == actionDataTypes.GROUP || this.dataType == actionDataTypes.ADNETWORK) {
            var value = [];
            if (Array.isArray(this.value)) {
                this.value.forEach(function (action) {
                    if (action instanceof Action) {
                        value.push(action.toJSON());
                    }
                })
            }
            json.value = value;
        }
        else if (value && typeof value.toJSON !== "undefined") {
            json.value = this.value.toJSON();
        } else {
            json.value = this.value;
        }
        return json;
    }

    Action.loadFromJson = function (json) {
        var value, isAction = function (json) {
            var dummy = ["id", "key", "dataType", "isDisabled", "owner", "ownerId", "audienceId", "value"],
                t = _.intersection(Object.keys(json), dummy);
            return t.length == dummy.length;
        }

        if (json.value && Utils.isArray(json.value)) {
            value = [];
            _(json.value).each(function (val) {
                isAction(val) ? value.push(Action.loadFromJson(val)) : value.push(val)
            })
        } else if (isAction(json.value)) {
            value.push(Action.loadFromJson(json.value))
        } else {
            value = json.value;
        }
        return new Action(json.key, value, json.dataType, json.owner, json.ownerId, json.audienceId, json.id)
    }


    var ActionsStore = Fluxxor.createStore({
        initialize: function (config) {
            this.actions = [];
            this.messenger = config.messenger;

            this.activeSection = null;
            this.activeChannel = null;
            var AM = CommonConsts.enums.actions.actionManager;
            this.bindActions(
                AM.CREATE_MODIFY_ACTION, this.createModifyAction,
                AM.REMOVE_SIZE_FROM_SECTION, this.createModifyAction,

                CommonConsts.enums.actions.siteManager.LOAD_SITE, this.loadAllActions,
                CommonConsts.enums.actions.channelManager.LOAD_CHANNEL, this.loadChannelSectionActions,

                CommonConsts.enums.actions.siteManager.CREATE_DEFAULTS, this.createDefaults,
                CommonConsts.enums.actions.channelManager.UNLOAD_CHANNEL, this.unloadChannelActions
            );

        },
        createDefaults: function () {
            this.waitFor([Stores.SITE_STORE],function(SiteStore){
                var adsenseNetwork = SiteStore.getAdNetworkByName("ADSENSE"),
                    audience =  SiteStore.getAudienceByName("Default");
                if(!adsenseNetwork || !audience)
                    return;

                var adsenseAction = this.createAction(privateCmds.CREATE_DEFAULT_ADSENSE, null, actionLevels.SITE, null, audience.id);
                this.actions.push(adsenseAction);

            }.bind(this))
        },
        getNetworkNames: function(owner, ownerId, audienceId){
            return _(_(this.actions).filter({owner: owner,ownerId: ownerId || null,audienceId: audienceId,dataType:CommonConsts.enums.actionManager.datatypes.ADNETWORK})).pluck("key");
        },
        addCustomAdNetwork: function (owner, ownerId, audienceId, networkName) {
            var network = this.getActionBykey(owner, ownerId, audienceId, networkName);
            if (network)
                return false;

            network = this.createAction(privateCmds.CREATE_CUSTOM_AD_NETWORK, networkName, owner, ownerId, audienceId);
            this.actions.push(network);
            this.emit("change");
        },
        removeCustomAdNetwork: function (owner, ownerId, audienceId, networkName) {
            var network = this.getActionBykey(owner, ownerId, audienceId, networkName);
            if (!network)
                return true;
            if(this.removeAction(network)){
                this.emit("change");
            }
        },
        changeStatusCustomNetworkAdType: function (owner, ownerId, audienceId, network, adType, status) {
            var action = null,
                networkAction = this.getActionBykey(owner, ownerId, audienceId, network);
            if (!networkAction) {
                action = this.createAction(privateCmds.CREATE_CUSTOM_ADTYPE, adType, owner, ownerId, audienceId)
                networkAction = new Action(network, [action], actionDataTypes.ADNETWORK, owner, ownerId, audienceId);
                action.changeStatus(adType, status);
                this.actions.push(networkAction);
            } else {
                action = networkAction.getActionByKey(actionMangerActions.CUSTOM_ADTYPES);
                if (!action) {
                    action = this.createAction(privateCmds.CREATE_CUSTOM_ADTYPE, adType, owner, ownerId, audienceId);
                    networkAction.addAction(action);
                }
                else if (!(action.getValue(adType))) {
                    action.pushValue(adType);
                }
                action.changeStatus(adType, status);
            }
            this.emit("change");
        },
        changeStatusCustomNetworkAdTypes:function(owner,ownerId,audienceId,network,adTypes){
            _(adTypes).each(function (status, adType) {
                this.changeStatusCustomNetworkAdType(owner, ownerId, audienceId,network, adType, status);
            }.bind(this));
            this.emit("change");

        },
        addDefaultAdsense: function (owner, ownerId, audienceId) {
            var adsense = this.getActionBykey(owner, ownerId, audienceId, actionMangerActions.ADSENSE);
            if (adsense)
                return false;

            adsense = this.createAction(privateCmds.CREATE_DEFAULT_ADSENSE, null, owner, ownerId, audienceId);
            this.actions.push(adsense);
            this.emit("change");
        },
        changeStatusAdsenseColorTpl: function (owner, ownerId, audienceId, tpl, status) {
            var action = null,
                adsenseAction = this.getActionBykey(owner, ownerId, audienceId, actionMangerActions.ADSENSE);
            if (!adsenseAction) {
                action = this.createAction(privateCmds.CREATE_ADSENSE_COLOR, tpl, owner, ownerId, audienceId);
                adsenseAction = new Action(actionMangerActions.ADSENSE, [action], actionDataTypes.ADNETWORK, owner, ownerId, audienceId);
                action.changeStatus(tpl, status);
                this.actions.push(adsenseAction);
            } else {
                action = adsenseAction.getActionByKey(actionMangerActions.ADSENSE_COLORS);
                if (!action) {
                    action = this.createAction(privateCmds.CREATE_ADSENSE_COLOR, tpl, owner, ownerId, audienceId);
                    adsenseAction.addAction(action);
                }
                else if (!(action.getValue(tpl))) {
                    action.pushValue(tpl);
                }
                action.changeStatus(tpl, status);
            }
            this.emit("change");
        },
        changeStatusAdsenseColorTpls: function(owner, ownerId, audienceId,tpls){
            _(tpls).each(function (props) {
                this.changeStatusAdsenseColorTpl(owner, ownerId, audienceId, props.tpl, props.status);
            }.bind(this));
            this.emit("change");
        },
        removeAdsenseColorTpl: function (owner, ownerId, audienceId, tpl) {
            var action = null,
                adsenseAction = this.getActionBykey(owner, ownerId, audienceId, actionMangerActions.ADSENSE);
            if (!adsenseAction)
                return false;

            action = adsenseAction.getActionByKey(actionMangerActions.ADSENSE_COLORS);
            if (!action) {
                return false;
            }
            else {
                action.removeValue(tpl);
                this.emit("change");
            }
        },
        addAdsenseColorTpl: function (owner, ownerId, audienceId, tpl) {
            var action = null,
                adsenseAction = this.getActionBykey(owner, ownerId, audienceId, actionMangerActions.ADSENSE);
            if (!adsenseAction) {
                adsenseAction = new Action(actionMangerActions.ADSENSE, [this.createAction(privateCmds.CREATE_ADSENSE_COLOR, tpl, owner, ownerId, audienceId)], actionDataTypes.ADNETWORK, owner, ownerId, audienceId);
                this.actions.push(adsenseAction);
            } else {
                action = adsenseAction.getActionByKey(actionMangerActions.ADSENSE_COLORS);
                if (!action) {
                    action = this.createAction(actionMangerActions.ADSENSE_COLORS, tpl, owner, ownerId, audienceId);
                    adsenseAction.addAction(action);
                }
                else if (!(action.getValue(tpl))) {
                    action.pushValue(tpl);
                }
            }
            this.emit("change");
        },
        changeStatusAdsenseAdType: function (owner, ownerId, audienceId, adType, status) {
            var action = null,
                adsenseAction = this.getActionBykey(owner, ownerId, audienceId, actionMangerActions.ADSENSE);
            if (!adsenseAction) {
                action = this.createAction(privateCmds.CREATE_ADSENSE_ADTYPE, adType, owner, ownerId, audienceId)
                adsenseAction = new Action(actionMangerActions.ADSENSE, [action], actionDataTypes.ADNETWORK, owner, ownerId, audienceId);
                action.changeStatus(adType, status);
                this.actions.push(adsenseAction);
            } else {
                action = adsenseAction.getActionByKey(actionMangerActions.ADSENSE_ADTYPES);
                if (!action) {
                    action = this.createAction(privateCmds.CREATE_ADSENSE_ADTYPE, adType, owner, ownerId, audienceId);
                    adsenseAction.addAction(action);
                }
                else if (!(action.getValue(adType))) {
                    action.pushValue(adType);
                }
                action.changeStatus(adType, status);
            }
            this.emit("change");
        },
        changeStatusAdsenseAdTypes: function (owner, ownerId, audienceId, adTypes) {
            _(adTypes).each(function (status, adType) {
                this.changeStatusAdsenseAdType(owner, ownerId, audienceId, adType, status);
            }.bind(this));
            this.emit("change");
        },
        changeStatusAdTypesNetworkWise:function(owner, ownerId, audienceId, adTypesNetworkWise){
            _(adTypesNetworkWise).each(function (adtypes, network) {
                if(network == CommonConsts.enums.adNetworks.integratedNetworks.ADSENSE){
                    this.changeStatusAdsenseAdTypes(owner, ownerId, audienceId, adtypes)
                }else{
                    this.changeStatusCustomNetworkAdTypes(owner, ownerId, audienceId, network, adtypes);
                }
            }.bind(this));
            this.emit("change");
        },
        addSize: function (owner, ownerId, audienceId, size) {
            var isNotInContentSectionOwner = (owner !== actionLevels.INCONTENT_SECTION),
                action, isTrue = true, sectionFirstAdCss, section, payload;

            /******************* Analytics ****************/
            if (isNotInContentSectionOwner) {
                analytics.track('EDITOR_AdCreated', {
                    siteDomain: window.ADP_SITE_DOMAIN,
                    height:size.height,
                    width:size.width,
                    IS_ADMIN: window.ADP_IS_ADMIN
                }, intercomObj);
            }else{
                analytics.track('EDITOR_InContentEnabled', {
                    siteDomain: window.ADP_SITE_DOMAIN,
                    height:size.height,
                    width:size.width,
                    IS_ADMIN: window.ADP_IS_ADMIN
                }, intercomObj);
            }
            /******************* Analytics Ended****************/

            if (!size.css && isNotInContentSectionOwner) {
                size.css = {
                    "margin-left": 'auto',
                    "margin-right": 'auto',
                    "margin-top": 0,
                    "margin-bottom": 0,
                    "clear": "both"
                }
            }

            action = this.getActionBykey(owner, ownerId, audienceId, actionMangerActions.SIZES);

            if (!action) {
                action = new Action(actionMangerActions.SIZES, size, actionDataTypes.ARRAY, owner, ownerId, audienceId);
                this.actions.push(action);
            } else {
                if (!action.getValue(size)) {
                    action.pushValue(size);
                }else{
                    isTrue = false;
                }
            }

            if (isNotInContentSectionOwner) {
                sectionFirstAdCss = (action.value.length > 1) ? _.extend({}, action.value[0].data.css) : false;
                size.css = (sectionFirstAdCss && (Object.keys(sectionFirstAdCss).length > 0)) ? sectionFirstAdCss : size.css;

                if (isTrue) {
                    section = this.flux.store(Stores.SECTION_STORE).getSectionById(ownerId);
                    payload = {
                        operation: section.operation,
                        selector: section.xpath,
                        sectionId: section.id,
                        adSize: size,
                        audienceId: audienceId
                    };
                    this.messenger.sendMessage(ADP.enums.messenger.INSERT_AD, payload);
                }
            }
            this.emit("change")
        },
        getCss: function (owner, ownerId, audienceId, size) {
            var action = this.getActionBykey(owner, ownerId, audienceId, actionMangerActions.SIZES);
            if (!action)
                return false;

            var obj = _.find(action.value, function (obj) {
                return (obj.data.height == size.height && obj.data.width == size.width);
            });
            if (obj && obj.data.css)
                return obj.data.css;

            return {
                "margin-left": 0,
                "margin-right": 0,
                "margin-top": 0,
                "margin-bottom": 0,
                "clear": "both"
            }

        },
        addCssToSize: function (owner, ownerId, audienceId, size, css) {
            var action = this.getActionBykey(owner, ownerId, audienceId, actionMangerActions.SIZES);
            if (!action)
                return false;

            var obj = _.find(action.value, function (obj) {
                return (obj.data.height == size.height && obj.data.width == size.width);
            });
            if (obj) {
                obj.data.css = css;
                var section = this.flux.store(Stores.SECTION_STORE).getSectionById(ownerId),
                    payload = {
                        sectionId: section.id,
                        adSize: size,
                        audienceId: audienceId,
                        css: css
                    }
                this.messenger.sendMessage(ADP.enums.messenger.APPLY_CSS, payload);

                this.emit("change");
            }

        },
        removeSize: function (owner, ownerId, audienceId, size) {
            var action = this.getActionBykey(owner, ownerId, audienceId, actionMangerActions.SIZES);
            if (!action)
                return false;
            action.removeValue(size);
            if (_.isEmpty(action.value)) {
                this.actions.splice(this.actions.indexOf(action), 1);
            }
            this.emit("change");

        },
        createModifyAction: function (payload) {
            switch (payload.name) {
                case publicCmds.CHANGE_ADSENSE_COLOR_STATUS:
                    this.changeStatusAdsenseColorTpl(payload.owner, payload.ownerId, payload.audienceId, payload.tpl, payload.status);
                    break;
                case publicCmds.CHANGE_ADSENSE_COLORS_STATUS:
                    this.changeStatusAdsenseColorTpls(payload.owner, payload.ownerId, payload.audienceId, payload.tpls);
                    break;
                case publicCmds.ADD_ADSENSE_COLOR:
                    this.addAdsenseColorTpl(payload.owner, payload.ownerId, payload.audienceId, payload.tpl);
                    break;
                case publicCmds.REMOVE_ADSENSE_COLOR:
                    this.removeAdsenseColorTpl(payload.owner, payload.ownerId, payload.audienceId, payload.tpl);
                    break;
                case publicCmds.CHANGE_ADSENSE_ADTYPE_STATUS:
                    this.changeStatusAdsenseAdType(payload.owner, payload.ownerId, payload.audienceId, payload.adType, payload.status);
                    break;
                case publicCmds.CHANGE_ADSENSE_ADTYPES_STATUS://Multiple at same time
                    this.changeStatusAdsenseAdTypes(payload.owner, payload.ownerId, payload.audienceId, payload.adTypes);
                    break;
                case publicCmds.CHANGE_ADTYPES_STATUS_NETWORKWISE://Multiple at same time
                    this.changeStatusAdTypesNetworkWise(payload.owner, payload.ownerId, payload.audienceId, payload.adTypesNetworkWise);
                    break;
                case publicCmds.ADD_SIZE_TO_SECTION:
                    this.addSize(payload.owner, payload.ownerId, payload.audienceId, payload.adSize);
                    break;
                case publicCmds.ADD_SIZE_TO_INCONTENT_SECTION:
                    this.addSize(payload.owner, payload.ownerId, payload.audienceId, payload.adSize);
                    break;
                case publicCmds.ADD_SIZES_TO_INCONTENT_SECTION:
                    _(payload.adSizes).each(function (adSize) {
                        this.addSize(payload.owner, payload.ownerId, payload.audienceId, adSize);
                    }.bind(this))
                    break;
                case publicCmds.ADD_DEFAULT_ADSENSE:
                    this.addDefaultAdsense(payload.owner, payload.ownerId, payload.audienceId, payload.size);
                    setTimeout(function () {
                        if (payload.owner == actionLevels.SITE)
                            this.flux.actions.setNetworkDefaultSettingsForAllChannels({network: "ADSENSE"});
                        else if (payload.owner == actionLevels.CHANNEL) {
                            this.flux.actions.setNetworkDefaultSettings({
                                channelId: payload.ownerId,
                                network: "ADSENSE"
                            })
                        } else if (payload.owner == actionLevels.SECTION) {
                            var section = this.flux.store(Stores.SECTION_STORE).getSectionById(payload.ownerId);
                            this.flux.actions.setNetworkDefaultSettings({
                                channelId: section.channelId,
                                network: "ADSENSE"
                            })
                        }
                    }.bind(this))

                    break;
                case publicCmds.ADD_CUSTOM_AD_NETWORK:
                    this.addCustomAdNetwork(payload.owner, payload.ownerId, payload.audienceId, payload.network);
                    setTimeout(function () {
                        if (payload.owner == actionLevels.SITE)
                            this.flux.actions.setNetworkDefaultSettingsForAllChannels({network: payload.network});
                        else if (payload.owner == actionLevels.CHANNEL) {
                            this.flux.actions.setNetworkDefaultSettings({
                                channelId: payload.ownerId,
                                network: payload.network
                            })
                        } else if (payload.owner == actionLevels.SECTION) {
                            var section = this.flux.store(Stores.SECTION_STORE).getSectionById(payload.ownerId);
                            this.flux.actions.setNetworkDefaultSettings({
                                channelId: section.channelId,
                                network: payload.network
                            })
                        }
                    }.bind(this))
                    break;
                case publicCmds.ADD_REMOVE_CUSTOM_AD_NETWORKS:
                    if(payload.networksToAdd && Array.isArray(payload.networksToAdd)){
                        _(payload.networksToAdd).each(function(network){
                            this.addCustomAdNetwork(payload.owner, payload.ownerId, payload.audienceId, network);
                            setTimeout(function () {
                                if (payload.owner == actionLevels.SITE)
                                    this.flux.actions.setNetworkDefaultSettingsForAllChannels({network: network});
                                else if (payload.owner == actionLevels.CHANNEL) {
                                    this.flux.actions.setNetworkDefaultSettings({
                                        channelId: payload.ownerId,
                                        network: network
                                    })
                                } else if (payload.owner == actionLevels.SECTION) {
                                    var section = this.flux.store(Stores.SECTION_STORE).getSectionById(payload.ownerId);
                                    this.flux.actions.setNetworkDefaultSettings({
                                        channelId: section.channelId,
                                        network: network
                                    })
                                }
                            }.bind(this))
                        }.bind(this))
                    }

                    if(payload.networksToRemove && Array.isArray(payload.networksToRemove)){
                        _(payload.networksToRemove).each(function(network){
                            this.removeCustomAdNetwork(payload.owner, payload.ownerId, payload.audienceId, network);
                        }.bind(this));
                    }

                    break;
                case publicCmds.CHANGE_CUSTOM_ADTYPE_STATUS:
                    this.changeStatusCustomNetworkAdType(payload.owner, payload.ownerId, payload.audienceId, payload.network, payload.adType, payload.status);
                    break;
                case publicCmds.ADD_CSS_TO_SIZE:
                    this.addCssToSize(payload.owner, payload.ownerId, payload.audienceId, payload.adSize, payload.css);
                    break;
                case publicCmds.REMOVE_SIZE_FROM_SECTION:
                    this.removeSize(payload.owner, payload.ownerId, payload.audienceId, payload.size);
                    payload['sectionId'] = payload.ownerId;
                    this.messenger.sendMessage(ADP.enums.messenger.REMOVE_AD, payload);
                    break;
                case publicCmds.REMOVE_SIZES_FROM_INCONTENT_SECTION:
                    _(payload.adSizes).each(function(size){
                        this.removeSize(payload.owner, payload.ownerId, payload.audienceId, size);
                    }.bind(this))
                    break;

            }
        },
        loadActions: function (actions) {//private function called internally for reusablity of code
            actions = actions || [];
            _(actions).each(function (action) {
                switch (action.key) {
                    case actionMangerActions.ADSENSE:
                        this.actions.push(this.loadAdsense(action));
                        break;
                    default:
                        this.actions.push(Action.loadFromJson(action));
                }
            }.bind(this))
        },
        loadChannelActions: function(channelJSON){ //private function  used internally
            this.loadActions(channelJSON.actions);
            this.loadActions(channelJSON.incontentActions);

            _(channelJSON.structuredSections ? channelJSON.structuredSections : channelJSON.sections || []).each(function (sectionJSON) {
                this.loadActions(sectionJSON.actions);
            }.bind(this))
        },
        loadAllActions: function (payload) {//called when site load is called
            this.waitFor([Stores.SECTION_STORE], function (SectionStore) {
                this.loadActions(payload.site.actions);

                _(payload.channels).each(function (channelJSON) {
                    this.loadChannelActions(channelJSON);
                }.bind(this));

                this.emit("change");

            }.bind(this))
        },
        loadChannelSectionActions: function (payload) {//called when channel is individually loaded is called
            var channelJSON = payload.channelJSON;
            this.waitFor([Stores.SECTION_STORE], function (SectionStore) {
                this.loadChannelActions(channelJSON);
                this.emit("change");
            }.bind(this))
        },
        loadAdsense: function (action) {
            if (action.key !== actionMangerActions.ADSENSE)
                return false
            var adsense = new Action(actionMangerActions.ADSENSE, null, actionDataTypes.ADNETWORK, action.owner, action.ownerId, action.audienceId, action.id)
            _(action.value).each(function (subAction) {
                switch (subAction.key) {
                    case actionMangerActions.ADSENSE_COLORS:
                        adsense.addAction(this.loadAdsenseColors(subAction));
                        break;
                    case actionMangerActions.ADSENSE_ADTYPES:
                        adsense.addAction(this.loadAdsenseAdtypes(subAction));
                        break;
                }
            }.bind(this))
            return adsense;
        },
        loadAdsenseColors: function (json) {
            var colorAction = new Action(actionMangerActions.ADSENSE_COLORS, null, actionDataTypes.ARRAY, json.owner, json.ownerId, json.audienceId, json.id),
                template = null;
            _(json.value).each(function (tpl) {
                template = NetworkSettings.AdsenseColorTpl.load(tpl.data);
                this.flux.store(Stores.TPL_STORE).loadAdenseTpl(template);
                colorAction.pushValue(template, tpl.status);
            }.bind(this))
            return colorAction;
        },
        loadAdsenseAdtypes: function (json) {
            var adTypeAction = new Action(actionMangerActions.ADSENSE_ADTYPES, null, actionDataTypes.ARRAY, json.owner, json.ownerId, json.audienceId, json.id)
            _(json.value).each(function (adtype) {
                adTypeAction.pushValue(adtype.data, adtype.status);
            }.bind(this))
            return adTypeAction;
        },
        getChannelActions: function (channelId) {
            return this.getActionsByOwner(actionLevels.CHANNEL, channelId);
        },
        getSectionActions: function (sectionId) {
            return this.getActionsByOwner(actionLevels.SECTION, sectionId);
        },
        getChannelIncontentSectionActions: function (channelId) {
            return this.getActionsByOwner(actionLevels.INCONTENT_SECTION, channelId);
        },
        actionsToJSON: function (actions) {
            if (!actions) return null;
            var json = [];
            actions.forEach(function (action) {
                json.push(action.toJSON())
            });
            return json;
        },
        channelActionsToJSON: function (channelId) {
            return this.actionsToJSON(this.getChannelActions(channelId));
        },
        channelIncontentSectionActionsToJSON: function (channelId) {
            return this.actionsToJSON(this.getChannelIncontentSectionActions(channelId));
        },
        sectionActionsToJSON: function (sectionId) {
            return this.actionsToJSON(this.getSectionActions(sectionId));
        },
        siteActionsToJSON: function () {
            return this.actionsToJSON(this.getActionsByOwner(actionLevels.SITE));
        },
        getChannelSiteMergedActions: function (channelId) {
            return this.mergeActions(this.getActionsByOwner(actionLevels.SITE), this.getChannelActions(channelId));
        },
        getChannelIncontentSectionMergedActions: function (channelId) {
            var channelMergedAction = this.getChannelSiteMergedActions(channelId);
            return this.mergeActions(channelMergedAction, this.getChannelIncontentSectionActions(channelId));
        },
        getSectionMergedActions: function (sectionId, channelId) {
            var channelMergedAction = this.getChannelSiteMergedActions(channelId);
            return this.mergeActions(channelMergedAction, this.getSectionActions(sectionId));
        },
        getAds: function (actions) {
            var sizes = _(actions).where({key: actionMangerActions.SIZES}), adsense, adTypes, colorTpls, audiences = [], audience, adnetworks = [], me = this;

            if (!Array.isArray(sizes)) {
                return audiences;
            }

            function pushAdsenseVariations(size, adsense, audienceId) {
                adTypes = adsense.getActionByKey(actionMangerActions.ADSENSE_ADTYPES);
                colorTpls = adsense.getActionByKey(actionMangerActions.ADSENSE_COLORS);
                if (adTypes && colorTpls && adTypes.value.length && colorTpls.value.length) {
                    _(adTypes.value).each(function (adType) {
                        if (adType.status == actionStatus.DISABLED)
                            return true;

                        _(colorTpls.value).each(function (tpl) {
                            if (tpl.status == actionStatus.DISABLED)
                                return true;

                            audience = _(audiences).findWhere({audienceId: audienceId});
                            if (!audience) {
                                audience = {audienceId: audienceId, ads: []};
                                audiences.push(audience);
                            }
                            audience.ads.push(NetworkSettings.AdsenseAd.loadAdFromIngrediants(size, adType.data, tpl.data).toJSON())
                        })
                    })
                }
            }

            function pushCustomVariations(sizeProps, networkAction, network, audienceId) {
                adTypes = networkAction.getActionByKey(actionMangerActions.CUSTOM_ADTYPES);
                var ads = [];
                if (adTypes && adTypes.value.length) {
                    _(adTypes.value).each(function (adType) {
                        if (adType.status == actionStatus.DISABLED)
                            return true;

                        audience = _(audiences).findWhere({audienceId: audienceId});
                        if (!audience) {
                            audience = {audienceId: audienceId, ads: []};
                            audiences.push(audience);
                        }
                        ads = network.findVariationsBySizeAndAdType(sizeProps.width, sizeProps.height, adType.data)
                        if (!ads.length)
                            return true;

                        _(ads).each(function (ad) {
                            ad = ad.toJSON()
                            ad.css = JSON.stringify(sizeProps.css);//very important as css is at section level and variation don't have css of there own, so ad css here(in adsense we load it automatically as adsense ads are genrated dynamically)
                            audience.ads.push(ad);
                        })
                    })
                }
            }

            _(sizes).each(function (size) {
                _(size.value).each(function (sizeVal) {
                    adnetworks = _(actions).filter({
                        dataType: actionDataTypes.ADNETWORK,
                        audienceId: size.audienceId
                    });
                    _(adnetworks).each(function (adnetwork) {
                        var network = me.flux.store(Stores.SITE_STORE).getAdNetworkByName(adnetwork.key)
                        if (!network || !network.sizeExists(sizeVal.data.width, sizeVal.data.height)) {
                            console.log("Size "+sizeVal+"not supported in network: " + adnetwork.key);
                            return true;
                        }

                        switch (adnetwork.key) {
                            case actionMangerActions.ADSENSE:
                                pushAdsenseVariations(sizeVal.data, adnetwork, size.audienceId);
                                break;
                            default :
                                pushCustomVariations(sizeVal.data, adnetwork, network, size.audienceId);

                        }
                    })
                })
            })
            return audiences.length && Array.isArray(audiences[0].ads) ? audiences[0].ads : [];
        },
        getSectionAds: function (sectionId, channelId) {
            var actions = this.getSectionMergedActions(sectionId, channelId);
            if (!actions)
                return [];
            else
                return this.getAds(actions)
        },
        getChannelIncontentSectionAds: function (channelId) {
            var actions = this.getChannelIncontentSectionMergedActions(channelId);
            if (!actions)
                return [];
            else
                return this.getAds(actions)
        },
        getActionBykey: function (owner, ownerId, audienceId, key) {
            ownerId = (typeof ownerId == "undefined") ? null : ownerId;
            audienceId = parseInt(audienceId);

            var action = _.findWhere(this.actions, {
                owner: owner,
                ownerId: ownerId,
                audienceId: audienceId,
                key: key
            });
            if (action)
                return action;
            else {//Return SubAction By Finding It
                var actions = _(this.actions).filter({
                        dataType: actionDataTypes.ADNETWORK,
                        owner: owner,
                        ownerId: ownerId,
                        audienceId: audienceId
                    }),
                    subAction = null;
                _(actions).each(function (action) {
                    subAction = action.getActionByKey(key);
                    if (subAction) {
                        return false
                    }
                })
                return subAction;
            }
        },
        removeAction: function(action){
            var index = this.actions.indexOf(action);
            if(index > -1){
                this.actions.splice(index,1);
                return true;
            }
        },
        getActionsByOwner: function (owner, ownerId) {
            ownerId = (typeof ownerId == "undefined") ? null : ownerId
            return _.filter(this.actions, {owner: owner, ownerId: ownerId});
        },
        getSiteLevelAdnetworks: function () {
            var actions = this.getActionsByOwner(actionLevels.SITE);
            return _(actions).filter({dataType: actionDataTypes.ADNETWORK});
        },
        getAdNetworkByOwner: function (owner, ownerId) {
            ownerId = (typeof ownerId == "undefined") ? null : ownerId
            return _.filter(this.actions, {dataType: actionDataTypes.ADNETWORK, owner: owner, ownerId: ownerId});
        },

        getMergedAdNetworkBySection: function (sectionId, channelId) {
            return _.filter(this.getSectionMergedActions(sectionId,channelId), {dataType: actionDataTypes.ADNETWORK});
        },
        unloadChannelActions: function (payload) {
            this.waitFor([Stores.CHANNEL_STORE], function (channelStore, sectionStore) {
                var sections = this.flux.store(Stores.SECTION_STORE).getChannelSection(payload.channel.id);
                this.actions = _(this.actions).reject({ownerId: payload.channel.id})
                _(sections).each(function (section) {
                    this.actions = _(this.actions).reject({ownerId: section.id})
                }.bind(this))
            }.bind(this))
        },
        createAction: function (name, value, owner, ownerId, audienceId) {
            switch (name) {

                case privateCmds.CREATE_DEFAULT_ADSENSE:
                    var d = this.flux.store(Stores.TPL_STORE).getAdsenseTplByName("Default");
                    var colors = new Action(actionMangerActions.ADSENSE_COLORS, d, actionDataTypes.ARRAY, owner, ownerId, audienceId);
                    var adtypes = new Action(actionMangerActions.ADSENSE_ADTYPES, ["text", "text_image"], actionDataTypes.ARRAY, owner, ownerId, audienceId);
                    adtypes.changeStatus("text",actionStatus.DISABLED);//added text disable by default due to adpushup/support #96
                    var noOfAdsenseAds = new Action(actionMangerActions.ADSENSE_TOTAL_ADS, 3, actionDataTypes.INT, owner, ownerId, audienceId);
                    return new Action(actionMangerActions.ADSENSE, [colors, adtypes, noOfAdsenseAds], actionDataTypes.ADNETWORK, owner, ownerId, audienceId);
                    break;

                case privateCmds.CREATE_CUSTOM_AD_NETWORK:
                    var network = this.flux.store(Stores.SITE_STORE).getAdNetworkByName(value);
                    if (!network)
                        throw new Error("No Adnetwork with name: " + value);

                    var adTypes = new Action(actionMangerActions.CUSTOM_ADTYPES, network.supportedAdTypes, actionDataTypes.ARRAY, owner, ownerId, audienceId)
                    return new Action(value, [adTypes], actionDataTypes.ADNETWORK, owner, ownerId, audienceId);
                    break;

                case privateCmds.CREATE_CUSTOM_ADTYPE:
                    return new Action(actionMangerActions.CUSTOM_ADTYPES, value, actionDataTypes.ARRAY, owner, ownerId, audienceId)
                    break;

                case privateCmds.CREATE_ADSENSE_COLOR:
                    return new Action(actionMangerActions.ADSENSE_COLORS, value, actionDataTypes.ARRAY, owner, ownerId, audienceId);
                    break;
                case privateCmds.CREATE_ADSENSE_ADTYPE:
                    return new Action(actionMangerActions.ADSENSE_ADTYPES, value, actionDataTypes.ARRAY, owner, ownerId, audienceId);
                    break;

                case privateCmds.ADS_ON_PAGE:
                    return new Action(actionMangerActions.ADS_ON_PAGE, 3, actionDataTypes.INT, owner, ownerId, audienceId);
                    break;

            }
        },
        mergeActions: function (parentActions, childActions) {
            if (!(parentActions instanceof Array) || !parentActions.length)
                return childActions;
            else if (!(childActions instanceof Array) || !childActions.length)
                return parentActions;


            var cParentActions = $.extend(true, [], parentActions),
                cChildActions = $.extend(true, [], childActions),
                cAction = null,
                pAction = null,
                finalActions = [],
                findAction = function (actions, audienceId, key) {
                    return _.findWhere(actions, {audienceId: audienceId, key: key});
                }

            //Merging Parent Actions to Child Actions (if they exist)
            _(cParentActions).each(function (pAction) {
                cAction = findAction(cChildActions, pAction.audienceId, pAction.key);
                if (cAction) {
                    finalActions.push(cAction.merge(pAction));
                    cChildActions.splice(cChildActions.indexOf(cAction), 1);
                } else {
                    finalActions.push(pAction);
                }
                cParentActions = _(cParentActions).reject(function (tAction) {
                    return tAction == pAction
                });
            });

            //Merging Child Actions to Parent Actions (if they exist)
            _(cChildActions).each(function (cAction) {
                pAction = findAction(cParentActions, cAction.audienceId, cAction.key);
                if (pAction) {
                    finalActions.push(cAction.merge(pAction));
                    cParentActions.splice(cParentActions.indexOf(pAction), 1);
                } else {
                    finalActions.push(cAction);
                }
                cChildActions = _(cChildActions).reject(function (tAction) {
                    return tAction == cAction
                });
            });

            return finalActions;

        },
        getState: function (channelId) {
            var json = {actions: this.actions};
            if (channelId) {
                json.activeChannelActions = this.getChannelSiteMergedActions(channelId);
            }
            return json;
        },
        toJSON: function () {
            return {sections: this.sections};
        }

    });

    return ActionsStore;
})(_, CommonConsts, Fluxxor, Utils, $, NetworkSettings);
