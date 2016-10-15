var React = window.React,
    Utils = require("../../../../../libs/custom/utils"),
    CommonConsts = require("../../../../../libs/custom/utils"),
    Row = require("../../../../BootstrapComponents/Row.jsx"),
    Input = require("../../../../BootstrapComponents/Input.jsx"),
    Button = require("../../../../BootstrapComponents/Button.jsx"),
    CheckBoxGroup = require("../../../../CustomComponents/CheckBoxGroup/checkboxGroup.jsx"),
    Col = require("../../../../BootstrapComponents/Col.jsx");


module.exports = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        var sizes = this.props.inContentAction ? _(this.props.inContentAction.value).map(function(props){
            return this.getStringFromSize(props.data);
        }.bind(this)) :[];

        return {
            changeXpath: false,
            contentSelector:this.props.channel.incontentSettings.contentSelector,
            sizes: sizes
        };
    },
    getDefaultProps: function () {
        return {};
    },
    toggleXpathChange: function () {
        this.setState({changeXpath: !this.state.changeXpath})
    },
    getSizeFromString: function(size){
        size = size.split("x");
        return {width: parseInt(size[0]), height: parseInt(size[1])}
    },
    getStringFromSize: function(size) {
        return size.width+"x"+size.height;
    },
    handleSizeChange: function(sizes){
        this.setState({sizes:sizes});
    },
    saveSizes: function(){
        var sizesAdded = _(_.difference(this.state.sizes,this.getInitialState().sizes)).map(function(size){
                            return this.getSizeFromString(size);
                        }.bind(this)),

            sizesRemoved = _(_.difference(this.getInitialState().sizes,this.state.sizes)).map(function(size){
                return this.getSizeFromString(size);
            }.bind(this));

        this.props.onSizesSave({sizesAdded:sizesAdded,sizesRemoved:sizesRemoved});

    },
    saveContentSelector: function(){
        this.props.onContentSelectorSave(this.state.contentSelector);
    },
    changeXpathComponent: function () {
        var allDone = (this.state.contentSelector.trim().length && Utils.deepDiffMapper.test(this.state.contentSelector,this.props.channel.incontentSettings.contentSelector).isChanged);
        return (
            <div className="rowPadding containerButtonBar">
                <Row>
                    <Col md={12}>
                        <label>Enter Content Area Css Path</label>
                    </Col>
                    <Col md={12}>
                        <Input type="text" ref="contentSelector" valueLink={this.linkState("contentSelector")}/>
                    </Col>
                </Row>
                <Row className="butttonsRow">
                    <Col xs={6}>
                        <Button onClick={this.saveContentSelector} disabled={!allDone} className="btn-lightBg btn-save">Save</Button>
                    </Col>
                    <Col xs={6}>
                        <Button onClick={this.toggleXpathChange} className="btn-lightBg btn-cancel">Cancel</Button>
                    </Col>
                </Row>
            </div>
        );
    },
    mainContent: function () {
        var allDone = Utils.deepDiffMapper.test(this.state.sizes,this.getInitialState().sizes).isChanged;
        return (
            <div className="rowPadding containerButtonBar">
                <Row>
                    <Col md={12}>
                        <label>Content Area Css Path</label>
                    </Col>
                    <Col md={12} className="wrapfeature">{this.props.channel.incontentSettings.contentSelector}</Col>
                </Row>
                <Row>
                    <Col md={12}><label>Select Sizes To Try</label></Col>

                    <CheckBoxGroup value={this.state.sizes}  onChange={this.handleSizeChange}>
                        <Col xs={6}>
                            <input type="checkbox" className="maincheckbox" id="one" value={this.props.channel.platform == "MOBILE" ? "300x250" : "336x280"}/>
                            <label htmlFor="one">{this.props.channel.platform == "MOBILE" ? "300x250" : "336x280"}</label>
                        </Col>
                        <Col xs={6}>
                            <input type="checkbox" className="maincheckbox"  id="two" value={this.props.channel.platform == "MOBILE" ? "320x100" : "728x90"}/>
                            <label htmlFor="two">{this.props.channel.platform == "MOBILE" ? "320x100" : "728x90"}</label>
                        </Col>
                        {_(this.props.customSizes).map(function(size){
                            var t = size.width+"x"+size.height;
                            return (<Col xs={6}>
                                <input type="checkbox" className="maincheckbox"  id={t} value={t}/>
                                <label htmlFor={t}>{t}</label>
                            </Col>)
                        }.bind(this))}
                    </CheckBoxGroup>
                </Row>
                <Row className="butttonsRow">
                    <Col xs={4}>
                        <Button disabled={!allDone} onClick={this.saveSizes} className="btn-lightBg btn-save">Save</Button>
                    </Col>
                    <Col xs={8}>
                        <Button onClick={this.toggleXpathChange} className="btn-lightBg btn-edit">Edit Selector</Button>
                    </Col>
                </Row>
            </div>
        )
    },
    render: function () {
        return (<div>
            {this.state.changeXpath ? this.changeXpathComponent() : this.mainContent()}

        </div>);
    }
})