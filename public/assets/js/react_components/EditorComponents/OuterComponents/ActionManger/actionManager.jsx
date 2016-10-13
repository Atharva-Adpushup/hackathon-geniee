var $ = window.jQuery,
    React = window.React,
    CommonConsts = require("../../../../editor/commonConsts"),    cmds = CommonConsts.enums.actionManager.publicCommands,
    adSizes = CommonConsts.enums.adSizes,
    levels = CommonConsts.enums.actionManager.levels,
    Actions = CommonConsts.enums.actionManager.actions,
    Fluxxor = require("../../../../libs/third-party/fluxxor"),
    Button = require("../../../BootstrapComponents/Button.jsx"),
    PopUp = require("../../../CustomComponents/popUp.jsx"),
    ListView = require("../listView.jsx"),
    ButtonGroup = require("../../../BootstrapComponents/ButtonGroup.jsx"),
    Row = require("../../../BootstrapComponents/Row.jsx"),
    ListGroup = require("../../../BootstrapComponents/ListGroup.jsx"),
    ListGroupItem = require("../../../BootstrapComponents/ListGroupItem.jsx"),
    Input = require("../../../BootstrapComponents/Input.jsx"),
    Accordion = require("../../../BootstrapComponents/Accordion.jsx"),
    Panel = require("../../../BootstrapComponents/Panel.jsx"),
    NetworkActionManager = require("./networkActionManager.jsx"),
    FluxMixin = Fluxxor.FluxMixin(React);


module.exports = React.createClass({

    mixins: [FluxMixin, React.addons.LinkedStateMixin],

    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return this.getDefaultState(this.props);
    },
    componentWillReceiveProps: function (nextProps) {
        this.setState(this.getDefaultState(nextProps));
    },
    getDefaultState: function (props) {
        var state = {}, adsOnPage = null;
        props.audiences.forEach(function (audience) {
            adsOnPage = (this.findAction(Actions.ADS_ON_PAGE, audience.id)) ? parseInt(this.findAction(Actions.ADS_ON_PAGE, audience.id).value) : 3;
            state["adsOnPage_" + audience.id] = adsOnPage;
        }.bind(this));
        return state;
    },
    disableSectionComponent: function () {

    },

    addSize: function (audienceId, size) {
        size = size.replace(" x ", ",")
        this.getFlux().actions.createAction({
            name: cmds.ADD_SIZE_TO_INCONTENT_SECTION,
            owner: this.props.owner,
            ownerId: this.props.activeId,
            audienceId: audienceId,
            adSize: {width:parseInt(adSize[0]),height:parseInt(adSize[1])}
        });
    },
    inconetentSizeAdder: function (audienceId) {
        var size = this.findAction(Actions.SIZES, audienceId), availableSizes = [], sizes = [];
        if (size) {
            sizes = _(size.value).pluck("data");
        }

        availableSizes = availableSizes.concat(Object.keys(ADP.enums.adSizes.Square), Object.keys(ADP.enums.adSizes.Horizontal), Object.keys(ADP.enums.adSizes.Vertical));
        availableSizes = _(availableSizes).reject(function (size) {
            return sizes.indexOf(size.replace(" x ", ",")) !== -1
        });

        return (
            <div>
                <Row>
                {sizes.map(function(size){return size.width+" X "+size.height+" "})}
                </Row>
                <PopUp title="Choose Sizes" triggerComponent={(<Button>Add Sizes</Button>)}  >
                    <ListView title="Available Sizes" items={availableSizes} addHandler={this.addSize.bind(this, audienceId)}/>
                </PopUp>
            </div>

        )
    },
    findAction: function (key, audienceId) {
        return _.findWhere(this.props.actions, {key: key, audienceId: audienceId});
    },
    getSegments: function () {
        var c = 0,
            segments = this.props.audiences.map(function (audience) {
                c++;
                return (
                    <Panel eventKey={c} header={audience.name} bsStyle="primary">

                        <NetworkActionManager
                            actions={_(this.props.actions || []).where({
                                dataType: "ADNETWORK",
                                audienceId: audience.id
                            })}
                            adNetworks={this.props.adNetworks}
                            templates={this.props.templates}
                            audienceId={audience.id}
                            owner={this.props.owner}
                            ownerId={this.props.activeId}
                        />
                        <label>Total Ads On Page</label>
                        <Input type="text" valueLink={this.linkState("adsOnPage_" + audience.id)} />
                        {this.props.owner == levels.INCONTENT_SECTION ? this.inconetentSizeAdder(audience.id) : null}
                    </Panel>
                )
            }.bind(this));
        return (<Accordion defaultActiveKey={1}>{segments}</Accordion>);
    },
    render: function () {
        return (
            <div id="actionManager">
                {this.getSegments()}
            </div>
        );

    }
});