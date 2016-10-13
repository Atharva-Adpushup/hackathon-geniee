var React = window.React,
    Fluxxor = require("../../../../libs/third-party/fluxxor"),
    CommonConsts = require("../../../../editor/commonConsts"),
    FluxMixin = Fluxxor.FluxMixin(React),
    CheckboxGroup = require("../../../CustomComponents/CheckBoxGroup/checkboxGroup.jsx"),
    Row = require("../../../BootstrapComponents/Row.jsx"),
    Button = require("../../../BootstrapComponents/Button.jsx"),
    Col = require("../../../BootstrapComponents/Col.jsx");

module.exports = React.createClass({
    getInitialState: function () {
        return {enabledNetworks: _(this.props.actions).pluck("key")};
    },
    getDefaultProps: function () {
        return {actions: [], adNetworks: []};
    },
    handleNetworkChange: function (n) {
        this.setState({enabledNetworks: n});
    },
    save: function(){
        this.props.onSave(this.state.enabledNetworks,_(this.availabeNetworks).difference(this.state.enabledNetworks));
    },
    backHandler: function () {
        this.props.onBack();
    },
    render: function () {
        this.availabeNetworks = _(this.props.adNetworks).pluck("name");
        return (
            <div className="modal-body">
            <Panel header="Use Network">
                <Row>
                <CheckboxGroup name="adTypes" value={this.state.enabledNetworks} ref="adTypes"
                               onChange={this.handleNetworkChange}>
                    {
                        _(this.availabeNetworks).map(function (val, key) {
                            return (
                                <Col xs={6}>
                                    <input type="checkbox" className="maincheckbox" value={val}/>
                                    <label>{val}</label>
                                </Col>
                            )
                        })
                    }
                </CheckboxGroup>
                </Row>
                <Row className="butttonsRow">
                    <Col xs={2}></Col>
                    <Col xs={4}>
                        <Button onClick={this.save} className="btn-block btn-lightBg btn-save btn">Save</Button>
                    </Col>
                    <Col xs={4}>
                        <Button onClick={this.backHandler} className="btn-block btn-lightBg btn-cancel btn">Cancel</Button>
                    </Col>
                    <Col xs={2}></Col>
                </Row>
            </Panel>
            </div>
        );
    }
});