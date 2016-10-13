var React = window.React,
    _ = require("../../../../libs/third-party/underscore"),
    CommonConsts = require("../../../../editor/commonConsts"),
    Row = require("../../../BootstrapComponents/Row.jsx"),
    Panel = require("../../../BootstrapComponents/Panel.jsx"),
    Button = require("../../../BootstrapComponents/Button.jsx"),
    Autocomplete = require("../../../CustomComponents/ComboBox/main.js"),
    CheckboxGroup = require("../../../CustomComponents/CheckBoxGroup/checkboxGroup.jsx"),
    Col = require("../../../BootstrapComponents/Col.jsx");

var Combobox = Autocomplete.Combobox,
    ComboboxOption = Autocomplete.Option,
    Consts = CommonConsts.enums.adNetworks;

module.exports = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function (props) {
        props = props || this.props;
        if (props.network) {
            return {
                name: props.network.name || " ",
                maxAdsToDisplay: props.network.maxAdsToDisplay || 3,
                displayType: props.network.displayType || "",
                revenueType: props.network.revenueType || "",
                adTypes: props.network.supportedAdTypes || ""
            };
        } else {
            return {
                name: "",
                maxAdsToDisplay: 3,
                displayType: "",
                revenueType: "",
                adTypes: []
            };
        }
    },
    componentWillReceiveProps(nextProps) {
        this.setState(this.getInitialState(nextProps));
    },
    handleDisplaySelect: function (value) {
        if (value !== "")
            this.setState({displayType: value});
    },
    handleDisplayTypeInput: function (value) {
        if (value !== "")
            this.setState({displayType: value});
    },
    handleRevenueSelect: function (value) {
        if (value !== "")
            this.setState({revenueType: value});
    },
    handleRevenueTypeInput: function (value) {
        if (value !== "")
            this.setState({revenueType: value});
    },
    clickHandler: function () {
        this.props.onSave(this.state);
    },
    cancelHandler: function () {
        this.props.onCancel(this.state);
    },
    handleAdtypeChange: function(checked){
        this.setState({adTypes:checked});
    },
    render: function () {
        var displayTypes = _(Consts.displayType).map(function (dt) {
            return (<ComboboxOption key={dt} value={dt} >{dt}</ComboboxOption>)
        })

        var revenueTypes = _(Consts.revenueType).map(function (dt) {
            return (<ComboboxOption key={dt} value={dt} >{dt}</ComboboxOption>)
        })
        return (
            <div className="modal-body">
            <Panel header="Network Settings">
                <Row>
                    <Col xs={6}>
                        <label>Name</label>
                    </Col>
                    <Col xs={6}>
                        <input type="text" className="form-control" placeholder="Adnetwork Name" valueLink={this.linkState('name')}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <label>Max Ads</label>
                    </Col>
                    <Col xs={6}>
                        <input type="number" className="form-control maxad" placeholder="Maximum Ads" valueLink={this.linkState('maxAdsToDisplay')}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <label>Display Types</label>
                    </Col>
                    <Col xs={6}>
                        <Combobox onSelect={this.handleDisplaySelect} onInput={this.handleDisplayTypeInput} value={this.state.displayType}>
                            {displayTypes}
                        </Combobox>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <label>Revenue Type</label>
                    </Col>
                    <Col xs={6}>
                        <Combobox onSelect={this.handleRevenueSelect} onInput={this.handleRevenueTypeInput} value={this.state.revenueType}>
                            {revenueTypes}
                        </Combobox>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <label>Supported Adtypes</label>
                    </Col>
                    <Col xs={6}>
                        <CheckboxGroup name="adTypes" value={this.state.adTypes} ref="adTypes" onChange={this.handleAdtypeChange}>
                            <Row>
                            {
                                _(Consts.adTypes).map(function(val,key){
                                    return (
                                        <Col xs={6}>
                                            <input type="checkbox" className="maincheckbox" value={val}/>
                                            <label>{key}</label>
                                        </Col>
                                        )
                                })
                            }
                            </Row>
                        </CheckboxGroup>
                    </Col>
                </Row>
                <Row className="butttonsRow">
                    <Col xs={2}></Col>
                    <Col xs={4}>
                        <Button onClick={this.clickHandler} className="btn-block btn-lightBg btn-save btn">Save</Button>
                    </Col>
                    <Col xs={4}>
                        <Button onClick={this.cancelHandler} className="btn-block btn-lightBg btn-cancel btn">Cancel</Button>
                    </Col>
                    <Col xs={2}></Col>
                </Row>

            </Panel>
            </div>
        )
    }
})