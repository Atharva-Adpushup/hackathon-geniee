var React = window.React,
     Fluxxor = require("../../../../libs/third-party/fluxxor")
    Button = require("../../../BootstrapComponents/Button.jsx"),
    ButtonGroup = require("../../../BootstrapComponents/ButtonGroup.jsx"),
    Modal = require("../../../BootstrapComponents/Modal.jsx"),
    Input = require("../../../BootstrapComponents/Input.jsx"),
    ListView = require("../listView.jsx"),
    Row = require("../../../BootstrapComponents/Row.jsx"),
    Panel = require("../../../BootstrapComponents/Panel.jsx"),
    FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({

    mixins: [FluxMixin, React.addons.LinkedStateMixin],

    getDefaultProps: function () {
        return {
            placeholder: {name: "Audience Name", defination: "Audience Defination"}
        };
    },
    getInitialState: function () {
        return {name: "", defination: "", id: null};
    },
    setActiveAudience: function (audience) {
        if (audience) {
            this.setState({id: audience.id, name: audience.name, defination: audience.rootCondition.toSTRING()});
        }
    },
    componentWillReceiveProps: function () {
        this.resetState();
    },

    saveAudience: function (event) {
        if (this.state.id) {
            this.getFlux().actions.modifyAudience(this.state.id, this.state.name, this.state.defination);
        }
        else {
            this.getFlux().actions.addAudience(this.state.name, this.state.defination);
        }
    },
    resetState: function () {
        this.setState({name: "", defination: "", id: null});
    },
    render: function () {

        return (
            <div>
                <label>{this.state.id ? "Edit Audience" : "Define Audience"}</label>
                <Input type="text" name="name" placeholder={this.props.placeholder.name}  valueLink={this.linkState('name')} />
                <Input type="text" name="defination" placeholder={this.props.placeholder.defination} valueLink={this.linkState('defination')} />
                <Row className="_ap_btn_group">
                    <Button className="btn-submit" bsSize="small" name="submit" onClick={this.saveAudience} > Save Audience </Button>
                    <Button className="_ap_btn_margin_left" bsSize="small" name="reset" onClick={this.resetState} > Reset</Button>
                </Row>
                {this.props.audiences.length ? <ListView title="All Audiences" items={this.props.audiences} display="name" addHandler={this.setActiveAudience}/> : null}
            </div>
        );

    }
});