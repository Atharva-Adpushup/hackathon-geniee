var React = window.React,
    commonConsts = require("../../../../editor/commonConsts"),
    OverlayTrigger = require("../../../BootstrapComponents/OverlayTrigger.jsx"),
    Tooltip = require("../../../BootstrapComponents/Tooltip.jsx"),
    $ = window.jQuery;

module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {};
    },
    openFaq: function(){
        this.props.flux.actions.showComponent(commonConsts.enums.components.FAQ);
    },
    render: function () {
        var style = {
            width: 48,
            height: 48,
            lineHeight: "48px",
            position: "absolute",
            zIndex: 99999,
            background:"#EB575C",
            borderRadius: "50%",
            cursor:"pointer",
            border:"1px solid #CF474B",
            boxShadow:"0 2px 4px 0 rgba(0, 0, 0, 0.2)",
            color:"#fff",
            right: 20,
            textAlign:"center",
            bottom: 75,
            fontSize:30,
            margin: "auto"
        }
        
        return (
        <OverlayTrigger placement='left' overlay={<Tooltip>Frequently Asked Questions</Tooltip>}>
            <div style={style} onClick={this.openFaq}>
                <i className="fa fa-question"></i>
            </div>
        </OverlayTrigger>

        );
    }
})