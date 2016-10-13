var React = window.React,
    CommonConsts = require("../../../../editor/commonConsts"),    Row = require("../../../BootstrapComponents/Row.jsx"),
    Col = require("../../../BootstrapComponents/Col.jsx"),
    Panel = require("../../../BootstrapComponents/Panel.jsx"),
    EnableDisableSwitch = require("../../../CustomComponents/EnableDisableSwitch.jsx"),
    Fluxxor = require("../../../../libs/third-party/fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    cmds = CommonConsts.enums.actionManager.publicCommands,
    levels = CommonConsts.enums.actionManager.levels,
    adsneseActions = CommonConsts.enums.actionManager.actions;

module.exports = React.createClass({
    mixins: [React.addons.LinkedStateMixin, FluxMixin],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function (props) {
        props = props || this.props;
        return {

        };
    },
    componentWillReceiveProps: function (nextProps) {
        this.setState(this.getInitialState(nextProps));
    },
    sendAction: function (payload) {
        payload['owner'] = this.props.owner;
        payload['network'] = this.props.network.key;
        payload['audienceId'] = this.props.audienceId;
        if (this.props.owner != levels.SITE) {
            payload['ownerId'] = this.props.ownerId;
        }
        this.getFlux().actions.createAction(payload);
    },
    toggleAdType: function (adType, status) {
        status = (status == true) ? CommonConsts.enums.actionManager.status.APPEND : CommonConsts.enums.actionManager.status.DISABLED;
        this.sendAction({name: cmds.CHANGE_CUSTOM_ADTYPE_STATUS, adType: adType, status: status});
    },
    render: function () {
        var adTypes = this.props.network.getActionByKey(adsneseActions.CUSTOM_ADTYPES).value.map(function (adType) {
            return (<div className="addTypesWrap">
                <div>{adType.data}</div>
                <EnableDisableSwitch onChange={this.toggleAdType.bind(null, adType.data)} checked={(adType.status == CommonConsts.enums.actionManager.status.APPEND)}/>
            </div>)
        }.bind(this))

        return (
            <Panel header={this.props.network.key}>
                <Row>
                    <Col xs={4}>
                        <label>Ad Types</label>
                    </Col>
                    <Col xs={8}>
                        {adTypes}
                    </Col>
                </Row>
            </Panel>
        );

    }
});