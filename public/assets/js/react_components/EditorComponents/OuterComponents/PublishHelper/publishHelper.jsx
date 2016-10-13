var React = window.React,
    $ = window.jQuery,
    Utils = require("libs/custom/utils")
    Row = require("BootstrapComponents/Row.jsx"),
    Glass = require("CustomComponents/glass.jsx"),
    DataSyncService = require("editor/dataSyncService"),
    CommonConsts = require("editor/commonConsts"),
    Panel = require("BootstrapComponents/Panel.jsx"),
    Accordion = require("BootstrapComponents/Accordion.jsx");
    Col = require("BootstrapComponents/Col.jsx");


var status = CommonConsts.enums.status;

module.exports = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getDefaultProps: function () {
        return {};
    },
    checkApStatus: function () {
        DataSyncService.isApInstalled(this.props.url || window.ADP_SITE_DOMAIN, window.ADP_SITE_ID).then(function (apStatus) {
            (apStatus && apStatus.ap) ? this.setState({apStatus: status.SUCCESS}) : this.setState({apStatus: status.FAILED})
        }.bind(this))
    },
    getInitialState: function () {
        this.timer = null;
        this.checkApStatus();
        return {
            apStatus: status.PENDING,
            controlStatus: status.FALSE,
            modeChanged: false
        };
    },
    componentWillReceiveProps: function (nextProps) {
        if (typeof nextProps.mode !== "undefined" && (nextProps.mode !== this.props.mode)) {
            this.setState({modeChanged: true});
        }
    },
    shouldComponentUpdate: function (nextProps,nextState) {
        return Utils.deepDiffMapper.test(nextState,this.state).isChanged
    },
    changeMode: function (mode) {
        this.props.flux.actions.changeMode(mode)
    },
    renderWaitMessage: function () {
        return (
            <div>Changing Mode Please Wait</div>
        )
    },
    renderSuccessMessage: function () {

        return (
            <div>Mode Change SuccessFully</div>
        )
    },
    showGuider: function (guider) {
        this.props.flux.actions.showComponent(guider)
    },
    onGlassClick: function () {
        this.props.flux.actions.hideMenu();
    },
    render: function () {
        var style = {
            position: "absolute",
            top: this.props.position.posY,
            left: this.props.position.posX - 300,
            zIndex: 10000,
            backgroundColor: "white",
            boxShadow: "0 1px 10px 0 rgba(0, 0, 0, 0.3)",
            width: "300px"
        }

        if (this.state.modeChanged) {
            setTimeout(function(){
                this.props.flux.actions.hideMenu();
            }.bind(this),0)
            return (null)
        }


        if (this.props.mode == CommonConsts.enums.site.modes.PUBLISH && !this.state.modeChanged) {
            setTimeout(function(){
                this.changeMode(CommonConsts.enums.site.modes.DRAFT);
            }.bind(this),0)

            return (
                <div style={style} className="publishHelperWrap">
                    <div className="publishHelperHeading"> Please wait</div>
                    <div className="publishHelperWrapInner">
                    {this.renderWaitMessage()}
                    </div>
                </div>
            )
        }

        if (this.props.mode == CommonConsts.enums.site.modes.DRAFT && this.state.modeChanged) {
            return (null)
        }

        var allDone = (this.props.oAuthStatus && (this.state.apStatus === status.SUCCESS) && this.state.controlStatus)
        if (allDone && !this.state.modeChanged) {
            setTimeout(function(){
                this.changeMode(CommonConsts.enums.site.modes.PUBLISH)
            }.bind(this),0)

        }

        return (<div>
            <Glass clickHandler={this.onGlassClick}/>


            <div style={style} className="publishHelperWrap">
                <div className="publishHelperHeading">Please complete the following before AdPushup goes live on the site!</div>
                <div className="publishHelperWrapInner">
                {(allDone && !this.state.modeChanged) ? this.renderWaitMessage() : (allDone && this.state.modeChanged) ? null :
                  <Accordion>
                    <Panel header="Page Group Setup" className={this.props.url ? "completed" : "notcompleted" }  eventKey={1}>
                      <div>You should have at least one Page Group set up.<a className="btn btn-sm btn-lightBg publishHelperhelp" onClick={this.showGuider.bind(null, CommonConsts.enums.components.PAGE_GROUP_GUIDER)}>Read more</a></div>  
                    </Panel>
                    <Panel header="AdPushup snippet" className={this.state.apStatus == status.PENDING ? "pending" : (this.state.apStatus == status.SUCCESS) ? "completed" : "notcompleted" }  eventKey={2}>
                      <div>We can't optimize your site if AdPushup snippet isn't installed! :) <a className="btn btn-sm btn-lightBg publishHelperhelp" onClick={this.showGuider.bind(null, CommonConsts.enums.components.ADPUSHUP_INSTALLATION_GUIDER)}>Read more</a></div>
                    </Panel>
                    <Panel header="AdSense Setup" className={this.props.oAuthStatus ? "completed" : "notcompleted"}   eventKey={3}>
                      <div>Connect your Google AdSense account with AdPushup so we can display & optimize them<a className="btn btn-sm btn-lightBg publishHelperhelp" onClick={this.showGuider.bind(null, CommonConsts.enums.components.OAUTH_GUIDER)}>Read more</a></div>
                    </Panel>

                    <Panel header="Control Ad Setup" className={this.state.controlStatus ? "completed" : "notcompleted"}  eventKey={4}>
                        <div>We strongly recommend setting up Control Ads on your site. They can help you track AdPushup performance, act as fallback in case of failure and much more. Please take a moment out to understand them.
                            <a className="btn btn-sm btn-lightBg publishHelperhelp" onClick={this.showGuider.bind(null, CommonConsts.enums.components.CONTROL_CONVERSION_GUIDER)}>Read more</a><br/></div>
                        <input type="checkbox" className="maincheckbox" id="ctrlconverted" checkedLink={this.linkState("controlStatus")}/>
                        <label htmlFor="ctrlconverted">Yes, I understand what control ads are, and have set them up.</label>
                    </Panel>
                  </Accordion>
                    }
                </div>
            </div>
        </div>
        )
    }
})