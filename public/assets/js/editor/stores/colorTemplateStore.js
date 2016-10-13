var _ = require("libs/third-party/underscore"),
    Fluxxor = require("libs/third-party/fluxxor"),
    CommonConsts = require("../commonConsts"),
    Utils = require("libs/custom/utils"),
    NetworkSettings = require("../adNetworkSettings");

module.exports = (function (_, CommonConsts, Fluxxor, NetworkSettings, Utils) {
    var defaultTpl = CommonConsts.enums.adNetworks.adsenseDefaultTpl;
    var ColorTemplateStore = Fluxxor.createStore({
        initialize: function (config) {
            this.templates = [];

            var actions = CommonConsts.enums.actions.templateManager;
            this.bindActions(
                actions.CREATE_ADSENSE_TEMPLATE, this.createAdsenseTeamplate,
                actions.MODIFY_ADSENSE_TEMPLATE, this.modifyAdsenseTeamplate,
                CommonConsts.enums.actions.siteManager.CREATE_DEFAULTS, this.createDefaultTemplate
            );

        },
        createDefaultTemplate: function () {
            this.createAdsenseTeamplate({
                name: "Default",
                borderColor: defaultTpl.border ,
                titleColor: defaultTpl.title,
                bgColor: defaultTpl.background,
                textColor: defaultTpl.text,
                urlColor: defaultTpl.url
            });
        },
        loadAdenseTpls: function (payload) {
            if (payload.templates && Utils.isArray(payload.templates)) {
                //to do
            }
        },
        loadAdenseTpl: function (tpl) {
            if (typeof this.templates['adsense'] == "undefined") {
                this.templates['adsense'] = [];
            }
            this.templates['adsense'].push(tpl);
        },
        getAdsenseTplById: function (id) {
            return _.find(this.templates['adsense'], function (tpl) {
                return tpl.id == id
            })
        },
        getAdsenseTplByName: function (name) {
            return _.find(this.templates['adsense'], function (tpl) {
                return tpl.name.toLowerCase() == name.toLowerCase()
            })
        },
        createAdsenseTeamplate: function (payload) {
            if (typeof this.templates['adsense'] == "undefined") {
                this.templates['adsense'] = [];
            }
            var tpl = new NetworkSettings.AdsenseColorTpl(payload.name, payload.borderColor, payload.titleColor, payload.bgColor, payload.textColor, payload.urlColor)
            this.templates['adsense'].push(tpl);
            this.emit("change");
        },
        modifyAdsenseTeamplate: function (payload) {
            var tpl = this.getAdsenseTplById(payload.id)
            if (tpl) {
                tpl.title = payload.titleColor;
                tpl.border = payload.borderColor;
                tpl.name = payload.name;
                tpl.text = payload.textColor;
                tpl.url = payload.urlColor;
                tpl.background = payload.bgColor;
            }
            this.emit("change");
        },
        getState: function () {
            return {
                templates: this.templates
            }
        }

    });
    return ColorTemplateStore;
 
})( _, CommonConsts, Fluxxor, NetworkSettings, Utils );
