var Fluxxor = require("../libs/third-party/fluxxor"),
    ChannelStore = require("./stores/channelStore"),
    SectionStore = require("./stores/sectionStore"),
    SiteStore = require("./stores/siteStore"),
    ContextMenuStore = require("./stores/contextMenuStore"),
    ColorTemplateStore = require("./stores/colorTemplateStore"),
    ActionsStore = require("./stores/actionsStore"),
    FluxActions = require("./fluxActions"),
    DataSyncService = require("./dataSyncService");


module.exports = (function (Fluxxor, ChannelStore, SectionStore, SiteStore, ContextMenuStore, ColorTemplateStore, ActionsStore, FluxActions, DataSyncService) {
    var Flux = function (config) {
        var flux;
        var stores = {
            ChannelStore: new ChannelStore({messenger: config.messenger}),
            SiteStore: new SiteStore(),

            ContextMenuStore: new ContextMenuStore({messenger: config.messenger}),
            ColorTemplateStore: new ColorTemplateStore(),
            SectionStore: new SectionStore({messenger: config.messenger}),
            ActionsStore: new ActionsStore({messenger: config.messenger})
        };

        flux = new Fluxxor.Flux(stores, FluxActions);
        DataSyncService.initFlux( flux);

        return flux;
    };

    return Flux;
})(Fluxxor, ChannelStore, SectionStore, SiteStore, ContextMenuStore, ColorTemplateStore, ActionsStore, FluxActions, DataSyncService);