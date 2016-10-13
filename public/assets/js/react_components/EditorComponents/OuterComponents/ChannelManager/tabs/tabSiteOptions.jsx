var React = window.React,
    Fluxxor = require("libs/third-party/fluxxor")
    _ = require("libs/third-party/underscore"),
    CommonConsts = require("editor/commonConsts"),
    CM = CommonConsts.enums.components,

    DomUtils = require("BootstrapComponents/utils/domUtils.js"),
    Modal = require("BootstrapComponents/Modal.jsx"),
    ModalTrigger = require("BootstrapComponents/ModalTrigger.jsx"),
    ColorTemplate = require("ActionManger/adsenseColorTemplateManager.jsx"),
    AudienceManager = require("AudienceManager/audienceManager.jsx"),
    ActionManager = require("ActionManger/actionManager.jsx"),
    NetworkManager = require("NetworkManager/networkManager.jsx"),
    OverlayMixin = require("BootstrapComponents/OverlayMixin"),

    OverlayTrigger = require("BootstrapComponents/OverlayTrigger.jsx"),
    Tooltip = require("BootstrapComponents/Tooltip.jsx"),
    Button = require("BootstrapComponents/Button.jsx"),
    Glass = require("CustomComponents/glass.jsx"),
    FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
    mixins: [FluxMixin],
    getDefaultProps: function () {
        return {
            adRecoverMode: 2
        };
    },

    getInitialState: function () {
        return {};
    },
    componentWillReceiveProps: function (nextProps) {

    },
    toggleEditorMode: function (e) {
        if (e.target.value == "editor")
            this.getFlux().actions.changeEditorMode(true);
        else
            this.getFlux().actions.changeEditorMode(false);
    },

    toggleAdRecoverMode: function(e) {
        var obj = {
            "adRecover": {
                "mode": 1
            }
        };

        if (e.target.value == "adRecoverPause") {
            obj.adRecover.mode = 2;
            this.getFlux().actions.updateApConfigs(obj);
        }
        else if (e.target.value == "adRecoverGoLive") {
            obj.adRecover.mode = 1;
            this.getFlux().actions.updateApConfigs(obj);
        }
    },

    masterSave: function () {
        var adsense = _(this.props.adNetworks).findWhere({name: "ADSENSE"});
        this.getFlux().actions.masterSave();
    },
    editorModes: function () {
        return (
            <div className="modes">
                <input onChange={this.toggleEditorMode} type="radio" className="modes-input" name="editorMode" value="editor" id="editormode" defaultChecked />
                <OverlayTrigger placement='bottom' overlay={<Tooltip>Editor Mode</Tooltip>}>
                    <label htmlFor="editormode" className="modes-label modes-label-off"><i className="fa fa-code"></i></label>
                </OverlayTrigger>

                <input onChange={this.toggleEditorMode} type="radio" className="modes-input" name="editorMode" value="browse" id="browsemode"/>
                <OverlayTrigger placement='bottom' overlay={<Tooltip>Browse Mode</Tooltip>}>
                    <label htmlFor="browsemode" className="modes-label modes-label-on"><i className="fa fa-globe"></i></label>
                </OverlayTrigger>

                <span className="modes-selection"></span>
            </div>);
    },
    adRecoverModes: function() {
        var adRecoverMode = parseInt(this.props.adRecoverMode, 10),
            modeObj = {
                pause: false,
                goLive: false
            };

            if (adRecoverMode === 1) {
                modeObj['goLive'] = true;
            } else if (adRecoverMode === 2) {
                modeObj['pause'] = true;
            }

        return (
            <div className="modes modeslarg modes--adrecover">
                <input onChange={this.toggleAdRecoverMode} type="radio" className="modes-input modes-input--off" name="adRecoverModes" value="adRecoverPause" id="adRecoverPauseMode" checked={modeObj['pause']} />
                <OverlayTrigger placement='bottom' overlay={<Tooltip>AdRecover Pause</Tooltip>}>
                    <label htmlFor="adRecoverPauseMode" className="modes-label modes-label-off">AR Pause</label>
                </OverlayTrigger>

                <input onChange={this.toggleAdRecoverMode} type="radio" className="modes-input modes-input--on" name="adRecoverModes" value="adRecoverGoLive" id="adRecoverGoLiveMode" checked={modeObj['goLive']} />
                <OverlayTrigger placement='bottom' overlay={<Tooltip>AdRecover Go Live</Tooltip>}>
                    <label htmlFor="adRecoverGoLiveMode" className="modes-label modes-label-on">AR Go Live!</label>
                </OverlayTrigger>

                <span className="modes-selection"></span>
            </div>);
    },
    siteModes: function () {
        var me = this;
        return (
            <div className="modes modes--stateChange">
                <input type="radio" className="modes-input modes-input-off" name="view" value="editor" id="draftmode" checked={this.props.siteMode == CommonConsts.enums.site.modes.DRAFT} />
                <OverlayTrigger placement='bottom' overlay={<Tooltip>{me.props.siteMode == CommonConsts.enums.site.modes.DRAFT ? "AdPushup is currently paused" : "Pause AdPushup"}</Tooltip>}>
                    <label onClick={this.showMenu.bind(null,CM.PUBLISH_HELPER)} htmlFor="draftmode" className="modes-label modes-label-off">
                        <i className="fa fa-pause"></i>
                    </label>
                </OverlayTrigger>

                <input type="radio" className="modes-input modes-input-on" name="view" value="browse" id="publishmode" checked={this.props.siteMode == CommonConsts.enums.site.modes.PUBLISH}/>
                <OverlayTrigger placement='bottom' overlay={<Tooltip>{me.props.siteMode == CommonConsts.enums.site.modes.PUBLISH ? "AdPushup is currently optimizing your website" : "Start Optimization"}</Tooltip>}>
                    <label onClick={this.showMenu.bind(null,CM.PUBLISH_HELPER)} htmlFor="publishmode" className="modes-label modes-label-on">
                        <i className="fa fa-play"></i>
                    </label>
                </OverlayTrigger>

                <span className="modes-selection"></span>
            </div>);
    },
    showMenu:function(menu,ev){
        var position = DomUtils.menuRenderPosition(ev.target);
        this.getFlux().actions.showComponent(menu,position.left,position.top);
    },

    isAdRecoverInSite: function(arr) {
        var isAdRecover = false;

        if (Array.isArray(arr) && arr.length > 0) {
            arr.map(function(channel, idx, origArr) {
                if (channel.isAdRecover) {
                    isAdRecover = true;
                }
            });
        }

        return isAdRecover;
    },

    render: function () {

        return (
            <div className="option-right">
                {this.editorModes()}

                { (window.NETWORK_MODE) ? ( <OverlayTrigger placement='bottom' overlay={<Tooltip>Network</Tooltip>}>
                        <Button id="networkOptions" className="btn btn-sm btn-lightBg"
                                onClick={this.showMenu.bind(null,CM.NETWORK_MANAGER )}>Network</Button>
                    </OverlayTrigger>) : null
                }

                <OverlayTrigger placement='bottom' overlay={<Tooltip>AdPushup Options</Tooltip>}>
                    <Button id="miscOptions" className="btn-sm btn-lightBg btn-option btn--icon" onClick={this.showMenu.bind(null,CM.MISC_MENU )}></Button>
                </OverlayTrigger>

                <OverlayTrigger placement='bottom' overlay={<Tooltip>Save changes</Tooltip>}>

                    <Button ref="saveButton" onClick={this.masterSave} className="btn-sm btn-save btn-lightBg btn--success btn--icon pull-left"></Button>
                </OverlayTrigger>


                {this.siteModes()}
                {this.isAdRecoverInSite(this.props.allChannels) ? this.adRecoverModes() : null}
            </div>

        );
    }
})