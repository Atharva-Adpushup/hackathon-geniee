var React = window.React,
    Fluxxor = require("../../../../libs/third-party/fluxxor"),
    CommonConsts = require("../../../../editor/commonConsts"),
    AM = CommonConsts.enums.actionManager,
    FluxMixin = Fluxxor.FluxMixin(React),
    Row = require("../../../BootstrapComponents/Row.jsx"),
    Col = require("../../../BootstrapComponents/Col.jsx"),
    NetworkEditor = require("./networkEditor.jsx"),
    VariationEditor = require("./variationEditor.jsx"),
    SiteNetworkMap = require("./siteNetworkMap.jsx"),
    AdsenseManager = require("./adsenseManager.jsx");

module.exports = React.createClass({
    mixins: [FluxMixin],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {
            screen: 0,
            activeNetwork: null
        };
    },
    componentWillReceiveProps(nextProps){
        this.setState(this.getInitialState());
    },
    addNewNetwork: function (json) {
        this.changeScreen(0);
        this.getFlux().actions.addCustomNetwork(json);
    },
    editNetwork: function (network,json) {
        this.changeScreen(0);
        this.getFlux().actions.editNetwork({network:network,json:json});
    },
    showEditNetworkScreen: function (network,ev){
        ev.preventDefault();
        this.setState({screen:2,activeNetwork:network});
    },
    showVariationManagerScreen: function (network,ev){
        ev.preventDefault();
        this.setState({screen:3,activeNetwork:network});
    },
    addVariationsToNetwork: function(network,json){
        this.getFlux().actions.addVariationsToNetwork({network:network,json:json});
    },
    enableDisableSiteNetworks: function(newNetworks,networksToRemove){
        this.props.flux.actions.createAction({name:AM.publicCommands.ADD_REMOVE_CUSTOM_AD_NETWORKS,owner:AM.levels.SITE,audienceId:this.props.defaultAudience.id,networksToAdd:newNetworks,networksToRemove:networksToRemove})
    },
    changeScreen: function(screen,ev){
        if(ev)
            ev.preventDefault();
        this.setState({screen:screen})
    },
    renderNetworkSummary: function () {
        var networks = this.props.site.adNetworks.map(function (network) {
            if (network.name == "ADSENSE") {
                return <div>{network.name}</div>
            } else {
                return (
                    <Row>
                        <Col xs={4}>{network.name}</Col>
                        <Col xs={4}>
                            <a href="#" onClick={this.showEditNetworkScreen.bind(null,network)} >Edit Network</a>
                        </Col>
                        <Col xs={4}>
                            <a href="#" onClick={this.showVariationManagerScreen.bind(null,network)} >Add Variations</a>
                        </Col>
                    </Row>
                )
            }
        }.bind(this));
        var me = this;
        return (
            <div className="modal-body">
              <Panel header={networks}>
                <Row>
                  <Col xs={4}>
                  <a href="#" onClick={me.changeScreen.bind(null,1)}>Add New Network</a>
                  </Col>
                  <Col xs={4}>
                  <a href="#" onClick={me.changeScreen.bind(null,4)}>Use Network</a>
                  </Col>
                </Row>
              </Panel>
            </div>
        );
    },
    decideScreen: function(){

        switch(this.state.screen){
            case 1:
                return (<NetworkEditor onCancel={this.changeScreen.bind(0)} onSave={this.addNewNetwork}/>);
                break;
            case 2:
                return (<NetworkEditor onCancel={this.changeScreen.bind(0)} network={this.state.activeNetwork} onSave={this.editNetwork.bind(null,this.state.activeNetwork)}/>);
                break
            case 3:
                return (<VariationEditor network={this.state.activeNetwork} onBack={this.changeScreen.bind(0)} onSave={this.addVariationsToNetwork.bind(null,this.state.activeNetwork)}/>);
                break
            case 4:
                return (<SiteNetworkMap onBack={this.changeScreen.bind(0)} onSave={this.enableDisableSiteNetworks} adNetworks={this.props.site.adNetworks} actions={this.props.networksActions}/>);
                break
            default:
                return this.renderNetworkSummary();
        }
    },
    render: function(){
        if(!this.props.site)
            return (null)
        return (<Modal onRequestHide={this.props.flux.actions.hideMenu} className="_ap_modal networkmanager" title='Network Editor' keyboard={true} animation={true}>

            {this.decideScreen()}

        </Modal>)
    }
})