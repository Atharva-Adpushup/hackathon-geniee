var React = window.React,
    CommonConsts = require("../../../../editor/commonConsts"),    Button = require("../../../BootstrapComponents/Button.jsx"),
    ButtonGroup = require("../../../BootstrapComponents/ButtonGroup.jsx"),
    Input = require("../../../BootstrapComponents/Input.jsx"),
    Row = require("../../../BootstrapComponents/Row.jsx"),
    Col = require("../../../BootstrapComponents/Col.jsx"),
    AdsenseColorPicker = require("./adsneseColorPicker.jsx"),
    Swatch = require("../colorSwatch.jsx"),
    Panel = require("../../../BootstrapComponents/Panel.jsx"),
    ListView = require("../listView.jsx"),
    AdsenseActionManager = require("./adsenseActionManager.jsx"),
    CustomNetworkActionManager = require("./customNetworkActionManager.jsx"),
    EnableDisableSwitch = require("../../../CustomComponents/EnableDisableSwitch.jsx"),
    Fluxxor = require("../../../../libs/third-party/fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    cmds = CommonConsts.enums.actionManager.publicCommands,
    levels = CommonConsts.enums.actionManager.levels,
    adsneseActions = CommonConsts.enums.actionManager.actions;

module.exports = React.createClass({
    mixins: [FluxMixin],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {};
    },
    sendAction: function(payload){
        payload['owner'] = this.props.owner;
        payload['audienceId'] = this.props.audienceId;
        if (this.props.owner != levels.SITE) {
            payload['ownerId'] = this.props.ownerId;
        }
        this.getFlux().actions.createAction(payload);
    },
    addNewNetwork: function(network,ev){
        ev.preventDefault();
        switch(network){
            case "ADSENSE":
                this.sendAction({name: cmds.ADD_DEFAULT_ADSENSE});
                break;
            default:
                this.sendAction({name: cmds.ADD_CUSTOM_AD_NETWORK,network:network});
        }
    },
    renderAvailableNetworks: function (availableNetwroks) {
        var  me = this;
        return (<Row>{
                availableNetwroks.map(function (network) {
                    return <a href="#" onClick={me.addNewNetwork.bind(null,network)}>{network}</a>
                })
            }</Row>)
    },
    renderCustomNetworkActionManager: function (network) {
        return (<CustomNetworkActionManager
                    network={network}
                    audienceId={this.props.audienceId}
                    owner={this.props.owner}
                    ownerId={this.props.ownerId}
                />
        )
    },
    renderAdsenseActionManger: function (adsense) {
        return (
            <AdsenseActionManager
                adsense={adsense}
                templates={this.props.templates['adsense']}
                audienceId={this.props.audienceId}
                owner={this.props.owner}
                ownerId={this.props.ownerId}
            />
        )
    },
    renderNetworkComponents: function () {
        return this.props.actions.map(function (action) {
            switch (action.key) {

                case "ADSENSE":
                    return this.renderAdsenseActionManger(action);
                    break;

                default:
                    return this.renderCustomNetworkActionManager(action);

            }
        }.bind(this))
    },
    render: function () {
        var me = this,
            usedNetworks = _(_(this.props.actions || []).where({dataType: "ADNETWORK"})).pluck("key"),
            allNetworks = _(this.props.adNetworks || []).pluck("name"),
            availableNetworks = _.difference(allNetworks, usedNetworks);

        return (
            <div>
                {me.renderNetworkComponents()}
                {availableNetworks.length ? me.renderAvailableNetworks(availableNetworks) : null}
            </div>
        );
    }


})