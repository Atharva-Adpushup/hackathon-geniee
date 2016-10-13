var React = window.React,
    Wizard = require("../../../CustomComponents/Wizard/wizard.jsx"),
    OauthHowTo = require("./Slides/oAuthHowTo.jsx"),
    ControlAdsGuider = require("./Slides/controlAdsGuider.jsx"),
    ApInstallHowTo = require("./Slides/apInstallHowTo.jsx"),
    ControlAdsHowTo = require("./Slides/controlTransformHowTo.jsx"),
    AdsenseSetupGuider = require("./Slides/adsenseSetupGuider.jsx"),


    $ = window.jQuery;

module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {};
    },
    renderApInstallationGuider: function () {
        return (
            <Wizard infinite={false}>
                <ApInstallHowTo next="Ok i got it" title={"AdPushup Installation "}/>
            </Wizard>
        )
    },
    renderOauthGuider: function () {
        return (
            <Wizard infinite={false}>
                <OauthHowTo next="Ok i got it" title={"How to Connect Adsense Account"}/>
            </Wizard>
        )
    },
    renderControlConversionGuider: function () {
        return (
            <Wizard infinite={false}>
                <ControlAdsGuider next="How to set up Control Ads?" title={"What are control Ads?"}/>
                <ControlAdsHowTo prev="What are control Ads?" next="Ok i got it" title={"How to set up Control Ads?"}/>
            </Wizard>
        )
    },
    render: function () {
        if (this.props.guider == "control")
            return this.renderControlConversionGuider();
        else if (this.props.guider == "ap")
            return this.renderApInstallationGuider();
        else if (this.props.guider == "oauth")
            return this.renderOauthGuider();
        else
            return null
    }
})