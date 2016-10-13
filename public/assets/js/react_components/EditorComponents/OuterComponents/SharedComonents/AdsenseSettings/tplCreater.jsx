var React = window.React,
    OverlayMixin = require("../../../../BootstrapComponents/OverlayMixin"),
    CommonConsts = require("../../../../../editor/commonConsts"),
    Button = require("../../../../BootstrapComponents/Button.jsx"),
    ButtonGroup = require("../../../../BootstrapComponents/ButtonGroup.jsx"),
    Input = require("../../../../BootstrapComponents/Input.jsx"),
    ColorPicker = require("../../../../ColorPicker/components/colorpicker.jsx"),
    Glass = require("../../../../CustomComponents/glass.jsx"),
    DomUtils = require("../../../../BootstrapComponents/utils/domUtils.js"),
    Panel = require("../../../../BootstrapComponents/Panel.jsx"),
    Col = require("../../../../BootstrapComponents/Col.jsx"),
    Row = require("../../../../BootstrapComponents/Row.jsx"),
    Adpreview = require("./adpreview.jsx"),
    defaultTpl = CommonConsts.enums.adNetworks.adsenseDefaultTpl;


module.exports = React.createClass({
    mixins: [OverlayMixin, React.addons.LinkedStateMixin],

    propTypes: {
        tplNamePrefix: React.PropTypes.string
    },

    getDefaultProps: function () {
        return {};
    },

    getInitialState: function (props) {
        props = props || this.props;
        return {
                showPicker: false,
                activePicker: null,
                glassShown: false,
                activeId: null,
                bgColor: props.tpl ? props.tpl.background : defaultTpl.background,
                borderColor: props.tpl ? props.tpl.border : defaultTpl.border,
                titleColor: props.tpl ? props.tpl.title : defaultTpl.title,
                urlColor: props.tpl ? props.tpl.url : defaultTpl.url,
                textColor: props.tpl ? props.tpl.text : defaultTpl.text,
                name: props.tpl ? props.tpl.name : null,
                isEnableSaveButton: false
              }

    },
    cancel: function () {
        this.setState(this.getInitialState());
    },
    componentWillReceiveProps: function(nextProps) {
       //this.setState(this.getInitialState(nextProps))
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
    setTplName: function(e) {
        var val = e.currentTarget.value.trim().replace(/ /g, ""),
            isEnableSaveButton = (val && val.length <= 10) ? true : false;

        if (val.length > 10 && !isEnableSaveButton) {
            this.setState({isEnableSaveButton: isEnableSaveButton});
        } else {
            this.setState({name: val, isEnableSaveButton: isEnableSaveButton});
        }
    },
    saveTemplate: function () {
        this.props.onSave({
            name: this.props.templatePrefix + "_" + this.state.name,
            borderColor: this.state.borderColor,
            titleColor: this.state.titleColor,
            bgColor: this.state.bgColor,
            textColor: this.state.textColor,
            urlColor: this.state.urlColor
        })
    },
    renderOverlay: function () {
        if (this.state.showPicker) {
            var offset = $(this.getDOMNode()).offset(),
                postion = {left:(offset.left - 266),top:offset.top}//220 is width of picker and 10 is margin and padding for the same
            return (
                <div>
                    <Glass clickHandler={this.glassClicked}></Glass>
                    <ColorPicker style={postion} color = {this.state[this.state.activePicker]} onChange = {this.setColor} > </ColorPicker>
                </div>);
        }
        return null;
    },
    /**
     * Render component with default template name
     */
    tplNameDefault: function() {
        return (
            <Input placeholder="Template name" type="text" valueLink={this.linkState('name')} ref="tplName"/>
        )
    },
    /**
     * Render component with prefixed template name
     * @returns {XML}
     */
    tplNamePrefixed: function() {
        var tplNamePrefix = this.props.templatePrefix + "_";

        return (
            <Input placeholder="Template name" addonBefore={tplNamePrefix} type="text" value={this.state.name} onChange={this.setTplName} ref="tplName"/>
        )
    },
    tplNameErrorMessage: function() {
        return (
            <div style={{"color": "red", "fontWeight": "bold"}}>Template name should be less than 11 characters</div>
        )
    },
    render: function () {

        return (
            <div>
              <div className="CreateTemplate pdAll-10">
                <ul className="colorTempUl">
                    <li>
                      <div className="colorBg"><div ref="bgColor" name="bgColor" onClick={this.handleColorPickerToggle} style={{"backgroundColor": this.state.bgColor}}></div></div>
                      <span>BgColor</span>
                    </li>
                    <li>
                      <div className="colorBg"><div ref="borderColor" name="borderColor" onClick={this.handleColorPickerToggle} style={{"backgroundColor": this.state.borderColor}}></div></div>
                      <span>Border</span>
                    </li>
                    <li>
                      <div className="colorBg"><div ref="titleColor"  name="titleColor" onClick={this.handleColorPickerToggle} style={{"backgroundColor": this.state.titleColor}}></div></div>
                      <span>Title</span>
                    </li>
                    <li>
                      <div className="colorBg"><div ref="urlColor" name="urlColor" onClick={this.handleColorPickerToggle} style={{"backgroundColor": this.state.urlColor}}></div></div>
                      <span>Url</span>
                    </li>
                    <li>
                      <div className="colorBg"><div ref="textColor" name="textColor" onClick={this.handleColorPickerToggle} style={{"backgroundColor": this.state.textColor}}></div></div>
                      <span>Text</span>
                    </li>
                </ul>

                {this.props.templatePrefix ? (this.tplNamePrefixed()): this.tplNameDefault()}
                {this.state.name && !this.state.isEnableSaveButton ? (this.tplNameErrorMessage()): null}
              <div>
                  <Adpreview tpl={this.state}/>
              </div>
              </div>
                <Row className="butttonsRow">
                    <Col xs={6}><Button disabled={!this.state.isEnableSaveButton} onClick={this.saveTemplate} className="btn-lightBg btn-save">Save</Button></Col>
                    <Col xs={6}><Button onClick={this.props.onCancel} className="btn-lightBg btn-cancel">Cancel</Button></Col>
                </Row>
            </div>
        );
    }
})