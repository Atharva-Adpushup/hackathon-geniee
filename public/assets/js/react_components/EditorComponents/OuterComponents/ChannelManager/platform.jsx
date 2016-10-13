var React = window.React,
 _ = require("../../../../libs/third-party/underscore");

var Fluxxor = require("../../../../libs/third-party/fluxxor")
    FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({

    mixins: [FluxMixin],

    getDefaultProps: function() {
        return {
            type: "desktop",
            os: "windows"
        };
    },

    render: function() {
        var platform = this.props.type,
        platformClass = "defaultPlatform";
        viewPortClass = "defaultViewPort";


        switch (platform.toLowerCase()){

            case "desktop":
                platformClass="desktopEditor";
                viewPortClass="desktopViePort";

                if (this.props.isAdRecover) {
                    platformClass += " desktopEditor--adrecover";
                }
                break;

            case "mobile":
                platformClass="iphone6sPortrait"
                viewPortClass="iphone6sViePort";
                break;

            case "tablet":
                platformClass="ipadAirPortrait"
                viewPortClass="ipadAirViePort";
                break;
        }

        return (
            <div id="editorPlatform" className={"platform "+platformClass}>
                <div id="editorViewPort" className={viewPortClass}>
                    {this.props.children}
                </div>
            </div>
        );
    }
});