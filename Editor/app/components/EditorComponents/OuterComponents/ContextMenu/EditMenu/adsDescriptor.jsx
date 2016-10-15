var React = window.React,
    Row = require("BootstrapComponents/Row.jsx"),
    OverlayTrigger = require("BootstrapComponents/OverlayTrigger.jsx"),
    Popover = require("BootstrapComponents/Popover.jsx"),
    Col = require("BootstrapComponents/Col.jsx"),
    EnableDisableSwitch = require("CustomComponents/EnableDisableSwitch.jsx"),
    ColorSwatch = require("colorSwatch.jsx"),
    AdPreview = require("SharedComonents/AdsenseSettings/adpreview.jsx"),

    Const = require("editor/commonConsts").enums.adNetworks;


module.exports = React.createClass({
    mixins: [],
    getAdtype: function(type){
        switch (type){
            case Const.adTypes.IMAGE:
                return "Image";
            case Const.adTypes.TEXT:
                return "Text";
            case Const.adTypes.TEXT_IMAGE:
                return "Text Image";
        }
    },
    renderAdsenseRow: function(){
        var tpl = {border:this.props.ad.borderColor,title:this.props.ad.titleColor,background:this.props.ad.backgroundColor,text:this.props.ad.textColor}
        return (
            <Row>
                <Col xs={6} className="pd-10">{this.getAdtype(this.props.ad.adType)}</Col>
                <Col xs={6} className="pd-10">
                    <OverlayTrigger trigger='hover' placement='bottom' overlay={<Popover title='Preview'><AdPreview tpl={this.props.ad} /></Popover>}>
                        <ColorSwatch tpl={tpl} />
                    </OverlayTrigger>
                </Col>
            {/*<Col xs={4} className="pd-10">
                  <EnableDisableSwitch size="s" on="On" off="Off"/>
                </Col>*/}
            </Row>
        )
    },
    renderCustomNetworkRow: function(){
        return (
            <Row>
                <Col xs={6}>{this.getAdtype(this.props.ad.adType)}</Col>
                <Col xs={6}>Pause</Col>
            </Row>
        )
    },
    render: function(){
        return (<div className="adsDescriptor">
        {this.props.ad.network == "ADSENSE" ? this.renderAdsenseRow() : this.renderCustomNetworkRow()}
        </div>);
    }
})