var React = window.React,
    utils = require("../../../../../libs/custom/utils"),
    CustomToggleSwitch = require("CustomComponents/CustomForm/CustomToggleSwitch.jsx"),
    Row = require("../../../../BootstrapComponents/Row.jsx"),
    Input = require("../../../../BootstrapComponents/Input.jsx"),
    Button = require("../../../../BootstrapComponents/Button.jsx"),
    Col = require("../../../../BootstrapComponents/Col.jsx");

module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {
            changeSampleUrl: false,
            hostNameValid: true,
            useAlternateProxy: (this.props.channel.useAlternateProxy) ? this.props.channel.useAlternateProxy : false,
            forceSampleUrl: (this.props.channel.forceSampleUrl) ? this.props.channel.forceSampleUrl : false,
            sampleUrl: this.props.channel.sampleUrl
        };
    },
    componentWillReceiveProps: function(newProps){
        this.setState({
            sampleUrl: this.props.channel.sampleUrl,
            useAlternateProxy: this.props.channel.useAlternateProxy,
            forceSampleUrl: this.props.channel.forceSampleUrl
        });
    },
    saveSampleUrl: function () {
        this.props.onSampleUrlChange(this.state.sampleUrl, this.state.useAlternateProxy, this.state.forceSampleUrl);
        this.toggleSampleUrl();
    },
    toggleSampleUrl: function () {
        this.setState({changeSampleUrl: !this.state.changeSampleUrl}, function() {
            this.props.onUpdate();
        });
    },
    onChange: function(){
        var val = $(this.refs.sampleUrl.getDOMNode()).find("input").val().trim(),
            isValidUrl = val && utils.ValidUrl(val.trim()),
            isHostNameEqual = (utils.parseUrl(val).hostname == utils.parseUrl(window.ADP_SITE_DOMAIN).hostname);

        if (isValidUrl && (this.state.forceSampleUrl || isHostNameEqual)) {
            this.setState({sampleUrl: utils.appendProtocolToUrl(val),hostNameValid:true},function(){
                $(this.refs.saveUrl.getDOMNode()).removeAttr("disabled").removeClass("disabled");
            });
        } else if (isValidUrl && !isHostNameEqual) {
            this.setState({sampleUrl: val, hostNameValid: false}, function() {
                $(this.refs.saveUrl.getDOMNode()).attr("disabled",true).addClass("disabled");
            });
        } else {
            this.setState({sampleUrl: val}, function() {
                $(this.refs.saveUrl.getDOMNode()).attr("disabled",true).addClass("disabled");
            });
        }
    },
    onBlur: function() {
        this.setState({
            sampleUrl: utils.parseUrl(this.state.sampleUrl).href
        });
    },
    toggleStateValues: function(target) {
        var isRefsAvailable = (Object.keys(this.refs).length > 0),
            element = (isRefsAvailable) ? $(this.refs.sampleUrl.getDOMNode()).find("input").get(0) : null,
            event = new Event('input', {
                'bubbles': true,
                'cancelable': false
            });

        switch (target) {
            case 'useAlternateProxy':
                this.setState({useAlternateProxy: !this.state.useAlternateProxy});
                break;

            case 'forceSampleUrl':
                this.setState({forceSampleUrl: !this.state.forceSampleUrl}, function () {
                    if (element) {
                        element.dispatchEvent(event);
                    }
                });
                break;
        }
    },
    getClass: function(name){
        var ico = "desktop";
        if(name == "MOBILE")
            ico = "mobile";
        else if (name == "TABLET")
            ico = "tablet";
        return ico;
    },
    render: function () {
        return (
            <div className="rowPadding containerButtonBar">
                <Row>
                    <Col xs={6}>
                        <label>Page Group</label>
                    </Col>
                    <Col xs={6} className="wrapfeature">{this.props.channel.pageGroup}</Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <label>Platform</label>
                    </Col>
                    <Col xs={6}>
                        <i className={"fa fa-" + this.getClass(this.props.channel.platform)}></i>
                    </Col>
                </Row>
                <CustomToggleSwitch labelText="Force sample url" defaultLayout={true} checked={this.state.forceSampleUrl} name="forceSampleUrl" onChange={this.toggleStateValues.bind(null, 'forceSampleUrl')} layout="horizontal" size="m" id="js-force-sample-url" on="On" off="Off" />
                {!this.state.changeSampleUrl ?
                    <div>
                        <Row>
                            <Col xs={12}>
                                <label>Sample Url</label>
                            </Col>
                            <Col xs={12} className="wrapfeature">{this.props.channel.sampleUrl}</Col>

                        </Row>
                        <Row className="butttonsRow">
                            <Col xs={12}>
                                <Button onClick={this.toggleSampleUrl} className="btn-lightBg btn-edit btn-block">Edit Url</Button>
                            </Col>
                        </Row>
                    </div>
                    :
                    <div>
                        <Row>
                            <Col xs={12}>
                                <label>Sample Url</label>
                            </Col>
                            <Col xs={12}>
                                <Input type="text" ref="sampleUrl" onBlur={this.onBlur} onChange={this.onChange} value ={this.state.sampleUrl}/>
                            </Col>
                            {!this.state.hostNameValid ?
                                <Col xs={12}>
                                    <span style={{color:"red"}}>Url should be from your website only</span>
                                </Col>
                                :
                                null
                                }
                        </Row>
                        <CustomToggleSwitch labelText="Use proxy" defaultLayout={true} checked={this.state.useAlternateProxy} name="useAlternateProxy" onChange={this.toggleStateValues.bind(null, 'useAlternateProxy')} layout="horizontal" size="m" id="js-use-proxy" on="Cheerio" off="Off" />
                        <Row className="butttonsRow">
                            <Col xs={6}>
                                <Button ref="saveUrl" onClick={this.saveSampleUrl} className="btn-lightBg btn-save">Save Url</Button>
                            </Col>
                            <Col xs={6}>
                                <Button onClick={this.toggleSampleUrl} className="btn-lightBg btn-cancel">Cancel</Button>
                            </Col>
                        </Row>
                    </div>
                    }
            </div>
        );
    }
})