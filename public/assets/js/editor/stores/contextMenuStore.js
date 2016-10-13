var Fluxxor = require("libs/third-party/fluxxor"),
    CommonConsts = require("../commonConsts"),
    Stores = CommonConsts.enums.stores;

module.exports = (function(Fluxxor, CommonConsts) {

    var ContextMenuStore = Fluxxor.createStore({
        initialize: function( config ) {
            this.position = {posX:0,posY:0};
            this.insertOptions = [];
            this.menuVisibility = false;
            this.visibleComponent = null;
            this.componentData = null;
            this.debugInfo = null;
            this.messenger = config.messenger;
            this.adRecover = {
                viewportDimensions: '1366 X 768',
                areaInAds: '0%',
                visible: false
            };

            var ContextMenuActions = CommonConsts.enums.actions.contextMenu,
                CM = CommonConsts.enums.components;

            this.bindActions(
                ContextMenuActions.HIDE_CONTEXTMENU, this.hideComponent,
                ContextMenuActions.SHOW_INSERT_CONTEXTMENU, this.showInsertMenu.bind(this, 1),
                ContextMenuActions.SHOW_EDIT_CONTEXTMENU, this.showInsertMenu.bind(this, 0),
                ContextMenuActions.HIGHLIGHT_ELEMENT, this.highlightElement,
                ContextMenuActions.HIGHLIGHT_ADBOX , this.highlightAdbox,
                ContextMenuActions.SELECT_ELEMENT, this.selectElement,
                ContextMenuActions.CHANGE_EDITOR_MODE, this.changeEditorMode,
                ContextMenuActions.SHOW_COMPONENT,this.showComponent,
                ContextMenuActions.HIDE_COMPONENT,this.hideComponent,
                ContextMenuActions.DEBUG_INFO,this.setDebugInfo,
                ContextMenuActions.SHOW_ADRECOVER_POPUP, this.showAdRecoverPopup,
                ContextMenuActions.HIDE_ADRECOVER_POPUP, this.hideAdRecoverPopup
            );

        },
        showComponent:function(payload){
            this.visibleComponent = payload.menu;
            this.position = {posX:payload.x,posY:payload.y};
            this.componentData = payload.data;
            this.emit("change");
        },
        hideComponent:function(){
            this.visibleComponent = null;
            this.position = {posX:0,posY:0};
            this.emit("change");
        },
        changeEditorMode: function(payload){
            this.messenger.sendMessage( ADP.enums.messenger.CHANGE_EDITOR_MODE, {mode:payload.mode});
        },
        hideInsertMenu: function(){
            this.menuVisibility = false;
            this.emit("change");
        },

        highlightElement: function( selector ) {
            this.messenger.sendMessage( ADP.enums.messenger.HIGHLIGHT_ELEMENT, selector);
        },

        highlightAdbox: function( payload ) {
            this.messenger.sendMessage( ADP.enums.messenger.HIGHLIGHT_ADBOX, payload);
        },

        selectElement: function( selector ) {
            this.messenger.sendMessage( ADP.enums.messenger.SELECT_ELEMENT, selector);
        },

        // isInsert is a bool to define the type of menu
        showInsertMenu: function( isInsert, payload ){
            this.isInsert = isInsert;

            if( this.isInsert ) {
                this.insertOptions = payload.insertOptions;
                this.parents = payload.parents;
            }
            else {
                this.section = this.flux.store(Stores.SECTION_STORE).getSectionById(payload.sectionId) ;
                this.audienceId = payload.audienceId;
                payload.adSize.css =  this.flux.store(Stores.ACTION_STORE).getCss(CommonConsts.enums.actionManager.levels.SECTION,payload.sectionId,payload.audienceId,payload.adSize);
                this.adSize = payload.adSize;
            }
            this.visibleComponent = payload.menu;
            this.position = {posX:payload.x,posY:payload.y};

            this.emit("change");
        },
        setDebugInfo: function(payload){
            this.debugInfo = payload.info;
            this.emit("change");
        },
        showAdRecoverPopup: function(payload) {
            this.adRecover.areaInAds = payload.areaInAds;
            this.adRecover.viewportDimensions = payload.viewportDimensions;
            this.adRecover.visible = true;

            this.emit("change");
        },

        hideAdRecoverPopup: function(payload) {
            this.adRecover.visible = payload.visible;

            this.emit("change");
        },

        getState: function() {
            return {
                visibleComponent: this.visibleComponent,
                componentData: this.componentData,
                position: this.position,
                menuVisibility: this.menuVisibility,
                parents: this.parents,
                
                section: this.section,
                audienceId: this.audienceId,
                adSize: this.adSize,
                
                isInsert: this.isInsert,
                debugInfo: this.debugInfo,
                insertOptions: this.insertOptions,
                adRecover: this.adRecover
            }
        }

    });

    return ContextMenuStore;
})(Fluxxor, CommonConsts);
