var React = window.React,
    Row = require("../../../../BootstrapComponents/Row.jsx"),
    Col = require("../../../../BootstrapComponents/Col.jsx"),
    _ = require("../../../../../libs/third-party/underscore");


module.exports = React.createClass({
  mixins: [],
  getClass: function(name){
    var ico = "desktop";
    if(name == "MOBILE")
      ico = "mobile";
    else if (name == "TABLET")
      ico = "tablet";
    return ico;
  },
  render: function () {
    var channels = _(this.props.channels).sortBy("pageGroup");
    return (<div className="SelectParent channelLst">{channels.map(function (channel) {
      return (<Row>
        <Col className={this.getClass(channel.platform)} xs={2}><i className={"fa fa-" + this.getClass(channel.platform)}></i></Col>
        <Col xs={6} className="overFlowTxt"><label className="mB-0">{channel.pageGroup}</label></Col>
        <Col onClick={this.props.onClick.bind(null, channel)} xs={4}><div className="btn-lightBg btn-Small btn">load</div></Col>
      </Row>)
    }.bind(this))}
    </div>);
  }
});