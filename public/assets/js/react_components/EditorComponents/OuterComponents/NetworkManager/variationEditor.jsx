var React = window.React,
    _ = require("../../../../libs/third-party/underscore"),
    SelectBox = require("../../../CustomComponents/Select/select.js"),
    Row = require("../../../BootstrapComponents/Row.jsx"),
    CommonConsts = require("../../../../editor/commonConsts"),
    consts = CommonConsts.enums.adNetworks,
    Autocomplete = require("../../../CustomComponents/ComboBox/main.js"),
    Combobox = Autocomplete.Combobox,
    ComboboxOption = Autocomplete.Option,
    Button = require("../../../BootstrapComponents/Button.jsx"),
    Col = require("../../../BootstrapComponents/Col.jsx");

module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {variation: {}};
    },
    getInitialState: function () {
        return {
            layout: "",
            adType:"",
            height:null,
            width:null,
            err: null
        };
    },


    saveHandler: function () {
        var json = {
            name: React.findDOMNode(this.refs.name).value,
            width: parseInt(this.state.width),
            height: parseInt(this.state.height),
            code: btoa(React.findDOMNode(this.refs.code).value),
            adType: this.state.adType,
            layoutType: this.state.layout
        },
        alldone = !!(json.adType && json.layoutType && json.code && json.height && json.width && json.name);
        if(!alldone){
            this.setState({err:"incomplete"});
            return false;
        }
        if(json.name && json.name.trim().length > 0){
            var t =  _(this.props.network.variations).findWhere({name:json.name.toUpperCase()});
            if(t){
                this.setState({err:"duplicateName"});
                return false;
            }
        }

        this.props.onSave(json);
    },
    backHandler: function () {
        this.props.onBack();
    },
    onLayoutChange: function(layout){
        this.setState({layout:layout});
    },
    onAdTypeChange: function(adType){
        this.setState({adType:adType});
    },
    handleSelect: function (type,value) {
        if (value !== ""){
            type == "width" ? this.setState({width:value}) : this.setState({height:value});
        }
    },
    handleInput: function (type,value) {
        if (value !== "")
            type == "width" ? this.setState({width:value}) : this.setState({height:value});
    },
    render: function () {
        var layOuts = _(consts.adLayout).map(function(layout){
            return (<option value={layout}>{layout}</option>)
        }),adTypes = _(this.props.network.supportedAdTypes).map(function(type){
            return (<option value={type}>{type.toUpperCase()}</option>)
        }),widths = [], heights =[];
        if(this.state.layout){
                var sizes = _(_(consts.commonSupportedSizes).findWhere({layoutType:this.state.layout}).sizes);
                widths = sizes.pluck("width").map(function (dt) {
                    return (<ComboboxOption value={dt} >{dt.toString()}</ComboboxOption>);
                });
                heights = sizes.pluck("height").map(function (dt) {
                    return (<ComboboxOption value={dt} >{dt.toString()}</ComboboxOption>);
                });
        }

        return (
            <div className="modal-body">
            <Panel header="Add Variations">
                {this.state.err == "incomplete" ? (<Row className="err"><Col xs={12}>Please Fill all fields</Col></Row>) : null}
                <Row className={this.state.err == "duplicateName" ? "err" : ""}>
                    <Col xs={6}>
                        <label>Name</label>
                    </Col>
                    <Col xs={this.state.err == "duplicateName" ? 3 : 6}>
                        <input type="text" className="form-control" ref="name" placeholder="Name" defaultValue={this.props.variation.name}/>
                    </Col>
                    {this.state.err == "duplicateName" ? (<Col xs={3}>Name Already Exists</Col>) : null}
                </Row>
                <Row>
                    <Col xs={6}><label>Layout</label></Col>
                    <Col xs={6}>
                        <SelectBox label="Layout" value={this.state.layout} onChange={this.onLayoutChange}>
                            {layOuts}
                        </SelectBox>
                    </Col>
                </Row><Row>
                    <Col xs={6}>
                        <label>Width</label>
                    </Col>
                    <Col xs={6}>
                        <Combobox onSelect={this.handleSelect.bind(null,"width")} onInput={this.handleInput.bind(null,"width")} value={this.state.width}>
                            {widths}
                        </Combobox>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <label>Height</label>
                    </Col>
                    <Col xs={6}>
                        <Combobox onSelect={this.handleSelect.bind(null,"height")} onInput={this.handleInput.bind(null,"height")} value={this.state.height}>
                            {heights}
                        </Combobox>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <label>Ad Code</label>
                    </Col>
                    <Col xs={6}>
                        <textarea ref="code" className="form-control" placeholder="Place your asynchronous ad codes here" defaultValue={this.props.variation.code ? atob(this.props.variation.code) : ""}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        Ad Type
                    </Col>
                    <Col xs={6}>
                        <SelectBox label="Ad Type" value={this.state.adType} onChange={this.onAdTypeChange}>
                            {adTypes}
                        </SelectBox>
                    </Col>
                </Row>
                <Row className="butttonsRow">
                    <Col xs={2}></Col>
                    <Col xs={4}>
                        <Button onClick={this.saveHandler} className="btn-block btn-lightBg btn-save btn">Save</Button>
                    </Col>
                    <Col xs={4}>
                        <Button onClick={this.backHandler} className="btn-block btn-lightBg btn-back btn">Back</Button>
                    </Col>
                    <Col xs={2}></Col>
                </Row>
                </Panel>
            </div>
        );
    }
})