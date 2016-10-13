var Fluxxor = require("../../../../libs/third-party/fluxxor"),
    React = window.React,
    OverlayMixin = require("../../../BootstrapComponents/OverlayMixin"),
    Button = require("../../../BootstrapComponents/Button.jsx"),
    ButtonGroup = require("../../../BootstrapComponents/ButtonGroup.jsx"),
    Input = require("../../../BootstrapComponents/Input.jsx"),
    ColorPicker = require("../../../ColorPicker/components/colorpicker.jsx"),
    Glass = require("../../../CustomComponents/glass.jsx"),
    Panel = require("../../../BootstrapComponents/Panel.jsx"),
    FluxMixin = Fluxxor.FluxMixin(React);


module.exports = React.createClass({
    mixins: [FluxMixin, OverlayMixin, React.addons.LinkedStateMixin],
    getDefaultProps: function () {
        return {templates: []};
    },
    getInitialState: function (props) {
        props = props || this.props;
        if (props.tpl) {
            return {
                showPicker: false,
                activePicker: null,
                glassShown: false,
                activeId: props.activeId,
                bgColor: props.tpl.background,
                borderColor: props.tpl.border,
                titleColor: props.tpl.title,
                urlColor: props.tpl.url,
                textColor: props.tpl.text,
                name: props.tpl.name
            };
        } else {
            return {
                activeId: null,
                showPicker: false,
                activePicker: null,
                glassShown: false,
                bgColor: "#ffffff",
                borderColor: "#ffffff",
                titleColor: "#000000",
                urlColor: "#000000",
                textColor: "#000000",
                name: ""
            }
        }

    },
    resetState: function () {
        this.setState(this.getInitialState());
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.tpl) {
            this.setState(this.getInitialState(nextProps))
        } else {
            this.resetState();
        }
    },
    renderOverlay: function () {
        if (this.state.showPicker)
            return (
                <div>
                    <Glass clickHandler={this.glassClicked}></Glass>
                    <ColorPicker color = {this.state[this.state.activePicker]} onChange = {this.setColor} > </ColorPicker>
                </div>);

        return null;
    },
    glassClicked: function (event) {
        this.setState({showPicker: false});
    },
    setColor: function (color) {
        var a = {};
        a[this.state.activePicker] = color.toHex();
        this.setState(a);
    },
    handleColorPickerToggle: function (event) {
        this.setState({activePicker: event.target.getAttribute("name")});
        this.setState({showPicker: !this.state.showPicker});
    },
    saveTemplate: function () {

        var payload = {
            name: this.state.name,
            borderColor: this.state.borderColor,
            titleColor: this.state.titleColor,
            bgColor: this.state.bgColor,
            textColor: this.state.textColor,
            urlColor: this.state.urlColor
        }
        if (this.state.activeId) {
            payload["id"] = this.state.activeId;
            this.getFlux().actions.modifyAdsenseTemplate(payload)
        } else {
            this.getFlux().actions.createAdsenseTemplate(payload)
        }

        this.resetState();
    },
    render: function () {
        var text = "Save Template";
        if (this.state.activeId) {
            text = "Edit Template"
        }
        return (
            <div>
                <ul className="colorTempUl">
                    <li name="bgColor" onClick={this.handleColorPickerToggle} style={{"backgroundColor": this.state.bgColor}}></li>
                    <li name="borderColor" onClick={this.handleColorPickerToggle} style={{"backgroundColor": this.state.borderColor}}></li>
                    <li name="titleColor" onClick={this.handleColorPickerToggle} style={{"backgroundColor": this.state.titleColor}} ></li>
                    <li name="urlColor" onClick={this.handleColorPickerToggle} style={{"backgroundColor": this.state.urlColor}} ></li>
                    <li name="textColor" onClick={this.handleColorPickerToggle} style={{"backgroundColor": this.state.textColor}} ></li>
                </ul>
                <input type="text" placeholder="Template Name" ref="tplName" valueLink={this.linkState('name')}/>
                <div className="_ap_btn_group">
                    <Button onClick={this.saveTemplate} className="btn-submit btn-sm">{text}</Button>
                    <Button onClick={this.resetState} className="btn-sm margin-left">Reset</Button>
                </div>
            </div>
        );
    }
})