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
    PopUp = require("../../../CustomComponents/popUp.jsx"),
    EnableDisableSwitch = require("../../../CustomComponents/EnableDisableSwitch.jsx"),
    Fluxxor = require("../../../../libs/third-party/fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    cmds = CommonConsts.enums.actionManager.publicCommands,
    levels = CommonConsts.enums.actionManager.levels,
    adsneseActions = CommonConsts.enums.actionManager.actions;

module.exports = React.createClass({
    mixins: [React.addons.LinkedStateMixin, FluxMixin],
    getDefaultProps: function () {
        return {templates: [], action: {}};
    },
    getInitialState: function (props) {
        props = props || this.props;
        return {
            noOfAdsenseAds: (props.adsense && props.adsense.getActionByKey(adsneseActions.ADSENSE_TOTAL_ADS)) ? props.adsense.getActionByKey(adsneseActions.ADSENSE_TOTAL_ADS).value : 3,
            showTlpList: false
        };
    },
    componentWillReceiveProps: function (nextProps) {
        this.setState(this.getInitialState(nextProps));
    },
    sendAction: function (payload) {
        payload['owner'] = this.props.owner;
        payload['audienceId'] = this.props.audienceId;
        if (this.props.owner != levels.SITE) {
            payload['ownerId'] = this.props.ownerId;
        }
        this.getFlux().actions.createAction(payload);
    },
    toggleTplList: function () {
        this.setState({showTlpList: !this.state.showTlpList})
    },
    toggleCreateTpl: function () {
        this.setState({showCreateTpl: !this.state.showCreateTpl})
    },
    addColorTemplate: function (tpl) {
        if (tpl)
            this.sendAction({name: cmds.ADD_ADSENSE_COLOR, tpl: tpl});
    },
    colorTemplateSelector: function () {
        var action = this.props.adsense.getActionByKey(adsneseActions.ADSENSE_COLORS),
            names = [],
            availableTpls = [],
            final = [];

        action.value.forEach(function (val) {
            names.push(val.data.name);
        })

        this.props.templates.forEach(function (tpl) {
            if (names.indexOf(tpl.name) == -1) {
                availableTpls.push(tpl)
            }
        })


        if (availableTpls.length) {
            final.push((function () {
                return (
                    <PopUp title="Choose Color Template" triggerComponent={(<Button>Add Tpl</Button>)}  >
                        <ListView title="Templates" items={availableTpls} display="name" addHandler={this.addColorTemplate}/>
                    </PopUp>
                )
            }.bind(this))())
        }

        final.push(
            <PopUp title="Create Color Template" trigger="click" triggerComponent={(<Button>Create Tpl</Button>)}  >
                <AdsenseColorPicker/>
            </PopUp>
        )

        return (<div>{final.map(function (item) {
            return item;
        })}</div>);

    },
    createAdsenseComponent: function () {
        return (<div>
            <a href="#" onClick={this.sendAction.bind(null, {name: cmds.ADD_DEFAULT_ADSENSE})}>Add Adsense</a>
        </div>)
    },
    toggleColor: function (tpl, status) {
        status = (status == true) ? CommonConsts.enums.actionManager.status.APPEND : CommonConsts.enums.actionManager.status.DISABLED;
        this.sendAction({name: cmds.CHANGE_ADSENSE_COLOR_STATUS, tpl: tpl, status: status});
    },
    toggleAdType: function (adType, status) {
        status = (status == true) ? CommonConsts.enums.actionManager.status.APPEND : CommonConsts.enums.actionManager.status.DISABLED;
        this.sendAction({name: cmds.CHANGE_ADSENSE_ADTYPE_STATUS, adType: adType, status: status});
    },
    onMouseOverSwatch: function (tpl) {
        console.log(tpl)
    },
    render: function () {
        if (!(this.props.adsense))
            return this.createAdsenseComponent();

        var colorTpls = this.props.adsense.getActionByKey(adsneseActions.ADSENSE_COLORS).value.map(function (tpl) {
            return (
                <div className="addTypesWrap" onMouseEnter={this.onMouseOverSwatch.bind(null, tpl.data)}>
                    <PopUp title="Create Color Template" trigger="click" triggerComponent={(<Swatch  tpl={tpl.data}/>)}  >
                        <EnableDisableSwitch onChange={this.toggleColor.bind(null, tpl.data)} checked={(tpl.status == CommonConsts.enums.actionManager.status.APPEND)}/>
                    </PopUp>
                    <div>{tpl.meta.owner}</div>
                </div>)
        }.bind(this))

        var adTypes = this.props.adsense.getActionByKey(adsneseActions.ADSENSE_ADTYPES).value.map(function (adType) {
            return (<div className="addTypesWrap">
                <div>{adType.data}</div>
                <div>{adType.meta.owner}</div>
                <EnableDisableSwitch onChange={this.toggleAdType.bind(null, adType.data)} checked={(adType.status == CommonConsts.enums.actionManager.status.APPEND)}/>
            </div>)
        }.bind(this))

        return (
            <Panel header="Adsense" className="adsenseWrapper">
                <Row>
                    <Col xs={4}>
                        <label>Number of Adsense Ads</label>
                    </Col>
                    <Col xs={6}>
                        <Input type="text" placeholder="Total number of Adsense Ads" valueLink={this.linkState('noOfAdsenseAds')}/>
                    </Col>
                    <Col xs={2}>
                    </Col>
                </Row>
                <Row>
                    <Col xs={4}>
                        <label>Color Templates</label>
                    </Col>
                    <Col xs={5}>
                        {colorTpls}
                    </Col>
                    <Col xs={3}>
                        { this.colorTemplateSelector()}
                    </Col>
                </Row>
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