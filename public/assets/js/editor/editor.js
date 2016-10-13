var $ = window.jQuery,
    _ = require("../libs/third-party/underscore"),
    Utils = require("../libs/custom/utils"),
    introJs = require("../libs/third-party/intro"),
    Messenger = require("../libs/custom/messenger"),
    CC = require("../react_components/outerMain.jsx"),
    Flux = require("./flux"),
    LocalStore = require("./localStore"),
    React = window.React,

    Condition = require("./condition"),
    AdNetworkSettings = require("./adNetworkSettings");

module.exports = (function ($, _, Utils, intro, Messenger, CC, Flux, React, Condition, AdNetworkSettings) {


    var Editor = function () {
        this.messenger = new Messenger();
        this.offset = null;
        this.flux = Flux({messenger: this.messenger});

        window.DEBUG_MODE = false;


        $(document).ready(function(){
            if( window.chrome )
            {
                $(document).ready(function(){
                    this.intro = intro.introJs(document.body);
                    this.initComponents();
                }.bind(this));
            }
        }.bind(this));


    };

    Editor.prototype.initComponents = function () {

        if(!window.analytics){
            window.analytics = {
                track: function(event,data){
                    console.log(event,data)
                }
            }
        }
        //render Editor
        React.render(React.createElement(CC.OuterEditor, {flux: this.flux, intro:this.intro}), document.body);

        //load site
        this.flux.actions.loadSite( this.messenger );

        window.onbeforeunload = this.handleBeforeUnload.bind(this)
        this.messenger.onMessage.bind(this.handleMessage, this);
        this.intro.onafterchange(function(targetElement) {
                if($(targetElement).hasClass("intercom-launcher")){
                    setTimeout(function(){
                        $("#finishIntro").click(function(){
                            this.intro.exit();
                        }.bind(this))
                    }.bind(this),2000)
                }
        }.bind(this));
        this.intro.setOptions({
            enable: false,/*! window.ADP_HAS_SITE_OBJECT,*/
            showButtons: false,
            showBullets: false,
            keyboardNavigation:false,
            showStepNumbers: false,
            exitOnOverlayClick: false,
            exitOnEsc: false,
            steps: [
                {
                    element: "div.tabBar > ul",
                    intro: "Click here to create a new <b>\"page group\"</b>. A <b>\"page group\"</b> is  basically a collection of similar pages, grouped to help you setup ads on multiple pages at once.",
                    position: 'right',
                    done:false
                },
                {
                    element: '#newChannelMenu .row:nth-child(1)',
                    intro: 'Please Enter the name for Page Group. <div class="introjs-tooltipbuttons"><a href="javascript:void(0);" class="introjs-button introjs-nextbutton">Next →</a></div>',
                    position: 'right'
                },
                {
                    element: '#newChannelMenu .platformRow',
                    intro: 'Select <b>device</b> for this Ad setup. You can always create setups for other devices later. <div class="proTip">Start off with the device for which your site get most hits.</div>',
                    position: 'right'
                },
                {
                    element: '#newChannelMenu .sampleUrl',
                    intro: 'Enter a <b>"sample URL"</b>. A <b>"sample URL"</b> can be any url from the <b>"page group"</b>. <div class="introjs-tooltipbuttons"><a href="javascript:void(0);" class="introjs-button introjs-nextbutton">Next →</a></div>',
                    position: 'right'
                },
                {
                    element: '#newChannelMenu .btn-save',
                    intro: 'Click the create button. <p>We\'ll not not make any changes on your website yet.</p>',
                    position: 'right'
                },
                {
                    element: '.tabContent',
                    intro: 'Click anywhere on the page to select location for your <b>Ad</b>. ',
                    position: 'top-middle-aligned'
                },
                {
                    element: '#insertMenu .MenuBarWrapper',
                    intro: 'Great, now select where you want the ad to be placed. Possible options are: <ul><li>inserting outside (before or after) the selection<li>insert inside (append or prepend) the selection</ul>',
                    position: 'top-middle-aligned'
                },
                {
                    element: '#insertMenu .MenuBarContainer .panel-group',
                    intro: 'Select an Ad Size.',
                    position: 'top-middle-aligned'
                },
                {
                    element: '#_ap_frameElemMimic',
                    intro: 'You can always click on inserted Ad to edit it\'s settings, or insert another ad on same location.',
                    position: 'top-middle-aligned'
                },
                {
                    element: '#editMenu .MenuBarWrapper',
                    intro: 'Use this menu to edit Ad styling (CSS), delete Ad and to insert more Ads on same location. ' +
                            '<div class="introjs-tooltipbuttons"><a id="editMenuIntroNext" href="javascript:void(0);" class="introjs-button introjs-nextbutton">Next →</a></div>',
                    position: 'top-middle-aligned'
                },
                {
                    element: '#adsenseOptions',
                    intro: 'Click on this button to see Adsense Options',
                    position: 'left'
                },
                {
                    element: '#adsenseMenu .MenuBarWrapper',
                    intro: 'Use this menu to link your Adsense account with AdPushup, and do ad settings (color template, ad formats etc.)' +
                    '<div class="introjs-tooltipbuttons"><a id="adsenseMenuIntroNext" href="javascript:void(0);" class="introjs-button introjs-nextbutton">Next →</a></div>',
                    position: 'left'
                },
                {
                    element: '#miscOptions',
                    intro: 'Click here to see other options ',
                    position: 'left'
                },
                {
                    element: '#miscMenu .MenuBarWrapper',
                    intro: 'Use this menu to install our Worpress Plugin, Chrome Extension and to convert you existing ad codes (so that AdPushup can track it\'s performance too)' +
                            '<div class="introjs-tooltipbuttons"><a id="miscMenuIntroNext" href="javascript:void(0);" class="introjs-button introjs-nextbutton">Next</a></div>',
                    position: 'left'
                },
                {
                    element: '#intercom-launcher',
                    intro: 'Please setup the ads and save them. We would automatically optimize them and increase your revenue. You can always click here and ask for any help. Happy optimization!'+
                        '<div class="introjs-tooltipbuttons"><a id="finishIntro" href="javascript:void(0);" class="introjs-button introjs-nextbutton">Finish</a></div>',
                    position: 'left'
                }
            ]
        });

    };

    Editor.prototype.handleBeforeUnload = function(){
        var siteJson = this.flux.store("SiteStore").toJSONClean();
        if(LocalStore.isSiteChanged(siteJson)){
            return "You have some unsaved changes in your setup, please click Save button to save them before you leave editor. "
        }
    },

    Editor.prototype.coverFrameElem = function (elmsVitals) {
        var platformPos = $(".platform iframe:visible").offset();
        if($("_ap_frameElemMimic").length){
            $("_ap_frameElemMimic").remove();
        }

        var cover = $("<div/>",{
                'id': "_ap_frameElemMimic"
            }
        ).css({
                position: 'absolute',
                width:elmsVitals.width,
                height:elmsVitals.height,
                background: "rgba(255, 255, 0, .25)",
                "z-index": 1000,
                top:platformPos.top +  elmsVitals.top ,
                left:platformPos.left + elmsVitals.left
            });
        $("body").append(cover);
        return cover;
    }

    Editor.prototype.handleMessage = function (cmd, data) {
        var CM = ADP.enums.components;
        var platformPos = $(".platform iframe:visible").offset();

        switch (cmd) {
            case ADP.enums.messenger.SHOW_INSERT_CONTEXTMENU:
                this.flux.actions.showContextMenu( CM.INSERT_CONTEXTMENU, {menu:CM.INSERT_CONTEXTMENU, x: platformPos.left + data.clientX,  y: platformPos.top + data.clientY, parents: data.parents,insertOptions:data.insertOptions} );
                break;

            case ADP.enums.messenger.SHOW_EDIT_CONTEXTMENU:
                this.flux.actions.showContextMenu( CM.EDIT_CONTEXTMENU, {menu:CM.EDIT_CONTEXTMENU, x: platformPos.left + data.clientX,  y: platformPos.top +  data.clientY, sectionId: data.sectionId, audienceId: data.audienceId, adSize: data.adSize } );
                break;
            
            case ADP.enums.messenger.HIDE_CONTEXTMENU:
                this.flux.actions.hideContextMenu();
                break;

            case ADP.enums.messenger.SAVE_ADSENSE_INFO:
                this.flux.actions.saveAdsenseSettings({pubId:data.pubId,email:data.adsenseEmail,noOfAds:3});
                break;

            case ADP.enums.messenger.CM_FRAMELOAD_SUCCESS:
                this.flux.actions.openChannelSuccess(data.channelId);
                break;

            case ADP.enums.messenger.ACTIVE_ELEMENT_INFO:
                this.flux.actions.setDebugInfo(data.info);
                break;

            case ADP.enums.messenger.SECTION_ALL_XPATHS:
                this.flux.actions.updateSection(data);
                break;

            case ADP.enums.messenger.SECTION_XPATH_MISSING:
                this.flux.actions.updateSection({id:data.id,xpathMissing:true});
                break;

            case ADP.enums.messenger.LAST_AD_VITALS:
                if(!this.intro._options.steps[8].done && this.intro._options['enable'] == true){
                    var $el = this.coverFrameElem(data.vitals);
                    $el.on("click",function(props){
                        this.flux.actions.showContextMenu( CM.EDIT_CONTEXTMENU, {
                            menu:CM.EDIT_CONTEXTMENU,
                            x: platformPos.left + props.vitals.left,
                            y: platformPos.top +  props.vitals.top,
                            sectionId: props.sectionId,
                            audienceId: props.audienceId,
                            adSize: {height:props.vitals.height,width:props.vitals.width}
                        });
                        setTimeout(function(){$el.remove()},0);
                    }.bind(this,data));
                    this.intro.start().goToStep(9);
                }
                break;

            case 'SHOW_ADRECOVER_POPUP':
                this.flux.actions.showAdRecoverPopup(data);
                break;
        }
    };
    return Editor;


})($, _, Utils, introJs, Messenger, CC, Flux, React, Condition, AdNetworkSettings);