var React = window.React,
    _ = require("libs/third-party/underscore"),

    utils = require("libs/custom/utils"),
    CommonConsts = require("editor/commonConsts"),
    AM = CommonConsts.enums.actionManager,
    AN = CommonConsts.enums.adNetworks,
    EnableDisableSwitch = require("CustomComponents/EnableDisableSwitch.jsx"),
    Accordion = require("BootstrapComponents/Accordion.jsx"),
    Panel = require("BootstrapComponents/Panel.jsx"),
    Row = require("BootstrapComponents/Row.jsx"),
    Button = require("BootstrapComponents/Button.jsx"),
    Col = require("BootstrapComponents/Col.jsx");

module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },

    getInitialState: function () {
        var state = {};
        _(this.props.adNetworkActions).each(function(networkAction){
            if(_.isEmpty(state[networkAction.key])){
                state[networkAction.key] = {};
            }
            var networkAdTypes = networkAction.getActionByKey(networkAction.key == AN.integratedNetworks.ADSENSE ? AM.actions.ADSENSE_ADTYPES : AM.actions.CUSTOM_ADTYPES);
            _(networkAdTypes.value).each(function(adtype){
                state[networkAction.key][adtype.data] = (adtype.status == AM.status.APPEND);
            })
        });
        state.activeTab = 1;
        return state;
    },
    toggleAdType: function(network,adType){
        this.state[network][adType] = !this.state[network][adType]
        this.setState(this.state);
    },
    onSave:function() {
        var iState = this.getInitialState(),changed={};
        _(this.state).each(function(adtypes,network){
            _(adtypes).each(function(status,adtype){
                if(iState[network][adtype] != this.state[network][adtype]){
                    if(_.isEmpty(changed[network])) changed[network] =  {};
                    changed[network][adtype] = status ? AM.status.APPEND : AM.status.DISABLED
                }
            }.bind(this))
        }.bind(this))
        this.props.onSave(changed)
    },
    getName: function(type){
        switch (type){
            case AN.adTypes.IMAGE:
                return "Image";
            case AN.adTypes.TEXT:
                return "Text";
            case AN.adTypes.TEXT_IMAGE:
                return "Text Image";
            case AN.adTypes.MULTIMEDIA:
                return "Multimedia";

        }
    },
    handleTabClick: function (key) {
        this.setState({activeTab: key});
    },
    render: function () {
        var changed = utils.deepDiffMapper.test(this.state, this.getInitialState()).isChanged,count = 0;

        return (
            <div className="containerButtonBar">

                <Accordion activeKey={this.state.activeTab} onSelect={this.handleTabClick}>
                    {_(this.state).map(function (adtypes, network) {
                        if(network == "activeTab")
                            return null;
                        var networkAction = _(this.props.adNetworkActions).find({key:network});
                        var networkAdTypes = networkAction.getActionByKey(networkAction.key == AN.integratedNetworks.ADSENSE ? AM.actions.ADSENSE_ADTYPES : AM.actions.CUSTOM_ADTYPES);
                        count++;
                        return (
                            <Panel header={network}  eventKey={count} className="panelBySize">
                                {_(adtypes).map(function (networkAdTypes,status,adType) {
                                    return (
                                        <Row className="m-All-0">
                                        <div className="adsDescriptor">
                                        <Row>
                                            <Col xs={6}  className="u-padding-r10px">{this.getName(adType) + " ("+networkAdTypes.getValue(adType).meta.owner+")"}</Col>
                                            <Col xs={6}  className="u-padding-r10px">
                                                <EnableDisableSwitch  size="s" id={network+adType} onChange={this.toggleAdType.bind(null, network,adType)} checked={status} on="On" off="Off"/>
                                            </Col>
                                        </Row>
                                        </div>
                                        </Row>
                                    )
                                }.bind(this,networkAdTypes))}
                            </Panel>
                        );
                    }.bind(this))}
                </Accordion>

                <Row className="butttonsRow">
                    <Col xs={12}>
                        <Button ref="save" disabled={!changed} onClick={this.onSave} className="btn-lightBg btn-save btn-block">Save</Button>
                    </Col>
                </Row>
            </div>
        );
    }
})