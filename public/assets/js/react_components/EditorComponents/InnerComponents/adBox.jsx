var React = window.React,
    reactCSS = require("reactcss").ReactCSS,
    CC = require("editor/commonConsts.js"),
    _ = require("../../../libs/third-party/underscore");

module.exports = React.createClass({

    getInitialState: function(){
        return {visibility: true};
    },

    hide: function() {
        this.setState({ visibility: false });
    },

    getDefaultProps: function() {
        return {
            highlighterClass: '_APD_highlighter',
            backgroundColor: 'rgba(255, 255, 0, .25)',
            borderColor: '#000',
            opacity: ".25",
            clickHandler: function(){}
        };
    },

    render: function() {
        var adBoxStyles = {
            boxShadow: this.props.borderColor + ' 0px 0px 0px 2px inset',
            backgroundColor: this.props.backgroundColor,
            width: this.props.width,
            height: this.props.height,
            "pointerEvents": "auto",
            "position": "relative"
        },
        adBoxSizeContent = (this.props.width + " X " + this.props.height),
        adBoxSizeStyles = CC.enums.adBoxSizeStyles,
        listStyle = {
            position: "absolute",
            width: "100%",
            "pointerEvents": "none"
        }, adBoxComputedStyles, adBoxSizeComputedStyles;

        if(this.props.css){
            _(this.props.css).each(function(value,key){
                adBoxStyles[key] = value;
            })
        }
        
        // Ad Box final computed styles
        adBoxComputedStyles = reactCSS({
            "default": {
                "ad": adBoxStyles
            }
        });
        
        // Ad Box size final computed styles
        adBoxSizeComputedStyles = reactCSS({
            "default": {
                "size": adBoxSizeStyles
            }
        })

        if( this.state.visibility )
            return (
                <div className="_ap_reject" style={listStyle}>
                    <div id={this.props.id} className={this.props.highlighterClass} onClick={this.props.clickHandler} style={adBoxComputedStyles.ad}>
                        <div className="_AP_adSize" style={adBoxSizeComputedStyles.size}>
                            {adBoxSizeContent}
                        </div>
                    </div>
                </div>);
        else
            return null;
    }
});
